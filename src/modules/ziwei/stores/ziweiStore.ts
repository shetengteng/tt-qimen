/**
 * 紫微模块独立 store —— 与其他模块完全隔离。
 *
 * Storage namespace: `tt-qimen:ziwei:*`
 *  - tt-qimen:ziwei:birth         （生辰输入）
 *  - tt-qimen:ziwei:last-computed （上次成功排盘的 birth 指纹，刷新后用于静默恢复 P4）
 *
 * 后续可拓展：
 *  - tt-qimen:ziwei:cache:<hash>   （iztro 排盘结果缓存）
 *  - tt-qimen:ziwei:history        （历史命盘列表）
 *  - tt-qimen:ziwei:settings       （模块级偏好，如默认显示三方四正）
 *
 * 向后兼容：首次访问时若 ziwei key 不存在，从旧的 `tt-qimen:birth` 复制一份。
 *
 * 设计取舍：与 `baziStore.lastComputed` 对齐，**不序列化 ZiweiChart 本体**。
 * iztro 排盘 < 200ms，mount 时重算（同 birth → 同 chart 的确定性）比跨版本反序列化
 * 一个嵌套深的 chart 对象更安全干净。
 */
import { defineStore } from 'pinia'
import { StorageSerializers, useStorage } from '@vueuse/core'
import { computed } from 'vue'
import {
  type BirthInput,
  DEFAULT_BIRTH,
  isDefaultBirth,
} from '@/stores/user'

const STORAGE_KEY = 'tt-qimen:ziwei:birth'
const LEGACY_KEY = 'tt-qimen:birth'
const COMPUTED_KEY = 'tt-qimen:ziwei:last-computed'

/** 用于 lastComputed 比对的输入快照（与 baziStore 同构）。 */
export interface ZiweiComputedSnapshot {
  calendar: BirthInput['calendar']
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: BirthInput['gender']
  longitude?: number
}

function snapshotKey(s: ZiweiComputedSnapshot): string {
  return [
    s.calendar,
    s.year,
    s.month,
    s.day,
    s.hour,
    s.minute,
    s.gender,
    s.longitude ?? 'na',
  ].join('|')
}

function birthToSnapshot(b: BirthInput): ZiweiComputedSnapshot {
  return {
    calendar: b.calendar,
    year: b.year,
    month: b.month,
    day: b.day,
    hour: b.hour,
    minute: b.minute,
    gender: b.gender,
    longitude: b.longitude,
  }
}

/** 首次进入紫微页时尝试从旧 key 迁移（不删旧 key，保留兼容）。 */
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

export const useZiweiStore = defineStore('ziwei', () => {
  const birth = useStorage<BirthInput>(STORAGE_KEY, loadInitial(), undefined, {
    mergeDefaults: true,
  })

  /**
   * 上次成功排盘的 birth 指纹快照（P4 · 输入指纹模式，与 baziStore / liurenStore 一致）。
   * 显式指定 StorageSerializers.object，避免 default null 时被推断为 boolean serializer。
   */
  const lastComputed = useStorage<ZiweiComputedSnapshot | null>(
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

  /**
   * 记录一次成功的排盘，用当前 birth 生成指纹覆盖旧值。
   */
  function recordComputed() {
    lastComputed.value = birthToSnapshot(birth.value)
  }

  function clearComputed() {
    lastComputed.value = null
  }

  /**
   * 判断本次挂载是否可以从 lastComputed 静默恢复：
   *   有缓存 + 缓存指纹与当前 birth 完全一致。
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

export type ZiweiStore = ReturnType<typeof useZiweiStore>
