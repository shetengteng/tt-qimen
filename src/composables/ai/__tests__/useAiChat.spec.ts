/**
 * P6-09 测试：takeRecentMessages 网络层裁剪
 *
 * 验证发给 LLM 的历史消息窗口是否符合 SEND_RECENT_TURNS 上限，
 * 而不是无限制地把整个历史推给后端。
 */
import { describe, expect, it } from 'vitest'
import { takeRecentMessages, SEND_RECENT_TURNS } from '../useAiChat'
import type { ChatMessage } from '../types'

function makeUserMsg(i: number): ChatMessage {
  return { role: 'user', content: `u${i}` }
}
function makeAssistantMsg(i: number): ChatMessage {
  return { role: 'assistant', content: `a${i}` }
}

describe('takeRecentMessages (P6-09 network-layer cap)', () => {
  it('returns the array as-is when length <= window', () => {
    const arr: ChatMessage[] = [makeUserMsg(0), makeAssistantMsg(0), makeUserMsg(1)]
    expect(takeRecentMessages(arr)).toBe(arr)
  })

  it('returns the last N messages when length > window', () => {
    const arr: ChatMessage[] = []
    for (let i = 0; i < 30; i++) {
      arr.push(makeUserMsg(i), makeAssistantMsg(i))
    }
    const taken = takeRecentMessages(arr)
    expect(taken.length).toBe(SEND_RECENT_TURNS)
    expect(taken[0]).toEqual(arr[arr.length - SEND_RECENT_TURNS])
    expect(taken[taken.length - 1]).toEqual(arr[arr.length - 1])
  })

  it('respects a custom windowSize', () => {
    const arr: ChatMessage[] = []
    for (let i = 0; i < 50; i++) arr.push(makeUserMsg(i))
    const taken = takeRecentMessages(arr, 5)
    expect(taken.length).toBe(5)
    expect(taken.map((m) => m.content)).toEqual(['u45', 'u46', 'u47', 'u48', 'u49'])
  })

  it('handles empty array gracefully', () => {
    expect(takeRecentMessages([])).toEqual([])
  })

  it('does not mutate the input array', () => {
    const arr: ChatMessage[] = []
    for (let i = 0; i < 25; i++) arr.push(makeUserMsg(i))
    const before = arr.length
    takeRecentMessages(arr)
    expect(arr.length).toBe(before)
  })
})

describe('takeRecentMessages — UI cap collaboration', () => {
  /**
   * UI 层渲染上限 50 条；网络层裁到 18。两层独立但语义协同：
   * - UI 50 条触发"已隐藏 N 条"提示
   * - 网络始终只送 18 条 + ctxMessages（system + 首次解读 narrative）
   * 此用例 verify：在 UI 满 50 条时，网络层仍然只送 18 条
   */
  it('produces a 18-message slice even when the UI buffer is at 50', () => {
    const arr: ChatMessage[] = []
    for (let i = 0; i < 50; i++) {
      arr.push(makeUserMsg(i), makeAssistantMsg(i))
    }
    const taken = takeRecentMessages(arr)
    expect(taken.length).toBe(SEND_RECENT_TURNS)
  })

  it('the LAST message in the slice is always the most recent', () => {
    const arr: ChatMessage[] = []
    for (let i = 0; i < 100; i++) {
      arr.push(makeUserMsg(i))
    }
    const taken = takeRecentMessages(arr)
    expect(taken.at(-1)?.content).toBe('u99')
    expect(taken.at(0)?.content).toBe(`u${100 - SEND_RECENT_TURNS}`)
  })
})
