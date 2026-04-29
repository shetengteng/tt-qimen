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
import { Button } from '@/components/ui/button'

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
  <div class="ai-input flex items-end gap-2 border-t border-border bg-card px-3 py-3">
    <textarea
      ref="taRef"
      v-model="text"
      class="ai-textarea flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
      :placeholder="effectivePlaceholder"
      :disabled="props.disabled && !props.streaming"
      rows="1"
      @keydown="onKeydown"
    />

    <Button
      v-if="props.streaming"
      type="button"
      variant="outline"
      size="icon"
      :aria-label="t('ai.drawer.stop')"
      :title="t('ai.drawer.stop')"
      class="shrink-0"
      @click="onStop"
    >
      <Square class="size-4" aria-hidden="true" />
    </Button>

    <Button
      v-else
      type="button"
      variant="default"
      size="icon"
      :aria-label="t('ai.drawer.sendAria')"
      :title="t('ai.drawer.sendAria')"
      :disabled="sendDisabled"
      class="shrink-0"
      @click="onSend"
    >
      <Send class="size-4" aria-hidden="true" />
    </Button>
  </div>
</template>

<style scoped>
.ai-textarea {
  min-height: 40px;
  max-height: 144px;
  line-height: 1.5;
  font-family: inherit;
}
</style>
