<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { PALACES_ORDER } from '../data/palaces'
import type { PalaceName } from '../types'

/**
 * 速览条：当前农历 + 月起/日数/时辰三步路径。
 * 路径数组若为空则显示占位"—"。
 */
interface Props {
  /** 农历日期汉字，如"三月初二" */
  lunarDateLabel: string
  /** 时辰汉字，如"午时" */
  hourBranchLabel: string
  /** 三步经过的宫位；未起卦为 [] */
  path: readonly PalaceName[]
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const items = computed(() => [
  {
    label: t('liuren.timeBar.lunar'),
    value: `${props.lunarDateLabel} ${props.hourBranchLabel}`,
    accent: false,
  },
  {
    label: t('liuren.timeBar.monthStep'),
    value: props.path[0] ?? '—',
    accent: !!props.path[0],
  },
  {
    label: t('liuren.timeBar.dayStep'),
    value: props.path[1] ?? '—',
    accent: !!props.path[1],
  },
  {
    label: t('liuren.timeBar.hourStep'),
    value: props.path[2] ?? '—',
    accent: !!props.path[2],
  },
])
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card lr-time-bar">
    <div class="lr-time-grid">
      <div v-for="(it, i) in items" :key="i" class="lr-time-item">
        <div class="lr-time-label">{{ it.label }}</div>
        <div class="lr-time-value" :class="{ accent: it.accent }">{{ it.value }}</div>
      </div>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card lr-time-bar">
    <div class="lr-time-grid">
      <div v-for="(it, i) in items" :key="i" class="lr-time-item">
        <div class="lr-time-label">{{ it.label }}</div>
        <div class="lr-time-value" :class="{ accent: it.accent }">{{ it.value }}</div>
      </div>
    </div>
  </div>
</template>
