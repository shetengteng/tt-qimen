/**
 * 8 个主流 LLM Provider 的元数据注册表
 *
 * Phase 1 范围：仅 metadata（id / displayName / 默认 endpoint / 模型清单 / 文档链接 等），
 * **不**包含 LlmProvider instance。Phase 2 才填 PROVIDERS_INSTANCES。
 *
 * 调研依据：2026-04-30 各家官方 docs（OpenAI / Anthropic / Google / DeepSeek /
 * 阿里通义 / Moonshot Kimi / 智谱 / xAI）。模型 id 与 baseUrl 取该日期实测可用值。
 *
 * 设计原则：
 *   - DEEPSEEK 保持现状（已有的 deepseek-v4-flash / deepseek-v4-pro 二选一）；
 *     注册表只是给它一个 ProviderDescriptor 包装，运行时行为零变化
 *   - OpenAI 兼容族（DeepSeek / OpenAI / Qwen / Moonshot / Zhipu / xAI）共享同一
 *     `openaiCompatible` 工厂（Phase 2 实现），仅 baseUrl + model 列表不同
 *   - Anthropic / Gemini 是原生协议，单独走 SDK
 *   - 默认 model 选择策略：尽量挑"非 thinking 默认开启"的快速档，避免新用户切到 Pro
 *     模型时遇到"长时间空气泡"问题（DeepSeek 已踩坑）
 */

import type { Locale } from '@/locales'

export type ProviderId =
  | 'deepseek'
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'qwen'
  | 'moonshot'
  | 'zhipu'
  | 'xai'

/**
 * 协议族：
 *   - openai-compatible：DeepSeek / OpenAI / Qwen / Moonshot / Zhipu / xAI 全部走
 *     OpenAI Chat Completions 协议（`/v1/chat/completions` + SSE 增量）
 *   - anthropic：Claude 原生消息 API（`/v1/messages`，system 提到顶层）
 *   - gemini：Google GenerativeLanguage API（contents/parts 结构 + systemInstruction）
 */
export type ProviderProtocol = 'openai-compatible' | 'anthropic' | 'gemini'

/**
 * 模型能力 tag：用于 i18n 描述时的"小标签"展示，与文案无关，可累加。
 *   thinking：开启 reasoning_content / thinking 段落输出
 *   fast：低延迟，主打速度
 *   cheap：价格档最便宜
 *   long-context：明显长于同 provider 其它模型的上下文窗
 *   multimodal：原生支持图像 / 音频输入
 *   coding：官方主推编码场景
 */
export type ModelTag = 'thinking' | 'fast' | 'cheap' | 'long-context' | 'multimodal' | 'coding'

export interface ModelDescriptor {
  /** API 实际请求的 model id（直接传给 SDK） */
  readonly id: string
  /** i18n key，回退到本表的 fallbackLabel */
  readonly labelKey?: string
  /** 兜底展示名（i18n 缺失时用） */
  readonly fallbackLabel: string
  /** 能力 tag（影响 UI 标签显示） */
  readonly tags: readonly ModelTag[]
  /** 是否被官方标记为已弃用；UI 不展示，仅 sanitize 用 */
  readonly deprecated?: boolean
}

export interface ProviderDescriptor {
  readonly id: ProviderId
  readonly protocol: ProviderProtocol
  /** 三语展示名 */
  readonly displayName: Record<Locale, string>
  /** 厂商官方主页（设置页可链） */
  readonly homepage: string
  /** 申请 / 管理 API Key 的页面 */
  readonly apiKeyDocsUrl: string
  /** 默认 API base URL；用户可在 settings 覆盖（仅 OpenAI 兼容族） */
  readonly defaultBaseUrl: string
  /** 是否允许用户在 UI 自定义 baseUrl（Anthropic / Gemini 隐藏，避免误用） */
  readonly allowCustomBaseUrl: boolean
  /** 该 Provider 的可用模型清单（含 deprecated 兜底） */
  readonly models: readonly ModelDescriptor[]
  /** 默认推荐模型（用户首次选择该 Provider 时填入） */
  readonly defaultModelId: string
  /** UI 分组：international vs domestic（中国大陆主推） */
  readonly group: 'international' | 'domestic'
}

/* ------------------------------------------------------------------ */
/*  Provider 元数据表                                                   */
/* ------------------------------------------------------------------ */

const DEEPSEEK: ProviderDescriptor = {
  id: 'deepseek',
  protocol: 'openai-compatible',
  displayName: { 'zh-CN': 'DeepSeek 深度求索', 'zh-TW': 'DeepSeek 深度求索', en: 'DeepSeek' },
  homepage: 'https://www.deepseek.com',
  apiKeyDocsUrl: 'https://platform.deepseek.com/api_keys',
  defaultBaseUrl: 'https://api.deepseek.com',
  allowCustomBaseUrl: true,
  models: [
    { id: 'deepseek-v4-flash', labelKey: 'ai.model.v4Flash', fallbackLabel: 'DeepSeek V4 Flash', tags: ['fast', 'cheap'] },
    { id: 'deepseek-v4-pro',   labelKey: 'ai.model.v4Pro',   fallbackLabel: 'DeepSeek V4 Pro',   tags: ['thinking'] },
    { id: 'deepseek-chat',     fallbackLabel: 'DeepSeek Chat (legacy)',     tags: ['fast'],      deprecated: true },
    { id: 'deepseek-reasoner', fallbackLabel: 'DeepSeek Reasoner (legacy)', tags: ['thinking'],  deprecated: true },
  ],
  defaultModelId: 'deepseek-v4-flash',
  group: 'domestic',
}

const OPENAI: ProviderDescriptor = {
  id: 'openai',
  protocol: 'openai-compatible',
  displayName: { 'zh-CN': 'OpenAI', 'zh-TW': 'OpenAI', en: 'OpenAI' },
  homepage: 'https://openai.com',
  apiKeyDocsUrl: 'https://platform.openai.com/api-keys',
  defaultBaseUrl: 'https://api.openai.com/v1',
  allowCustomBaseUrl: true,
  models: [
    { id: 'gpt-5.4-mini', fallbackLabel: 'GPT-5.4 mini', tags: ['fast', 'cheap'] },
    { id: 'gpt-5.4',      fallbackLabel: 'GPT-5.4',      tags: ['thinking'] },
    { id: 'gpt-5.5',      fallbackLabel: 'GPT-5.5',      tags: ['thinking'] },
    { id: 'gpt-5.4-nano', fallbackLabel: 'GPT-5.4 nano', tags: ['fast', 'cheap'] },
  ],
  defaultModelId: 'gpt-5.4-mini',
  group: 'international',
}

const ANTHROPIC: ProviderDescriptor = {
  id: 'anthropic',
  protocol: 'anthropic',
  displayName: { 'zh-CN': 'Anthropic Claude', 'zh-TW': 'Anthropic Claude', en: 'Anthropic Claude' },
  homepage: 'https://www.anthropic.com',
  apiKeyDocsUrl: 'https://console.anthropic.com/settings/keys',
  defaultBaseUrl: 'https://api.anthropic.com',
  allowCustomBaseUrl: false,
  models: [
    { id: 'claude-sonnet-4-6',         fallbackLabel: 'Claude Sonnet 4.6', tags: ['fast', 'thinking'] },
    { id: 'claude-opus-4-7',           fallbackLabel: 'Claude Opus 4.7',   tags: ['thinking', 'coding'] },
    { id: 'claude-haiku-4-5-20251001', fallbackLabel: 'Claude Haiku 4.5',  tags: ['fast', 'cheap'] },
  ],
  defaultModelId: 'claude-sonnet-4-6',
  group: 'international',
}

const GEMINI: ProviderDescriptor = {
  id: 'gemini',
  protocol: 'gemini',
  displayName: { 'zh-CN': 'Google Gemini', 'zh-TW': 'Google Gemini', en: 'Google Gemini' },
  homepage: 'https://ai.google.dev',
  apiKeyDocsUrl: 'https://aistudio.google.com/apikey',
  defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  allowCustomBaseUrl: false,
  models: [
    { id: 'gemini-3-flash',        fallbackLabel: 'Gemini 3 Flash',        tags: ['fast', 'multimodal'] },
    { id: 'gemini-3.1-pro',        fallbackLabel: 'Gemini 3.1 Pro',        tags: ['thinking', 'multimodal', 'long-context'] },
    { id: 'gemini-3.1-flash-lite', fallbackLabel: 'Gemini 3.1 Flash-Lite', tags: ['fast', 'cheap'] },
    { id: 'gemini-2.5-pro',        fallbackLabel: 'Gemini 2.5 Pro',        tags: ['thinking', 'multimodal'] },
  ],
  defaultModelId: 'gemini-3-flash',
  group: 'international',
}

const QWEN: ProviderDescriptor = {
  id: 'qwen',
  protocol: 'openai-compatible',
  displayName: { 'zh-CN': '通义千问 Qwen', 'zh-TW': '通義千問 Qwen', en: 'Qwen (Alibaba)' },
  homepage: 'https://tongyi.aliyun.com',
  apiKeyDocsUrl: 'https://bailian.console.aliyun.com',
  defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  allowCustomBaseUrl: true,
  models: [
    { id: 'qwen-plus',             fallbackLabel: 'Qwen Plus',             tags: ['cheap', 'long-context'] },
    { id: 'qwen3-max',             fallbackLabel: 'Qwen3 Max',             tags: ['thinking', 'long-context'] },
    { id: 'qwen3.6-plus-preview',  fallbackLabel: 'Qwen 3.6 Plus Preview', tags: ['long-context'] },
    { id: 'qwen3-coder-next',      fallbackLabel: 'Qwen3 Coder Next',      tags: ['coding'] },
  ],
  defaultModelId: 'qwen-plus',
  group: 'domestic',
}

const MOONSHOT: ProviderDescriptor = {
  id: 'moonshot',
  protocol: 'openai-compatible',
  displayName: { 'zh-CN': '月之暗面 Kimi', 'zh-TW': '月之暗面 Kimi', en: 'Moonshot Kimi' },
  homepage: 'https://www.moonshot.cn',
  apiKeyDocsUrl: 'https://platform.moonshot.cn/console/api-keys',
  defaultBaseUrl: 'https://api.moonshot.cn/v1',
  allowCustomBaseUrl: true,
  models: [
    { id: 'kimi-k2.6', fallbackLabel: 'Kimi K2.6', tags: ['fast', 'long-context'] },
    { id: 'kimi-k2.5', fallbackLabel: 'Kimi K2.5', tags: ['multimodal', 'thinking'] },
    { id: 'kimi-k2',   fallbackLabel: 'Kimi K2',   tags: ['coding'] },
  ],
  defaultModelId: 'kimi-k2.6',
  group: 'domestic',
}

const ZHIPU: ProviderDescriptor = {
  id: 'zhipu',
  protocol: 'openai-compatible',
  displayName: { 'zh-CN': '智谱 GLM', 'zh-TW': '智譜 GLM', en: 'Zhipu GLM' },
  homepage: 'https://open.bigmodel.cn',
  apiKeyDocsUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
  defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  allowCustomBaseUrl: true,
  models: [
    { id: 'glm-4.6', fallbackLabel: 'GLM-4.6', tags: ['thinking', 'long-context'] },
    { id: 'glm-4.7', fallbackLabel: 'GLM-4.7', tags: ['thinking', 'coding'] },
    { id: 'glm-4.5', fallbackLabel: 'GLM-4.5', tags: ['fast'] },
  ],
  defaultModelId: 'glm-4.6',
  group: 'domestic',
}

const XAI: ProviderDescriptor = {
  id: 'xai',
  protocol: 'openai-compatible',
  displayName: { 'zh-CN': 'xAI Grok', 'zh-TW': 'xAI Grok', en: 'xAI Grok' },
  homepage: 'https://x.ai',
  apiKeyDocsUrl: 'https://console.x.ai',
  defaultBaseUrl: 'https://api.x.ai/v1',
  allowCustomBaseUrl: true,
  models: [
    { id: 'grok-3', fallbackLabel: 'Grok 3', tags: ['fast', 'cheap'] },
    { id: 'grok-4', fallbackLabel: 'Grok 4', tags: ['thinking'] },
  ],
  defaultModelId: 'grok-3',
  group: 'international',
}

/**
 * 8 家 Provider 元数据，按 UI 分组顺序排列：先国际，再国内。
 * 默认 active provider 是 deepseek（保留 Phase 0 行为）。
 */
export const PROVIDERS: Readonly<Record<ProviderId, ProviderDescriptor>> = Object.freeze({
  deepseek: DEEPSEEK,
  openai: OPENAI,
  anthropic: ANTHROPIC,
  gemini: GEMINI,
  qwen: QWEN,
  moonshot: MOONSHOT,
  zhipu: ZHIPU,
  xai: XAI,
})

/** 8 个 Provider id 的有序列表（UI 渲染顺序） */
export const PROVIDER_IDS: readonly ProviderId[] = Object.freeze([
  'deepseek',
  'openai',
  'anthropic',
  'gemini',
  'qwen',
  'moonshot',
  'zhipu',
  'xai',
])

/** 类型守卫：未知字符串能否安全断言为 ProviderId */
export function isProviderId(s: unknown): s is ProviderId {
  return typeof s === 'string' && (PROVIDER_IDS as readonly string[]).includes(s)
}

/** 取 Provider 元数据；非法 id 兜底回 deepseek */
export function getProviderDescriptor(id: ProviderId): ProviderDescriptor {
  return PROVIDERS[id] ?? PROVIDERS.deepseek
}

/**
 * 校验某 Provider 下 model id 是否合法且**未被弃用**。用于 sanitize 用户 storage 残留 +
 * setModel 时主动拦截。返回合法 id 或该 Provider 的 defaultModelId。
 *
 * 注意：deprecated:true 的 model 仍在 `models` 列表里（提供"id → fallbackLabel"
 * 反查能力），但本函数把它视为不可用，主动改写为 defaultModelId 避免下游 LLM 收到
 * deprecated id 后报 400。
 */
export function sanitizeModelId(providerId: ProviderId, modelId: string): string {
  const desc = getProviderDescriptor(providerId)
  const valid = desc.models.some((m) => m.id === modelId && !m.deprecated)
  return valid ? modelId : desc.defaultModelId
}
