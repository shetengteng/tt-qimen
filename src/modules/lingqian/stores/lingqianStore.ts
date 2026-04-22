/**
 * 观音灵签独立 Store
 *
 * 不依赖 BirthInput；状态包含：
 *   - 用户输入：question（心中所问）+ preferredTopic（占问领域）
 *   - 抽签历史：lastId（避免连续抽同一签）+ drawCount（累计抽签次数，用于温和限流）
 *
 * 状态持久化到 localStorage（key: tt-divination:lingqian-state）。
 */

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { LingqianTopicKey } from '../types'

const STORAGE_KEY = 'tt-divination:lingqian-state'

interface LingqianStoredState {
  question: string
  preferredTopic: LingqianTopicKey
  lastId: number
  drawCount: number
}

const DEFAULT_STATE: LingqianStoredState = {
  question: '',
  preferredTopic: 'overall',
  lastId: 0,
  drawCount: 0,
}

export const useLingqianStore = defineStore('lingqian', () => {
  const state = useStorage<LingqianStoredState>(STORAGE_KEY, { ...DEFAULT_STATE }, undefined, {
    mergeDefaults: true,
  })

  function setQuestion(q: string) {
    state.value.question = q
  }
  function setPreferredTopic(t: LingqianTopicKey) {
    state.value.preferredTopic = t
  }
  function recordDraw(id: number) {
    state.value.lastId = id
    state.value.drawCount = (state.value.drawCount ?? 0) + 1
  }
  function reset() {
    state.value = { ...DEFAULT_STATE }
  }

  return {
    state,
    question: computed(() => state.value.question),
    preferredTopic: computed(() => state.value.preferredTopic),
    lastId: computed(() => state.value.lastId),
    drawCount: computed(() => state.value.drawCount),
    setQuestion,
    setPreferredTopic,
    recordDraw,
    reset,
  }
})

export type LingqianStore = ReturnType<typeof useLingqianStore>
