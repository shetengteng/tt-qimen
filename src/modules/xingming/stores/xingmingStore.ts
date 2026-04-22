/**
 * 姓名学模块独立 store —— 与其他模块完全隔离。
 *
 * Storage namespace: `tt-qimen:xingming:input`
 *
 * 与 chengguStore / ziweiStore 等其他模块 store 保持相同范式：
 *   - 独立 localStorage key，避免多模块状态相互污染
 *   - 提供 update / reset / isDefault 工具
 *
 * 本模块不复用 UserState.birth —— 姓名学只需姓名字段，与生辰无关。
 * 性别、出生年 MVP 保留字段但不入算法（原型图保留 UI，后续三才配置扩展使用）。
 */

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { Gender, XingmingInput } from '../types'

const STORAGE_KEY = 'tt-qimen:xingming:input'

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
  }
})

export type XingmingStore = ReturnType<typeof useXingmingStore>
