import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
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
  type ModelDescriptor,
} from '@/composables/ai/providers/registry'
import type { RemoteModel } from '@/composables/ai/providers/types'

const STORAGE_KEY = 'tt-qimen:ai-config'

/**
 * sessionStorage key（按 tab 隔离 + 关闭浏览器后失效）。
 *
 * 用 sessionStorage 而非 localStorage 的考量：
 *   - 模型清单是"配置类瞬时数据"，下次启动时让用户主动决定是否重拉
 *   - localStorage 多 tab 共享会导致一个 tab 的 stale cache 污染另一个 tab
 *   - 隐私：API key 已在 localStorage（必须长期存）；模型清单不需要长期存
 */
const MODELS_CACHE_KEY = 'tt-qimen:ai-models-cache'

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
/* ------------------------------------------------------------------ */
/*  Provider 模型清单缓存（远程 listModels 结果，sessionStorage 持久化）  */
/* ------------------------------------------------------------------ */

interface ModelsCacheEntry {
  /** 远程 listModels 拉取到的模型列表（时间倒序 / 字典序） */
  readonly models: readonly RemoteModel[]
  /** 拉取时刻 Unix 毫秒（UI 用相对时间提示） */
  readonly fetchedAt: number
}

type ModelsCache = Partial<Record<ProviderId, ModelsCacheEntry>>

/**
 * 远程模型拉取的状态机（UI 侧渲染 spinner / 错误 / 时间提示用）。
 *   - idle：从未拉取，或上次成功 / 失败已清理
 *   - loading：listModels 进行中（按钮 disabled）
 *   - success：刚刚拉取成功（cache 同步更新）
 *   - error：拉取失败（保留 message，cache 保持上次结果）
 *
 * 全局单例：只跟踪当前 activeProvider 的拉取，切 provider 时重置回 idle。
 */
export type ModelsRefreshState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; fetchedAt: number; count: number }
  | { kind: 'error'; message: string }

export const useAiConfigStore = defineStore('aiConfig', () => {
  const userConfig = useStorage<AiUserConfig>(
    STORAGE_KEY,
    structuredClone(DEFAULT_AI_USER_CONFIG),
    undefined,
    { mergeDefaults: true },
  )

  sanitizeUserConfig(userConfig.value)

  /**
   * 模型清单缓存：跨刷新保持该 tab 的最近一次拉取结果。
   *
   * 为什么用 sessionStorage（不是 localStorage）：
   *   - 模型清单可能在厂商上线 / 下线新模型时变化；保留太久会和当前实际 API 脱节
   *   - 多 tab 隔离避免互相污染
   *   - 浏览器关闭即失效，让用户在长时间不活跃后自然重新评估
   */
  const modelsCache = useStorage<ModelsCache>(
    MODELS_CACHE_KEY,
    {},
    typeof window !== 'undefined' ? window.sessionStorage : undefined,
    { mergeDefaults: true },
  )

  /** 当前 activeProvider 的拉取状态（不持久化） */
  const refreshState = ref<ModelsRefreshState>({ kind: 'idle' })

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

  /**
   * 当前 active provider 的可用模型清单（合并 registry hardcoded + 远程缓存）。
   *
   * 决策树：
   *   - sessionStorage 中有 cache → 用 cache（厂商最新）
   *   - 没 cache → 用 registry.models（过滤 deprecated，保持原 labelKey/tags）
   *
   * 不直接把远程结果与 registry 合并（去重共有 id 之类）：因为
   *   - 远程结果通常是 registry 的超集，去重逻辑会引入两份字段不一致风险
   *   - 用户主动 refresh 后期望看到"完整远程列表"，而不是混合视图
   */
  const currentModels = computed<readonly ModelDescriptor[]>(() => {
    const id = userConfig.value.activeProviderId
    return getModelsForProvider(id)
  })

  function getModelsForProvider(id: ProviderId): readonly ModelDescriptor[] {
    const cached = modelsCache.value[id]
    if (cached && cached.models.length > 0) {
      return cached.models.map(remoteToDescriptor)
    }
    return PROVIDERS[id].models.filter((m) => !m.deprecated)
  }

  function remoteToDescriptor(m: RemoteModel): ModelDescriptor {
    return {
      id: m.id,
      fallbackLabel: m.fallbackLabel,
      tags: (m.tags ?? []) as ModelDescriptor['tags'],
    }
  }

  /* -------- mutators ---------------------------------------------- */

  function setActiveProvider(id: ProviderId): void {
    if (!isProviderId(id)) return
    userConfig.value = { ...userConfig.value, activeProviderId: id }
    refreshState.value = { kind: 'idle' }
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
    patchCurrentProvider({ model: sanitizeModelIdAgainstCache(id, model) })
  }

  /**
   * sanitize 模型 id：远程缓存里有则视为合法（可能是 registry 没收录的新模型）；
   * 没缓存时回退到 registry 的 sanitize 行为（防 deprecated）。
   */
  function sanitizeModelIdAgainstCache(id: ProviderId, modelId: string): string {
    const cached = modelsCache.value[id]
    if (cached) {
      const ok = cached.models.some((m) => m.id === modelId)
      if (ok) return modelId
      if (cached.models.length > 0) return cached.models[0].id
    }
    return sanitizeModelId(id, modelId)
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
    modelsCache.value = {}
    refreshState.value = { kind: 'idle' }
  }

  function clearKeyOnly(): void {
    patchCurrentProvider({ apiKey: '' })
  }

  /**
   * 写入指定 provider 的远程模型清单缓存（不切 active）。
   * 主要给 SettingsPage 的"刷新模型列表"按钮用。
   */
  function setRemoteModels(id: ProviderId, models: readonly RemoteModel[]): void {
    modelsCache.value = {
      ...modelsCache.value,
      [id]: {
        models: models.map((m) => ({ ...m })),
        fetchedAt: Date.now(),
      },
    }
    refreshState.value = {
      kind: 'success',
      fetchedAt: Date.now(),
      count: models.length,
    }
    const cur = userConfig.value.perProvider[id].model
    const sanitized = sanitizeModelIdAgainstCache(id, cur)
    if (sanitized !== cur) {
      userConfig.value = {
        ...userConfig.value,
        perProvider: {
          ...userConfig.value.perProvider,
          [id]: { ...userConfig.value.perProvider[id], model: sanitized },
        },
      }
    }
  }

  function clearRemoteModels(id: ProviderId): void {
    if (!modelsCache.value[id]) return
    const next = { ...modelsCache.value }
    delete next[id]
    modelsCache.value = next
    refreshState.value = { kind: 'idle' }
  }

  function setRefreshState(s: ModelsRefreshState): void {
    refreshState.value = s
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
    /** 当前 active provider 的可用模型（registry hardcoded 或远程缓存） */
    currentModels,
    /** 当前 active provider 的远程拉取状态（loading / success / error） */
    refreshState,
    /** sessionStorage 中所有 provider 的模型缓存 */
    modelsCache,
    setActiveProvider,
    setApiKey,
    setModel,
    setTemperature,
    setBaseUrl,
    reset,
    clearKeyOnly,
    /** 给指定 provider 设远程模型清单（用于"刷新模型列表"按钮） */
    setRemoteModels,
    /** 清空指定 provider 的缓存，回退到 registry hardcoded */
    clearRemoteModels,
    /** 任意状态写入（loading / error 等过渡态） */
    setRefreshState,
    /** 取任意 provider 的可用模型（含远程缓存） */
    getModelsForProvider,
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
