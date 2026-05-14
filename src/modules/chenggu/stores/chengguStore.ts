/**
 * 称骨模块独立 store —— 与其他模块完全隔离。
 *
 * Storage namespace:
 *   - `tt-qimen:chenggu:birth`         （生辰输入）
 *   - `tt-qimen:chenggu:last-computed` （上次成功测算的 birth 指纹，刷新后用于静默恢复）
 *
 * 首次进入时若 chenggu key 不存在，从旧的 `tt-qimen:birth` 迁移一份
 *（保持与八字 / 紫微子 store 相同的兜底策略）。
 *
 * lastComputed 设计：与 baziStore / ziweiStore 同构 —— 仅记录"哪一组 birth 已成功
 * 测算过"，不缓存 result 本体（calculateChenggu 是纯函数 < 5ms，重算成本可忽略，
 * 跨版本反序列化嵌套对象反而更脏）。
 */
import { defineStore } from 'pinia'
import { StorageSerializers, useStorage } from '@vueuse/core'
import { computed } from 'vue'
import {
  type BirthInput,
  DEFAULT_BIRTH,
  isDefaultBirth,
} from '@/stores/user'

const STORAGE_KEY = 'tt-qimen:chenggu:birth'
const LEGACY_KEY = 'tt-qimen:birth'
const COMPUTED_KEY = 'tt-qimen:chenggu:last-computed'

/**
 * 用于 lastComputed 比对的输入快照（与 baziStore 同构，但只含称骨算法实际依赖的字段）。
 * 称骨算法不依赖 minute / longitude，故省略。
 */
export interface ChengguComputedSnapshot {
  calendar: BirthInput['calendar']
  year: number
  month: number
  day: number
  hour: number
  gender: BirthInput['gender']
}

function snapshotKey(s: ChengguComputedSnapshot): string {
  return [s.calendar, s.year, s.month, s.day, s.hour, s.gender].join('|')
}

function birthToSnapshot(b: BirthInput): ChengguComputedSnapshot {
  return {
    calendar: b.calendar,
    year: b.year,
    month: b.month,
    day: b.day,
    hour: b.hour,
    gender: b.gender,
  }
}

function loadInitial(): BirthInput {
  if (typeof window === 'undefined') return { ...DEFAULT_BIRTH }
  try {
    const own = window.localStorage.getItem(STORAGE_KEY)
    if (own) return JSON.parse(own) as BirthInput
    const legacy = window.localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const parsed = JSON.parse(legacy) as BirthInput
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      return parsed
    }
  } catch {
    /* 忽略损坏的旧值，按默认走 */
  }
  return { ...DEFAULT_BIRTH }
}

export const useChengguStore = defineStore('chenggu', () => {
  const birth = useStorage<BirthInput>(STORAGE_KEY, loadInitial(), undefined, {
    mergeDefaults: true,
  })

  /**
   * 上次成功测算的 birth 指纹快照。null 表示从未测算 / 已被清空。
   * 显式指定 StorageSerializers.object 以避免 useStorage 在 default 为 null 时被
   * 推断为 boolean 序列化器，导致对象写入后变成 "[object Object]"。
   */
  const lastComputed = useStorage<ChengguComputedSnapshot | null>(
    COMPUTED_KEY,
    null,
    undefined,
    { serializer: StorageSerializers.object },
  )

  function update(patch: Partial<BirthInput>) {
    birth.value = { ...birth.value, ...patch }
  }

  function reset() {
    birth.value = { ...DEFAULT_BIRTH }
    lastComputed.value = null
  }

  /** 记录一次成功测算，用当前 birth 生成指纹覆盖旧值。 */
  function recordComputed() {
    lastComputed.value = birthToSnapshot(birth.value)
  }

  function clearComputed() {
    lastComputed.value = null
  }

  /**
   * 判断本次挂载是否可以从 lastComputed 静默恢复：
   *   有缓存 + 缓存指纹与当前 birth 指纹完全一致。
   */
  const shouldRestore = computed<boolean>(() => {
    const snap = lastComputed.value
    if (snap == null || typeof snap !== 'object') return false
    return snapshotKey(snap) === snapshotKey(birthToSnapshot(birth.value))
  })

  const isDefault = computed(() => isDefaultBirth(birth.value))

  return {
    birth,
    update,
    reset,
    isDefault,
    lastComputed: computed(() => lastComputed.value),
    shouldRestore,
    recordComputed,
    clearComputed,
  }
})

export type ChengguStore = ReturnType<typeof useChengguStore>
