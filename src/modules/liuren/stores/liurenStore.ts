/**
 * 小六壬独立 Store
 *
 * 注意：本模块不依赖 BirthInput（与生辰无关）。
 * 状态包含两种模式：
 *   - immediate：即时起卦，使用当前时间
 *   - custom：自定月/日/时（农历）
 *
 * 状态持久化：问事心念、分面选择、手动模式下的月日时。
 *
 * 结果缓存（lastComputed）：
 *   - **两种模式都缓存**：用户起卦后写入完整 seed（month/day/hourIndex + 农历/时辰文案）
 *     + 起卦时间戳（drawnAt），下次进入静默恢复展示。
 *   - immediate 模式不能依赖 seedFromDate(new Date()) 重算，必须从 snapshot 读 seed
 *     避免显示当前时间却复用昨天卦的不一致；UI 层会显示"上次于 X 起卦"提示带告知用户。
 *   - shouldRestore：
 *       - mode=immediate + 有缓存且 mode 一致 → true（永久缓存策略，跨日仍恢复）
 *       - mode=custom + 缓存与当前 custom+aspect+question 完全一致 → true
 */

import { defineStore } from 'pinia'
import { StorageSerializers, useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { Aspect } from '../types'

export type LiurenMode = 'immediate' | 'custom'

export interface LiurenCustomInput {
  month: number
  day: number
  /** 时辰序号 1=子, 12=亥 */
  hourIndex: number
}

/**
 * 用于 lastComputed 比对的输入快照。
 *
 * 字段语义：
 *   - mode：起卦模式；恢复时按 mode 走不同分支（immediate 无脑恢复，custom 校验输入）
 *   - month/day/hourIndex：实际参与计算的农历月/日/时辰序号（immediate 模式来自 seedFromDate）
 *   - aspect/question：用户主诉，影响解读文案
 *   - drawnAt：起卦时间戳，用于结果区"上次于 X 时间起卦"提示；旧数据缺失视为 0
 *   - lunarDateLabel/hourBranchLabel：农历/时辰文案（如"三月廿八"、"未时"），immediate
 *     模式恢复时直接复用避免重新调用 tyme4ts；旧数据缺失走兜底重算
 */
export interface LiurenComputedSnapshot {
  mode: LiurenMode
  month: number
  day: number
  hourIndex: number
  aspect: Aspect
  question: string
  drawnAt: number
  lunarDateLabel: string
  hourBranchLabel: string
}

/**
 * core/immediate 与 onPaipan 共用的 seed 结构。这里复制一份避免 store 反向依赖 page。
 * 字段命名与 calculateLiuren 接受的入参对齐（hour 即 hourIndex）。
 */
export interface LiurenSeed {
  month: number
  day: number
  hour: number
  lunarDateLabel: string
  hourBranchLabel: string
}

const STORAGE_KEY = 'tt-divination:liuren-input'
const COMPUTED_KEY = 'tt-divination:liuren-last-computed'

interface LiurenStoredState {
  mode: LiurenMode
  aspect: Aspect
  question: string
  custom: LiurenCustomInput
}

const DEFAULT_STATE: LiurenStoredState = {
  mode: 'immediate',
  aspect: 'overall',
  question: '',
  custom: {
    month: 3,
    day: 2,
    hourIndex: 7,
  },
}

/** custom 模式恢复用的 key —— 只比对参与计算的字段，不含 drawnAt（时间戳每次都新）。 */
function customSnapshotKey(s: LiurenComputedSnapshot): string {
  return `${s.month}-${s.day}-${s.hourIndex}-${s.aspect}-${s.question}`
}

export const useLiurenStore = defineStore('liuren', () => {
  const state = useStorage<LiurenStoredState>(STORAGE_KEY, { ...DEFAULT_STATE }, undefined, {
    mergeDefaults: true,
  })

  /**
   * 上一次成功计算的 custom 模式快照。null 表示没有可恢复的缓存。
   * 显式指定 StorageSerializers.object 以避免 useStorage 在 default 为 null 时
   * 错误推断为 boolean 序列化器，导致对象被存为 "[object Object]"。
   */
  const lastComputed = useStorage<LiurenComputedSnapshot | null>(
    COMPUTED_KEY,
    null,
    undefined,
    { serializer: StorageSerializers.object },
  )

  function setMode(m: LiurenMode) {
    state.value.mode = m
  }
  function setAspect(a: Aspect) {
    state.value.aspect = a
  }
  function setQuestion(q: string) {
    state.value.question = q
  }
  function setCustom(patch: Partial<LiurenCustomInput>) {
    state.value.custom = { ...state.value.custom, ...patch }
  }
  function reset() {
    state.value = { ...DEFAULT_STATE, custom: { ...DEFAULT_STATE.custom } }
    lastComputed.value = null
  }

  /**
   * 记录一次成功的起卦，作为下次进入 / 刷新时的恢复依据。
   *
   * @param seed 实际用于计算的 seed —— immediate 模式从 seedFromDate(new Date()) 来，
   *             custom 模式从 customSeed 来。统一参数避免 store 内部判断模式时拿不到 immediate 的当下值。
   */
  function recordComputed(seed: LiurenSeed) {
    lastComputed.value = {
      mode: state.value.mode,
      month: seed.month,
      day: seed.day,
      hourIndex: seed.hour,
      aspect: state.value.aspect,
      question: state.value.question,
      drawnAt: Date.now(),
      lunarDateLabel: seed.lunarDateLabel,
      hourBranchLabel: seed.hourBranchLabel,
    }
  }

  function clearComputed() {
    lastComputed.value = null
  }

  /**
   * 判断本次挂载是否可以从 lastComputed 静默恢复结果。
   *
   * 分模式判定（与 onMounted 的 hydrate 流程对齐）：
   *   - mode=immediate：只要有 immediate 类型的快照即恢复（用户选择"永久缓存"，
   *     跨日依旧显示，UI 用 drawnAt 提示"上次于 X 时间起卦"避免误读）
   *   - mode=custom：缓存类型一致 + 输入字段完全一致才恢复（避免用户改了 month
   *     却看到旧月份的解读）
   *
   * 兼容旧版 snapshot：旧数据无 mode 字段，视为 custom（旧实现只缓存 custom）。
   */
  const shouldRestore = computed<boolean>(() => {
    const snap = lastComputed.value
    if (snap == null || typeof snap !== 'object') return false
    const snapMode: LiurenMode = (snap as Partial<LiurenComputedSnapshot>).mode ?? 'custom'
    const currentMode = state.value.mode
    if (snapMode !== currentMode) return false
    if (currentMode === 'immediate') return true
    const current: LiurenComputedSnapshot = {
      mode: 'custom',
      month: state.value.custom.month,
      day: state.value.custom.day,
      hourIndex: state.value.custom.hourIndex,
      aspect: state.value.aspect,
      question: state.value.question,
      drawnAt: 0,
      lunarDateLabel: '',
      hourBranchLabel: '',
    }
    return customSnapshotKey(snap) === customSnapshotKey(current)
  })

  return {
    state,
    mode: computed(() => state.value.mode),
    aspect: computed(() => state.value.aspect),
    question: computed(() => state.value.question),
    custom: computed(() => state.value.custom),
    lastComputed: computed(() => lastComputed.value),
    shouldRestore,
    setMode,
    setAspect,
    setQuestion,
    setCustom,
    reset,
    recordComputed,
    clearComputed,
  }
})

export type LiurenStore = ReturnType<typeof useLiurenStore>
