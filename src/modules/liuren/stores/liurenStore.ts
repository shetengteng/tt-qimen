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
 *   - 仅缓存 custom 模式：用户主动指定 month/day/hour，是稳定输入
 *   - immediate 模式刷新页面时 seedFromDate(new Date()) 已变化，
 *     恢复"昨天的卦"会误导用户，故主动不缓存
 *   - shouldRestore 当且仅当：mode=custom + 缓存值与当前 custom+aspect+question 完全一致
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

/** 用于 lastComputed 比对的输入快照（只含 custom 模式可复算的字段） */
export interface LiurenComputedSnapshot {
  month: number
  day: number
  hourIndex: number
  aspect: Aspect
  question: string
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

function snapshotKey(s: LiurenComputedSnapshot): string {
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
   * 记录一次成功的 custom 模式计算，作为下次刷新时的恢复依据。
   * immediate 模式调用此函数会被忽略（避免缓存"过期的当前时间"卦象）。
   */
  function recordComputed() {
    if (state.value.mode !== 'custom') {
      lastComputed.value = null
      return
    }
    lastComputed.value = {
      month: state.value.custom.month,
      day: state.value.custom.day,
      hourIndex: state.value.custom.hourIndex,
      aspect: state.value.aspect,
      question: state.value.question,
    }
  }

  function clearComputed() {
    lastComputed.value = null
  }

  /**
   * 判断本次挂载是否可以从 lastComputed 静默恢复结果。
   * 条件：mode=custom + 有缓存 + 缓存与当前 store 状态完全一致。
   */
  const shouldRestore = computed<boolean>(() => {
    if (state.value.mode !== 'custom') return false
    const snap = lastComputed.value
    if (snap == null || typeof snap !== 'object') return false
    const current: LiurenComputedSnapshot = {
      month: state.value.custom.month,
      day: state.value.custom.day,
      hourIndex: state.value.custom.hourIndex,
      aspect: state.value.aspect,
      question: state.value.question,
    }
    return snapshotKey(snap) === snapshotKey(current)
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
