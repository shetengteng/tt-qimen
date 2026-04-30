/**
 * Anthropic Claude Provider 实现
 *
 * 协议关键差异（与 OpenAI 兼容族对照）：
 *   1. **System 消息位置**：Anthropic API 不允许 messages 数组里出现 role==='system'，
 *      必须把它提取到顶层 `system: string` 字段。我们的 ChatMessage 列表头部由
 *      `systemPrompts.ts` 注入 system 行，所以本 provider 会把第一个 system 拆走。
 *   2. **max_tokens 必填**：OpenAI 协议下 max_tokens 是可选；Anthropic 是必填，
 *      给 4096 兜底（解读类响应最长不会超过这个量级）。
 *   3. **流式事件结构**：返回 `Stream<RawMessageStreamEvent>` union，文本增量在
 *      `type === 'content_block_delta'` 且 `delta.type === 'text_delta'` 的事件
 *      `delta.text` 字段中。其他事件类型（message_start / content_block_start /
 *      message_delta / message_stop 等）我们直接忽略。
 *   4. **dangerouslyAllowBrowser**：与 OpenAI SDK 同理，纯前端 BYOK 必须开启。
 *
 * 错误：透传至 `toLlmError`。Anthropic SDK 抛的 APIError 也带 status 字段，
 * `mapStatusToCode` 已能正确归类（401/403 → unauthorized, 429 → rate-limited 等）。
 */

import Anthropic from '@anthropic-ai/sdk'
import type { LlmProvider, PingResult, ListModelsResult, RemoteModel } from './types'
import type { AiConfig, ChatMessage } from '../types'
import { toLlmError } from '../errors'
import { inferModelTags } from './modelHeuristics'

const DEFAULT_MAX_TOKENS = 4096

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * 把上层 OpenAI 风格 messages 转换为 Anthropic 期望的形态。
 *
 * 处理规则：
 *   - 抽取 *第一条* role==='system' 的 content 到顶层 system 字符串
 *   - 后续若再出现 system 行（罕见），将其作为 user 行追加（Anthropic 不接受多个 system）
 *   - 折叠相邻同 role 消息：Anthropic 严格要求 messages 必须以 user 开头且
 *     user/assistant 严格交替；hidden 字段不影响序列化
 *
 * Exported for unit testing. 上层运行时不会直接调用此函数，仅 anthropicProvider 内部用。
 */
export function convertMessagesToAnthropic(messages: ChatMessage[]): {
  system: string | undefined
  messages: AnthropicMessage[]
} {
  let system: string | undefined
  const out: AnthropicMessage[] = []
  for (const m of messages) {
    if (m.role === 'system') {
      if (system === undefined) {
        system = m.content
      } else {
        out.push({ role: 'user', content: m.content })
      }
      continue
    }
    out.push({ role: m.role, content: m.content })
  }
  return { system, messages: out }
}

function buildClient(config: AiConfig): Anthropic {
  return new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true,
    maxRetries: 1,
  })
}

export const anthropicProvider: LlmProvider = {
  id: 'anthropic',

  async *streamChat(messages, config, options) {
    const client = buildClient(config)
    const { system, messages: anthMessages } = convertMessagesToAnthropic(messages)
    try {
      const stream = await client.messages.create(
        {
          model: config.model,
          max_tokens: DEFAULT_MAX_TOKENS,
          temperature: config.temperature,
          stream: true,
          ...(system !== undefined ? { system } : {}),
          messages: anthMessages,
        },
        { signal: options?.signal },
      )

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta'
          && event.delta.type === 'text_delta'
          && event.delta.text
        ) {
          yield event.delta.text
        }
      }
    } catch (e) {
      throw toLlmError(e)
    }
  },

  async ping(config: AiConfig): Promise<PingResult> {
    const client = buildClient(config)
    try {
      await client.messages.create({
        model: config.model,
        max_tokens: 4,
        temperature: config.temperature,
        messages: [{ role: 'user', content: 'ping' }],
      })
      return { ok: true }
    } catch (e) {
      const err = toLlmError(e)
      return { ok: false, message: err.detail }
    }
  },

  /**
   * Anthropic SDK 提供 `client.models.list()`，返回 `{ data, has_more, ... }`。
   *
   * 字段映射：
   *   - data[].id  → RemoteModel.id（如 `claude-sonnet-4-6`）
   *   - data[].display_name → fallbackLabel（如 `Claude Sonnet 4.6`，比 id 更友好）
   *   - data[].created_at（ISO string）→ Unix 秒（按时间倒序展示新模型优先）
   *
   * Anthropic 列表只含 chat 模型（无 embedding/audio 干扰），无需 isChatLikeModelId 过滤。
   * SDK 的分页默认拿 first page（20 条），目前 Claude 家族总数 < 20 一次性能拿全。
   */
  async listModels(config: AiConfig): Promise<ListModelsResult> {
    const client = buildClient(config)
    try {
      const res = await client.models.list()
      const models: RemoteModel[] = res.data.map((m) => {
        const ts = Date.parse(m.created_at)
        return {
          id: m.id,
          fallbackLabel: m.display_name || m.id,
          kind: 'chat' as const,
          created: Number.isFinite(ts) ? Math.floor(ts / 1000) : undefined,
          tags: inferModelTags(m.id),
        }
      })
      models.sort((a, b) => {
        if (a.created && b.created) return b.created - a.created
        return a.id.localeCompare(b.id)
      })
      return { models }
    } catch (e) {
      throw toLlmError(e)
    }
  },
}
