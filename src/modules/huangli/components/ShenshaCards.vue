<script setup lang="ts">
/**
 * 神煞四联卡：
 *   1) 吉神
 *   2) 凶神
 *   3) 吉时（黄道时辰）+ 喜神方位
 *   4) 财神 / 福神 方位
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HuangliDay } from '../types'

const props = defineProps<{
  day: HuangliDay
}>()

const { t } = useI18n()

const godsText = computed(() => props.day.gods.slice(0, 8).join(' · ') || t('huangli.shensha.empty'))
const fiendsText = computed(() => props.day.fiends.slice(0, 8).join(' · ') || t('huangli.shensha.empty'))
const luckyHoursText = computed(() => {
  if (props.day.luckyHours.length === 0) return t('huangli.shensha.empty')
  return props.day.luckyHours.map((h) => h.name).join(' / ')
})
const directionsText = computed(() =>
  t('huangli.shensha.directionsFmt', {
    joy: props.day.joyDirection,
    wealth: props.day.wealthDirection,
  }),
)
</script>

<template>
  <div class="hl-shensha-section">
    <div class="hl-shensha-card">
      <div class="hl-shensha-label">{{ t('huangli.shensha.gods') }}</div>
      <div class="hl-shensha-content hl-shensha-content--positive">{{ godsText }}</div>
    </div>
    <div class="hl-shensha-card">
      <div class="hl-shensha-label">{{ t('huangli.shensha.fiends') }}</div>
      <div class="hl-shensha-content hl-shensha-content--negative">{{ fiendsText }}</div>
    </div>
    <div class="hl-shensha-card">
      <div class="hl-shensha-label">{{ t('huangli.shensha.luckyHours') }}</div>
      <div class="hl-shensha-content">{{ luckyHoursText }}</div>
    </div>
    <div class="hl-shensha-card">
      <div class="hl-shensha-label">{{ t('huangli.shensha.directions') }}</div>
      <div class="hl-shensha-content">{{ directionsText }}</div>
    </div>
  </div>
</template>
