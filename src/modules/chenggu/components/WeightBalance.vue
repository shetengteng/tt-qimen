<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { ChengguResult } from '../types'

interface Props {
  /**
   * 已排盘结果。允许为空：此时只渲染天秤主体（秤杆/秤盘/柱子），
   * 下方的 displayWeight / breakdown 数字区会被隐藏，作为首次进入页面的"占位空态"。
   */
  result?: ChengguResult | null
}
const props = withDefaults(defineProps<Props>(), { result: null })

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const displayWeight = computed(() => props.result?.displayWeight ?? '')
const totalNumber = computed(() => props.result?.totalWeight ?? 0)

const parts = computed(() => {
  const b = props.result?.breakdown
  if (!b) return []
  return [
    { key: 'year', value: b.year.weight },
    { key: 'month', value: b.month.weight },
    { key: 'day', value: b.day.weight },
    { key: 'hour', value: b.hour.weight },
  ]
})

const hasResult = computed(() => props.result !== null && props.result !== undefined)
</script>

<template>
  <!-- 国风：铜金渐变天秤（来源：design/prototypes/guofeng/chenggu.html） -->
  <div
    v-if="isGuofeng"
    class="cg-balance-scene"
    :class="{ 'cg-is-weighed': hasResult }"
  >
    <div class="cg-scene-halo" aria-hidden="true"></div>

    <div class="cg-scale">
      <div class="cg-scale-base" aria-hidden="true">
        <span class="cg-scale-foot left"></span>
        <span class="cg-scale-foot right"></span>
      </div>
      <div class="cg-scale-pole">
        <span class="cg-scale-cap" aria-hidden="true"></span>
      </div>
      <div class="cg-scale-bar">
        <span class="cg-scale-pivot" aria-hidden="true"></span>
        <div class="cg-scale-pan left">
          <span class="cg-scale-rope" aria-hidden="true"></span>
          <span class="cg-scale-ingot" aria-hidden="true"></span>
        </div>
        <div class="cg-scale-pan right">
          <span class="cg-scale-rope" aria-hidden="true"></span>
          <span class="cg-scale-ingot" aria-hidden="true"></span>
        </div>
      </div>
      <ul class="cg-scale-particles" aria-hidden="true">
        <li></li><li></li><li></li><li></li><li></li><li></li>
      </ul>
    </div>

    <div v-if="result" class="cg-weight">
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
  <div
    v-else
    class="cg-balance-scene"
    :class="{ 'cg-is-weighed': hasResult }"
  >
    <div class="cg-scene-halo" aria-hidden="true"></div>

    <div class="cg-scale">
      <div class="cg-scale-base" aria-hidden="true">
        <span class="cg-scale-foot left"></span>
        <span class="cg-scale-foot right"></span>
      </div>
      <div class="cg-scale-pole">
        <span class="cg-scale-cap" aria-hidden="true"></span>
      </div>
      <div class="cg-scale-bar">
        <span class="cg-scale-pivot" aria-hidden="true"></span>
        <div class="cg-scale-pan left">
          <span class="cg-scale-rope" aria-hidden="true"></span>
          <span class="cg-scale-ingot" aria-hidden="true"></span>
        </div>
        <div class="cg-scale-pan right">
          <span class="cg-scale-rope" aria-hidden="true"></span>
          <span class="cg-scale-ingot" aria-hidden="true"></span>
        </div>
      </div>
      <ul class="cg-scale-particles" aria-hidden="true">
        <li></li><li></li><li></li><li></li><li></li><li></li>
      </ul>
    </div>

    <div v-if="result" class="cg-weight">
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
