<script setup lang="ts">
/**
 * AI 输入框 · 多行 textarea + ⌘/Ctrl + ↵ 发送 + 停止按钮
 *
 * 职责：
 *   - 自动随内容增高（min 1 行，max 6 行）
 *   - ⌘/Ctrl + ↵ 触发 emit('send', text)；普通 ↵ 换行
 *   - streaming 时把"发送"按钮换成"停止"按钮（对应 stop 事件）
 *   - 发送后自动清空 textarea，并 reset 高度
 *
 * 设计文档：design/2026-04-28-01-AI解读模块设计.md §4.5
 */
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Send, Square } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  streaming?: boolean
  disabled?: boolean
  /** 自定义占位符；默认走 i18n ai.drawer.placeholder */
  placeholder?: string
}>(), {
  streaming: false,
  disabled: false,
  placeholder: undefined,
})

const emit = defineEmits<{
  (e: 'send', text: string): void
  (e: 'stop'): void
}>()

const { t } = useI18n()
const text = ref('')
const taRef = ref<HTMLTextAreaElement | null>(null)

const sendDisabled = computed(() => props.disabled || !text.value.trim())

const effectivePlaceholder = computed(() => props.placeholder ?? t('ai.drawer.placeholder'))

/** 自动高度：依赖 scrollHeight，min 40px / max ~ 6 行 (~144px) */
function resize() {
  const el = taRef.value
  if (!el) return
  el.style.height = 'auto'
  const max = 144
  el.style.height = `${Math.min(el.scrollHeight, max)}px`
}

watch(text, () => {
  void nextTick(resize)
})

function onKeydown(e: KeyboardEvent) {
  // ⌘/Ctrl + ↵ 触发发送；其余键放行（包括普通 ↵ 换行）
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    onSend()
  }
}

function onSend() {
  if (sendDisabled.value) return
  const v = text.value.trim()
  text.value = ''
  void nextTick(() => {
    resize()
    taRef.value?.focus()
  })
  emit('send', v)
}

function onStop() {
  emit('stop')
}

defineExpose({
  focus: () => taRef.value?.focus(),
  setText: (next: string) => { text.value = next },
})
</script>

<template>
  <div class="ai-input bg-card px-3 py-3 md:py-3">
    <div
      class="ai-composer"
      :class="{ 'is-disabled': props.disabled && !props.streaming }"
    >
      <textarea
        ref="taRef"
        v-model="text"
        :class="cn(
          'ai-textarea resize-none text-foreground placeholder:text-muted-foreground/60 disabled:cursor-not-allowed'
        )"
        :placeholder="effectivePlaceholder"
        :disabled="props.disabled && !props.streaming"
        rows="1"
        @keydown="onKeydown"
      />

      <button
        v-if="props.streaming"
        type="button"
        class="ai-send-btn ai-send-btn--stop"
        :aria-label="t('ai.drawer.stop')"
        :title="t('ai.drawer.stop')"
        @click="onStop"
      >
        <Square class="size-4" aria-hidden="true" />
      </button>

      <button
        v-else
        type="button"
        class="ai-send-btn"
        :aria-label="t('ai.drawer.sendAria')"
        :title="t('ai.drawer.sendAria')"
        :disabled="sendDisabled"
        @click="onSend"
      >
        <Send class="ai-send-icon size-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-input {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
}

.ai-composer {
  position: relative;
  border-radius: 1.5rem;
  background: color-mix(in srgb, var(--muted, #f4f4f6) 50%, var(--background, #ffffff));
  border: 1px solid transparent;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 0 0 1px color-mix(in srgb, var(--border, #e4e4e7) 60%, transparent);
  transition: box-shadow 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ai-composer:hover {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 0 0 1px color-mix(in srgb, var(--border, #e4e4e7) 90%, transparent);
}

.ai-composer:focus-within {
  background: var(--background, #ffffff);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--primary, #3b2f63) 35%, var(--border, #e4e4e7)),
    0 0 0 4px color-mix(in srgb, var(--primary, #3b2f63) 12%, transparent),
    0 4px 12px -4px color-mix(in srgb, var(--primary, #3b2f63) 18%, transparent);
}

.ai-composer.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.ai-textarea {
  display: block;
  width: 100%;
  min-height: 52px;
  max-height: 200px;
  padding: 16px 56px 16px 18px;
  line-height: 1.5;
  font-family: inherit;
  font-size: 0.9375rem;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: inherit;
  outline: none;
  box-shadow: none;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border, #e4e4e7) transparent;
}

.ai-textarea:focus,
.ai-textarea:focus-visible {
  outline: none;
  box-shadow: none;
  border: 0;
}

.ai-textarea::-webkit-scrollbar {
  width: 6px;
}
.ai-textarea::-webkit-scrollbar-thumb {
  background: var(--border, #e4e4e7);
  border-radius: 3px;
}
.ai-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.ai-send-btn {
  position: absolute;
  right: 9px;
  bottom: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  color: var(--primary-foreground, #ffffff);
  background: linear-gradient(
    135deg,
    var(--primary, #3b2f63) 0%,
    color-mix(in srgb, var(--primary, #3b2f63) 78%, #000) 100%
  );
  box-shadow:
    0 4px 12px -3px color-mix(in srgb, var(--primary, #3b2f63) 45%, transparent),
    0 1px 2px color-mix(in srgb, var(--primary, #3b2f63) 25%, transparent),
    0 1px 0 rgba(255, 255, 255, 0.18) inset;
  transition:
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 200ms ease,
    opacity 180ms ease,
    background 200ms ease;
}

.ai-send-icon {
  transform: translateX(-1px);
}

.ai-send-btn:hover:not(:disabled) {
  transform: scale(1.06);
  box-shadow:
    0 8px 18px -4px color-mix(in srgb, var(--primary, #3b2f63) 55%, transparent),
    0 2px 4px color-mix(in srgb, var(--primary, #3b2f63) 30%, transparent),
    0 1px 0 rgba(255, 255, 255, 0.22) inset;
}

.ai-send-btn:active:not(:disabled) {
  transform: scale(0.96);
  transition-duration: 80ms;
}

.ai-send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
  background: color-mix(in srgb, var(--muted-foreground, #71717a) 35%, var(--muted, #f4f4f6));
  box-shadow: none;
}

.ai-send-btn--stop {
  background: var(--background, #ffffff);
  color: var(--foreground, #18181b);
  border: 1px solid var(--border, #e4e4e7);
  box-shadow:
    0 2px 6px -2px rgba(0, 0, 0, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.4) inset;
}

.ai-send-btn--stop:hover:not(:disabled) {
  background: var(--muted, #f4f4f6);
}

@media (max-width: 767.98px) {
  .ai-input {
    padding-top: 0.875rem;
    padding-bottom: max(0.875rem, env(safe-area-inset-bottom));
  }

  .ai-textarea {
    min-height: 58px;
    padding: 18px 60px 18px 18px;
  }

  .ai-send-btn {
    width: 38px;
    height: 38px;
    right: 10px;
    bottom: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-composer,
  .ai-send-btn {
    transition: none;
  }
  .ai-send-btn:hover:not(:disabled),
  .ai-send-btn:active:not(:disabled) {
    transform: none;
  }
}
</style>
