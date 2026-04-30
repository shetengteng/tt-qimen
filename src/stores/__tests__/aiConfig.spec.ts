/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

/**
 * vueuse useStorage 缓存说明同 aiHistory.spec.ts：每个 spec 用 vi.resetModules()
 * + 动态 import 重置 store，避免测试间状态泄漏。
 */
let useAiConfigStore: typeof import('../aiConfig').useAiConfigStore

beforeEach(async () => {
  localStorage.clear()
  vi.resetModules()
  const mod = await import('../aiConfig')
  useAiConfigStore = mod.useAiConfigStore
  setActivePinia(createPinia())
})

afterEach(() => {
  localStorage.clear()
})

describe('aiConfig store — defaults', () => {
  it('starts with activeProviderId=deepseek and empty key', () => {
    const store = useAiConfigStore()
    expect(store.activeProviderId).toBe('deepseek')
    expect(store.hasKey).toBe(false)
    expect(store.config.apiKey).toBe('')
  })

  it('config.baseUrl falls back to provider default when user baseUrl is empty', () => {
    const store = useAiConfigStore()
    expect(store.config.baseUrl).toBe('https://api.deepseek.com')
  })

  it('config.model is the provider defaultModelId', () => {
    const store = useAiConfigStore()
    expect(store.config.model).toBe('deepseek-v4-flash')
  })

  it('initial perProvider entries are populated for all 8 providers', () => {
    const store = useAiConfigStore()
    expect(Object.keys(store.userConfig.perProvider).sort()).toEqual([
      'anthropic',
      'deepseek',
      'gemini',
      'moonshot',
      'openai',
      'qwen',
      'xai',
      'zhipu',
    ])
  })
})

describe('aiConfig store — switching providers preserves per-provider keys', () => {
  it('keeps deepseek key when switching to openai and back', () => {
    const store = useAiConfigStore()

    store.setApiKey('dk-1234')
    expect(store.config.apiKey).toBe('dk-1234')

    store.setActiveProvider('openai')
    expect(store.config.apiKey).toBe('') // openai not configured yet
    store.setApiKey('sk-openai-9999')
    expect(store.config.apiKey).toBe('sk-openai-9999')

    store.setActiveProvider('deepseek')
    expect(store.config.apiKey).toBe('dk-1234') // deepseek still there

    store.setActiveProvider('openai')
    expect(store.config.apiKey).toBe('sk-openai-9999')
  })

  it('switches model independently per provider', () => {
    const store = useAiConfigStore()
    store.setModel('deepseek-v4-pro')
    expect(store.config.model).toBe('deepseek-v4-pro')

    store.setActiveProvider('openai')
    expect(store.config.model).toBe('gpt-5.4-mini') // openai default
    store.setModel('gpt-5.5')
    expect(store.config.model).toBe('gpt-5.5')

    store.setActiveProvider('deepseek')
    expect(store.config.model).toBe('deepseek-v4-pro')
  })
})

describe('aiConfig store — model sanitize', () => {
  it('rejects unknown model id and falls back to provider default', () => {
    const store = useAiConfigStore()
    store.setModel('totally-unknown-id')
    expect(store.config.model).toBe('deepseek-v4-flash')
  })

  it('rejects deprecated deepseek-chat and rewrites to default', () => {
    const store = useAiConfigStore()
    store.setModel('deepseek-chat') // deprecated
    expect(store.config.model).toBe('deepseek-v4-flash')
  })

  it('also sanitizes on hydration when storage holds a deprecated id', async () => {
    localStorage.setItem(
      'tt-qimen:ai-config',
      JSON.stringify({
        activeProviderId: 'deepseek',
        temperature: 0.7,
        perProvider: {
          deepseek: { apiKey: 'k', baseUrl: '', model: 'deepseek-reasoner' },
          openai: { apiKey: '', baseUrl: '', model: 'gpt-5.4-mini' },
          anthropic: { apiKey: '', baseUrl: '', model: 'claude-sonnet-4-6' },
          gemini: { apiKey: '', baseUrl: '', model: 'gemini-3-flash' },
          qwen: { apiKey: '', baseUrl: '', model: 'qwen-plus' },
          moonshot: { apiKey: '', baseUrl: '', model: 'kimi-k2.6' },
          zhipu: { apiKey: '', baseUrl: '', model: 'glm-4.6' },
          xai: { apiKey: '', baseUrl: '', model: 'grok-3' },
        },
      }),
    )
    vi.resetModules()
    const { useAiConfigStore: freshStore } = await import('../aiConfig')
    setActivePinia(createPinia())
    const store = freshStore()
    expect(store.config.model).toBe('deepseek-v4-flash')
  })
})

describe('aiConfig store — baseUrl behaviour', () => {
  it('per-provider baseUrl override flows into config', () => {
    const store = useAiConfigStore()
    store.setBaseUrl('https://my-proxy.local/v1')
    expect(store.config.baseUrl).toBe('https://my-proxy.local/v1')
  })

  it('empty baseUrl resets to provider default', () => {
    const store = useAiConfigStore()
    store.setBaseUrl('https://my-proxy.local/v1')
    store.setBaseUrl('') // user clears
    expect(store.config.baseUrl).toBe('https://api.deepseek.com')
  })

  it('whitespace-only baseUrl is treated as empty (falls back to default)', () => {
    const store = useAiConfigStore()
    store.setBaseUrl('   ')
    expect(store.config.baseUrl).toBe('https://api.deepseek.com')
  })

  it('different providers can have different baseUrl overrides', () => {
    const store = useAiConfigStore()
    store.setBaseUrl('https://deepseek-proxy.local/v1')
    store.setActiveProvider('moonshot')
    expect(store.config.baseUrl).toBe('https://api.moonshot.cn/v1') // not yet configured
    store.setBaseUrl('https://kimi-proxy.local/v1')

    store.setActiveProvider('deepseek')
    expect(store.config.baseUrl).toBe('https://deepseek-proxy.local/v1')
    store.setActiveProvider('moonshot')
    expect(store.config.baseUrl).toBe('https://kimi-proxy.local/v1')
  })
})

describe('aiConfig store — temperature is shared across providers', () => {
  it('setTemperature persists across provider switches', () => {
    const store = useAiConfigStore()
    store.setTemperature(0.9)
    store.setActiveProvider('anthropic')
    expect(store.config.temperature).toBe(0.9)
    store.setActiveProvider('xai')
    expect(store.config.temperature).toBe(0.9)
  })

  it('temperature is clamped to [0, 2]', () => {
    const store = useAiConfigStore()
    store.setTemperature(5)
    expect(store.config.temperature).toBe(2)
    store.setTemperature(-1)
    expect(store.config.temperature).toBe(0)
    store.setTemperature(Number.NaN)
    expect(store.config.temperature).toBe(0.2) // default
  })
})

describe('aiConfig store — clearKeyOnly / reset', () => {
  it('clearKeyOnly clears only the active provider key', () => {
    const store = useAiConfigStore()
    store.setApiKey('dk-1')
    store.setActiveProvider('openai')
    store.setApiKey('sk-1')

    store.clearKeyOnly() // clears openai
    expect(store.config.apiKey).toBe('')

    store.setActiveProvider('deepseek')
    expect(store.config.apiKey).toBe('dk-1') // deepseek key intact
  })

  it('reset wipes all per-provider configs back to defaults', () => {
    const store = useAiConfigStore()
    store.setApiKey('dk-1')
    store.setActiveProvider('openai')
    store.setApiKey('sk-1')
    store.setTemperature(1.5)

    store.reset()
    expect(store.activeProviderId).toBe('deepseek')
    expect(store.config.temperature).toBe(0.2)
    expect(store.userConfig.perProvider.deepseek.apiKey).toBe('')
    expect(store.userConfig.perProvider.openai.apiKey).toBe('')
  })
})

describe('aiConfig store — setApiKey trims whitespace', () => {
  it('strips leading/trailing spaces on assignment', () => {
    const store = useAiConfigStore()
    store.setApiKey('   dk-padded   ')
    expect(store.config.apiKey).toBe('dk-padded')
  })
})

describe('aiConfig store — invalid activeProviderId in storage', () => {
  it('falls back to deepseek when activeProviderId is unknown', async () => {
    localStorage.setItem(
      'tt-qimen:ai-config',
      JSON.stringify({
        activeProviderId: 'totally-unknown-vendor',
        temperature: 0.4,
        perProvider: {
          deepseek: { apiKey: 'k', baseUrl: '', model: 'deepseek-v4-flash' },
          openai: { apiKey: '', baseUrl: '', model: 'gpt-5.4-mini' },
          anthropic: { apiKey: '', baseUrl: '', model: 'claude-sonnet-4-6' },
          gemini: { apiKey: '', baseUrl: '', model: 'gemini-3-flash' },
          qwen: { apiKey: '', baseUrl: '', model: 'qwen-plus' },
          moonshot: { apiKey: '', baseUrl: '', model: 'kimi-k2.6' },
          zhipu: { apiKey: '', baseUrl: '', model: 'glm-4.6' },
          xai: { apiKey: '', baseUrl: '', model: 'grok-3' },
        },
      }),
    )
    vi.resetModules()
    const { useAiConfigStore: freshStore } = await import('../aiConfig')
    setActivePinia(createPinia())
    const store = freshStore()
    expect(store.activeProviderId).toBe('deepseek')
  })
})
