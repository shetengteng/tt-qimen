<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart } from '../types'
import { TEN_GOD_INFO } from '../data/tenGods'

interface ShishenItem {
  pillar: string
  gan: string
  shishen: string
  desc: string
  descMn: string
}

interface Props {
  /** 真实命盘；不传则回退到 i18n mock */
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const fallbackItems = computed(() => (tm('bazi.shishen.items') as ShishenItem[]) ?? [])

const items = computed<ShishenItem[]>(() => {
  if (!props.chart) return fallbackItems.value
  const pillarLabels = tm('bazi.pillars') as Record<string, string>
  const list: ShishenItem[] = []
  const cfgs: Array<{ key: 'year' | 'month' | 'hour'; label: string }> = [
    { key: 'year', label: pillarLabels.year },
    { key: 'month', label: pillarLabels.month },
    { key: 'hour', label: pillarLabels.hour },
  ]
  for (const c of cfgs) {
    const p = props.chart.pillars[c.key]
    const info = TEN_GOD_INFO[p.tenGod]
    list.push({
      pillar: c.label,
      gan: p.gan,
      shishen: p.tenGod,
      desc: info.desc,
      descMn: info.descMn,
    })
  }
  return list
})
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="shishen-structure">
    <h3>◈ {{ t('bazi.shishen.sectionTitle') }}</h3>
    <div class="shishen-list">
      <div v-for="(it, idx) in items" :key="idx" class="shishen-item">
        <div class="ss-head">
          <span class="ss-gan">{{ it.gan }}</span>{{ it.pillar }}
        </div>
        <div class="ss-text">
          <strong>{{ it.shishen }}</strong>{{ '：' }}{{ it.desc }}
        </div>
      </div>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="shishen-structure">
    <h4>
      {{ t('bazi.shishen.sectionTitle') }}
      <span class="tag">{{ t('bazi.shishen.sectionTag') }}</span>
    </h4>
    <div class="shishen-list">
      <div v-for="(it, idx) in items.slice(0, 3)" :key="idx" class="shishen-item">
        <div class="shishen-item-title">
          {{ it.pillar }} <strong>{{ it.gan }}</strong>
          <span class="ss-tag">{{ it.shishen }}</span>
        </div>
        <div class="shishen-item-desc">{{ it.descMn }}</div>
      </div>
    </div>
    <div class="shishen-detail-trigger">{{ t('bazi.btn.shishenDetail') }}</div>
  </div>
</template>
