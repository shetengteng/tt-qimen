<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { ChengguResult } from '../types'

interface Props {
  /** 已排盘结果；调用方用 v-if="result" 保证非空 */
  result: ChengguResult
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const displayWeight = computed(() => props.result.displayWeight)
const totalNumber = computed(() => props.result.totalWeight)

const parts = computed(() => {
  const b = props.result.breakdown
  return [
    { key: 'year', value: b.year.weight },
    { key: 'month', value: b.month.weight },
    { key: 'day', value: b.day.weight },
    { key: 'hour', value: b.hour.weight },
  ]
})
</script>

<template>
  <!-- 国风：铜金渐变天秤（来源：design/prototypes/guofeng/chenggu.html） -->
  <div v-if="isGuofeng" class="cg-balance-scene">
    <div class="cg-scale">
      <div class="cg-scale-pole"></div>
      <div class="cg-scale-bar">
        <div class="cg-scale-pan left"></div>
        <div class="cg-scale-pan right"></div>
      </div>
    </div>
    <div class="cg-weight">
      <div class="cg-weight-value">{{ displayWeight }}</div>
      <div class="cg-weight-label">{{ t('chenggu.balance.label') }}</div>
      <div class="cg-weight-breakdown">
        <span v-for="p in parts" :key="p.key">
          {{ t(`chenggu.balance.breakdown.${p.key}`) }}
          <strong>{{ p.value.toFixed(1) }} {{ t('chenggu.balance.unit') }}</strong>
        </span>
      </div>
    </div>
  </div>

  <!-- 简约：黑色细线 + 橙色秤盘（来源：design/prototypes/minimal/chenggu.html） -->
  <div v-else class="cg-balance-scene">
    <div class="cg-scale">
      <div class="cg-scale-base"></div>
      <div class="cg-scale-pole"></div>
      <div class="cg-scale-bar">
        <div class="cg-scale-pan left"></div>
        <div class="cg-scale-pan right"></div>
      </div>
    </div>
    <div class="cg-weight">
      <div class="cg-weight-value">{{ totalNumber.toFixed(1) }} {{ t('chenggu.balance.unit') }}</div>
      <div class="cg-weight-label">{{ t('chenggu.balance.labelMn') }}</div>
      <div class="cg-weight-breakdown">
        <div v-for="p in parts" :key="p.key" class="cg-wb-item">
          {{ t(`chenggu.balance.breakdown.${p.key}`) }}
          <strong>{{ p.value.toFixed(1) }} {{ t('chenggu.balance.unit') }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>
