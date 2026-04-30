/**
 * xAI Grok Provider 实现
 *
 * xAI 官方 endpoint `https://api.x.ai/v1` 100% OpenAI 协议兼容（与原厂 OpenAI SDK
 * 仅需切 baseURL 即可使用），流式 chunk 完全同构。
 */

import { createOpenAiCompatibleProvider } from './openaiCompatible'

export const xaiProvider = createOpenAiCompatibleProvider({ id: 'xai' })
