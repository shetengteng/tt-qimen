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
import { ArrowLeft, Eye, EyeOff, Palette, Languages, Sparkles, History, ShieldCheck } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { useAiConfigStore } from '@/stores/aiConfig'
import { useAiHistoryStore } from '@/stores/aiHistory'
import { DEEPSEEK_MODELS } from '@/composables/ai/types'
import { deepseekProvider } from '@/composables/ai/providers/deepseek'
import { LlmError } from '@/composables/ai/errors'
import type { ThemeId } from '@/themes'
import type { Locale } from '@/locales'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

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
    const res = await deepseekProvider.ping(aiConfig.config)
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

function clearKey() {
  aiConfig.clearKeyOnly()
  testState.value = { kind: 'idle' }
}

function getModelDescKey(modelId: string): string {
  if (modelId === 'deepseek-v4-pro') return 'settings.section.ai.model.proDesc'
  return 'settings.section.ai.model.flashDesc'
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
            class="h-auto flex-col items-start gap-1 px-4 py-3 text-left whitespace-normal aria-pressed:border-primary aria-pressed:bg-accent"
            :aria-pressed="id === themeStore.id"
            @click="themeStore.set(id)"
          >
            <span class="text-sm font-medium text-foreground">
              {{ getThemeName(id) }}
            </span>
            <span class="text-xs font-normal text-muted-foreground">
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
            class="h-auto justify-start gap-3 px-4 py-3 aria-pressed:border-primary aria-pressed:bg-accent"
            :aria-pressed="id === localeStore.id"
            @click="localeStore.set(id)"
          >
            <span class="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {{ LANG_LABELS[id].short }}
            </span>
            <span class="text-sm font-medium text-foreground">
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
          <!-- Provider -->
          <div class="space-y-2">
            <Label>{{ t('settings.section.ai.providerLabel') }}</Label>
            <div class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
              <span class="size-1.5 rounded-full bg-primary" aria-hidden="true"></span>
              {{ t('settings.section.ai.providerOption.deepseek') }}
            </div>
          </div>

          <!-- API Key -->
          <div class="space-y-2">
            <Label for="ai-api-key">
              {{ t('settings.section.ai.apiKey.label') }}
            </Label>
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

          <!-- Model -->
          <div class="space-y-2">
            <Label>{{ t('settings.section.ai.model.label') }}</Label>
            <div class="grid gap-2 sm:grid-cols-2">
              <Button
                v-for="m in DEEPSEEK_MODELS"
                :key="m.id"
                type="button"
                variant="outline"
                class="h-auto flex-col items-start gap-1 px-4 py-3 text-left whitespace-normal aria-pressed:border-primary aria-pressed:bg-accent"
                :aria-pressed="m.id === aiConfig.config.model"
                @click="aiConfig.setModel(m.id)"
              >
                <span class="text-sm font-medium text-foreground">
                  {{ t(m.labelKey) }}
                </span>
                <span class="text-xs font-normal text-muted-foreground">
                  {{ t(getModelDescKey(m.id)) }}
                </span>
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ t('settings.section.ai.model.hint') }}
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

          <!-- Base URL -->
          <div class="space-y-2">
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
                :placeholder="t('settings.section.ai.baseUrl.placeholder')"
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
