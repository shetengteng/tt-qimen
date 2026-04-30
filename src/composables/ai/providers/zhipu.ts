/**
 * 智谱 GLM Provider 实现
 *
 * 智谱开放平台 `https://open.bigmodel.cn/api/paas/v4` 完全 OpenAI 协议兼容；
 * GLM-4.6 的"深度思考"模式由独立 endpoint 提供（且不在 OpenAI 协议内），V1 暂不支持。
 */

import { createOpenAiCompatibleProvider } from './openaiCompatible'

export const zhipuProvider = createOpenAiCompatibleProvider({ id: 'zhipu' })
