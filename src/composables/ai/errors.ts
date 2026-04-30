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
 * 多 Provider 适配（按优先级识别）：
 *   1. OpenAI / DeepSeek / Qwen / Moonshot / Zhipu / xAI（openai SDK APIError 体系）：
 *      实例上有 `status: number` + 标准 `message` 字段；status 走 mapStatusToCode
 *   2. Anthropic SDK：`@anthropic-ai/sdk` 抛 `APIError` 子类，**也是** `status: number`，
 *      命中第 1 步即可；细分 401/429/5xx 与 OpenAI 一致
 *   3. Google Gemini（@google/genai）：错误对象上没有 `status`，typically 抛
 *      `ApiError` 或带 message 的字符串（如 "[400 Bad Request] API key not valid"）；
 *      用 message 前缀正则提取状态码兜底
 *   4. AbortController.abort() → 'aborted'（reka 在 SSE 中断时也走这路径）
 *   5. fetch 层 TypeError → 'network'（CORS / DNS / offline）
 *   6. 其余 → 'unknown'
 */
export function toLlmError(e: unknown): LlmError {
  if (LlmError.is(e)) return e

  const anyE = e as {
    status?: number
    message?: string
    name?: string
    code?: string
    error?: { code?: number | string; status?: number | string; message?: string }
  }

  // Step 1+2：OpenAI SDK / Anthropic SDK 都用 `status` 数字
  if (typeof anyE?.status === 'number') {
    const code = mapStatusToCode(anyE.status)
    return new LlmError(anyE.status, anyE.message ?? anyE.name ?? 'API error', code)
  }

  // Step 3a：Anthropic 也可能在 `error.status` 嵌套字段（部分版本）
  const nestedStatus = anyE?.error?.status
  if (typeof nestedStatus === 'number') {
    return new LlmError(
      nestedStatus,
      anyE?.error?.message ?? anyE?.message ?? 'API error',
      mapStatusToCode(nestedStatus),
    )
  }
  if (typeof nestedStatus === 'string' && /^\d{3}$/.test(nestedStatus)) {
    const num = Number(nestedStatus)
    return new LlmError(
      num,
      anyE?.error?.message ?? anyE?.message ?? 'API error',
      mapStatusToCode(num),
    )
  }

  // Step 3b：Gemini @google/genai 在 message 前缀塞状态码，如 "[400 Bad Request] ..."
  // 当 message 形如 `[NNN ...]` 提取 NNN
  if (typeof anyE?.message === 'string') {
    const m = anyE.message.match(/^\[(\d{3})\b/)
    if (m) {
      const num = Number(m[1])
      return new LlmError(num, anyE.message, mapStatusToCode(num))
    }
  }

  // Step 4：AbortController.abort()
  if ((e as Error)?.name === 'AbortError') {
    return new LlmError(0, 'aborted', 'aborted')
  }

  // Step 5：浏览器 fetch 抛 TypeError 通常是网络/CORS 错
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
