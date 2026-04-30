import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import {
  DEFAULT_AI_USER_CONFIG,
  projectRequestConfig,
  type AiConfig,
  type AiUserConfig,
  type ProviderUserConfig,
} from '@/composables/ai/types'
import {
  PROVIDERS,
  isProviderId,
  sanitizeModelId,
  type ProviderId,
} from '@/composables/ai/providers/registry'

const STORAGE_KEY = 'tt-qimen:ai-config'

/**
 * AI 解读配置（多 Provider 持久化结构）。
 *
 * 持久化策略：
 *   - 走 useStorage（@vueuse/core），与 theme/locale/user 三个 store 风格一致
 *   - mergeDefaults:true → 旧版 storage 缺字段时用 DEFAULT_AI_USER_CONFIG 补齐
 *   - **不做旧 schema migration**（用户决策 2026-04-30）：项目还未公开使用，
 *     旧版 single-deepseek 形态 `{ providerId, apiKey, baseUrl, model, temperature }`
 *     在 mergeDefaults 后会缺 perProvider / activeProviderId 字段，被默认值覆盖。
 *     老开发者重填 Key 即可（已在 todo 19 §5 风险表接受此代价）
 *
 * 安全约束：
 *   - 不向 console 打印整个 config（防 apiKey 泄漏到崩溃报告 / 错误监控）
 *   - hasKey 仅暴露布尔，对外不直接暴露 apiKey 字段
 *
 * 校验：
 *   - 启动时 sanitizeUserConfig 兜底：activeProviderId 非法 → 'deepseek'；
 *     每个 provider 的 model 非法 → 该 provider 的 defaultModelId
 *
 * 向后兼容：
 *   - `config` getter 暴露的是当前 activeProvider 的扁平 AiConfig，与 Phase 0
 *     单 provider 时代的 `aiConfig.config.apiKey` / `.model` 等访问完全等价；
 *     SettingsPage / AiSidebarPanel 的现有 `aiConfig.config.xxx` 用法零改动
 *   - `setApiKey / setModel / setBaseUrl` 操作的是当前 activeProvider 的对应字段；
 *     `setTemperature` 操作顶层共享 temperature
 */
export const useAiConfigStore = defineStore('aiConfig', () => {
  const userConfig = useStorage<AiUserConfig>(
    STORAGE_KEY,
    structuredClone(DEFAULT_AI_USER_CONFIG),
    undefined,
    { mergeDefaults: true },
  )

  sanitizeUserConfig(userConfig.value)

  /** 当前 activeProvider 的扁平运行时 config（向后兼容旧 store API） */
  const config = computed<AiConfig>(() => projectRequestConfig(userConfig.value))

  /** 当前 activeProvider id */
  const activeProviderId = computed<ProviderId>(() => userConfig.value.activeProviderId)

  /** 当前 activeProvider 的可写 user config（仅供 settings 页绑定） */
  const currentProviderConfig = computed<ProviderUserConfig>(
    () => userConfig.value.perProvider[userConfig.value.activeProviderId],
  )

  const hasKey = computed(() => currentProviderConfig.value.apiKey.trim().length > 0)
  const isConfigured = computed(() => hasKey.value && config.value.baseUrl.trim().length > 0)

  /* -------- mutators ---------------------------------------------- */

  function setActiveProvider(id: ProviderId): void {
    if (!isProviderId(id)) return
    userConfig.value = { ...userConfig.value, activeProviderId: id }
  }

  function patchCurrentProvider(patch: Partial<ProviderUserConfig>): void {
    const id = userConfig.value.activeProviderId
    const prev = userConfig.value.perProvider[id]
    userConfig.value = {
      ...userConfig.value,
      perProvider: { ...userConfig.value.perProvider, [id]: { ...prev, ...patch } },
    }
  }

  function setApiKey(key: string): void {
    patchCurrentProvider({ apiKey: key.trim() })
  }

  function setModel(model: string): void {
    const id = userConfig.value.activeProviderId
    patchCurrentProvider({ model: sanitizeModelId(id, model) })
  }

  function setTemperature(t: number): void {
    userConfig.value = { ...userConfig.value, temperature: clamp01to2(t) }
  }

  /**
   * 设置当前 Provider 的 baseUrl。
   * 空字符串 = 重置为该 Provider 的 defaultBaseUrl（实际存储为空，运行时 fallback）。
   */
  function setBaseUrl(url: string): void {
    patchCurrentProvider({ baseUrl: url.trim() })
  }

  function reset(): void {
    userConfig.value = structuredClone(DEFAULT_AI_USER_CONFIG)
  }

  function clearKeyOnly(): void {
    patchCurrentProvider({ apiKey: '' })
  }

  return {
    /** 多 provider 完整持久化结构（仅供 settings 切 Provider UI 读 perProvider） */
    userConfig,
    /** 当前 active provider 的扁平 AiConfig（runtime 输入；向后兼容旧 API） */
    config,
    activeProviderId,
    currentProviderConfig,
    hasKey,
    isConfigured,
    setActiveProvider,
    setApiKey,
    setModel,
    setTemperature,
    setBaseUrl,
    reset,
    clearKeyOnly,
  }
})

/**
 * 启动时把 storage 中可能残留的非法字段修正为安全值。
 *
 * 防御场景：
 *   - 用户旧 storage activeProviderId === 'foo' 之类非法字符串 → 改回 'deepseek'
 *   - 某 provider 的 model 是 deprecated（如 'deepseek-chat'）或拼写错误 → 改回该
 *     provider 的 defaultModelId
 *   - perProvider 中缺某 provider 的整条记录（mergeDefaults 已经补齐，这里再保险）
 */
function sanitizeUserConfig(user: AiUserConfig): void {
  if (!isProviderId(user.activeProviderId)) {
    user.activeProviderId = 'deepseek'
  }
  for (const id of Object.keys(PROVIDERS) as ProviderId[]) {
    const cur = user.perProvider[id]
    if (!cur) {
      user.perProvider[id] = {
        apiKey: '',
        baseUrl: '',
        model: PROVIDERS[id].defaultModelId,
      }
      continue
    }
    const fixedModel = sanitizeModelId(id, cur.model)
    if (fixedModel !== cur.model) cur.model = fixedModel
  }
  if (Number.isNaN(user.temperature) || user.temperature < 0 || user.temperature > 2) {
    user.temperature = DEFAULT_AI_USER_CONFIG.temperature
  }
}

function clamp01to2(t: number): number {
  if (Number.isNaN(t)) return DEFAULT_AI_USER_CONFIG.temperature
  return Math.max(0, Math.min(2, t))
}
