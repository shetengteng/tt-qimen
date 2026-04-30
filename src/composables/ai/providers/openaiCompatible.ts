/**
 * OpenAI 协议兼容族通用 Provider 工厂
 *
 * 适用厂商（截止 2026-04，全部 100% 兼容 `/v1/chat/completions` + SSE 增量）：
 *   - DeepSeek（深度求索）
 *   - OpenAI（原厂）
 *   - 通义千问 Qwen（DashScope compatible-mode endpoint）
 *   - 月之暗面 Kimi（Moonshot）
 *   - 智谱 GLM（开放平台 paas/v4）
 *   - xAI Grok
 *
 * 不复用此工厂的家族：
 *   - Anthropic Claude — 原生 messages API（system 字段从 messages 数组提到顶层）
 *   - Google Gemini — GenerativeLanguage API（contents/parts 结构 + systemInstruction）
 *
 * 设计目标：
 *   - 6 家共享一份 streamChat / ping 实现，**只通过 ProviderDescriptor 配置差异**
 *   - 保持与 P0 deepseek.ts 行为完全等价（DeepSeek 实例只是该工厂的实例化），
 *     既有 thinking 处理 + reasoning_content 流式输出 都纳入工厂的可选项
 *   - openai SDK 的 dangerouslyAllowBrowser:true 集中在工厂内，避免每家 provider 重复
 *
 * 工厂选项：
 *   - id：ProviderId，仅作 `LlmProvider.id` 标识，无逻辑作用
 *   - shouldDisableThinking(model)：当返回 true 时，请求体 extra_body 注入
 *     `thinking: { type: 'disabled' }`（仅 DeepSeek 现行约定支持，其它家不识别字段）
 *   - consumeReasoningContent：是否在 streamChat 中把 `delta.reasoning_content` 也
 *     yield 到上层（仅 DeepSeek V4 Pro 实测有此字段；其他家流式 chunk 没这个字段
 *     不会触发，开着也安全）
 */

import OpenAI from 'openai'
import type { LlmProvider, PingResult } from './types'
import type { AiConfig } from '../types'
import type { ProviderId } from './registry'
import { toLlmError } from '../errors'

export interface OpenAiCompatibleProviderOptions {
  readonly id: ProviderId
  readonly shouldDisableThinking?: (model: string) => boolean
  readonly consumeReasoningContent?: boolean
}

/**
 * 工厂入口：返回一个实现 `LlmProvider` 的对象。
 *
 * 内部细节：
 *   - 每次 streamChat / ping 都现造 OpenAI client（apiKey/baseURL 可能在两次调用间变化）
 *   - maxRetries:1 → 仅 ping 走重试；流式不便重试（中途断流复发会产生重复输出）
 *   - signal 透传 abort 才能让流式立即停止
 */
export function createOpenAiCompatibleProvider(
  opts: OpenAiCompatibleProviderOptions,
): LlmProvider {
  const { id, shouldDisableThinking, consumeReasoningContent } = opts

  function buildClient(config: AiConfig): OpenAI {
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true,
      maxRetries: 1,
    })
  }

  /**
   * 构造 chat.completions 请求体；DeepSeek thinking 字段通过 SDK 的 extra body 透传。
   * OpenAI SDK typing 不暴露非标字段，用 (Object as any) 强转避开。
   */
  function buildChatPayload(
    model: string,
    messages: Parameters<OpenAI['chat']['completions']['create']>[0]['messages'],
    temperature: number,
    stream: boolean,
    extra?: Record<string, unknown>,
  ): Parameters<OpenAI['chat']['completions']['create']>[0] {
    const base = {
      model,
      messages,
      temperature,
      stream,
      ...(extra ?? {}),
    } as unknown as Parameters<OpenAI['chat']['completions']['create']>[0]
    if (shouldDisableThinking?.(model)) {
      ;(base as unknown as Record<string, unknown>).thinking = { type: 'disabled' }
    }
    return base
  }

  return {
    id,

    async *streamChat(messages, config, options) {
      const client = buildClient(config)
      const includeReasoning =
        !!consumeReasoningContent && !shouldDisableThinking?.(config.model)
      try {
        const stream = (await client.chat.completions.create(
          buildChatPayload(config.model, messages, config.temperature, true),
          { signal: options?.signal },
        )) as AsyncIterable<{
          choices: Array<{
            delta?: { content?: string | null; reasoning_content?: string | null }
          }>
        }>
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta as
            | { content?: string | null; reasoning_content?: string | null }
            | undefined
          if (!delta) continue
          if (delta.content) yield delta.content
          else if (includeReasoning && delta.reasoning_content) {
            yield delta.reasoning_content
          }
        }
      } catch (e) {
        throw toLlmError(e)
      }
    },

    async ping(config: AiConfig): Promise<PingResult> {
      const client = buildClient(config)
      try {
        await client.chat.completions.create(
          buildChatPayload(
            config.model,
            [{ role: 'user', content: 'ping' }],
            config.temperature,
            false,
            { max_tokens: 4 },
          ),
        )
        return { ok: true }
      } catch (e) {
        const err = toLlmError(e)
        return { ok: false, message: err.detail }
      }
    },
  }
}
