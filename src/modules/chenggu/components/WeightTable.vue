<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { ChengguLevel, ChengguResult } from '../types'

interface Props {
  /** 已排盘结果；调用方用 v-if="result" 保证非空 */
  result: ChengguResult
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const cells = computed(() => {
  const b = props.result.breakdown
  return [
    { key: 'year', label: t('chenggu.table.year'), src: b.year.label, weight: b.year.weight },
    { key: 'month', label: t('chenggu.table.month'), src: b.month.label, weight: b.month.weight },
    { key: 'day', label: t('chenggu.table.day'), src: b.day.label, weight: b.day.weight },
    { key: 'hour', label: t('chenggu.table.hour'), src: b.hour.label, weight: b.hour.weight },
  ]
})

const totalWeight = computed(() => props.result.totalWeight)

const level = computed<ChengguLevel>(() => props.result.poem.level)

/** 等级 → badge 类名（用于 CSS 上色） */
const LEVEL_CLASS: Record<ChengguLevel, string> = {
  top: 'rank-top',
  high: 'rank-high',
  middle: 'rank-mid',
  low: 'rank-low',
  bottom: 'rank-bottom',
}

const levelClass = computed(() => LEVEL_CLASS[level.value])
const levelLabel = computed(() => t(`chenggu.level.${level.value}`))
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="gf-card cg-bone-table-card">
    <div class="cg-bone-table">
      <div
        v-for="c in cells"
        :key="c.key"
        :class="['cg-bone-col', `cg-bone-col--${c.key}`]"
      >
        <div class="cg-bone-head">{{ c.label }}</div>
        <div class="cg-bone-src">{{ c.src }}</div>
        <div class="cg-bone-weight">{{ c.weight.toFixed(1) }} {{ t('chenggu.balance.unit') }}</div>
      </div>
    </div>
    <div class="cg-bone-total">
      <span class="cg-total-label">{{ t('chenggu.table.totalLabel') }}</span>
      <span class="cg-total-value">{{ totalWeight.toFixed(1) }} {{ t('chenggu.balance.unit') }}</span>
      <span :class="['cg-rank-badge', levelClass]">{{ levelLabel }}</span>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="mn-card cg-bone-table-card">
    <div class="cg-bone-table">
      <div
        v-for="c in cells"
        :key="c.key"
        :class="['cg-bone-col', `cg-bone-col--${c.key}`]"
      >
        <div class="cg-bone-head">{{ c.label }}</div>
        <div class="cg-bone-src">{{ c.src }}</div>
        <div class="cg-bone-weight">{{ c.weight.toFixed(1) }} {{ t('chenggu.balance.unit') }}</div>
      </div>
    </div>
    <div class="cg-bone-total">
      <span class="cg-total-label">{{ t('chenggu.table.totalLabel') }}</span>
      <span class="cg-total-value">{{ totalWeight.toFixed(1) }} {{ t('chenggu.balance.unit') }}</span>
      <span :class="['cg-rank-badge', levelClass]">{{ levelLabel }}</span>
    </div>
  </div>
</template>
