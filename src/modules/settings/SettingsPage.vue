<script setup lang="ts">
/**
 * 设置页 · /settings
 *
 * 三节：
 *   1. 主题（双主题选项卡 · 复用 themeStore.registry）
 *   2. 语言（三语单选 · 复用 localeStore.list）
 *   3. AI 解读（provider / apiKey / model / temperature / baseUrl + 测试连接 + 清空会话 + 隐私）
 *
 * 实现规范（2026-04-28 用户规范修订）：
 *   - 完全采用 shadcn-vue 组件 + Tailwind utility class，不再写 scoped CSS
 *   - 双主题视觉适配由 themes/{guofeng,minimal}/shadcn.css 通过 [data-theme] 选择器接管，
 *     业务代码无需 v-if 分支
 *   - shadcn Slider modelValue 是 number[]，需要在 wrapper computed 里 wrap/unwrap
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  EyeOff,
  Palette,
  Languages,
  Sparkles,
  History,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { useAiConfigStore } from '@/stores/aiConfig'
import { useAiHistoryStore } from '@/stores/aiHistory'
import {
  PROVIDERS,
  PROVIDER_IDS,
  getProviderDescriptor,
  isOpenAiCompatible,
  type ModelTag,
  type ProviderId,
} from '@/composables/ai/providers/registry'
import { getProvider } from '@/composables/ai/providers'
import { LlmError } from '@/composables/ai/errors'
import type { ThemeId } from '@/themes'
import type { Locale } from '@/locales'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import SearchableCombobox from '@/components/common/SearchableCombobox.vue'

const { t, tm, rt, locale: i18nLocale } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const aiConfig = useAiConfigStore()
const aiHistory = useAiHistoryStore()

const LANG_LABELS: Record<Locale, { short: string; full: string }> = {
  'zh-CN': { short: '简', full: '简体中文' },
  'zh-TW': { short: '繁', full: '繁體中文' },
  en: { short: 'EN', full: 'English' },
}

function getThemeName(id: ThemeId): string {
  const dn = themeStore.registry[id].displayName
  return dn[i18nLocale.value as keyof typeof dn] ?? dn['zh-CN']
}

function getThemeDesc(id: ThemeId): string {
  const dc = themeStore.registry[id].description
  return dc[i18nLocale.value as keyof typeof dc] ?? dc['zh-CN']
}

const showApiKey = ref(false)

const apiKeyValue = computed({
  get: () => aiConfig.config.apiKey,
  set: (v: string) => aiConfig.setApiKey(v),
})

const baseUrlValue = computed({
  get: () => aiConfig.config.baseUrl,
  set: (v: string) => aiConfig.setBaseUrl(v),
})

const temperatureSliderValue = computed<number[]>({
  get: () => [aiConfig.config.temperature],
  set: (v: number[]) => aiConfig.setTemperature(v[0] ?? 0.7),
})

/**
 * 当前 active Provider 的元数据（i18n displayName / 模型清单 / docs 链接 / baseUrl 策略）。
 * 切换 activeProviderId 时整个 SettingsPage AI 段会自动重新投影：
 *   - apiKey input 跟随 aiConfig.config.apiKey 变化（store computed 已重新投影到新 provider）
 *   - model grid 跟随 currentProvider.models 变化
 *   - baseUrl 区按 currentProvider.allowCustomBaseUrl 决定显示与否
 *   - testConnection / "获取 API Key →" 跟随当前 provider
 */
const currentProvider = computed(() => getProviderDescriptor(aiConfig.activeProviderId))

/**
 * 当前 provider 的可选 model 列表。
 *
 * 数据来源（动态）：
 *   - 若用户主动刷新过远程列表 → store.modelsCache 中有该 provider 的远程结果；
 *     `aiConfig.currentModels` 直接返回缓存（store 内部已转成 ModelDescriptor 形态）
 *   - 否则 → store 回退到 registry hardcoded（已过滤 deprecated）
 *
 * 这样设计后 SettingsPage 不再硬编码 `currentProvider.value.models.filter(...)`，
 * 远程刷新后立即透传到 model combobox。
 */
const currentModels = computed(() => aiConfig.currentModels)

/** 当前 provider 是否暴露 baseUrl 自定义入口（仅 OpenAI 协议兼容族 = true） */
const canCustomBaseUrl = computed(() => isOpenAiCompatible(aiConfig.activeProviderId))

/** 当前选中 model 的 tag 描述串（"快速 · 便宜"），无 tag 时为空串 */
const currentModelTagLine = computed(() => {
  const m = currentModels.value.find((x) => x.id === aiConfig.config.model)
  return m ? modelTagLine(m.tags) : ''
})

type TestState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'ok' }
  | { kind: 'fail'; message: string }
  | { kind: 'missing-key' }

const testState = ref<TestState>({ kind: 'idle' })

async function testConnection() {
  if (!aiConfig.hasKey) {
    testState.value = { kind: 'missing-key' }
    return
  }
  testState.value = { kind: 'running' }
  try {
    const res = await getProvider(aiConfig.activeProviderId).ping(aiConfig.config)
    if (res.ok) {
      testState.value = { kind: 'ok' }
    } else {
      testState.value = { kind: 'fail', message: res.message ?? t('ai.error.unknown') }
    }
  } catch (e) {
    if (e instanceof LlmError) {
      testState.value = { kind: 'fail', message: t(`ai.error.${e.code}`) }
    } else {
      testState.value = { kind: 'fail', message: t('ai.error.unknown') }
    }
  }
}

/**
 * 拉取当前 active provider 的远程模型清单并写入 sessionStorage 缓存。
 *
 * 设计：
 *   - 没填 apiKey 时直接拒绝（远程接口都需要 Bearer token）
 *   - provider 实例没实现 listModels 时（理论上 8 家都实现了，作防御）写一个 unsupported 状态
 *   - 任意失败都不污染当前缓存（保留上一次结果）
 */
async function refreshModels() {
  if (aiConfig.refreshState.kind === 'loading') return
  if (!aiConfig.hasKey) {
    aiConfig.setRefreshState({ kind: 'error', message: t('settings.section.ai.test.missingKey') })
    return
  }
  const provider = getProvider(aiConfig.activeProviderId)
  if (typeof provider.listModels !== 'function') {
    aiConfig.setRefreshState({
      kind: 'error',
      message: t('settings.section.ai.model.refresh.unsupported'),
    })
    return
  }
  aiConfig.setRefreshState({ kind: 'loading' })
  try {
    const result = await provider.listModels(aiConfig.config)
    if (result.models.length === 0) {
      aiConfig.setRefreshState({
        kind: 'error',
        message: t('settings.section.ai.model.refresh.empty'),
      })
      return
    }
    aiConfig.setRemoteModels(aiConfig.activeProviderId, result.models)
  } catch (e) {
    const msg
      = e instanceof LlmError
        ? t(`ai.error.${e.code}`)
        : e instanceof Error
          ? e.message
          : t('ai.error.unknown')
    aiConfig.setRefreshState({ kind: 'error', message: msg })
  }
}

function clearRemoteModels() {
  aiConfig.clearRemoteModels(aiConfig.activeProviderId)
}

/**
 * 当前 provider 是否使用了远程拉取的模型缓存（决定是否展示"清空缓存"按钮 + 时间提示）
 */
const hasRemoteCache = computed(() => {
  const cached = aiConfig.modelsCache[aiConfig.activeProviderId]
  return !!cached && cached.models.length > 0
})

/**
 * 把 fetchedAt 时间戳格式化成"刚刚 / N 分钟前 / 时:分"
 */
function formatRelativeTime(unixMs: number): string {
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - unixMs) / 1000))
  if (diffSec < 60) return t('settings.section.ai.model.refresh.justNow')
  if (diffSec < 3600) {
    return t('settings.section.ai.model.refresh.minutesAgo', { n: Math.floor(diffSec / 60) })
  }
  const d = new Date(unixMs)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return t('settings.section.ai.model.refresh.atTime', { time: `${hh}:${mm}` })
}

/**
 * 当前 model combobox 下方第二行 "源" 提示：
 *   - 远程缓存：`已使用远程列表 · 12 个模型 · 5 分钟前`
 *   - hardcoded：`使用内置列表`
 */
const modelSourceLine = computed(() => {
  const cached = aiConfig.modelsCache[aiConfig.activeProviderId]
  if (!cached || cached.models.length === 0) {
    return t('settings.section.ai.model.refresh.useHardcoded')
  }
  const sep = ' · '
  return [
    t('settings.section.ai.model.refresh.useRemote'),
    t('settings.section.ai.model.refresh.fromCache', { count: cached.models.length }),
    formatRelativeTime(cached.fetchedAt),
  ].join(sep)
})

/**
 * Provider 选择 v-model（SearchableCombobox 的 modelValue 双向绑定）。
 *
 * 设计决策（用户三轮反馈 2026-04-30）：
 *   1. 第一版：8 个 Button grid（占空间）
 *   2. 第二版：shadcn-vue Select 下拉（不能搜索 + 滚动抖动）
 *   3. 第三版：shadcn-vue Combobox = Popover + Command（支持搜索但 portal 与
 *      项目已有 CityCombobox 风格不一致）
 *   4. 终版（当前）：参考 `CityCombobox.vue` 自定义 input + listbox 模式实现的
 *      `SearchableCombobox`，与项目"选择城市"风格统一，零 portal、滚动稳定
 *
 * 切 Provider 时同步重置 testState，避免上一次连接成功/失败标记被错误沿用。
 */
const providerSelectValue = computed<ProviderId>({
  get: () => aiConfig.activeProviderId,
  set: (v) => {
    if (!v || v === aiConfig.activeProviderId) return
    aiConfig.setActiveProvider(v as ProviderId)
    testState.value = { kind: 'idle' }
  },
})

/**
 * Model 选择 v-model；setModel 内部已有 sanitize 兜底。
 */
const modelSelectValue = computed<string>({
  get: () => aiConfig.config.model,
  set: (v: string) => {
    if (!v) return
    aiConfig.setModel(v)
  },
})

/** 当前 provider 可选 model 的 id 列表（剔除 deprecated；用于 SearchableCombobox.options） */
const currentModelIds = computed<readonly string[]>(
  () => currentModels.value.map((m) => m.id),
)

/** 找一个 model 的 i18n 名 / fallback 名 */
function getModelLabel(modelId: string): string {
  const m = currentModels.value.find((x) => x.id === modelId)
  if (!m) return modelId
  return m.labelKey ? t(m.labelKey) : m.fallbackLabel
}

/** 找一个 model 的 tag 描述串（"快速 · 便宜"） */
function getModelHint(modelId: string): string {
  const m = currentModels.value.find((x) => x.id === modelId)
  return m ? modelTagLine(m.tags) : ''
}

/**
 * Provider 自定义匹配函数：按 displayName 三语 + tagline 联合匹配。
 * 让用户输入 "claude" 命中 "Anthropic Claude"；输入 "中文" 命中 DeepSeek 的中文 tagline。
 */
function matchProvider(id: ProviderId, q: string): boolean {
  const name = getProviderDisplayName(id).toLowerCase()
  const tagline = t(`settings.section.ai.providerOption.${id}`).toLowerCase()
  return name.includes(q) || tagline.includes(q) || id.toLowerCase().includes(q)
}

function clearKey() {
  aiConfig.clearKeyOnly()
  testState.value = { kind: 'idle' }
}

/**
 * 把 ModelTag union 映射到 i18n 子键。
 * 注意 `long-context` 含连字符不是合法对象 key，对 i18n 用 camelCase 别名。
 */
const TAG_I18N_KEY: Record<ModelTag, string> = {
  thinking: 'thinking',
  fast: 'fast',
  cheap: 'cheap',
  'long-context': 'longContext',
  multimodal: 'multimodal',
  coding: 'coding',
}

/**
 * 把模型的 tag 列表拼成「思维链 · 长上下文」之类的描述串；
 * 无 tag 时返回空串，模板里据此选择是否渲染描述行。
 */
function modelTagLine(tags: readonly ModelTag[]): string {
  if (tags.length === 0) return ''
  const sep = i18nLocale.value === 'en' ? ' · ' : ' · '
  return tags
    .map((tag) => t(`settings.section.ai.model.tag.${TAG_I18N_KEY[tag]}`))
    .join(sep)
}

function getProviderDisplayName(id: ProviderId): string {
  const dn = PROVIDERS[id].displayName
  return dn[i18nLocale.value as keyof typeof dn] ?? dn['zh-CN']
}

function resetBaseUrl() {
  aiConfig.setBaseUrl('')
}

function clearAllSessions() {
  const count = aiHistory.count
  if (count === 0) return
  const msg = t('settings.section.ai.sessions.clearConfirm', { count })
  if (window.confirm(msg)) {
    aiHistory.clearAll()
  }
}

/**
 * 隐私要点列表。
 *
 * vue-i18n@9 不支持 `t(key, { returnObjects: true })`（这是 i18next 的 API）；
 * 旧实现把 key 字符串当作 string 拿到，再被模板 v-for 拆成单字符 <li>，导致渲染为
 * "s/e/t/t/i/n/g/s/..." 乱码。正确姿势是 `tm()` 取数组消息节点，再 `rt()` 解
 * 引用每条字符串（即使没有插值参数也要走 rt，否则拿到的是 MessageNode 对象）。
 *
 * tm 返回类型在 vue-i18n@9 的泛型推导里非常深，给 raw 显式标注 unknown[] 即可
 * 短路递归类型，避免 "Type instantiation is excessively deep" 报错。
 *
 * 参考：vue-i18n Composer.tm / Composer.rt
 */
const privacyItems = computed<string[]>(() => {
  const raw = tm('settings.section.ai.privacy.items') as unknown as unknown[]
  if (!Array.isArray(raw)) return []
  return raw.map((node) => rt(node as never))
})

function goPrivacy() {
  router.push({ name: 'privacy' })
}

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-6 md:py-10">
    <Button variant="ghost" size="sm" class="mb-6 -ml-2" @click="goHome">
      <ArrowLeft class="size-4" />
      {{ t('common.button.back') }}
    </Button>

    <header class="mb-10">
      <h1 class="text-3xl font-semibold tracking-tight text-foreground">
        {{ t('settings.title') }}
      </h1>
      <p class="mt-3 text-base text-muted-foreground">
        {{ t('settings.subtitle') }}
      </p>
    </header>

    <div class="space-y-6">
      <!-- ============== 主题 ============== -->
      <section class="rounded-xl border border-border bg-card p-5 md:p-6">
        <div class="flex items-start gap-3">
          <div class="rounded-lg bg-muted p-2 text-muted-foreground">
            <Palette class="size-4" aria-hidden="true" />
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold text-foreground">
              {{ t('settings.section.theme.title') }}
            </h2>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ t('settings.section.theme.hint') }}
            </p>
          </div>
        </div>
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          <Button
            v-for="id in themeStore.list"
            :key="id"
            type="button"
            variant="outline"
            class="group/opt h-auto flex-col items-start gap-1 px-4 py-3 text-left whitespace-normal aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            :aria-pressed="id === themeStore.id"
            @click="themeStore.set(id)"
          >
            <span class="text-sm font-medium text-foreground group-aria-pressed/opt:text-current">
              {{ getThemeName(id) }}
            </span>
            <span class="text-xs font-normal text-muted-foreground group-aria-pressed/opt:text-current/80">
              {{ getThemeDesc(id) }}
            </span>
          </Button>
        </div>
      </section>

      <!-- ============== 语言 ============== -->
      <section class="rounded-xl border border-border bg-card p-5 md:p-6">
        <div class="flex items-start gap-3">
          <div class="rounded-lg bg-muted p-2 text-muted-foreground">
            <Languages class="size-4" aria-hidden="true" />
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold text-foreground">
              {{ t('settings.section.language.title') }}
            </h2>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ t('settings.section.language.hint') }}
            </p>
          </div>
        </div>
        <div class="mt-4 grid gap-2 sm:grid-cols-3">
          <Button
            v-for="id in localeStore.list"
            :key="id"
            type="button"
            variant="outline"
            class="group/opt h-auto justify-start gap-3 px-4 py-3 aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            :aria-pressed="id === localeStore.id"
            @click="localeStore.set(id)"
          >
            <span class="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground group-aria-pressed/opt:bg-current/15 group-aria-pressed/opt:text-current">
              {{ LANG_LABELS[id].short }}
            </span>
            <span class="text-sm font-medium text-foreground group-aria-pressed/opt:text-current">
              {{ LANG_LABELS[id].full }}
            </span>
          </Button>
        </div>
      </section>

      <!-- ============== AI 解读 ============== -->
      <section class="rounded-xl border border-border bg-card p-5 md:p-6">
        <div class="flex items-start gap-3">
          <div class="rounded-lg bg-primary/10 p-2 text-primary">
            <Sparkles class="size-4" aria-hidden="true" />
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold text-foreground">
              {{ t('settings.section.ai.title') }}
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
              {{ t('settings.section.ai.lead') }}
            </p>
          </div>
        </div>

        <div class="mt-6 space-y-6">
          <!-- Provider · 自定义 SearchableCombobox（参考 CityCombobox 风格） -->
          <div class="space-y-2">
            <Label for="ai-provider-combobox">{{ t('settings.section.ai.providerLabel') }}</Label>
            <SearchableCombobox
              id="ai-provider-combobox"
              v-model="providerSelectValue"
              :options="PROVIDER_IDS"
              :label-of="(id) => getProviderDisplayName(id)"
              :match-fn="(id, q) => matchProvider(id, q)"
              :placeholder="getProviderDisplayName(aiConfig.activeProviderId)"
              :search-placeholder="t('settings.section.ai.providerSearchPlaceholder')"
              :no-result-text="t('settings.section.ai.providerEmpty')"
            />
            <p class="text-xs text-muted-foreground">
              <span class="text-foreground/80">
                {{ t(`settings.section.ai.providerOption.${aiConfig.activeProviderId}`) }}
              </span>
              <span class="mx-1.5 text-muted-foreground/60" aria-hidden="true">·</span>
              <span>{{ t('settings.section.ai.providerHint') }}</span>
            </p>
          </div>

          <!-- API Key -->
          <div class="space-y-2">
            <div class="flex items-baseline justify-between gap-3">
              <Label for="ai-api-key">
                {{ t('settings.section.ai.apiKey.label') }}
                <span class="ml-1 font-normal text-muted-foreground">·</span>
                <span class="ml-1 font-normal text-muted-foreground">{{ getProviderDisplayName(aiConfig.activeProviderId) }}</span>
              </Label>
              <a
                :href="currentProvider.apiKeyDocsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {{ t('settings.section.ai.providerDocsCta') }}
                <ExternalLink class="size-3" aria-hidden="true" />
              </a>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row">
              <div class="relative flex-1">
                <Input
                  id="ai-api-key"
                  v-model="apiKeyValue"
                  :type="showApiKey ? 'text' : 'password'"
                  autocomplete="off"
                  spellcheck="false"
                  :placeholder="t('settings.section.ai.apiKey.placeholder')"
                  class="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                  :aria-label="showApiKey
                    ? t('settings.section.ai.apiKey.hide')
                    : t('settings.section.ai.apiKey.show')"
                  @click="showApiKey = !showApiKey"
                >
                  <Eye v-if="!showApiKey" class="size-4" aria-hidden="true" />
                  <EyeOff v-else class="size-4" aria-hidden="true" />
                </Button>
              </div>
              <Button
                v-if="aiConfig.hasKey"
                variant="outline"
                class="w-full sm:w-auto"
                @click="clearKey"
              >
                {{ t('settings.section.ai.apiKey.clear') }}
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ t('settings.section.ai.apiKey.hint') }}
            </p>
          </div>

          <!-- Model · 与 Provider 同款 SearchableCombobox + 刷新按钮 -->
          <div class="space-y-2">
            <div class="flex items-baseline justify-between gap-3">
              <Label for="ai-model-combobox">{{ t('settings.section.ai.model.label') }}</Label>
              <div class="flex items-center gap-2 text-xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                  :disabled="aiConfig.refreshState.kind === 'loading'"
                  :aria-label="t('settings.section.ai.model.refresh.button')"
                  @click="refreshModels"
                >
                  <Loader2
                    v-if="aiConfig.refreshState.kind === 'loading'"
                    class="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                  <RefreshCw
                    v-else
                    class="size-3.5"
                    aria-hidden="true"
                  />
                  <span>{{ t('settings.section.ai.model.refresh.button') }}</span>
                </Button>
                <Button
                  v-if="hasRemoteCache"
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="h-7 px-2 text-muted-foreground hover:text-foreground"
                  @click="clearRemoteModels"
                >
                  {{ t('settings.section.ai.model.refresh.clear') }}
                </Button>
              </div>
            </div>
            <SearchableCombobox
              id="ai-model-combobox"
              v-model="modelSelectValue"
              :options="currentModelIds"
              :label-of="getModelLabel"
              :hint-of="getModelHint"
              :placeholder="getModelLabel(aiConfig.config.model)"
              :search-placeholder="t('settings.section.ai.providerSearchPlaceholder')"
              :no-result-text="t('settings.section.ai.providerEmpty')"
            />
            <p class="text-xs text-muted-foreground">
              <span v-if="currentModelTagLine" class="text-foreground/80">
                {{ currentModelTagLine }}
              </span>
              <span
                v-if="currentModelTagLine"
                class="mx-1.5 text-muted-foreground/60"
                aria-hidden="true"
              >·</span>
              <span>{{ t('settings.section.ai.model.hint') }}</span>
            </p>
            <p
              :class="[
                'text-xs',
                aiConfig.refreshState.kind === 'error'
                  ? 'text-destructive'
                  : 'text-muted-foreground',
              ]"
            >
              <template v-if="aiConfig.refreshState.kind === 'loading'">
                {{ t('settings.section.ai.model.refresh.loading') }}
              </template>
              <template v-else-if="aiConfig.refreshState.kind === 'error'">
                {{ t('settings.section.ai.model.refresh.error', {
                  message: aiConfig.refreshState.message,
                }) }}
              </template>
              <template v-else>
                {{ modelSourceLine }}
              </template>
            </p>
          </div>

          <!-- Temperature -->
          <div class="space-y-3">
            <div class="flex items-baseline justify-between">
              <Label>{{ t('settings.section.ai.temperature.label') }}</Label>
              <span class="font-mono text-sm text-muted-foreground">
                {{ aiConfig.config.temperature.toFixed(1) }}
              </span>
            </div>
            <Slider
              v-model="temperatureSliderValue"
              :min="0"
              :max="2"
              :step="0.1"
            />
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>{{ t('settings.section.ai.temperature.min') }}</span>
              <span>{{ t('settings.section.ai.temperature.max') }}</span>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ t('settings.section.ai.temperature.hint') }}
            </p>
          </div>

          <!-- Base URL（仅 OpenAI 协议兼容族暴露） -->
          <div v-if="canCustomBaseUrl" class="space-y-2">
            <Label for="ai-base-url">
              {{ t('settings.section.ai.baseUrl.label') }}
            </Label>
            <div class="flex flex-col gap-2 sm:flex-row">
              <Input
                id="ai-base-url"
                v-model="baseUrlValue"
                type="text"
                autocomplete="off"
                spellcheck="false"
                :placeholder="currentProvider.defaultBaseUrl"
              />
              <Button variant="outline" class="w-full sm:w-auto" @click="resetBaseUrl">
                {{ t('settings.section.ai.baseUrl.useDefault') }}
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ t('settings.section.ai.baseUrl.hint') }}
            </p>
          </div>

          <!-- 测试连接 -->
          <div class="space-y-2">
            <Button
              variant="default"
              class="w-full sm:w-auto"
              :disabled="testState.kind === 'running'"
              @click="testConnection"
            >
              <template v-if="testState.kind === 'running'">
                {{ t('settings.section.ai.test.running') }}
              </template>
              <template v-else>
                {{ t('settings.section.ai.test.button') }}
              </template>
            </Button>
            <p
              v-if="testState.kind === 'ok'"
              class="font-mono text-sm text-green-600 dark:text-green-400"
            >
              {{ t('settings.section.ai.test.ok') }}
            </p>
            <p
              v-else-if="testState.kind === 'fail'"
              class="font-mono text-sm text-destructive"
            >
              {{ t('settings.section.ai.test.fail') }}{{ testState.message }}
            </p>
            <p
              v-else-if="testState.kind === 'missing-key'"
              class="font-mono text-sm text-destructive"
            >
              {{ t('settings.section.ai.test.missingKey') }}
            </p>
          </div>
        </div>
      </section>

      <!-- ============== 对话历史 ============== -->
      <section class="rounded-xl border border-border bg-card p-5 md:p-6">
        <div class="flex items-start gap-3">
          <div class="rounded-lg bg-muted p-2 text-muted-foreground">
            <History class="size-4" aria-hidden="true" />
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold text-foreground">
              {{ t('settings.section.ai.sessions.title') }}
            </h2>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ t('settings.section.ai.sessions.hint') }}
            </p>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 divide-x divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
          <div class="px-4 py-3">
            <div class="text-xs text-muted-foreground">
              {{ t('settings.section.ai.sessions.countLabel') }}
            </div>
            <div class="mt-1 font-mono text-xl font-semibold text-foreground md:text-2xl">
              {{ aiHistory.count }}
            </div>
          </div>
          <div class="px-4 py-3">
            <div class="text-xs text-muted-foreground">
              {{ t('settings.section.ai.sessions.messagesLabel') }}
            </div>
            <div class="mt-1 font-mono text-xl font-semibold text-foreground md:text-2xl">
              {{ aiHistory.totalMessages }}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          class="mt-4 w-full sm:w-auto"
          :disabled="aiHistory.count === 0"
          @click="clearAllSessions"
        >
          {{ t('settings.section.ai.sessions.clearButton') }}
        </Button>
      </section>

      <!-- ============== 隐私 ============== -->
      <section class="rounded-xl border border-border bg-card p-5 md:p-6">
        <div class="flex items-start gap-3">
          <div class="rounded-lg bg-muted p-2 text-muted-foreground">
            <ShieldCheck class="size-4" aria-hidden="true" />
          </div>
          <div class="flex-1">
            <h2 class="text-base font-semibold text-foreground">
              {{ t('settings.section.ai.privacy.title') }}
            </h2>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ t('settings.section.ai.privacy.hint') }}
            </p>
          </div>
        </div>
        <ul class="mt-4 space-y-2 pl-5 text-sm text-muted-foreground">
          <li
            v-for="(item, i) in privacyItems"
            :key="i"
            class="list-disc leading-relaxed"
          >
            {{ item }}
          </li>
        </ul>
        <Button
          variant="link"
          size="sm"
          class="mt-3 h-auto px-0 text-primary hover:text-primary/80"
          @click="goPrivacy"
        >
          {{ t('settings.section.ai.privacy.privacyLink') }}
        </Button>
      </section>
    </div>
  </main>
</template>
