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
 * 当前只展示短版说明（desc / descMn）：
 * - `tenGods.ts` 顶层已补 classical / source（《三命通会》卷五 / 卷六，简体）
 *   但考虑到本组件 4 柱并排的紧凑布局，塞入古文引文会显著加高每个卡片，
 *   且 4 项引文出处多为同卷，视觉重复——故 UI 层暂不展示 classical / source，
 *   数据保留在 TEN_GOD_INFO 供未来独立交互（例如 hover InlineAnnotsBar）复用。
 * - long 四字段（trait/suit/caution/relation）仍为现代化扩写，未单独溯源，
 *   故此组件也暂不渲染 long。
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
