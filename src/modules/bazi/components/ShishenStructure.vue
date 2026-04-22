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

/**
 * 当前只展示短版说明：
 * - `tenGods.ts` 已明确标注为“C 类常识性知识卡片”
 * - 其中 `long` 字段尚无独立 raw → extracted 溯源链
 * 因此此组件暂不渲染 long，避免把未审校的扩写直接展示给用户。
 */
const items = computed<ShishenItem[]>(() => {
  if (!props.chart) return fallbackItems.value
  const pillarLabels = tm('bazi.pillars') as Record<string, string>
  const list: ShishenItem[] = []
  const cfgs: Array<{ key: 'year' | 'month' | 'day' | 'hour'; label: string }> = [
    { key: 'year', label: pillarLabels.year },
    { key: 'month', label: pillarLabels.month },
    { key: 'day', label: pillarLabels.day },
    { key: 'hour', label: pillarLabels.hour },
  ]
  for (const c of cfgs) {
    const p = props.chart.pillars[c.key]
    const isDay = c.key === 'day'
    const shishen = isDay ? '日主' : p.tenGod
    const info = TEN_GOD_INFO[shishen as keyof typeof TEN_GOD_INFO]
    list.push({
      pillar: c.label,
      gan: p.gan,
      shishen,
      desc: info.desc,
      descMn: info.descMn,
    })
  }
  return list
})

const visibleGfItems = computed<ShishenItem[]>(() => items.value)
const visibleMnItems = computed<ShishenItem[]>(() => items.value)
</script>

<template>
  <div v-if="isGuofeng" class="shishen-structure">
    <h3>◈ {{ t('bazi.shishen.sectionTitle') }}</h3>
    <div class="shishen-list">
      <div v-for="(it, idx) in visibleGfItems" :key="idx" class="shishen-item">
        <div class="ss-head">
          <span class="ss-gan">{{ it.gan }}</span>{{ it.pillar }}
        </div>
        <div class="ss-text">
          <strong>{{ it.shishen }}</strong>{{ '：' }}{{ it.desc }}
        </div>
      </div>
    </div>
  </div>

  <div v-else class="shishen-structure">
    <h4>
      {{ t('bazi.shishen.sectionTitle') }}
      <span class="tag">{{ t('bazi.shishen.sectionTag') }}</span>
    </h4>
    <div class="shishen-list">
      <div v-for="(it, idx) in visibleMnItems" :key="idx" class="shishen-item">
        <div class="shishen-item-title">
          {{ it.pillar }} <strong>{{ it.gan }}</strong>
          <span class="ss-tag">{{ it.shishen }}</span>
        </div>
        <div class="shishen-item-desc">{{ it.descMn }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
