<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { SihuaKey } from '../data/mockZiwei'

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const items: { key: SihuaKey; labelKey: `ziwei.sihuaLegend.${SihuaKey}`; shortKey: `ziwei.sihuaShort.${SihuaKey}` }[] = [
  { key: 'lu', labelKey: 'ziwei.sihuaLegend.lu', shortKey: 'ziwei.sihuaShort.lu' },
  { key: 'quan', labelKey: 'ziwei.sihuaLegend.quan', shortKey: 'ziwei.sihuaShort.quan' },
  { key: 'ke', labelKey: 'ziwei.sihuaLegend.ke', shortKey: 'ziwei.sihuaShort.ke' },
  { key: 'ji', labelKey: 'ziwei.sihuaLegend.ji', shortKey: 'ziwei.sihuaShort.ji' },
]
</script>

<template>
  <div class="sihua-legend">
    <span v-for="it in items" :key="it.key" class="legend-item">
      <span :class="['star-sihua', `sihua-${it.key}`]">{{ t(it.shortKey) }}</span>
      {{ t(it.labelKey) }}
    </span>
    <span v-if="!isGuofeng" class="legend-item legend-bright">
      {{ t('ziwei.sihuaLegend.brightness') }}
    </span>
  </div>
</template>
