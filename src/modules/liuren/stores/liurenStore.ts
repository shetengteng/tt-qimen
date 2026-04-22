/**
 * 小六壬独立 Store
 *
 * 注意：本模块不依赖 BirthInput（与生辰无关）。
 * 状态包含两种模式：
 *   - immediate：即时起卦，使用当前时间
 *   - custom：自定月/日/时（农历）
 *
 * 状态持久化：问事心念、分面选择、手动模式下的月日时。
 */

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { Aspect } from '../types'

export type LiurenMode = 'immediate' | 'custom'

export interface LiurenCustomInput {
  month: number
  day: number
  /** 时辰序号 1=子, 12=亥 */
  hourIndex: number
}

const STORAGE_KEY = 'tt-divination:liuren-input'

interface LiurenStoredState {
  mode: LiurenMode
  aspect: Aspect
  question: string
  custom: LiurenCustomInput
}

const DEFAULT_STATE: LiurenStoredState = {
  mode: 'immediate',
  aspect: 'overall',
  question: '',
  custom: {
    month: 3,
    day: 2,
    hourIndex: 7,
  },
}

export const useLiurenStore = defineStore('liuren', () => {
  const state = useStorage<LiurenStoredState>(STORAGE_KEY, { ...DEFAULT_STATE }, undefined, {
    mergeDefaults: true,
  })

  function setMode(m: LiurenMode) {
    state.value.mode = m
  }
  function setAspect(a: Aspect) {
    state.value.aspect = a
  }
  function setQuestion(q: string) {
    state.value.question = q
  }
  function setCustom(patch: Partial<LiurenCustomInput>) {
    state.value.custom = { ...state.value.custom, ...patch }
  }
  function reset() {
    state.value = { ...DEFAULT_STATE, custom: { ...DEFAULT_STATE.custom } }
  }

  return {
    state,
    mode: computed(() => state.value.mode),
    aspect: computed(() => state.value.aspect),
    question: computed(() => state.value.question),
    custom: computed(() => state.value.custom),
    setMode,
    setAspect,
    setQuestion,
    setCustom,
    reset,
  }
})

export type LiurenStore = ReturnType<typeof useLiurenStore>
