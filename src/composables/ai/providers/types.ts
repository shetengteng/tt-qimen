/**
 * LLM Provider 抽象接口
 *
 * 设计目标：
 *   - 上层 useAiChat 只面向 `LlmProvider` 接口编程，不感知具体 SDK；
 *   - MVP 仅有 DeepSeek 实现；未来加 OpenAI / Claude 时只需新增 provider 文件，
 *     上层 0 改动。
 */

import type { AiConfig, ChatMessage } from '../types'

export interface StreamOptions {
  /** 由调用方持有 AbortController；用户点 [停止生成] / 关闭 Drawer / 切路由时 abort */
  signal?: AbortSignal
}

export interface PingResult {
  ok: boolean
  /** 失败时的简短 message（已映射过的 i18n key 或英文） */
  message?: string
}

export interface LlmProvider {
  /** 'deepseek' | 'openai' | ... */
  readonly id: string

  /**
   * 流式聊天。
   *
   * 实现方应：
   *   1. 内部调用具体 SDK / fetch；解析 SSE 增量
   *   2. 每个 token 增量 yield 出去，让上层直接拼接到 message.content
   *   3. 透传 options.signal，确保 abort 立即生效
   *   4. 任何错误统一抛 LlmError（用 toLlmError 映射）
   */
  streamChat(
    messages: ChatMessage[],
    config: AiConfig,
    options?: StreamOptions,
  ): AsyncIterable<string>

  /**
   * 探活：用于设置页 [测试连接] 按钮。
   * 实现方应发起最小成本请求（如 max_tokens=1），返回 ok 与可选 message。
   */
  ping(config: AiConfig): Promise<PingResult>
}
