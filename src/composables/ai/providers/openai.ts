/**
 * OpenAI Provider 实现（原厂 GPT-5.x 系列）
 *
 * 走通用 `createOpenAiCompatibleProvider` 工厂，不需要 thinking / reasoning_content
 * 特殊处理（OpenAI 流式 chunk 只有 `delta.content`，没有 DeepSeek 的 reasoning_content
 * 私有扩展）。
 */

import { createOpenAiCompatibleProvider } from './openaiCompatible'

export const openaiProvider = createOpenAiCompatibleProvider({ id: 'openai' })
