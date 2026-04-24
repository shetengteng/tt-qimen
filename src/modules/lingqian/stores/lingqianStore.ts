/**
 * 观音灵签独立 Store
 *
 * 不依赖 BirthInput；状态包含：
 *   - 用户输入：question（心中所问）+ preferredTopic（占问领域）
 *   - 抽签历史：lastId（避免连续抽同一签）+ drawCount（累计抽签次数，用于温和限流）
 *   - **上次结果快照**：lastResult（仅存 id/topic/question/drawnAt，item 本体由 core 懒加载恢复）
 *
 * 状态持久化到 localStorage（key: tt-divination:lingqian-state）。
 * 刷新页面后，LingqianPage 会尝试用 lastResult + 数据集缓存恢复上次签文，
 * 避免"用户刚抽到一签、切回窗口又要从头摇一次"。
 */

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { LingqianTopicKey } from '../types'

const STORAGE_KEY = 'tt-divination:lingqian-state'

/**
 * 上次抽得结果的快照。故意不存 item 本体（item 文本多语言 / 可能随数据集更新而变化），
 * 页面恢复时用 `lastResult.itemId` 去 guanyin.{locale}.json 里找当前版本的 item。
 */
interface LingqianResultSnapshot {
  itemId: number
  topic: LingqianTopicKey
  question?: string
  drawnAt: number
}

interface LingqianStoredState {
  question: string
  preferredTopic: LingqianTopicKey
  lastId: number
  drawCount: number
  lastResult: LingqianResultSnapshot | null
}

const DEFAULT_STATE: LingqianStoredState = {
  question: '',
  preferredTopic: 'overall',
  lastId: 0,
  drawCount: 0,
  lastResult: null,
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
  function recordDraw(id: number, snapshot?: Omit<LingqianResultSnapshot, 'itemId'>) {
    state.value.lastId = id
    state.value.drawCount = (state.value.drawCount ?? 0) + 1
    if (snapshot) {
      state.value.lastResult = { itemId: id, ...snapshot }
    }
  }
  function clearLastResult() {
    state.value.lastResult = null
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
    lastResult: computed(() => state.value.lastResult),
    setQuestion,
    setPreferredTopic,
    recordDraw,
    clearLastResult,
    reset,
  }
})

export type LingqianStore = ReturnType<typeof useLingqianStore>
export type { LingqianResultSnapshot }
