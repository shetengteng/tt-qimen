/**
 * DeepSeek Provider 实现（基于 OpenAI 官方 SDK）
 *
 * 选型理由（详见 design/2026-04-28-01-AI解读模块设计.md §8.1）：
 *   - DeepSeek 官方文档明示完全兼容 OpenAI 协议，推荐用 OpenAI SDK + 改 baseURL 接入
 *   - 复用 SDK 已封装好的：SSE 解析 / [DONE] 终止 / keep-alive / abort signal / 错误模型
 *   - 不造轮子，~50 行实现完整流式 provider
 *
 * 注意：
 *   - 必须显式 `dangerouslyAllowBrowser: true`：项目纯静态 SPA，Key 由用户自管
 *   - `signal` 透传 abort 才能让流式立即停止
 *   - `for await` 解构 SDK 返回的 AsyncIterable，零手写 SSE 解析
 *
 * V4 thinking mode（2026-04-29 修正）：
 *   - DeepSeek V4 默认开启 thinking，输出分 `reasoning_content` + `content` 两段
 *   - 仅消费 `delta.content` 会在思考阶段一直收到空字符串，用户体验是"长时间无输出"
 *   - 策略：
 *     * V4-Flash 默认关 thinking（速度优先），仅取 `content` 直出
 *     * V4-Pro / 其他 reasoner 模型保留 thinking，把 reasoning_content 也并入流（用户感知"AI 在推理"）
 *     * 通过 `extra_body.thinking.type` 控制（OpenAI SDK 不识别 `thinking` 顶级字段，需走 extra_body 透传）
 */

import OpenAI from 'openai'
import type { LlmProvider, PingResult } from './types'
import type { AiConfig } from '../types'
import { toLlmError } from '../errors'

function buildClient(config: AiConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true,
    /** 流式不便重试；非流式 ping 走 1 次重试 */
    maxRetries: 1,
  })
}

/**
 * 是否对该 model 关闭 thinking。Flash = 速度优先 → 关；Pro = 推理优先 → 开。
 * 旧版 reasoner / chat 已 sanitize 到 v4-flash，不会再出现。
 */
function shouldDisableThinking(model: string): boolean {
  return /flash/i.test(model)
}

/**
 * 构造 chat.completions 请求体；DeepSeek thinking 字段通过 SDK 的 extra body 透传。
 * OpenAI SDK 不在 typing 中暴露非标字段，用 (Object as any) 强转避开。
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
  if (shouldDisableThinking(model)) {
    ;(base as unknown as Record<string, unknown>).thinking = { type: 'disabled' }
  }
  return base
}

export const deepseekProvider: LlmProvider = {
  id: 'deepseek',

  async *streamChat(messages, config, options) {
    const client = buildClient(config)
    const includeReasoning = !shouldDisableThinking(config.model)
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
        // Pro 模式（thinking 开）下把推理段也吐出来，让用户看到"AI 在推理"
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
