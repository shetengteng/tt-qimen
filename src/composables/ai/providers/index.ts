/**
 * Provider 实例入口 — 把 8 家 LlmProvider 实例聚合为一个 map，给 AiSidebarPanel /
 * SettingsPage 用 `getProvider(id)` 按当前 activeProviderId 取实例。
 *
 * 与 `registry.ts` 的分工：
 *   - registry.ts 是纯 metadata（无 SDK import）：displayName / models / defaultBaseUrl 等
 *     设置页/sanitize/UI 列表渲染的来源
 *   - 本 index.ts 持有真实 LlmProvider 实例：拉 openai / @anthropic-ai/sdk /
 *     @google/genai 三个 SDK；运行时调 streamChat / ping 时才需要
 *
 * 这种切分让 registry.ts 可以被任何模块（包括 store / spec 测试）轻量 import 而
 * 不拉 SDK；本 index.ts 只在真正发请求路径上被引用，仍然走 vite manualChunks 的
 * `feat-ai` chunk 懒加载，不影响首屏体积。
 */

import type { LlmProvider } from './types'
import type { ProviderId } from './registry'
import { deepseekProvider } from './deepseek'
import { openaiProvider } from './openai'
import { anthropicProvider } from './anthropic'
import { geminiProvider } from './gemini'
import { qwenProvider } from './qwen'
import { moonshotProvider } from './moonshot'
import { zhipuProvider } from './zhipu'
import { xaiProvider } from './xai'

export const PROVIDER_INSTANCES: Readonly<Record<ProviderId, LlmProvider>> =
  Object.freeze({
    deepseek: deepseekProvider,
    openai: openaiProvider,
    anthropic: anthropicProvider,
    gemini: geminiProvider,
    qwen: qwenProvider,
    moonshot: moonshotProvider,
    zhipu: zhipuProvider,
    xai: xaiProvider,
  })

/**
 * 取指定 ProviderId 的运行时实例。非法 id 兜底回 deepseek（保持 Phase 0 行为）。
 *
 * 主要使用场景：
 *   - SettingsPage 测试连接：`getProvider(aiConfig.activeProviderId).ping(aiConfig.config)`
 *   - AiSidebarPanel：`provider = computed(() => getProvider(aiConfig.activeProviderId))`
 *     传给 useAiChat 的 Ref<LlmProvider>，切 Provider 时 sidebar 自动用新 Provider
 */
export function getProvider(id: ProviderId): LlmProvider {
  return PROVIDER_INSTANCES[id] ?? deepseekProvider
}
