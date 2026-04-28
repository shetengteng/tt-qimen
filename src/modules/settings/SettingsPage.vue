<script setup lang="ts">
/**
 * 设置页 · /settings
 *
 * 三节：
 *   1. 主题（双主题选项卡 · 复用 themeStore.registry）
 *   2. 语言（三语单选 · 复用 localeStore.list）
 *   3. AI 解读（provider / apiKey / model / temperature / baseUrl + 测试连接 + 清空会话 + 隐私）
 *
 * 设计意图：
 *   - 不复用 ThemeSwitch / LangSwitch（它们是 toolbar Popover），改成 radio 平铺更适合长形 settings 页
 *   - 双主题样式分支与 LegalContentLayout 对齐：guofeng / minimal 两套外观容器
 *   - apiKey 可显隐切换；用户清空 baseUrl 时 store 内部会回退到 DEFAULT
 *   - 测试连接：单态机（idle / running / ok / fail / missing-key），错误码走 i18n
 *   - 清空会话：浏览器 confirm() 二次确认，传入会话数让用户判断后果
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { useAiConfigStore } from '@/stores/aiConfig'
import { useAiHistoryStore } from '@/stores/aiHistory'
import { DEEPSEEK_MODELS } from '@/composables/ai/types'
import { deepseekProvider } from '@/composables/ai/providers/deepseek'
import { LlmError } from '@/composables/ai/errors'
import type { ThemeId } from '@/themes'
import type { Locale } from '@/locales'

const { t, locale: i18nLocale } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const aiConfig = useAiConfigStore()
const aiHistory = useAiHistoryStore()

const isGuofeng = computed(() => themeStore.id === 'guofeng')

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

const modelValue = computed({
  get: () => aiConfig.config.model,
  set: (v: string) => aiConfig.setModel(v),
})

const temperatureValue = computed({
  get: () => aiConfig.config.temperature,
  set: (v: number) => aiConfig.setTemperature(v),
})

const baseUrlValue = computed({
  get: () => aiConfig.config.baseUrl,
  set: (v: string) => aiConfig.setBaseUrl(v),
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
  <main :class="['settings-page', isGuofeng ? 'gf-container' : 'mn-container']">
    <button
      type="button"
      :class="isGuofeng ? 'gf-btn gf-btn-outline' : 'mn-btn mn-btn-outline'"
      class="settings-back"
      @click="goHome"
    >
      ← {{ t('common.button.back') }}
    </button>

    <header :class="['settings-hero', { 'settings-hero--mn': !isGuofeng }]">
      <h1 :class="['settings-title', { 'settings-title--mn': !isGuofeng }]">
        {{ t('settings.title') }}
      </h1>
      <p :class="['settings-meta', { 'settings-meta--mn': !isGuofeng }]">
        {{ t('settings.subtitle') }}
      </p>
    </header>

    <article :class="['settings-article', { 'settings-article--mn': !isGuofeng }]">
      <!-- ============== 主题 ============== -->
      <section class="settings-section">
        <h2 :class="['settings-heading', { 'settings-heading--mn': !isGuofeng }]">
          {{ t('settings.section.theme.title') }}
        </h2>
        <p class="settings-hint">{{ t('settings.section.theme.hint') }}</p>
        <div class="settings-radio-group">
          <button
            v-for="id in themeStore.list"
            :key="id"
            type="button"
            class="settings-radio"
            :class="{ 'is-active': id === themeStore.id }"
            @click="themeStore.set(id)"
          >
            <span class="settings-radio-name">{{ getThemeName(id) }}</span>
            <span class="settings-radio-desc">{{ getThemeDesc(id) }}</span>
          </button>
        </div>
      </section>

      <!-- ============== 语言 ============== -->
      <section class="settings-section">
        <h2 :class="['settings-heading', { 'settings-heading--mn': !isGuofeng }]">
          {{ t('settings.section.language.title') }}
        </h2>
        <p class="settings-hint">{{ t('settings.section.language.hint') }}</p>
        <div class="settings-radio-group">
          <button
            v-for="id in localeStore.list"
            :key="id"
            type="button"
            class="settings-radio"
            :class="{ 'is-active': id === localeStore.id }"
            @click="localeStore.set(id)"
          >
            <span class="settings-radio-mark">{{ LANG_LABELS[id].short }}</span>
            <span class="settings-radio-name">{{ LANG_LABELS[id].full }}</span>
          </button>
        </div>
      </section>

      <!-- ============== AI 解读 ============== -->
      <section class="settings-section">
        <h2 :class="['settings-heading', { 'settings-heading--mn': !isGuofeng }]">
          {{ t('settings.section.ai.title') }}
        </h2>
        <p class="settings-lead">{{ t('settings.section.ai.lead') }}</p>

        <!-- Provider -->
        <div class="settings-field">
          <label class="settings-field-label">{{ t('settings.section.ai.providerLabel') }}</label>
          <div class="settings-radio-group">
            <button
              type="button"
              class="settings-radio is-active"
              :aria-pressed="true"
            >
              <span class="settings-radio-name">
                {{ t('settings.section.ai.providerOption.deepseek') }}
              </span>
            </button>
          </div>
        </div>

        <!-- API Key -->
        <div class="settings-field">
          <label class="settings-field-label" for="ai-api-key">
            {{ t('settings.section.ai.apiKey.label') }}
          </label>
          <div class="settings-input-wrap">
            <input
              id="ai-api-key"
              v-model="apiKeyValue"
              :type="showApiKey ? 'text' : 'password'"
              autocomplete="off"
              spellcheck="false"
              class="settings-input"
              :placeholder="t('settings.section.ai.apiKey.placeholder')"
            />
            <button
              type="button"
              class="settings-input-btn"
              :aria-label="showApiKey
                ? t('settings.section.ai.apiKey.hide')
                : t('settings.section.ai.apiKey.show')"
              @click="showApiKey = !showApiKey"
            >
              {{ showApiKey
                ? t('settings.section.ai.apiKey.hide')
                : t('settings.section.ai.apiKey.show') }}
            </button>
          </div>
          <div class="settings-row settings-row--space">
            <p class="settings-hint">{{ t('settings.section.ai.apiKey.hint') }}</p>
            <button
              v-if="aiConfig.hasKey"
              type="button"
              class="settings-link-btn"
              @click="clearKey"
            >
              {{ t('settings.section.ai.apiKey.clear') }}
            </button>
          </div>
        </div>

        <!-- Model -->
        <div class="settings-field">
          <label class="settings-field-label" for="ai-model">
            {{ t('settings.section.ai.model.label') }}
          </label>
          <div class="settings-radio-group settings-radio-group--col">
            <button
              v-for="m in DEEPSEEK_MODELS"
              :key="m.id"
              type="button"
              class="settings-radio"
              :class="{ 'is-active': m.id === modelValue }"
              @click="modelValue = m.id"
            >
              <span class="settings-radio-name">{{ t(m.labelKey) }}</span>
              <span
                v-if="'deprecated' in m && m.deprecated"
                class="settings-radio-tag"
              >
                {{ t('ai.model.deprecatedTip') }}
              </span>
            </button>
          </div>
          <p class="settings-hint">{{ t('settings.section.ai.model.hint') }}</p>
        </div>

        <!-- Temperature -->
        <div class="settings-field">
          <label class="settings-field-label" for="ai-temperature">
            {{ t('settings.section.ai.temperature.label') }}
            <span class="settings-field-value">{{ temperatureValue.toFixed(1) }}</span>
          </label>
          <input
            id="ai-temperature"
            v-model.number="temperatureValue"
            type="range"
            min="0"
            max="2"
            step="0.1"
            class="settings-range"
          />
          <div class="settings-range-meta">
            <span>{{ t('settings.section.ai.temperature.min') }}</span>
            <span>{{ t('settings.section.ai.temperature.max') }}</span>
          </div>
          <p class="settings-hint">{{ t('settings.section.ai.temperature.hint') }}</p>
        </div>

        <!-- Base URL -->
        <div class="settings-field">
          <label class="settings-field-label" for="ai-base-url">
            {{ t('settings.section.ai.baseUrl.label') }}
          </label>
          <div class="settings-input-wrap">
            <input
              id="ai-base-url"
              v-model="baseUrlValue"
              type="text"
              autocomplete="off"
              spellcheck="false"
              class="settings-input"
              :placeholder="t('settings.section.ai.baseUrl.placeholder')"
            />
            <button
              type="button"
              class="settings-input-btn"
              @click="resetBaseUrl"
            >
              {{ t('settings.section.ai.baseUrl.useDefault') }}
            </button>
          </div>
          <p class="settings-hint">{{ t('settings.section.ai.baseUrl.hint') }}</p>
        </div>

        <!-- 测试连接 -->
        <div class="settings-field">
          <button
            type="button"
            :class="isGuofeng ? 'gf-btn gf-btn-primary' : 'mn-btn mn-btn-primary'"
            :disabled="testState.kind === 'running'"
            @click="testConnection"
          >
            <template v-if="testState.kind === 'running'">
              {{ t('settings.section.ai.test.running') }}
            </template>
            <template v-else>
              {{ t('settings.section.ai.test.button') }}
            </template>
          </button>
          <p
            v-if="testState.kind === 'ok'"
            class="settings-test-feedback settings-test-feedback--ok"
          >
            {{ t('settings.section.ai.test.ok') }}
          </p>
          <p
            v-else-if="testState.kind === 'fail'"
            class="settings-test-feedback settings-test-feedback--fail"
          >
            {{ t('settings.section.ai.test.fail') }}{{ testState.message }}
          </p>
          <p
            v-else-if="testState.kind === 'missing-key'"
            class="settings-test-feedback settings-test-feedback--fail"
          >
            {{ t('settings.section.ai.test.missingKey') }}
          </p>
        </div>

        <!-- 对话历史 -->
        <div class="settings-field settings-field--block">
          <h3 class="settings-subheading">{{ t('settings.section.ai.sessions.title') }}</h3>
          <div class="settings-stat-row">
            <div class="settings-stat">
              <span class="settings-stat-label">
                {{ t('settings.section.ai.sessions.countLabel') }}
              </span>
              <span class="settings-stat-value">{{ aiHistory.count }}</span>
            </div>
            <div class="settings-stat">
              <span class="settings-stat-label">
                {{ t('settings.section.ai.sessions.messagesLabel') }}
              </span>
              <span class="settings-stat-value">{{ aiHistory.totalMessages }}</span>
            </div>
          </div>
          <button
            type="button"
            :class="isGuofeng ? 'gf-btn gf-btn-outline' : 'mn-btn mn-btn-outline'"
            :disabled="aiHistory.count === 0"
            @click="clearAllSessions"
          >
            {{ t('settings.section.ai.sessions.clearButton') }}
          </button>
        </div>

        <!-- 隐私 -->
        <div class="settings-field settings-field--block">
          <h3 class="settings-subheading">{{ t('settings.section.ai.privacy.title') }}</h3>
          <ul class="settings-privacy-list">
            <li
              v-for="(item, i) in (t('settings.section.ai.privacy.items', { returnObjects: true }) as unknown as string[])"
              :key="i"
            >
              {{ item }}
            </li>
          </ul>
          <button type="button" class="settings-link-btn" @click="goPrivacy">
            {{ t('settings.section.ai.privacy.privacyLink') }}
          </button>
        </div>
      </section>
    </article>
  </main>
</template>

<style scoped>
.settings-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  position: relative;
  z-index: 1;
}

.settings-back {
  margin-bottom: 24px;
}

.settings-hero {
  text-align: center;
  margin-bottom: 32px;
}

.settings-title {
  font-family: var(--gf-font-kaiti, var(--font-display));
  font-size: clamp(1.75rem, 4vw, 2.2rem);
  margin: 0 0 12px;
  color: var(--color-ink, var(--color-accent));
  letter-spacing: 0.08em;
}

.settings-meta {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-ink-muted, var(--color-ink-soft));
  letter-spacing: 0.05em;
}

.settings-article {
  background: var(--color-bg-elev, rgba(255, 255, 255, 0.6));
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
  border-radius: var(--radius-lg, 8px);
  padding: 32px 24px;
}

.settings-section + .settings-section {
  margin-top: 36px;
}

.settings-heading {
  font-family: var(--gf-font-kaiti, var(--font-display));
  font-size: 1.2rem;
  margin: 0 0 8px;
  color: var(--color-accent);
  border-left: 3px solid var(--color-accent);
  padding-left: 12px;
  letter-spacing: 0.06em;
}

.settings-subheading {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--color-ink, var(--color-accent));
}

.settings-lead {
  margin: 0 0 16px;
  line-height: 1.75;
  color: var(--color-ink);
  font-size: 0.92rem;
}

.settings-hint {
  margin: 6px 0 0;
  line-height: 1.6;
  font-size: 0.82rem;
  color: var(--color-ink-muted, var(--color-ink-soft));
}

.settings-field + .settings-field {
  margin-top: 20px;
}

.settings-field--block {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px dashed var(--color-border, rgba(0, 0, 0, 0.08));
}

.settings-field-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-ink, var(--color-accent));
}

.settings-field-value {
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--color-ink-muted, var(--color-ink-soft));
}

.settings-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.settings-radio-group--col {
  flex-direction: column;
}

.settings-radio {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 14px;
  min-width: 120px;
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
  border-radius: var(--radius-md, 6px);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: var(--color-ink);
  transition: all 0.15s ease;
}

.settings-radio:hover {
  border-color: var(--color-accent);
}

.settings-radio.is-active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft, rgba(0, 0, 0, 0.04));
}

.settings-radio-mark {
  font-weight: 600;
  font-size: 0.85rem;
}

.settings-radio-name {
  font-size: 0.92rem;
  font-weight: 500;
}

.settings-radio-desc {
  font-size: 0.78rem;
  color: var(--color-ink-muted, var(--color-ink-soft));
}

.settings-radio-tag {
  font-size: 0.75rem;
  color: var(--color-warn, #b8860b);
}

.settings-input-wrap {
  display: flex;
  gap: 8px;
}

.settings-input {
  flex: 1;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.9rem;
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
  border-radius: var(--radius-md, 6px);
  background: var(--color-bg, #fff);
  color: var(--color-ink);
  outline: none;
  transition: border-color 0.15s ease;
}

.settings-input:focus {
  border-color: var(--color-accent);
}

.settings-input-btn {
  padding: 0 14px;
  font-size: 0.85rem;
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
  border-radius: var(--radius-md, 6px);
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--color-ink-muted, var(--color-ink));
}

.settings-input-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.settings-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.settings-row--space {
  justify-content: space-between;
}

.settings-link-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.settings-link-btn:hover {
  opacity: 0.75;
}

.settings-range {
  width: 100%;
  margin: 6px 0 0;
  accent-color: var(--color-accent);
}

.settings-range-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-ink-muted, var(--color-ink-soft));
  margin-top: 4px;
}

.settings-test-feedback {
  margin: 12px 0 0;
  font-size: 0.85rem;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Consolas, monospace);
}

.settings-test-feedback--ok {
  color: var(--color-success, #2e7d32);
}

.settings-test-feedback--fail {
  color: var(--color-danger, #c62828);
}

.settings-stat-row {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.settings-stat {
  display: flex;
  flex-direction: column;
}

.settings-stat-label {
  font-size: 0.78rem;
  color: var(--color-ink-muted, var(--color-ink-soft));
}

.settings-stat-value {
  font-size: 1.4rem;
  font-weight: 600;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Consolas, monospace);
  color: var(--color-ink, var(--color-accent));
}

.settings-privacy-list {
  margin: 8px 0 12px;
  padding-left: 22px;
}

.settings-privacy-list li {
  line-height: 1.75;
  color: var(--color-ink);
  font-size: 0.88rem;
  margin-bottom: 6px;
}

.settings-hero--mn {
  text-align: left;
}

.settings-title--mn {
  font-family: var(--mn-font-sans, var(--font-display));
  font-size: clamp(1.6rem, 3.5vw, 2rem);
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: -0.01em;
  margin: 0 0 8px;
}

.settings-meta--mn {
  color: var(--color-ink-muted, var(--color-ink-soft));
  font-size: 0.8rem;
}

.settings-article--mn {
  background: transparent;
  border: none;
  padding: 0;
}

.settings-heading--mn {
  font-family: var(--mn-font-sans, var(--font-display));
  font-weight: 600;
  border-left: 2px solid var(--color-accent);
  padding-left: 10px;
  letter-spacing: -0.01em;
}

@media (max-width: 640px) {
  .settings-page {
    padding: 16px 12px 32px;
  }
  .settings-article {
    padding: 24px 16px;
  }
  .settings-input-wrap {
    flex-direction: column;
  }
  .settings-input-btn {
    padding: 8px 14px;
    width: 100%;
  }
}
</style>
