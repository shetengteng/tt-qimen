/**
 * AC9 守门：toLlmError 把任意异常正确映射到 6 个 LlmErrorCode。
 *
 * 覆盖：
 *   - 401 / 403 → 'unauthorized'
 *   - 429       → 'rate-limited'
 *   - 500-599   → 'server-error'
 *   - AbortError → 'aborted'
 *   - TypeError  → 'network'
 *   - 其他      → 'unknown'
 *
 * 不依赖：网络 / 真实 OpenAI SDK / 真实 Key。
 */

import { describe, it, expect } from 'vitest'
import { LlmError, toLlmError } from '../errors'

describe('AC9 · toLlmError 状态码映射', () => {
  describe('HTTP status → code', () => {
    it.each([
      [400, 'unknown'],
      [401, 'unauthorized'],
      [403, 'unauthorized'],
      [404, 'unknown'],
      [429, 'rate-limited'],
      [500, 'server-error'],
      [502, 'server-error'],
      [503, 'server-error'],
      [504, 'server-error'],
      [600, 'unknown'],
    ] as const)('status %i → %s', (status, expectedCode) => {
      const err = toLlmError({ status, message: `HTTP ${status}` })
      expect(err).toBeInstanceOf(LlmError)
      expect(err.code).toBe(expectedCode)
      expect(err.status).toBe(status)
    })
  })

  it('AbortError 名称 → aborted code（即便 status 缺失）', () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' })
    const err = toLlmError(abort)
    expect(err.code).toBe('aborted')
    expect(err.status).toBe(0)
  })

  it('TypeError → network code', () => {
    const err = toLlmError(new TypeError('fetch failed'))
    expect(err.code).toBe('network')
    expect(err.status).toBe(0)
  })

  it('未识别异常 → unknown code', () => {
    const err = toLlmError(new Error('something else'))
    expect(err.code).toBe('unknown')
    expect(err.status).toBe(0)
  })

  it('字符串异常 → unknown code', () => {
    const err = toLlmError('boom')
    expect(err.code).toBe('unknown')
  })

  it('已是 LlmError 直接透传，不重新包', () => {
    const original = new LlmError(429, 'too many requests', 'rate-limited')
    const out = toLlmError(original)
    expect(out).toBe(original)
  })

  it('LlmError.is 类型守卫正确', () => {
    expect(LlmError.is(new LlmError(500, 'x', 'server-error'))).toBe(true)
    expect(LlmError.is(new Error('plain'))).toBe(false)
    expect(LlmError.is(null)).toBe(false)
    expect(LlmError.is(undefined)).toBe(false)
    expect(LlmError.is({ status: 401 })).toBe(false)
  })

  it('LlmError 构造默认 code = unknown', () => {
    const err = new LlmError(418, 'teapot')
    expect(err.code).toBe('unknown')
    expect(err.status).toBe(418)
    expect(err.message).toContain('LlmError 418 unknown')
  })
})
