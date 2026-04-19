<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import {
  daxianCells as mockDaxian,
  xiaoxianCells as mockXiaoxian,
  meta as mockMeta,
} from '../data/mockZiwei'
import type { ZiweiChart } from '../types'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t, te } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const daxianCells = computed(() => props.chart?.daxianCells ?? mockDaxian)
const xiaoxianCells = computed(() => props.chart?.xiaoxianCells ?? mockXiaoxian)
const meta = computed(() => props.chart?.meta ?? mockMeta)

const currentDaxian = computed(() => daxianCells.value.find((c) => c.current))
const currentXiaoxian = computed(() => xiaoxianCells.value.find((c) => c.current))

const daxianCurrentText = computed(() => {
  const cur = currentDaxian.value
  if (!cur) return ''
  return t('ziwei.daxian.currentFmt', {
    age: meta.value.currentAge,
    range: cur.age,
    palace: t(`ziwei.palaceNamesShort.${cur.palaceKey}`),
  })
})

const xiaoxianCurrentText = computed(() => {
  const cur = currentXiaoxian.value
  if (!cur) return ''
  return t('ziwei.xiaoxian.currentFmt', {
    year: cur.year,
    ganzhi: cur.ganzhi,
    palace: t(`ziwei.palaceNamesShort.${cur.palaceKey}`),
  })
})

const genderBadgeText = computed(() => {
  if (!props.chart) return ''
  const g = meta.value.gender
  const key = g === '女' ? 'ziwei.daxian.genderBadgeFemale' : g === '男' ? 'ziwei.daxian.genderBadgeMale' : ''
  if (!key || !te(key)) return ''
  return t(key)
})
const genderBadgeHint = computed(() => te('ziwei.daxian.genderBadgeHint') ? t('ziwei.daxian.genderBadgeHint') : '')
</script>

<template>
  <section class="ziwei-daxian-section">
    <div class="ziwei-daxian-header">
      <h2>
        {{ isGuofeng ? t('ziwei.daxian.title') : t('ziwei.daxian.titleMn') }}
        <span
          v-if="genderBadgeText"
          class="gender-badge"
          :title="genderBadgeHint"
        >{{ genderBadgeText }}</span>
      </h2>
      <div class="ziwei-daxian-meta">{{ daxianCurrentText }}</div>
    </div>
    <div class="ziwei-daxian-grid">
      <div
        v-for="(c, idx) in daxianCells"
        :key="idx"
        :class="['ziwei-daxian-cell', { current: c.current }]"
      >
        <div class="ziwei-daxian-age">{{ c.age }}</div>
        <div class="ziwei-daxian-palace">{{ t(`ziwei.palaceNamesShort.${c.palaceKey}`) }}</div>
        <div class="ziwei-daxian-gz">{{ c.ganzhi }}</div>
      </div>
    </div>
  </section>

  <section class="ziwei-daxian-section">
    <div class="ziwei-daxian-header">
      <h2>{{ isGuofeng ? t('ziwei.xiaoxian.title') : t('ziwei.xiaoxian.titleMn') }}</h2>
      <div class="ziwei-daxian-meta">{{ xiaoxianCurrentText }}</div>
    </div>
    <div class="ziwei-daxian-grid">
      <div
        v-for="(c, idx) in xiaoxianCells"
        :key="idx"
        :class="['ziwei-daxian-cell', { current: c.current }]"
      >
        <div class="ziwei-daxian-age">{{ c.year }}</div>
        <div class="ziwei-daxian-palace">{{ t(`ziwei.palaceNamesShort.${c.palaceKey}`) }}</div>
        <div class="ziwei-daxian-gz">{{ c.ganzhi }}</div>
      </div>
    </div>
  </section>
</template>
