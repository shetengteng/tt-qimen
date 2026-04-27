/**
 * 八字模块独立 store —— 复用全局 `useUserStore.birth` 作为输入；
 * 本 store 仅承载"最近一次成功排盘"的输入指纹，用于刷新页面后判断
 * 是否可静默恢复命盘（P4 · 输入指纹模式，与小六壬 `liurenStore` 对齐）。
 *
 * Storage namespace: `tt-qimen:bazi:*`
 *  - tt-qimen:bazi:last-computed   （上次成功排盘的 birth 指纹快照）
 *
 * 设计取舍：
 *  - 不序列化 BaziChart 本体：chart 字段多、结构演进快，跨版本反序列化易脏；
 *    八字是**确定性计算**（同 birth → 同 chart），mount 时重算（< 50ms）即可。
 *  - 仅记录"哪一组 birth 已成功排过盘"，避免刷新后用户面对空表单 / 默认 birth
 *    需要再点一次"排盘"才能看到上次结果。
 *
 * 与 `useDivinationStore.cachedCompute`（内存缓存）层级关系：
 *  - 本 store 解决"刷新存活"（localStorage 持久化）；
 *  - cachedCompute 解决"路由间复活"（in-memory）；
 *  - 两者正交，不互相替代。本轮接入仅用本 store 的 lastComputed。
 */

import { defineStore } from 'pinia'
import { StorageSerializers, useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { BirthInput } from '@/stores/user'
import { useUserStore } from '@/stores/user'

const COMPUTED_KEY = 'tt-qimen:bazi:last-computed'

/**
 * 用于 lastComputed 比对的输入快照。仅含**参与排盘计算**的字段，
 * 故意排除 longitude / birthplace / minute（minute 当前 core 未使用）外的派生字段。
 *
 * 注：minute 仍纳入指纹 —— 真太阳时计算依赖分钟级精度，且 BirthForm 已暴露分钟输入。
 */
export interface BaziComputedSnapshot {
  calendar: BirthInput['calendar']
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: BirthInput['gender']
  /** 真太阳时影响：经度纳入指纹（undefined 与 0 区分） */
  longitude?: number
}

function snapshotKey(s: BaziComputedSnapshot): string {
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

function birthToSnapshot(b: BirthInput): BaziComputedSnapshot {
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

export const useBaziStore = defineStore('bazi', () => {
  const userStore = useUserStore()

  /**
   * 上次成功排盘的 birth 指纹。null 表示从未排盘 / 已被清空。
   * 显式指定 StorageSerializers.object，避免 default null 时被推断为 boolean serializer。
   */
  const lastComputed = useStorage<BaziComputedSnapshot | null>(
    COMPUTED_KEY,
    null,
    undefined,
    { serializer: StorageSerializers.object },
  )

  /**
   * 记录一次成功的排盘。用当前 userStore.birth 生成指纹覆盖旧值。
   */
  function recordComputed() {
    lastComputed.value = birthToSnapshot(userStore.birth)
  }

  /**
   * 清空快照（"重新排盘"按钮路径）。
   */
  function clearComputed() {
    lastComputed.value = null
  }

  /**
   * 判断本次挂载是否可以从 lastComputed 静默恢复：
   *   有缓存 + 缓存指纹与当前 birth 指纹一致。
   *
   * 完全不一致（例如 onMounted 阶段 query hydrate 改了 birth）时，
   * 应当走完整 onPaipan 流程而不是恢复。
   */
  const shouldRestore = computed<boolean>(() => {
    const snap = lastComputed.value
    if (snap == null || typeof snap !== 'object') return false
    return snapshotKey(snap) === snapshotKey(birthToSnapshot(userStore.birth))
  })

  return {
    lastComputed: computed(() => lastComputed.value),
    shouldRestore,
    recordComputed,
    clearComputed,
  }
})

export type BaziStore = ReturnType<typeof useBaziStore>
