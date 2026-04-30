/**
 * Google Gemini Provider 实现（@google/genai SDK）
 *
 * 协议关键差异（与 OpenAI 兼容族对照）：
 *   1. **Role 命名**：Gemini 用 'user' / 'model'（不是 'assistant'），且不接受 'system'
 *      作为消息 role。System 消息要提取到顶层 `config.systemInstruction`。
 *   2. **消息结构**：Gemini 消息是 `Content` 数组，每条 `{ role, parts: [{ text }] }`，
 *      不是 OpenAI 的 `{ role, content }` 平铺字符串。
 *   3. **配置位置**：temperature / abortSignal / systemInstruction 全在 `config` 对象里，
 *      不是顶层。
 *   4. **流式 chunk**：返回 `AsyncGenerator<GenerateContentResponse>`，每个 chunk 的
 *      `.text` getter 给出该 chunk 的**增量**文本（已自动剔除 thought parts）。
 *   5. **baseUrl 自定义**：通过 `httpOptions.baseUrl` 传入，不是顶层 `baseURL`。
 *      项目里 Gemini 的 `allowCustomBaseUrl` 默认 false（registry），传入用户填的
 *      defaultBaseUrl 即可，浏览器中通常不需要改。
 *
 * 错误：透传至 `toLlmError`。Gemini SDK 抛的错带 status 字段或 ApiError 实例，能被
 * `mapStatusToCode` 正确归类。
 */

import { GoogleGenAI, type Content } from '@google/genai'
import type { LlmProvider, PingResult } from './types'
import type { AiConfig, ChatMessage } from '../types'
import { toLlmError } from '../errors'

interface GeminiPayload {
  systemInstruction: string | undefined
  contents: Content[]
}

/**
 * 把上层 OpenAI 风格 messages 转换为 Gemini 期望的形态。
 *
 * 处理规则：
 *   - role==='system' → 顶层 systemInstruction（多条 system 用 \n\n 拼接）
 *   - role==='user' → contents[].role = 'user'
 *   - role==='assistant' → contents[].role = 'model'
 *   - 每条 content 的 text 包成单个 part `{ text }`
 *
 * Exported for unit testing. 上层运行时不会直接调用此函数，仅 geminiProvider 内部用。
 */
export function convertMessagesToGemini(messages: ChatMessage[]): GeminiPayload {
  const systemParts: string[] = []
  const contents: Content[] = []
  for (const m of messages) {
    if (m.role === 'system') {
      if (m.content) systemParts.push(m.content)
      continue
    }
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })
  }
  return {
    systemInstruction: systemParts.length > 0 ? systemParts.join('\n\n') : undefined,
    contents,
  }
}

function buildClient(config: AiConfig): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: config.apiKey,
    httpOptions: { baseUrl: config.baseUrl },
  })
}

export const geminiProvider: LlmProvider = {
  id: 'gemini',

  async *streamChat(messages, config, options) {
    const client = buildClient(config)
    const { systemInstruction, contents } = convertMessagesToGemini(messages)
    try {
      const stream = await client.models.generateContentStream({
        model: config.model,
        contents,
        config: {
          temperature: config.temperature,
          ...(systemInstruction !== undefined ? { systemInstruction } : {}),
          ...(options?.signal ? { abortSignal: options.signal } : {}),
        },
      })
      for await (const chunk of stream) {
        const text = chunk.text
        if (text) yield text
      }
    } catch (e) {
      throw toLlmError(e)
    }
  },

  async ping(config: AiConfig): Promise<PingResult> {
    const client = buildClient(config)
    try {
      await client.models.generateContent({
        model: config.model,
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        config: {
          temperature: config.temperature,
          maxOutputTokens: 4,
        },
      })
      return { ok: true }
    } catch (e) {
      const err = toLlmError(e)
      return { ok: false, message: err.detail }
    }
  },
}
