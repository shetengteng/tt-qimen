/**
 * 周公解梦 Store
 *
 * - 不依赖 BirthInput（见 todo §4"不依赖 BirthInput"）
 * - 会话内状态：query / selectedId / activeCategory（走 ref，不落盘）
 * - 持久化：recentSearches（最近 5 次），localStorage key `tt-divination:jiemeng-state`
 */

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import type { DreamCategoryKey } from '../types'

const STORAGE_KEY = 'tt-divination:jiemeng-state'
const MAX_RECENT = 5

interface JiemengStoredState {
  /** 最近搜索词，按时间由新到旧 */
  recentSearches: string[]
}

const DEFAULT_STATE: JiemengStoredState = {
  recentSearches: [],
}

export const useJiemengStore = defineStore('jiemeng', () => {
  const state = useStorage<JiemengStoredState>(STORAGE_KEY, { ...DEFAULT_STATE }, undefined, {
    mergeDefaults: true,
  })

  /** 当前搜索关键词（含未 debounce 的实时输入值） */
  const query = ref('')
  /** 当前选中的分类；null 表示"全部" */
  const activeCategory = ref<DreamCategoryKey | null>(null)
  /** 当前查看详情的词条 id */
  const selectedId = ref<string | null>(null)

  function setQuery(q: string) {
    query.value = q
  }
  function setActiveCategory(cat: DreamCategoryKey | null) {
    activeCategory.value = cat
  }
  function setSelectedId(id: string | null) {
    selectedId.value = id
  }

  function pushRecent(keyword: string) {
    const k = keyword.trim()
    if (!k) return
    const list = [...state.value.recentSearches]
    const idx = list.indexOf(k)
    if (idx !== -1) list.splice(idx, 1)
    list.unshift(k)
    state.value.recentSearches = list.slice(0, MAX_RECENT)
  }
  function clearRecent() {
    state.value.recentSearches = []
  }

  function reset() {
    query.value = ''
    activeCategory.value = null
    selectedId.value = null
  }

  return {
    state,
    query,
    activeCategory,
    selectedId,
    recentSearches: computed(() => state.value.recentSearches ?? []),
    setQuery,
    setActiveCategory,
    setSelectedId,
    pushRecent,
    clearRecent,
    reset,
  }
})

export type JiemengStore = ReturnType<typeof useJiemengStore>
