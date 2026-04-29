<script setup lang="ts">
/**
 * AI 预设提问 chips · 横向流式排布
 *
 * 职责：
 *   - 接收一组 i18n key（如 'bazi.ai.preset.career'）
 *   - 为每个 key 渲染一个 chip 按钮，文案 = t(key)
 *   - 点击 → 把 t(key) 作为完整 prompt 直接 emit('select', text)
 *   - streaming === true 时禁用所有 chip，避免并发
 *
 * 不维护 input 状态：上层 AiDrawer 拿到 text 后调用 useAiChat.send()。
 */
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  keys: readonly string[]
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  (e: 'select', text: string): void
}>()

const { t } = useI18n()

function onClick(key: string) {
  if (props.disabled) return
  const text = t(key)
  if (typeof text === 'string' && text.trim()) {
    emit('select', text)
  }
}
</script>

<template>
  <div v-if="props.keys.length" class="ai-preset-chips flex flex-wrap gap-2 pt-1">
    <button
      v-for="key in props.keys"
      :key="key"
      type="button"
      class="ai-chip group inline-flex min-h-9 items-center rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs leading-tight text-foreground transition-all hover:border-primary/40 hover:bg-accent hover:text-accent-foreground hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 md:min-h-8 md:py-1 md:text-[13px]"
      :disabled="props.disabled"
      @click="onClick(key)"
    >
      {{ t(key) }}
    </button>
  </div>
</template>
