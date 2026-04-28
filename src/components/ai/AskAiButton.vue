<script setup lang="ts">
/**
 * 询问 AI 按钮 · 在 8 个模块的操作栏（分享按钮之后）渲染。
 *
 * 设计要点：
 *   - 单纯按钮，不维护 drawer 开关 state（由父组件 v-model 给 AiDrawer）
 *   - 视觉上与同行的「分享 / 重新排盘」按钮等高（shadcn Button default size）
 *   - 命盘未就绪时 disabled（父级通过 :disabled 透传）
 *   - 国风/简约双主题视觉适配由 shadcn-vue [data-theme] CSS 接管，无需 v-if 分支
 */
import { Sparkles } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'

const props = withDefaults(defineProps<{
  disabled?: boolean
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg'
}>(), {
  disabled: false,
  variant: 'outline',
  size: 'default',
})

const { t } = useI18n()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <Button
    :variant="props.variant"
    :size="props.size"
    :disabled="props.disabled"
    :aria-label="t('ai.askButtonAria')"
    @click="$emit('click')"
  >
    <Sparkles class="size-4" aria-hidden="true" />
    {{ t('ai.askButton') }}
  </Button>
</template>
