/**
 * AI 解读模块异常类型
 *
 * 与 src/lib/errors.ts 的 FortuneError 互不干扰：
 *   - FortuneError 表达"占卜模块业务错"（数据空 / 输入越界 / 解析失败 等）
 *   - LlmError 表达"AI 服务调用错"（HTTP status code / 网络 / 取消 等）
 *
 * UI 错误态文案的 i18n key 直接对应 `code` 字段（见 settings/ai.error.<code>）。
 */

/** AI 调用错因（用于映射 i18n 文案） */
export type LlmErrorCode =
  /** 200 但请求被取消（AbortController.abort） */
  | 'aborted'
  /** 401 / 403 — Key 无效或权限不足 */
  | 'unauthorized'
  /** 429 — 限流 */
  | 'rate-limited'
  /** 500 / 502 / 503 / 504 — 服务端错误 */
  | 'server-error'
  /** TypeError / 网络失败 / DNS / CORS 等浏览器层面错误 */
  | 'network'
  /** 未分类（含 SDK 内部错） */
  | 'unknown'

export class LlmError extends Error {
  readonly status: number
  readonly code: LlmErrorCode
  /** SDK / 服务端原始错误信息（开发者友好，不直接展示给用户） */
  readonly detail: string

  constructor(status: number, detail: string, code: LlmErrorCode = 'unknown') {
    super(`[LlmError ${status} ${code}] ${detail}`)
    this.name = 'LlmError'
    this.status = status
    this.detail = detail
    this.code = code
  }

  static is(err: unknown): err is LlmError {
    return err instanceof LlmError
  }
}

/**
 * 把任意异常映射为 LlmError。
 *
 * 优先识别 OpenAI SDK 的 APIError 子类（含 status 字段 + name），其次识别 AbortError，
 * 兜底归为 'unknown'。
 */
export function toLlmError(e: unknown): LlmError {
  if (LlmError.is(e)) return e

  // OpenAI SDK 的 APIError：含 status 数字字段，name === 'APIError' / 'AuthenticationError' / 'RateLimitError' 等
  const anyE = e as { status?: number; message?: string; name?: string; code?: string }
  if (typeof anyE?.status === 'number') {
    const code = mapStatusToCode(anyE.status)
    return new LlmError(anyE.status, anyE.message ?? anyE.name ?? 'API error', code)
  }

  // AbortController.abort()
  if ((e as Error)?.name === 'AbortError') {
    return new LlmError(0, 'aborted', 'aborted')
  }

  // 浏览器 fetch 抛 TypeError 通常是网络/CORS 错
  if (e instanceof TypeError) {
    return new LlmError(0, e.message, 'network')
  }

  return new LlmError(0, String((e as Error)?.message ?? e), 'unknown')
}

function mapStatusToCode(status: number): LlmErrorCode {
  if (status === 401 || status === 403) return 'unauthorized'
  if (status === 429) return 'rate-limited'
  if (status >= 500 && status < 600) return 'server-error'
  return 'unknown'
}
