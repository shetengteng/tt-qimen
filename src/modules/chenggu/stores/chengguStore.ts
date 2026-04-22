/**
 * 称骨模块独立 store —— 与其他模块完全隔离。
 *
 * Storage namespace: `tt-qimen:chenggu:birth`
 *
 * 首次进入时若 chenggu key 不存在，从旧的 `tt-qimen:birth` 迁移一份
 *（保持与八字 / 紫微子 store 相同的兜底策略）。
 */
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import {
  type BirthInput,
  DEFAULT_BIRTH,
  isDefaultBirth,
} from '@/stores/user'

const STORAGE_KEY = 'tt-qimen:chenggu:birth'
const LEGACY_KEY = 'tt-qimen:birth'

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

  function update(patch: Partial<BirthInput>) {
    birth.value = { ...birth.value, ...patch }
  }

  function reset() {
    birth.value = { ...DEFAULT_BIRTH }
  }

  const isDefault = computed(() => isDefaultBirth(birth.value))

  return { birth, update, reset, isDefault }
})

export type ChengguStore = ReturnType<typeof useChengguStore>
