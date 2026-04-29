<script setup lang="ts">
/**
 * AI 错误气泡 · 一体化错误态展示
 *
 * 职责：
 *   - 展示一条错误"气泡"（与 AssistantBubble 视觉同源，带 destructive 描边）
 *   - 提供"重试"按钮（只对非 unauthorized 错有意义；unauthorized 改为"前往设置"）
 *   - 文案完全走 i18n（ai.error.<code>），不接受外部 message
 *
 * 设计文档：design/2026-04-28-01-AI解读模块设计.md §4.4
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { AlertTriangle, RefreshCcw, ArrowRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { LlmError } from '@/composables/ai/errors'

const props = defineProps<{
  error: LlmError
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const { t } = useI18n()
const router = useRouter()

const errorText = computed(() => t(`ai.error.${props.error.code}`))

const isAuth = computed(() => props.error.code === 'unauthorized')

function onRetry() {
  emit('retry')
}

function onSettings() {
  router.push({ name: 'settings' })
}
</script>

<template>
  <div class="flex w-full justify-start">
    <div
      class="ai-error-bubble inline-flex max-w-[85%] flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-foreground"
      role="alert"
      aria-live="polite"
    >
      <div class="flex items-start gap-2">
        <AlertTriangle class="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        <p class="leading-relaxed">{{ errorText }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-if="isAuth"
          size="sm"
          variant="default"
          @click="onSettings"
        >
          {{ t('ai.drawer.emptyKey.cta') }}
          <ArrowRight class="size-3.5" aria-hidden="true" />
        </Button>
        <Button
          v-else
          size="sm"
          variant="outline"
          @click="onRetry"
        >
          <RefreshCcw class="size-3.5" aria-hidden="true" />
          {{ t('ai.drawer.retry') }}
        </Button>
      </div>
    </div>
  </div>
</template>
