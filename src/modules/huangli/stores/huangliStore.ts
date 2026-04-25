/**
 * 黄历模块 Store
 *
 * 持久化查询日期（year/month/day）与当前选中的事由筛选。
 * 设计文档 §4.7：按日期工作，与生辰无关；不依赖 BirthInput。
 *
 * 存储 key：`tt-divination:huangli-state`
 *
 * 2026-04-25 增强（R1）：
 *   - 加月历缓存 `monthCache`（in-memory LRU，容量 6）
 *   - 切换 store.year/month 时翻看历史月份不再重复调用 tyme4ts
 *   - 缓存仅存活在内存，不持久化（节省 localStorage 空间，且数据是计算结果可重建）
 */

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, shallowRef } from 'vue'
import type { HuangliMatterKey, HuangliMonth } from '../types'
import { getHuangliMonth } from '../core/huangli'

const MONTH_CACHE_CAPACITY = 6

const STORAGE_KEY = 'tt-divination:huangli-state'

interface HuangliStoredState {
  year: number
  month: number
  day: number
  /** 当前月历高亮的事由（null = 不高亮任何事由） */
  activeMatter: HuangliMatterKey | null
}

function today(): { year: number; month: number; day: number } {
  const d = new Date()
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  }
}

function monthKey(y: number, m: number): string {
  return `${y}-${String(m).padStart(2, '0')}`
}

export const useHuangliStore = defineStore('huangli', () => {
  const state = useStorage<HuangliStoredState>(
    STORAGE_KEY,
    { ...today(), activeMatter: null },
    undefined,
    { mergeDefaults: true },
  )

  /**
   * 月历缓存（in-memory LRU，按 `${year}-${month}` hash）。
   * 用 shallowRef 持有 Map，避免 Pinia 深度响应大对象（HuangliMonth.days 42 项）影响性能。
   * Map 自带插入顺序，淘汰最早的 key 即可实现 LRU。
   */
  const monthCache = shallowRef(new Map<string, HuangliMonth>())
  // 命中统计（仅用于诊断与 Playwright 探针验证）
  let cacheHits = 0
  let cacheMisses = 0

  function getMonthCached(y: number, m: number): HuangliMonth {
    const key = monthKey(y, m)
    const cache = monthCache.value
    const hit = cache.get(key)
    if (hit) {
      cacheHits++
      // LRU touch：先 delete 再 set，使其挪到最尾（最近使用）
      cache.delete(key)
      cache.set(key, hit)
      return hit
    }
    cacheMisses++
    const fresh = getHuangliMonth(y, m)
    cache.set(key, fresh)
    while (cache.size > MONTH_CACHE_CAPACITY) {
      const oldestKey = cache.keys().next().value
      if (oldestKey === undefined) break
      cache.delete(oldestKey)
    }
    return fresh
  }

  /** 仅诊断 / 测试用。 */
  function _cacheStats() {
    return {
      hits: cacheHits,
      misses: cacheMisses,
      size: monthCache.value.size,
      keys: Array.from(monthCache.value.keys()),
    }
  }

  function clearMonthCache() {
    monthCache.value = new Map<string, HuangliMonth>()
    cacheHits = 0
    cacheMisses = 0
  }

  function setDate(y: number, m: number, d: number) {
    state.value.year = y
    state.value.month = m
    state.value.day = d
  }

  function setToToday() {
    const t = today()
    state.value.year = t.year
    state.value.month = t.month
    state.value.day = t.day
  }

  function setActiveMatter(key: HuangliMatterKey | null) {
    state.value.activeMatter = key
  }

  /**
   * 月份跳转。超出 12 / 小于 1 会年份进位，并把 day 限制到"新月"的末日以内。
   */
  function shiftMonth(delta: number) {
    let y = state.value.year
    let m = state.value.month + delta
    while (m > 12) { m -= 12; y += 1 }
    while (m < 1) { m += 12; y -= 1 }
    const lastDay = new Date(y, m, 0).getDate()
    state.value.year = y
    state.value.month = m
    if (state.value.day > lastDay) state.value.day = lastDay
  }

  return {
    state,
    year: computed(() => state.value.year),
    month: computed(() => state.value.month),
    day: computed(() => state.value.day),
    activeMatter: computed(() => state.value.activeMatter),
    setDate,
    setToToday,
    setActiveMatter,
    shiftMonth,
    getMonthCached,
    clearMonthCache,
    _cacheStats,
  }
})

export type HuangliStore = ReturnType<typeof useHuangliStore>
