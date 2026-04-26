/**
 * 姓名学模块独立 store —— 与其他模块完全隔离。
 *
 * Storage namespace:
 *   `tt-qimen:xingming:input`        — 用户输入（姓 / 名 / 性别 / 出生年）
 *   `tt-qimen:xingming:lastComputed` — 上次成功计算的 input 快照（按 hash 缓存恢复）
 *
 * 与 chengguStore / ziweiStore 等其他模块 store 保持相同范式：
 *   - 独立 localStorage key，避免多模块状态相互污染
 *   - 提供 update / reset / isDefault 工具
 *
 * 本模块不复用 UserState.birth —— 姓名学只需姓名字段，与生辰无关。
 * 性别、出生年 MVP 保留字段但不入算法（原型图保留 UI，后续三才配置扩展使用）。
 *
 * lastComputed 设计动机（2026-04-26 追加）：
 *   姓名计算是 input → result 的纯函数（同输入 = 同输出），但 result 主体内含
 *   i18n 解读文本（locale 切换会重译），故 **不缓存 result 本体**，只缓存
 *   "上次成功计算过的 input 快照"。XingmingPage 在 onMounted 时若当前 input 与
 *   快照一致，会触发 silent runCalculate + revealImmediately()，跳过 1.5s 骨架，
 *   把"刷新页面后还要从头摇一次"的体验消除。
 *   参考：灵签 P4 lastResult 快照思路，但姓名实现更简（不需要存随机种子）。
 */

import { defineStore } from 'pinia'
import { StorageSerializers, useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { Gender, XingmingInput } from '../types'

const STORAGE_KEY = 'tt-qimen:xingming:input'
const COMPUTED_KEY = 'tt-qimen:xingming:lastComputed'

export const DEFAULT_XINGMING_INPUT: XingmingInput = {
  surname: '李',
  givenName: '文轩',
  gender: 'male',
  birthYear: null,
}

export function isDefaultXingmingInput(v: XingmingInput): boolean {
  return (
    v.surname === DEFAULT_XINGMING_INPUT.surname
    && v.givenName === DEFAULT_XINGMING_INPUT.givenName
    && v.gender === DEFAULT_XINGMING_INPUT.gender
    && (v.birthYear ?? null) === (DEFAULT_XINGMING_INPUT.birthYear ?? null)
  )
}

/**
 * 把 input 序列化为可比较的字符串 key —— 故意 birthYear 用 ?? 'null' 兜底，
 * 避免 undefined 与 null 在比较时被认为不等
 */
function inputKey(v: XingmingInput): string {
  return `${v.surname}|${v.givenName}|${v.gender}|${v.birthYear ?? 'null'}`
}

function loadInitial(): XingmingInput {
  if (typeof window === 'undefined') return { ...DEFAULT_XINGMING_INPUT }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<XingmingInput>
      return { ...DEFAULT_XINGMING_INPUT, ...parsed }
    }
  } catch {
    /* 损坏的旧值走默认 */
  }
  return { ...DEFAULT_XINGMING_INPUT }
}

export const useXingmingStore = defineStore('xingming', () => {
  const input = useStorage<XingmingInput>(STORAGE_KEY, loadInitial(), undefined, {
    mergeDefaults: true,
  })
  /**
   * 上次成功计算的 input 快照。null 表示尚未计算过 / 已被 reset 清除。
   * 不存 result 主体（i18n 文本会随 locale 切换变化）；只存"哪次输入成功算过"。
   *
   * ⚠️ 必须显式传 object serializer：useStorage 会按"初始值类型"推断 serializer。
   * 这里默认值是 `null` → vueuse 推断为 boolean serializer → 后续写 object 会被
   * `String(value)` 序列化成 `[object Object]`，恢复时无法 JSON.parse。
   * 用 StorageSerializers.object 强制 JSON.stringify/parse 走 object 通道，
   * 同时保留 null 透传（StorageSerializers.object 内部会判断 null）。
   */
  const lastComputed = useStorage<XingmingInput | null>(
    COMPUTED_KEY,
    null,
    undefined,
    { serializer: StorageSerializers.object },
  )

  function update(patch: Partial<XingmingInput>) {
    input.value = { ...input.value, ...patch }
  }

  function setSurname(v: string) {
    update({ surname: v })
  }
  function setGivenName(v: string) {
    update({ givenName: v })
  }
  function setGender(v: Gender) {
    update({ gender: v })
  }
  function setBirthYear(v: number | null) {
    update({ birthYear: v })
  }

  function reset() {
    input.value = { ...DEFAULT_XINGMING_INPUT }
    lastComputed.value = null
  }

  /** 计算成功后调用：记下"这套 input 算过且没出错" */
  function recordComputed(v: XingmingInput) {
    lastComputed.value = { ...v }
  }
  /** 主动清除（重新测算时用） */
  function clearComputed() {
    lastComputed.value = null
  }
  /**
   * 是否应该走 cache 恢复路径：
   *   - 有 lastComputed 快照
   *   - 且当前 input 与快照完全一致（按 inputKey 比较）
   * 调用方收到 true 时应触发 silent runCalculate + revealImmediately（不走骨架）
   */
  function shouldRestore(): boolean {
    if (!lastComputed.value) return false
    return inputKey(input.value) === inputKey(lastComputed.value)
  }

  const isDefault = computed(() => isDefaultXingmingInput(input.value))

  return {
    input,
    update,
    setSurname,
    setGivenName,
    setGender,
    setBirthYear,
    reset,
    isDefault,
    lastComputed,
    recordComputed,
    clearComputed,
    shouldRestore,
  }
})

export type XingmingStore = ReturnType<typeof useXingmingStore>
