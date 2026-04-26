<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { getPalaceDisplayName } from '../data/palaceLabels'
import type { LiurenLocale } from '../data/palacesLocale'
import type { PalaceName } from '../types'

/**
 * 速览条：当前农历 + 月起/日数/时辰三步路径。
 * 路径数组若为空则显示占位"—"；非空时按当前 locale 显示宫名。
 */
interface Props {
  lunarDateLabel: string
  hourBranchLabel: string
  /** 三步经过的宫位；未起卦为 [] */
  path: readonly PalaceName[]
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

function dispName(p: PalaceName | undefined): string {
  if (!p) return '—'
  return getPalaceDisplayName(p, localeStore.id as LiurenLocale)
}

const items = computed(() => [
  {
    label: t('liuren.timeBar.lunar'),
    value: `${props.lunarDateLabel} ${props.hourBranchLabel}`,
    accent: false,
  },
  {
    label: t('liuren.timeBar.monthStep'),
    value: dispName(props.path[0]),
    accent: !!props.path[0],
  },
  {
    label: t('liuren.timeBar.dayStep'),
    value: dispName(props.path[1]),
    accent: !!props.path[1],
  },
  {
    label: t('liuren.timeBar.hourStep'),
    value: dispName(props.path[2]),
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
