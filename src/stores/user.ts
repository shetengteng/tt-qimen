import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

export interface BirthInput {
  calendar: 'solar' | 'lunar'
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: 'male' | 'female'
  longitude?: number
  birthplace?: string
}

export const DEFAULT_BIRTH: BirthInput = {
  calendar: 'solar',
  year: 1990,
  month: 5,
  day: 20,
  hour: 12,
  minute: 0,
  gender: 'male',
}

/** 姓名长度限制（命名学常识：单姓 1 字 + 名 1~2 字 / 复姓 2 字 + 名 1~2 字 → 4 字内最常见，宽松到 16 兼容外文） */
export const NAME_MAX_LENGTH = 16

/**
 * 判定 birth 是否仍处于初始默认值（用于决定首屏要不要自动排盘）。
 * 仅比对参与排盘计算的字段；longitude / birthplace 不影响。
 */
export function isDefaultBirth(b: BirthInput): boolean {
  return (
    b.calendar === DEFAULT_BIRTH.calendar
    && b.year === DEFAULT_BIRTH.year
    && b.month === DEFAULT_BIRTH.month
    && b.day === DEFAULT_BIRTH.day
    && b.hour === DEFAULT_BIRTH.hour
    && b.minute === DEFAULT_BIRTH.minute
    && b.gender === DEFAULT_BIRTH.gender
  )
}

/**
 * 全局用户态。
 *
 * 字段说明：
 *  - `birth`：生辰输入，跨模块共享（八字 / 紫微 / 称骨 / 黄历 / 灵签 / 小六壬 / 解梦）
 *  - `name`：姓名（单 string）。统一作为跨模块"权威 display name"使用：
 *      · 分享卡截图 fileName（如 `bazi-王某某-1990-05-20.png`）
 *      · 命盘报告标题
 *    数据流：xingming 模块拥有结构化输入 `{ surname, givenName, ... }`，每次 surname /
 *    givenName 变化时**单向派生写入** `surname + givenName` 到本字段（见
 *    `src/modules/xingming/stores/xingmingStore.ts` 的 watch 逻辑）。
 *    其他模块只读消费本字段；为空时各模块 fallback 到 birth-only 命名方案。
 */
export const useUserStore = defineStore('user', () => {
  const birth = useStorage<BirthInput>('tt-qimen:birth', { ...DEFAULT_BIRTH }, undefined, {
    mergeDefaults: true,
  })

  const name = useStorage<string>('tt-qimen:name', '')

  function update(patch: Partial<BirthInput>) {
    birth.value = { ...birth.value, ...patch }
  }

  function reset() {
    birth.value = { ...DEFAULT_BIRTH }
  }

  /**
   * 设置姓名。
   * - 自动 trim：去除首尾空白（避免 localStorage 内存空白姓名）
   * - 长度上限按 NAME_MAX_LENGTH 截断（防御过长输入污染 storage / UI）
   * - 不做内容校验：允许中英文、连字符、空格在中间（如 "Alice Wang"）
   */
  function setName(next: string) {
    const trimmed = (next ?? '').trim().slice(0, NAME_MAX_LENGTH)
    name.value = trimmed
  }

  const hasName = computed(() => name.value.length > 0)
  const isDefault = computed(() => isDefaultBirth(birth.value))

  return { birth, name, update, reset, setName, hasName, isDefault }
})
