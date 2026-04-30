/**
 * AI 解读模块通用类型
 *
 * 设计要点（Phase 1 多 Provider 重构 · 2026-04-30）：
 *   - `ChatMessage` 故意**不**依赖 `openai` 包路径，保持上层与 SDK 解耦；
 *     仅在具体 provider 文件内部把 ChatMessage 转换为 SDK 期望的格式
 *   - `AiConfig` 维持"扁平 4 字段"语义（apiKey + baseUrl + model + temperature），
 *     这是 LlmProvider 接口约定的运行时输入；providers/types.ts、deepseek.ts、
 *     useAiChat.ts 全部围绕这个形态编程，**Phase 1 不能破坏这个 shape**
 *   - `AiUserConfig` 是 localStorage 持久化结构：多 provider perProvider 配置 + 顶层
 *     temperature + activeProviderId；store 把它"投影"为某 provider 的扁平 AiConfig
 *   - `DEEPSEEK_MODELS` / `DEPRECATED_DEEPSEEK_MODEL_IDS` / `DeepseekModelId` /
 *     `DEFAULT_AI_CONFIG` 保留作向后兼容别名，仅供 sanitize 兜底；新代码请优先用
 *     providers/registry.ts 暴露的 PROVIDERS / sanitizeModelId
 */

import type { ProviderId } from './providers/registry'
import { PROVIDERS, sanitizeModelId } from './providers/registry'

/* ------------------------------------------------------------------ */
/*  对话消息                                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Provider 运行时配置（LlmProvider.streamChat / ping 输入）            */
/* ------------------------------------------------------------------ */

/**
 * Provider 运行时配置（扁平 4 字段）。
 *
 * 这是 LlmProvider 接口的输入，由 store 从多 provider 持久化结构
 * 投影而来。不持久化、不直接暴露给 UI 修改；只在请求时由 store 计算并传给
 * provider.streamChat / ping。
 */
export interface AiConfig {
  apiKey: string
  baseUrl: string
  model: string
  /**
   * 0..2，默认 0.2。
   *
   * 占卜场景需要稳定输出（同一命盘多次解读结果一致性高），
   * 因此默认值定在 0.2（偏保守）。用户可在设置页"高级"区展开调整。
   */
  temperature: number
}

/* ------------------------------------------------------------------ */
/*  多 Provider 持久化结构                                              */
/* ------------------------------------------------------------------ */

/**
 * 单个 Provider 的可持久化配置。
 *
 * 字段说明：
 *   - apiKey：用户填的 API Key（明文存 localStorage，与 Phase 0 deepseek 单 provider
 *     时同样的隐私模型）
 *   - baseUrl：空字符串 = 用 PROVIDERS[id].defaultBaseUrl；非空 = 用户自定义
 *     代理 / 自部署 endpoint（仅 OpenAI 兼容族在 UI 暴露此字段）
 *   - model：当前选中的 model id；非法值由 sanitizeModelId 兜底回 defaultModelId
 */
export interface ProviderUserConfig {
  apiKey: string
  baseUrl: string
  model: string
}

/**
 * AI 解读模块的全部用户配置（持久化到 localStorage 的真正 schema）。
 *
 * 设计：
 *   - activeProviderId：当前侧栏 / 测试连接 / 设置页正在操作的 provider
 *   - temperature：跨 provider 共享（用户偏好通常是稳定的，不希望切 provider 时还要重设）
 *   - perProvider：8 个 Provider 各自独立的 apiKey / baseUrl / model；切换
 *     activeProviderId 不会丢失任何一家已配置的内容
 *
 * 不做 storage migration（用户决策 2026-04-30）：旧版 single-deepseek storage 在
 * useStorage mergeDefaults 后会被 DEFAULT_AI_USER_CONFIG 覆盖；老用户重填 Key 即可。
 */
export interface AiUserConfig {
  activeProviderId: ProviderId
  temperature: number
  perProvider: Record<ProviderId, ProviderUserConfig>
}

/**
 * 构造每个 Provider 的初始 perProvider 配置：apiKey 空 / baseUrl 空（让运行时
 * fallback 到 defaultBaseUrl）/ model = defaultModelId。
 */
function buildDefaultPerProvider(): Record<ProviderId, ProviderUserConfig> {
  const result = {} as Record<ProviderId, ProviderUserConfig>
  for (const id of Object.keys(PROVIDERS) as ProviderId[]) {
    result[id] = { apiKey: '', baseUrl: '', model: PROVIDERS[id].defaultModelId }
  }
  return result
}

export const DEFAULT_AI_USER_CONFIG: AiUserConfig = {
  activeProviderId: 'deepseek',
  temperature: 0.2,
  perProvider: buildDefaultPerProvider(),
}

/**
 * 把 AiUserConfig 投影为当前 activeProvider 的扁平运行时 AiConfig。
 *
 * baseUrl 兜底：用户填的 baseUrl 为空时回退到该 Provider 的 defaultBaseUrl，
 * 让 provider.streamChat / ping 拿到的永远是可用 endpoint。
 *
 * model 兜底：sanitizeModelId 把 storage 中残留的非法 / deprecated id 修正回
 * defaultModelId（与 Phase 0 sanitizeModel 行为一致，扩展到所有 provider）。
 */
export function projectRequestConfig(user: AiUserConfig): AiConfig {
  const id = user.activeProviderId
  const provCfg = user.perProvider[id]
  const desc = PROVIDERS[id]
  return {
    apiKey: provCfg.apiKey,
    baseUrl: provCfg.baseUrl.trim().length > 0 ? provCfg.baseUrl : desc.defaultBaseUrl,
    model: sanitizeModelId(id, provCfg.model),
    temperature: user.temperature,
  }
}

/* ------------------------------------------------------------------ */
/*  向后兼容别名（仅给 sanitize 与潜在的旧 import 兜底）                 */
/* ------------------------------------------------------------------ */

/**
 * @deprecated 用 PROVIDERS.deepseek.models 替代。仅为兼容旧 import 保留。
 * 同时仍是 SettingsPage 当前 model 选择 grid 的数据源（Phase 3 切换到多 provider 后移除）。
 */
export const DEEPSEEK_MODELS = PROVIDERS.deepseek.models
  .filter((m) => !m.deprecated)
  .map((m) => ({ id: m.id, labelKey: m.labelKey ?? '' }))

/**
 * @deprecated 用 PROVIDERS.deepseek.models 中 deprecated 字段替代。
 */
export const DEPRECATED_DEEPSEEK_MODEL_IDS = PROVIDERS.deepseek.models
  .filter((m) => m.deprecated)
  .map((m) => m.id) as readonly string[]

export type DeepseekModelId =
  | 'deepseek-v4-flash'
  | 'deepseek-v4-pro'
  | 'deepseek-chat'
  | 'deepseek-reasoner'

/**
 * @deprecated 旧版本单 provider 时代的"扁平 + providerId"形态。新代码用
 * `DEFAULT_AI_USER_CONFIG`（持久化层）+ `projectRequestConfig(...)`（运行时层）。
 * 仍保留是因为：
 *   - errors.spec / 旧测试可能直接 import
 *   - 给 store 在极少数 reset 旁路时提供一个"安全的扁平默认"
 */
export const DEFAULT_AI_CONFIG: AiConfig = projectRequestConfig(DEFAULT_AI_USER_CONFIG)
