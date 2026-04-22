/**
 * 黄历模块 Store
 *
 * 持久化查询日期（year/month/day）与当前选中的事由筛选。
 * 设计文档 §4.7：按日期工作，与生辰无关；不依赖 BirthInput。
 *
 * 存储 key：`tt-divination:huangli-state`
 */

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { HuangliMatterKey } from '../types'

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

export const useHuangliStore = defineStore('huangli', () => {
  const state = useStorage<HuangliStoredState>(
    STORAGE_KEY,
    { ...today(), activeMatter: null },
    undefined,
    { mergeDefaults: true },
  )

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
  }
})

export type HuangliStore = ReturnType<typeof useHuangliStore>
