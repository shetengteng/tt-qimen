import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ModuleId } from '@/router'

interface CacheEntry {
  hash: string
  result: unknown
}

export const useDivinationStore = defineStore('divination', () => {
  const cache = ref<Partial<Record<ModuleId, CacheEntry>>>({})

  function get<T>(moduleId: ModuleId, hash: string): T | undefined {
    const hit = cache.value[moduleId]
    return hit && hit.hash === hash ? (hit.result as T) : undefined
  }

  function set<T>(moduleId: ModuleId, hash: string, result: T) {
    cache.value[moduleId] = { hash, result }
  }

  function clear(moduleId?: ModuleId) {
    if (moduleId) delete cache.value[moduleId]
    else cache.value = {}
  }

  return { cache, get, set, clear }
})
