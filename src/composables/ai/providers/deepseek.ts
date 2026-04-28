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

export const deepseekProvider: LlmProvider = {
  id: 'deepseek',

  async *streamChat(messages, config, options) {
    const client = buildClient(config)
    try {
      const stream = await client.chat.completions.create(
        {
          model: config.model,
          messages,
          temperature: config.temperature,
          stream: true,
        },
        { signal: options?.signal },
      )
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) yield delta
      }
    } catch (e) {
      throw toLlmError(e)
    }
  },

  async ping(config: AiConfig): Promise<PingResult> {
    const client = buildClient(config)
    try {
      await client.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      })
      return { ok: true }
    } catch (e) {
      const err = toLlmError(e)
      return { ok: false, message: err.detail }
    }
  },
}
