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
import { translateGod, type GodLocale } from '../data/godNames'

const props = defineProps<{
  day: HuangliDay
}>()

const { t, locale } = useI18n()

/** 把 vue-i18n 当前 locale 收敛到 godNames 支持的三档之一。 */
const godLocale = computed<GodLocale>(() => {
  const code = locale.value
  if (code.startsWith('zh-TW') || code === 'zh-Hant') return 'zh-TW'
  if (code.startsWith('en')) return 'en'
  return 'zh-CN'
})

const godsText = computed(() => {
  if (props.day.gods.length === 0) return t('huangli.shensha.empty')
  return props.day.gods
    .slice(0, 8)
    .map((g) => translateGod(g, godLocale.value))
    .join(' · ')
})
const fiendsText = computed(() => {
  if (props.day.fiends.length === 0) return t('huangli.shensha.empty')
  return props.day.fiends
    .slice(0, 8)
    .map((f) => translateGod(f, godLocale.value))
    .join(' · ')
})
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
