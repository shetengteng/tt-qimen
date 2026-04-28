/**
 * AI 解读模块通用类型
 *
 * 设计要点：
 *   - `ChatMessage` 故意**不**依赖 `openai` 包路径，保持上层与 SDK 解耦；
 *     仅在 `providers/deepseek.ts` 内部把 ChatMessage 转换为 SDK 期望的格式
 *   - `AiConfig` 是用户在设置页填写的可序列化配置，全字段都能存 localStorage
 *   - `DEEPSEEK_MODELS` 反映 2026/04 DeepSeek 官方现状（v4-pro / v4-flash 主推；
 *     deepseek-chat / deepseek-reasoner 2026/07/24 弃用，但保留兼容字段）
 */

/** 对话消息（与 OpenAI 协议同构，字段是 OpenAI 兼容协议的最小子集） */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** 用户保存的 AI 配置（全部字段都能 JSON 序列化存 localStorage） */
export interface AiConfig {
  /** 当前 MVP 仅支持 'deepseek'；保留 union 形式便于未来加 'openai' / 'anthropic' */
  providerId: 'deepseek'
  apiKey: string
  /** DeepSeek 默认 https://api.deepseek.com（OpenAI SDK 自动拼 `/chat/completions`） */
  baseUrl: string
  /** 'deepseek-v4-flash' / 'deepseek-v4-pro' / 'deepseek-chat'（旧）/ 'deepseek-reasoner'（旧） */
  model: string
  /** 0..2，默认 0.7 */
  temperature: number
}

/** DeepSeek 模型枚举（2026/07/24 后 deepseek-chat / deepseek-reasoner 弃用） */
export const DEEPSEEK_MODELS = [
  /** 高速 / 便宜 / 对话场景默认（deepseek-chat 的非思考模式继任者） */
  { id: 'deepseek-v4-flash', labelKey: 'ai.model.v4Flash' },
  /** 思维链 / 深度解读（deepseek-reasoner 的继任者） */
  { id: 'deepseek-v4-pro',   labelKey: 'ai.model.v4Pro' },
  /** 旧型号，2026/07/24 弃用，仅作兼容 */
  { id: 'deepseek-chat',     labelKey: 'ai.model.chatLegacy', deprecated: true },
  { id: 'deepseek-reasoner', labelKey: 'ai.model.reasonerLegacy', deprecated: true },
] as const

export type DeepseekModelId = typeof DEEPSEEK_MODELS[number]['id']

export const DEFAULT_AI_CONFIG: AiConfig = {
  providerId: 'deepseek',
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-v4-flash',
  temperature: 0.7,
}
