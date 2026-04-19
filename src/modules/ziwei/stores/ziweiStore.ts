/**
 * 紫微模块独立 store —— 与其他模块完全隔离。
 *
 * Storage namespace: `tt-qimen:ziwei:*`
 *  - tt-qimen:ziwei:birth     （生辰输入）
 *
 * 后续可拓展：
 *  - tt-qimen:ziwei:cache:<hash>   （iztro 排盘结果缓存）
 *  - tt-qimen:ziwei:history        （历史命盘列表）
 *  - tt-qimen:ziwei:settings       （模块级偏好，如默认显示三方四正）
 *
 * 向后兼容：首次访问时若 ziwei key 不存在，从旧的 `tt-qimen:birth` 复制一份。
 */
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import {
  type BirthInput,
  DEFAULT_BIRTH,
  isDefaultBirth,
} from '@/stores/user'

const STORAGE_KEY = 'tt-qimen:ziwei:birth'
const LEGACY_KEY = 'tt-qimen:birth'

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

  function update(patch: Partial<BirthInput>) {
    birth.value = { ...birth.value, ...patch }
  }

  function reset() {
    birth.value = { ...DEFAULT_BIRTH }
  }

  const isDefault = computed(() => isDefaultBirth(birth.value))

  return { birth, update, reset, isDefault }
})

export type ZiweiStore = ReturnType<typeof useZiweiStore>
