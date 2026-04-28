import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { ChatMessage } from '@/composables/ai/types'
import type { ModuleId } from '@/router'

const STORAGE_KEY = 'tt-qimen:ai-history'

/** 单个会话条目 */
export interface ChatSession {
  /** fingerprint：moduleId × 关键入参，由 buildFingerprintSync 生成 */
  fingerprint: string
  moduleId: ModuleId
  /** 用于设置页 / 历史抽屉显示，例如「八字 · 甲子年 · 丙午月」 */
  displayLabel: string
  /** 含 system + assistant + user 的完整消息流（system 首条始终保留） */
  messages: ChatMessage[]
  /** 创建时间戳（ms） */
  createdAt: number
  /** 最近一次写入时间戳（ms），LRU 排序键 */
  updatedAt: number
}

interface HistoryState {
  /** 全部会话；key 为 fingerprint */
  sessions: Record<string, ChatSession>
  /** LRU 顺序：最近使用在最前；超出上限时从尾部 evict */
  lru: string[]
}

const DEFAULT_STATE: HistoryState = { sessions: {}, lru: [] }

/** 同时保留的会话上限（含所有模块） */
const MAX_SESSIONS = 50

/** 单条会话最大消息数（防极端长会话占满 storage） */
const MAX_MESSAGES_PER_SESSION = 200

/**
 * AI 对话历史 store —— 按命盘 fingerprint 隔离。
 *
 * 设计要点：
 *   - **不在写入路径做磁盘 IO 节流**：useStorage 内部已有 RAF/同步策略，此处保持同步赋值即可；
 *     若后续监控到 hot-write 卡顿，再外层加 throttle，不在此处过早优化
 *   - **system 消息始终保留**：发送给 LLM 时由调用方对 messages 做"保留 system + 末尾 N"裁剪，
 *     本 store 只管完整持久化（设计文档 §6.2 已经说明 UI 层 50 条 / 网络层 20 条的边界）
 *   - **fingerprint 不在此处生成**：调用方负责传入（一般来自 contextBuilder 的 AiContext.fingerprint），
 *     避免 store 反向依赖 ai 模块
 *   - **LRU**：每次读 / 写都把目标 fingerprint 提到队首；超过 MAX_SESSIONS 时尾部 evict
 *   - **消息上限**：超过 MAX_MESSAGES_PER_SESSION 时，在保留首条 system 的前提下从第 2 条开始裁剪，
 *     避免无限增长
 */
export const useAiHistoryStore = defineStore('aiHistory', () => {
  const state = useStorage<HistoryState>(
    STORAGE_KEY,
    { ...DEFAULT_STATE },
    undefined,
    { mergeDefaults: true },
  )

  const count = computed(() => state.value.lru.length)
  const totalMessages = computed(() => {
    let n = 0
    for (const fp of state.value.lru) n += state.value.sessions[fp]?.messages.length ?? 0
    return n
  })

  function get(fingerprint: string): ChatSession | undefined {
    return state.value.sessions[fingerprint]
  }

  function loadOrCreate(input: {
    fingerprint: string
    moduleId: ModuleId
    displayLabel: string
    initialMessages?: ChatMessage[]
  }): ChatSession {
    const existing = state.value.sessions[input.fingerprint]
    if (existing) {
      touchLru(input.fingerprint)
      return existing
    }
    const now = Date.now()
    const fresh: ChatSession = {
      fingerprint: input.fingerprint,
      moduleId: input.moduleId,
      displayLabel: input.displayLabel,
      messages: input.initialMessages ? [...input.initialMessages] : [],
      createdAt: now,
      updatedAt: now,
    }
    state.value.sessions[input.fingerprint] = fresh
    state.value.lru = [input.fingerprint, ...state.value.lru.filter((fp) => fp !== input.fingerprint)]
    enforceMaxSessions()
    return fresh
  }

  function appendMessage(fingerprint: string, message: ChatMessage): void {
    const s = state.value.sessions[fingerprint]
    if (!s) return
    s.messages.push(message)
    s.updatedAt = Date.now()
    enforceMaxMessages(s)
    touchLru(fingerprint)
  }

  function setMessages(fingerprint: string, messages: ChatMessage[]): void {
    const s = state.value.sessions[fingerprint]
    if (!s) return
    s.messages = [...messages]
    s.updatedAt = Date.now()
    enforceMaxMessages(s)
    touchLru(fingerprint)
  }

  function removeSession(fingerprint: string): void {
    delete state.value.sessions[fingerprint]
    state.value.lru = state.value.lru.filter((fp) => fp !== fingerprint)
  }

  function clearAll(): void {
    state.value = { sessions: {}, lru: [] }
  }

  function listAll(): ChatSession[] {
    return state.value.lru
      .map((fp) => state.value.sessions[fp])
      .filter((s): s is ChatSession => Boolean(s))
  }

  function touchLru(fingerprint: string): void {
    const next = [fingerprint, ...state.value.lru.filter((fp) => fp !== fingerprint)]
    state.value.lru = next
  }

  function enforceMaxSessions(): void {
    while (state.value.lru.length > MAX_SESSIONS) {
      const evict = state.value.lru.pop()
      if (evict) delete state.value.sessions[evict]
    }
  }

  function enforceMaxMessages(s: ChatSession): void {
    if (s.messages.length <= MAX_MESSAGES_PER_SESSION) return
    const overflow = s.messages.length - MAX_MESSAGES_PER_SESSION
    const head = s.messages[0]
    const headIsSystem = head?.role === 'system'
    if (headIsSystem) {
      s.messages = [head, ...s.messages.slice(1 + overflow)]
    } else {
      s.messages = s.messages.slice(overflow)
    }
  }

  return {
    state,
    count,
    totalMessages,
    get,
    loadOrCreate,
    appendMessage,
    setMessages,
    removeSession,
    clearAll,
    listAll,
  }
})
