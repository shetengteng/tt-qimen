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
  /**
   * 是否在 UI 中隐藏渲染（仍参与 LLM 上下文）。
   * 用途：首次自动发送的 firstResponse 系统-style user 提示不展示气泡，
   * 但仍要把它喂给 LLM 让其作出响应。向前兼容：旧数据无此字段 = false。
   */
  hidden?: boolean
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

/**
 * DeepSeek 模型枚举。
 *
 * 2026/07/24 之后 deepseek-chat / deepseek-reasoner 已下线（API 已不可用），
 * 我们不再把弃用项暴露给用户选择，但 type union 仍保留 'deepseek-chat'
 * / 'deepseek-reasoner' 字面量，避免老用户 localStorage 里残留的 model 字段
 * 在 TS 编译期报错。运行时如果检测到这两个 id，会在 store 自动迁移到
 * 'deepseek-v4-flash'。
 */
export const DEEPSEEK_MODELS = [
  /** 高速 / 便宜 / 对话场景默认（deepseek-chat 的非思考模式继任者） */
  { id: 'deepseek-v4-flash', labelKey: 'ai.model.v4Flash' },
  /** 思维链 / 深度解读（deepseek-reasoner 的继任者） */
  { id: 'deepseek-v4-pro',   labelKey: 'ai.model.v4Pro' },
] as const

/** 已弃用的旧 model id，仅用于运行时迁移识别，不再出现在 UI */
export const DEPRECATED_DEEPSEEK_MODEL_IDS = ['deepseek-chat', 'deepseek-reasoner'] as const

export type DeepseekModelId =
  | typeof DEEPSEEK_MODELS[number]['id']
  | typeof DEPRECATED_DEEPSEEK_MODEL_IDS[number]

export const DEFAULT_AI_CONFIG: AiConfig = {
  providerId: 'deepseek',
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-v4-flash',
  temperature: 0.7,
}
