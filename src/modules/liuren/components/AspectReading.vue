<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { Aspect, LiurenResult } from '../types'

/**
 * 分面 tabs + 解读卡 + 宜忌。
 * 当前分面由上游 v-model 控制；结果缺省时，用"默认速喜"演示示意。
 */
interface Props {
  aspect: Aspect
  result?: LiurenResult | null
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:aspect', v: Aspect): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const ASPECTS: readonly Aspect[] = ['overall', 'career', 'love', 'wealth', 'health', 'travel']

const palace = computed(() => props.result?.palace ?? null)

const readingText = computed(() => palace.value?.readings[props.aspect] ?? t('liuren.placeholder.reading'))
const suitable = computed(() => palace.value?.suitable ?? [])
const avoid = computed(() => palace.value?.avoid ?? [])

const verdictClass = computed(() => {
  const j = palace.value?.jiXiong
  if (j === 'ji') return 'ji'
  if (j === 'xiong') return 'xiong'
  return 'ping'
})

const verdictLabel = computed(() => {
  const j = palace.value?.jiXiong
  if (!j) return t('liuren.verdict.idle')
  return t(`liuren.verdict.${j}`)
})

const title = computed(() => {
  if (palace.value) return `${palace.value.name} · ${t(`liuren.aspect.${props.aspect}`)}`
  return t('liuren.placeholder.title')
})

function pickAspect(a: Aspect) {
  emit('update:aspect', a)
}
</script>

<template>
  <!-- tabs（两主题 class 命名一致，样式由主题 CSS 差异化） -->
  <div class="lr-aspect-tabs">
    <button
      v-for="a in ASPECTS"
      :key="a"
      type="button"
      class="lr-aspect-tab"
      :class="{ active: a === aspect }"
      @click="pickAspect(a)"
    >{{ t(`liuren.aspect.${a}`) }}</button>
  </div>

  <!-- 国风解读卡 -->
  <div v-if="isGuofeng" class="lr-reading-card">
    <div class="lr-reading-header">
      <h3 class="lr-reading-title">{{ title }}</h3>
      <span :class="['lr-reading-verdict', verdictClass]">{{ verdictLabel }}</span>
    </div>
    <p class="lr-reading-body">{{ readingText }}</p>
    <div class="lr-yiji">
      <div class="lr-yiji-item">
        <span class="lr-yiji-label yi">{{ t('liuren.reading.suitable') }}</span>
        <span class="lr-yiji-content">{{ suitable.join('、') || '—' }}</span>
      </div>
      <div class="lr-yiji-item">
        <span class="lr-yiji-label ji">{{ t('liuren.reading.avoid') }}</span>
        <span class="lr-yiji-content">{{ avoid.join('、') || '—' }}</span>
      </div>
    </div>
  </div>

  <!-- 简约解读卡 -->
  <div v-else class="lr-reading-card">
    <div class="lr-reading-header">
      <h3 class="lr-reading-title">{{ title }}</h3>
      <span :class="['lr-reading-verdict', verdictClass]">{{ verdictLabel }}</span>
    </div>
    <p class="lr-reading-body">{{ readingText }}</p>
    <div class="lr-yiji">
      <div class="lr-yiji-box yi">
        <div class="lr-yiji-label">◎ {{ t('liuren.reading.suitable') }}</div>
        <div class="lr-yiji-content">{{ suitable.join('、') || '—' }}</div>
      </div>
      <div class="lr-yiji-box ji">
        <div class="lr-yiji-label">✕ {{ t('liuren.reading.avoid') }}</div>
        <div class="lr-yiji-content">{{ avoid.join('、') || '—' }}</div>
      </div>
    </div>
  </div>
</template>
