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
import { ArrowLeft, Eye, EyeOff } from 'lucide-vue-next'
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
import { Separator } from '@/components/ui/separator'

const { t, locale: i18nLocale } = useI18n()
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

function goPrivacy() {
  router.push({ name: 'privacy' })
}

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-6 md:py-10">
    <Button variant="ghost" size="sm" class="mb-6" @click="goHome">
      <ArrowLeft class="size-4" />
      {{ t('common.button.back') }}
    </Button>

    <header class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight text-foreground">
        {{ t('settings.title') }}
      </h1>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ t('settings.subtitle') }}
      </p>
    </header>

    <div class="space-y-10">
      <!-- ============== 主题 ============== -->
      <section>
        <h2 class="text-base font-semibold text-foreground">
          {{ t('settings.section.theme.title') }}
        </h2>
        <p class="mt-1 text-xs text-muted-foreground">
          {{ t('settings.section.theme.hint') }}
        </p>
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            v-for="id in themeStore.list"
            :key="id"
            type="button"
            class="flex flex-col items-start gap-1 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary aria-pressed:border-primary aria-pressed:bg-accent"
            :aria-pressed="id === themeStore.id"
            @click="themeStore.set(id)"
          >
            <span class="text-sm font-medium text-foreground">
              {{ getThemeName(id) }}
            </span>
            <span class="text-xs text-muted-foreground">
              {{ getThemeDesc(id) }}
            </span>
          </button>
        </div>
      </section>

      <Separator />

      <!-- ============== 语言 ============== -->
      <section>
        <h2 class="text-base font-semibold text-foreground">
          {{ t('settings.section.language.title') }}
        </h2>
        <p class="mt-1 text-xs text-muted-foreground">
          {{ t('settings.section.language.hint') }}
        </p>
        <div class="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            v-for="id in localeStore.list"
            :key="id"
            type="button"
            class="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-primary aria-pressed:border-primary aria-pressed:bg-accent"
            :aria-pressed="id === localeStore.id"
            @click="localeStore.set(id)"
          >
            <span class="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {{ LANG_LABELS[id].short }}
            </span>
            <span class="text-sm font-medium text-foreground">
              {{ LANG_LABELS[id].full }}
            </span>
          </button>
        </div>
      </section>

      <Separator />

      <!-- ============== AI 解读 ============== -->
      <section>
        <h2 class="text-base font-semibold text-foreground">
          {{ t('settings.section.ai.title') }}
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
          {{ t('settings.section.ai.lead') }}
        </p>

        <div class="mt-6 space-y-6">
          <!-- Provider -->
          <div class="space-y-2">
            <Label>{{ t('settings.section.ai.providerLabel') }}</Label>
            <div class="rounded-lg border border-primary bg-accent px-4 py-3 text-sm font-medium text-foreground">
              {{ t('settings.section.ai.providerOption.deepseek') }}
            </div>
          </div>

          <!-- API Key -->
          <div class="space-y-2">
            <Label for="ai-api-key">
              {{ t('settings.section.ai.apiKey.label') }}
            </Label>
            <div class="flex gap-2">
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
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  :aria-label="showApiKey
                    ? t('settings.section.ai.apiKey.hide')
                    : t('settings.section.ai.apiKey.show')"
                  @click="showApiKey = !showApiKey"
                >
                  <Eye v-if="!showApiKey" class="size-4" aria-hidden="true" />
                  <EyeOff v-else class="size-4" aria-hidden="true" />
                </button>
              </div>
              <Button
                v-if="aiConfig.hasKey"
                variant="outline"
                size="sm"
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
            <div class="space-y-2">
              <button
                v-for="m in DEEPSEEK_MODELS"
                :key="m.id"
                type="button"
                class="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary aria-pressed:border-primary aria-pressed:bg-accent"
                :aria-pressed="m.id === aiConfig.config.model"
                @click="aiConfig.setModel(m.id)"
              >
                <span class="text-sm font-medium text-foreground">
                  {{ t(m.labelKey) }}
                </span>
                <span
                  v-if="'deprecated' in m && m.deprecated"
                  class="shrink-0 rounded-md bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
                >
                  {{ t('ai.model.deprecatedTip') }}
                </span>
              </button>
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
            <div class="flex gap-2">
              <Input
                id="ai-base-url"
                v-model="baseUrlValue"
                type="text"
                autocomplete="off"
                spellcheck="false"
                :placeholder="t('settings.section.ai.baseUrl.placeholder')"
              />
              <Button variant="outline" size="sm" @click="resetBaseUrl">
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

        <Separator class="my-8" />

        <!-- 对话历史 -->
        <div>
          <h3 class="text-sm font-semibold text-foreground">
            {{ t('settings.section.ai.sessions.title') }}
          </h3>
          <div class="mt-3 flex flex-wrap gap-6">
            <div class="space-y-1">
              <div class="text-xs text-muted-foreground">
                {{ t('settings.section.ai.sessions.countLabel') }}
              </div>
              <div class="font-mono text-2xl font-semibold text-foreground">
                {{ aiHistory.count }}
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-xs text-muted-foreground">
                {{ t('settings.section.ai.sessions.messagesLabel') }}
              </div>
              <div class="font-mono text-2xl font-semibold text-foreground">
                {{ aiHistory.totalMessages }}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="mt-4"
            :disabled="aiHistory.count === 0"
            @click="clearAllSessions"
          >
            {{ t('settings.section.ai.sessions.clearButton') }}
          </Button>
        </div>

        <Separator class="my-8" />

        <!-- 隐私 -->
        <div>
          <h3 class="text-sm font-semibold text-foreground">
            {{ t('settings.section.ai.privacy.title') }}
          </h3>
          <ul class="mt-3 space-y-2 pl-5 text-sm text-muted-foreground">
            <li
              v-for="(item, i) in (t('settings.section.ai.privacy.items', { returnObjects: true }) as unknown as string[])"
              :key="i"
              class="list-disc leading-relaxed"
            >
              {{ item }}
            </li>
          </ul>
          <Button variant="link" class="mt-2 px-0" @click="goPrivacy">
            {{ t('settings.section.ai.privacy.privacyLink') }}
          </Button>
        </div>
      </section>
    </div>
  </main>
</template>
