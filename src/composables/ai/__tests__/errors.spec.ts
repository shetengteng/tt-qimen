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

  /**
   * Phase 4 多 Provider 错误体扩展：
   *   - Anthropic SDK 顶层 status（同 OpenAI），第一步即捕获，已被 status-table 覆盖
   *   - 但部分版本 Anthropic 把状态包在 `error.status`（数字或字符串）
   *   - Google Gemini @google/genai 用 message 前缀塞状态码 `[NNN xxx]`
   */
  describe('Phase 4 · Anthropic / Gemini 错误体兼容', () => {
    it('Anthropic 嵌套 error.status 数字 → 正确映射', () => {
      const e = {
        error: { status: 401, message: 'Invalid API Key' },
      }
      const out = toLlmError(e)
      expect(out.status).toBe(401)
      expect(out.code).toBe('unauthorized')
      expect(out.detail).toBe('Invalid API Key')
    })

    it('Anthropic 嵌套 error.status 字符串 → 正确映射', () => {
      const e = {
        error: { status: '429', message: 'Rate limit exceeded' },
      }
      const out = toLlmError(e)
      expect(out.status).toBe(429)
      expect(out.code).toBe('rate-limited')
    })

    it('Gemini message 前缀 [400 ...] → 提取 400 → unknown', () => {
      const e = new Error('[400 Bad Request] API key not valid. Please pass a valid API key.')
      const out = toLlmError(e)
      expect(out.status).toBe(400)
      expect(out.code).toBe('unknown')
    })

    it('Gemini message 前缀 [403 ...] → 提取 403 → unauthorized', () => {
      const e = new Error('[403 Forbidden] PERMISSION_DENIED: ...')
      const out = toLlmError(e)
      expect(out.status).toBe(403)
      expect(out.code).toBe('unauthorized')
    })

    it('Gemini message 前缀 [503 ...] → 提取 503 → server-error', () => {
      const e = new Error('[503 Service Unavailable] The model is overloaded')
      const out = toLlmError(e)
      expect(out.status).toBe(503)
      expect(out.code).toBe('server-error')
    })

    it('普通 Error message 不带 [NNN] 前缀 → 仍是 unknown', () => {
      const e = new Error('400 Bad Request')
      const out = toLlmError(e)
      expect(out.code).toBe('unknown')
      expect(out.status).toBe(0)
    })
  })
})
