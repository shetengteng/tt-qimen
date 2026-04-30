/**
 * 月之暗面 Kimi Provider 实现（Moonshot AI）
 *
 * Moonshot 官方 endpoint `https://api.moonshot.cn/v1` 完全 OpenAI 协议兼容；
 * 流式 chunk 与 OpenAI 同构。Kimi K2.5 的 thinking 模式与 OpenAI Chat Completions
 * 协议无关（走单独 endpoint），暂不在 V1 范围支持。
 */

import { createOpenAiCompatibleProvider } from './openaiCompatible'

export const moonshotProvider = createOpenAiCompatibleProvider({ id: 'moonshot' })
