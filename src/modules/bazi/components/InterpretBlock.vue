<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart } from '../types'

interface Props {
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const fallbackTagsGf = computed(() => (tm('bazi.interpret.tags') as string[]) ?? [])
const fallbackTagsMn = computed(() => (tm('bazi.interpret.tagsMn') as string[]) ?? [])

const p1 = computed(() => props.chart?.interpret.paragraph1 ?? t('bazi.interpret.p1'))
const p2 = computed(() => props.chart?.interpret.paragraph2 ?? t('bazi.interpret.p2'))

const tags = computed(() => props.chart?.interpret.tags ?? fallbackTagsGf.value)
const tagsMn = computed(() => props.chart?.interpret.tags ?? fallbackTagsMn.value)
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="interpret-section">
    <h3>◈ {{ t('bazi.interpret.title') }}</h3>
    <p>{{ p1 }}</p>
    <p>{{ p2 }}</p>
    <div class="interpret-tags">
      <span v-for="tag in tags" :key="tag" class="interpret-tag">{{ tag }}</span>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="interpret">
    <h3>{{ t('bazi.interpret.title') }}</h3>
    <p>{{ p1 }}</p>
    <p>{{ p2 }}</p>
    <div class="interpret-tags">
      <span class="mn-badge">{{ tagsMn[0] }}</span>
      <span class="mn-badge">{{ tagsMn[1] }}</span>
      <span class="mn-badge mn-badge-success">{{ tagsMn[2] }}</span>
      <span class="mn-badge mn-badge-danger">{{ tagsMn[3] }}</span>
    </div>
  </div>
</template>
