import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import { DEFAULT_AI_CONFIG, DEEPSEEK_MODELS, type AiConfig } from '@/composables/ai/types'

const STORAGE_KEY = 'tt-qimen:ai-config'

/**
 * AI 解读配置（API Key / Provider / Model / Temperature / Base URL）。
 *
 * 持久化策略：
 *   - 走 useStorage（@vueuse/core），与 theme/locale/user 三个 store 风格一致
 *   - mergeDefaults:true → 旧版 storage 缺字段时用 DEFAULT 补齐，避免 undefined 渲染崩溃
 *   - apiKey **明文存 localStorage**：纯前端 SPA 无服务端可托管，已在隐私页与设置页明示风险
 *
 * 安全约束：
 *   - 不向 console 打印整个 config（防 apiKey 泄漏到崩溃报告 / 错误监控）
 *   - hasKey 仅暴露布尔，对外不直接暴露 apiKey 字段（消费方按需 store.config.apiKey 自取）
 *
 * 校验：
 *   - sanitizeModel 兜底：用户旧版本 storage 里的弃用模型 id 在加载时会被映射到 DEFAULT.model
 *     避免下次发请求时 DeepSeek 直接 400
 */
export const useAiConfigStore = defineStore('aiConfig', () => {
  const config = useStorage<AiConfig>(
    STORAGE_KEY,
    { ...DEFAULT_AI_CONFIG },
    undefined,
    { mergeDefaults: true },
  )

  const hasKey = computed(() => config.value.apiKey.trim().length > 0)
  const isConfigured = computed(() => hasKey.value && config.value.baseUrl.trim().length > 0)

  function update(patch: Partial<AiConfig>): void {
    config.value = { ...config.value, ...patch }
  }

  function setApiKey(key: string): void {
    config.value = { ...config.value, apiKey: key.trim() }
  }

  function setModel(model: string): void {
    config.value = { ...config.value, model: sanitizeModel(model) }
  }

  function setTemperature(t: number): void {
    config.value = { ...config.value, temperature: clamp01to2(t) }
  }

  function setBaseUrl(url: string): void {
    const trimmed = url.trim()
    config.value = {
      ...config.value,
      baseUrl: trimmed.length > 0 ? trimmed : DEFAULT_AI_CONFIG.baseUrl,
    }
  }

  function reset(): void {
    config.value = { ...DEFAULT_AI_CONFIG }
  }

  function clearKeyOnly(): void {
    config.value = { ...config.value, apiKey: '' }
  }

  return {
    config,
    hasKey,
    isConfigured,
    update,
    setApiKey,
    setModel,
    setTemperature,
    setBaseUrl,
    reset,
    clearKeyOnly,
  }
})

function sanitizeModel(model: string): string {
  const known = DEEPSEEK_MODELS.find((m) => m.id === model)
  if (!known) return DEFAULT_AI_CONFIG.model
  const deprecated = 'deprecated' in known && known.deprecated === true
  return deprecated ? DEFAULT_AI_CONFIG.model : model
}

function clamp01to2(t: number): number {
  if (Number.isNaN(t)) return DEFAULT_AI_CONFIG.temperature
  return Math.max(0, Math.min(2, t))
}
