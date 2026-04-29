/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ChatMessage } from '@/composables/ai/types'

const SYSTEM_MSG: ChatMessage = { role: 'system', content: 'sys' }
function userMsg(i: number): ChatMessage {
  return { role: 'user', content: `u${i}` }
}

function makeFp(i: number): string {
  return `bazi:${i.toString(16).padStart(8, '0')}`
}

/**
 * vueuse `useStorage` 内部维护 `(key, storage)` -> ref 的全局缓存，
 * `setActivePinia(createPinia())` 只能重置 pinia store 注册表，
 * 不会重置 vueuse 的全局 ref 缓存 —— 这会导致测试间状态泄漏。
 *
 * 解决：每个 spec 用 `vi.resetModules()` + 动态 `import` store，
 * 这样 useStorage 会跟着模块重置一并失效。
 */
let useAiHistoryStore: typeof import('../aiHistory').useAiHistoryStore
let __TEST_CONSTANTS__: typeof import('../aiHistory').__TEST_CONSTANTS__

beforeEach(async () => {
  localStorage.clear()
  vi.resetModules()
  const mod = await import('../aiHistory')
  useAiHistoryStore = mod.useAiHistoryStore
  __TEST_CONSTANTS__ = mod.__TEST_CONSTANTS__
  setActivePinia(createPinia())
})

afterEach(() => {
  localStorage.clear()
})

describe('aiHistory store — LRU eviction (P6-02)', () => {
  it('keeps only MAX_SESSIONS by evicting the LRU tail', () => {
    const store = useAiHistoryStore()
    const max = __TEST_CONSTANTS__.MAX_SESSIONS

    for (let i = 0; i < max + 3; i++) {
      store.loadOrCreate({
        fingerprint: makeFp(i),
        moduleId: 'bazi',
        displayLabel: `fp ${i}`,
        initialMessages: [SYSTEM_MSG],
      })
    }

    expect(store.count).toBe(max)
    expect(store.get(makeFp(0))).toBeUndefined()
    expect(store.get(makeFp(1))).toBeUndefined()
    expect(store.get(makeFp(2))).toBeUndefined()
    expect(store.get(makeFp(max + 2))).toBeDefined()
  })

  it('promotes a session to the head on read & write', () => {
    const store = useAiHistoryStore()
    store.loadOrCreate({ fingerprint: makeFp(0), moduleId: 'bazi', displayLabel: 'a' })
    store.loadOrCreate({ fingerprint: makeFp(1), moduleId: 'bazi', displayLabel: 'b' })
    store.loadOrCreate({ fingerprint: makeFp(2), moduleId: 'bazi', displayLabel: 'c' })

    expect(store.listAll().map((s) => s.fingerprint)).toEqual([makeFp(2), makeFp(1), makeFp(0)])

    store.appendMessage(makeFp(0), userMsg(1))

    expect(store.listAll().map((s) => s.fingerprint)).toEqual([makeFp(0), makeFp(2), makeFp(1)])
  })

  it('evicts the OLDEST (by lru-tail) when over MAX_SESSIONS, never the most recent', () => {
    const store = useAiHistoryStore()
    const max = __TEST_CONSTANTS__.MAX_SESSIONS

    for (let i = 0; i < max; i++) {
      store.loadOrCreate({ fingerprint: makeFp(i), moduleId: 'bazi', displayLabel: `s${i}` })
    }

    store.appendMessage(makeFp(0), userMsg(1))

    store.loadOrCreate({ fingerprint: makeFp(max), moduleId: 'bazi', displayLabel: 'newest' })

    expect(store.get(makeFp(0))).toBeDefined()
    expect(store.get(makeFp(1))).toBeUndefined()
    expect(store.get(makeFp(max))).toBeDefined()
    expect(store.count).toBe(max)
  })

  it('clears prior sessions when fingerprint already exists (loadOrCreate is idempotent)', () => {
    const store = useAiHistoryStore()
    const fp = makeFp(0)

    store.loadOrCreate({ fingerprint: fp, moduleId: 'bazi', displayLabel: 'a' })
    store.appendMessage(fp, userMsg(1))
    store.appendMessage(fp, userMsg(2))

    const reused = store.loadOrCreate({ fingerprint: fp, moduleId: 'bazi', displayLabel: 'a' })
    expect(reused.messages.length).toBe(2)
    expect(reused.messages[1].content).toBe('u2')
  })
})

describe('aiHistory store — message-cap eviction (P6-09 collaborator)', () => {
  it('keeps the leading system message and trims the oldest non-system messages on overflow', () => {
    const store = useAiHistoryStore()
    const max = __TEST_CONSTANTS__.MAX_MESSAGES_PER_SESSION
    const fp = makeFp(0)

    store.loadOrCreate({ fingerprint: fp, moduleId: 'bazi', displayLabel: 'cap', initialMessages: [SYSTEM_MSG] })

    const total = max + 5
    for (let i = 0; i < total; i++) {
      store.appendMessage(fp, userMsg(i))
    }

    const session = store.get(fp)!
    expect(session.messages.length).toBe(max)
    expect(session.messages[0]).toEqual(SYSTEM_MSG)
    expect(session.messages.at(-1)?.content).toBe(`u${total - 1}`)
    expect(session.messages[1].content).toBe(`u${total - max + 1}`)
  })

  it('drops from the head when there is no leading system message', () => {
    const store = useAiHistoryStore()
    const max = __TEST_CONSTANTS__.MAX_MESSAGES_PER_SESSION
    const fp = makeFp(0)

    store.loadOrCreate({ fingerprint: fp, moduleId: 'bazi', displayLabel: 'no-sys' })
    for (let i = 0; i < max + 3; i++) store.appendMessage(fp, userMsg(i))

    const session = store.get(fp)!
    expect(session.messages.length).toBe(max)
    expect(session.messages[0].content).toBe('u3')
    expect(session.messages.at(-1)?.content).toBe(`u${max + 2}`)
  })

  it('does nothing when message count is at exactly the cap', () => {
    const store = useAiHistoryStore()
    const max = __TEST_CONSTANTS__.MAX_MESSAGES_PER_SESSION
    const fp = makeFp(0)

    store.loadOrCreate({ fingerprint: fp, moduleId: 'bazi', displayLabel: 'eq', initialMessages: [SYSTEM_MSG] })
    for (let i = 0; i < max - 1; i++) store.appendMessage(fp, userMsg(i))

    const session = store.get(fp)!
    expect(session.messages.length).toBe(max)
    expect(session.messages[0]).toEqual(SYSTEM_MSG)
    expect(session.messages[1].content).toBe('u0')
  })
})

describe('aiHistory store — basics', () => {
  it('clearAll() drops every session and resets lru', () => {
    const store = useAiHistoryStore()
    for (let i = 0; i < 5; i++) {
      store.loadOrCreate({ fingerprint: makeFp(i), moduleId: 'bazi', displayLabel: `s${i}` })
    }
    expect(store.count).toBe(5)

    store.clearAll()
    expect(store.count).toBe(0)
    expect(store.listAll()).toEqual([])
  })

  it('totalMessages aggregates across all sessions', () => {
    const store = useAiHistoryStore()
    store.loadOrCreate({ fingerprint: makeFp(0), moduleId: 'bazi', displayLabel: 'a', initialMessages: [SYSTEM_MSG] })
    store.appendMessage(makeFp(0), userMsg(1))
    store.loadOrCreate({ fingerprint: makeFp(1), moduleId: 'ziwei', displayLabel: 'b' })
    store.appendMessage(makeFp(1), userMsg(2))
    store.appendMessage(makeFp(1), userMsg(3))

    expect(store.totalMessages).toBe(2 + 2)
  })

  it('removeSession evicts that fingerprint from both sessions and lru', () => {
    const store = useAiHistoryStore()
    store.loadOrCreate({ fingerprint: makeFp(0), moduleId: 'bazi', displayLabel: 'a' })
    store.loadOrCreate({ fingerprint: makeFp(1), moduleId: 'bazi', displayLabel: 'b' })

    store.removeSession(makeFp(0))

    expect(store.get(makeFp(0))).toBeUndefined()
    expect(store.listAll().map((s) => s.fingerprint)).toEqual([makeFp(1)])
  })
})
