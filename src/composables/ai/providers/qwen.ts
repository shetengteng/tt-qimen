/**
 * 通义千问 Qwen Provider 实现（DashScope compatible-mode endpoint）
 *
 * 阿里云 DashScope 提供 `https://dashscope.aliyuncs.com/compatible-mode/v1` 这个
 * OpenAI 协议兼容代理，能用 OpenAI SDK 直发；流式 chunk 与 OpenAI 同构（仅 delta.content）。
 *
 * 不消费 reasoning_content：Qwen 的 thinking 模式（qwen3-max thinking）走的是另一种
 * 协议（max_thinking_length 参数 + 不同响应字段），暂不在 V1 范围支持。
 */

import { createOpenAiCompatibleProvider } from './openaiCompatible'

export const qwenProvider = createOpenAiCompatibleProvider({ id: 'qwen' })
