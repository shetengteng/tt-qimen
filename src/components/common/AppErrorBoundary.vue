<script setup lang="ts">
/**
 * 全局错误边界
 *
 * 用 Vue 3 的 onErrorCaptured 拦截子树（RouterView + 所有 page）抛出的渲染期错误：
 *  - 区分 FortuneError（友好提示 + 模块信息）与 unknown error（兜底文案）
 *  - 提供"重试 / 回首页"两条用户路径，避免白屏
 *  - 同时把错误打到 console，方便开发者定位
 *
 * 注意：onErrorCaptured 只能捕获子组件的渲染期错误、watcher 错误、生命周期错误；
 *       异步 Promise 错误需在抛出处自己 try/catch 后再 throw 同步出来。
 *       未捕获的 Promise 错误由 main.ts 里的 app.config.errorHandler / window.onerror 兜底。
 */
import { onErrorCaptured, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { FortuneError } from '@/lib/errors'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const captured = ref<Error | null>(null)
const isFortune = computed(() => FortuneError.is(captured.value))
const fortuneInfo = computed(() => {
  const err = captured.value
  if (!err || !FortuneError.is(err)) return null
  return { module: err.module, code: err.code, userMessage: err.userMessage }
})
const isGuofeng = computed(() => themeStore.id === 'guofeng')

onErrorCaptured((err) => {
  captured.value = err instanceof Error ? err : new Error(String(err))
  console.error('[AppErrorBoundary] captured error:', err)
  // 返回 false 阻止继续向上传播；返回 true / undefined 会继续传播
  return false
})

// 路由变更时自动清错（用户点了"回首页"或路由级跳转后，应该让新页面正常渲染）
watch(
  () => route.fullPath,
  () => {
    if (captured.value) captured.value = null
  },
)

function retry() {
  captured.value = null
}

function goHome() {
  captured.value = null
  router.push({ name: 'home' })
}
</script>

<template>
  <slot v-if="!captured" />

  <main v-else-if="isGuofeng" class="gf-container error-boundary">
    <div class="error-card">
      <h1 class="error-title">{{ t('errorBoundary.title') }}</h1>

      <p v-if="fortuneInfo?.userMessage" class="error-friendly">
        {{ fortuneInfo.userMessage }}
      </p>
      <p v-else-if="isFortune" class="error-friendly">
        {{ t(`errorBoundary.fortuneCode.${fortuneInfo!.code}`) }}
      </p>
      <p v-else class="error-friendly">
        {{ t('errorBoundary.unknown') }}
      </p>

      <p v-if="isFortune" class="error-meta">
        {{ t('errorBoundary.moduleLabel') }}：{{ fortuneInfo!.module }} ·
        {{ t('errorBoundary.codeLabel') }}：{{ fortuneInfo!.code }}
      </p>
      <p v-else class="error-meta error-meta--debug">
        {{ captured!.name }}: {{ captured!.message }}
      </p>

      <div class="error-actions">
        <Button type="button" variant="default" @click="retry">
          {{ t('errorBoundary.retry') }}
        </Button>
        <Button type="button" variant="outline" @click="goHome">
          {{ t('errorBoundary.goHome') }}
        </Button>
      </div>
    </div>
  </main>

  <main v-else class="mn-container error-boundary error-boundary--mn">
    <div class="error-card error-card--mn">
      <h1 class="error-title error-title--mn">{{ t('errorBoundary.title') }}</h1>

      <p v-if="fortuneInfo?.userMessage" class="error-friendly">
        {{ fortuneInfo.userMessage }}
      </p>
      <p v-else-if="isFortune" class="error-friendly">
        {{ t(`errorBoundary.fortuneCode.${fortuneInfo!.code}`) }}
      </p>
      <p v-else class="error-friendly">
        {{ t('errorBoundary.unknown') }}
      </p>

      <p v-if="isFortune" class="error-meta">
        {{ t('errorBoundary.moduleLabel') }}：{{ fortuneInfo!.module }} ·
        {{ t('errorBoundary.codeLabel') }}：{{ fortuneInfo!.code }}
      </p>
      <p v-else class="error-meta error-meta--debug">
        {{ captured!.name }}: {{ captured!.message }}
      </p>

      <div class="error-actions">
        <Button type="button" variant="default" @click="retry">
          {{ t('errorBoundary.retry') }}
        </Button>
        <Button type="button" variant="outline" @click="goHome">
          {{ t('errorBoundary.goHome') }}
        </Button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.error-boundary {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  z-index: 1;
}

.error-card {
  max-width: 560px;
  width: 100%;
  text-align: center;
  background: var(--color-bg-elev, rgba(255, 255, 255, 0.6));
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
  border-radius: var(--radius-lg, 8px);
  padding: 36px 28px;
}

.error-title {
  font-family: var(--gf-font-kaiti, var(--font-display));
  font-size: clamp(1.5rem, 4vw, 1.9rem);
  margin: 0 0 16px;
  color: var(--color-accent);
  letter-spacing: 0.06em;
}

.error-friendly {
  margin: 0 0 14px;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-ink);
}

.error-meta {
  margin: 0 0 20px;
  font-size: 0.85rem;
  color: var(--color-ink-muted, var(--color-ink-soft));
  letter-spacing: 0.03em;
}

.error-meta--debug {
  font-family: var(--font-mono, monospace);
  word-break: break-word;
}

.error-actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-card--mn {
  background: var(--color-bg-elev, transparent);
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
}

.error-title--mn {
  font-family: var(--mn-font-sans, var(--font-display));
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-ink);
}
</style>
