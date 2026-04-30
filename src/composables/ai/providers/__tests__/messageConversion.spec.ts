/**
 * @vitest-environment happy-dom
 *
 * Tests the message-shape conversion that bridges our OpenAI-style
 * `ChatMessage[]` with the Anthropic Messages API and the Google Gemini
 * GenerativeLanguage API. The two providers diverge from OpenAI in three
 * places that have historically caused silent prod bugs:
 *
 *   1. Anthropic does not accept `role: 'system'` inside the messages array
 *      and *requires* it to live in the top-level `system` field.
 *   2. Gemini renames `'assistant'` to `'model'` and accepts no `'system'`
 *      role at all (system goes to `config.systemInstruction`).
 *   3. Both providers wrap content differently from OpenAI's flat string.
 *
 * These tests cover the conversion functions only; SDK calls themselves are
 * thin pass-throughs and best validated end-to-end in the browser.
 */
import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../../types'
import { convertMessagesToAnthropic } from '../anthropic'
import { convertMessagesToGemini } from '../gemini'

const sys = (content: string): ChatMessage => ({ role: 'system', content })
const user = (content: string): ChatMessage => ({ role: 'user', content })
const asst = (content: string): ChatMessage => ({ role: 'assistant', content })

describe('convertMessagesToAnthropic', () => {
  it('lifts the first system message to the top-level system field', () => {
    const out = convertMessagesToAnthropic([
      sys('You are an oracle.'),
      user('Will it rain?'),
    ])
    expect(out.system).toBe('You are an oracle.')
    expect(out.messages).toEqual([{ role: 'user', content: 'Will it rain?' }])
  })

  it('preserves user / assistant ordering verbatim', () => {
    const out = convertMessagesToAnthropic([
      sys('rules'),
      user('q1'),
      asst('a1'),
      user('q2'),
    ])
    expect(out.messages).toEqual([
      { role: 'user', content: 'q1' },
      { role: 'assistant', content: 'a1' },
      { role: 'user', content: 'q2' },
    ])
  })

  it('routes a second system message back into the user stream', () => {
    const out = convertMessagesToAnthropic([
      sys('first system'),
      user('q'),
      sys('second system'),
    ])
    expect(out.system).toBe('first system')
    expect(out.messages).toEqual([
      { role: 'user', content: 'q' },
      { role: 'user', content: 'second system' },
    ])
  })

  it('returns undefined system when no system role is present', () => {
    const out = convertMessagesToAnthropic([user('hi'), asst('hello')])
    expect(out.system).toBeUndefined()
    expect(out.messages).toHaveLength(2)
  })

  it('handles empty input gracefully', () => {
    const out = convertMessagesToAnthropic([])
    expect(out.system).toBeUndefined()
    expect(out.messages).toEqual([])
  })

  it('does not strip hidden flag-bearing messages from the visible stream', () => {
    const out = convertMessagesToAnthropic([
      sys('s'),
      { role: 'user', content: 'hidden user', hidden: true },
      asst('a'),
    ])
    expect(out.messages).toEqual([
      { role: 'user', content: 'hidden user' },
      { role: 'assistant', content: 'a' },
    ])
  })
})

describe('convertMessagesToGemini', () => {
  it('lifts every system message into systemInstruction joined by blank line', () => {
    const out = convertMessagesToGemini([
      sys('rule one'),
      sys('rule two'),
      user('q'),
    ])
    expect(out.systemInstruction).toBe('rule one\n\nrule two')
    expect(out.contents).toEqual([
      { role: 'user', parts: [{ text: 'q' }] },
    ])
  })

  it('renames assistant to model and keeps user as user', () => {
    const out = convertMessagesToGemini([user('q1'), asst('a1'), user('q2')])
    expect(out.contents).toEqual([
      { role: 'user',  parts: [{ text: 'q1' }] },
      { role: 'model', parts: [{ text: 'a1' }] },
      { role: 'user',  parts: [{ text: 'q2' }] },
    ])
  })

  it('omits systemInstruction when no system role present', () => {
    const out = convertMessagesToGemini([user('hi')])
    expect(out.systemInstruction).toBeUndefined()
  })

  it('skips empty-content system messages so systemInstruction never gets a trailing blank line', () => {
    const out = convertMessagesToGemini([
      sys(''),
      sys('actual rule'),
      user('q'),
    ])
    expect(out.systemInstruction).toBe('actual rule')
  })

  it('handles empty input gracefully', () => {
    const out = convertMessagesToGemini([])
    expect(out.systemInstruction).toBeUndefined()
    expect(out.contents).toEqual([])
  })

  it('preserves message text exactly without re-formatting', () => {
    const out = convertMessagesToGemini([user('  multi\nline\ttext  ')])
    expect(out.contents[0]?.parts?.[0]).toEqual({ text: '  multi\nline\ttext  ' })
  })
})
