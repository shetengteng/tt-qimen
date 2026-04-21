<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart, ShenshaCategory, ShenshaHit } from '../types'
import { getShenshaMeaning } from '../data/shenshaMeaning'

interface Props {
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const { t, tm, locale } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

function chipTooltip(item: ShenshaHit): string {
  if (locale.value === 'en') return ''
  const m = getShenshaMeaning(item.key)
  const parts: string[] = []
  if (item.short) parts.push(item.short)
  if (m.long) parts.push(m.long)
  return parts.join('\n')
}

interface Group {
  category: ShenshaCategory
  items: ShenshaHit[]
}

const groups = computed<Group[]>(() => {
  const hits = props.chart?.shensha ?? []
  const bucket: Record<ShenshaCategory, ShenshaHit[]> = {
    auspicious: [],
    neutral: [],
    inauspicious: [],
  }
  for (const h of hits) bucket[h.category].push(h)
  const order: ShenshaCategory[] = ['auspicious', 'neutral', 'inauspicious']
  return order
    .map(category => ({ category, items: bucket[category] }))
    .filter(g => g.items.length > 0)
})

const hasAny = computed(() => groups.value.length > 0)

const pillarLabels = computed(() => {
  const labels = (tm('bazi.shensha.pillarAbbr') as Record<string, string>) ?? {}
  return {
    year:  labels.year  ?? '年',
    month: labels.month ?? '月',
    day:   labels.day   ?? '日',
    hour:  labels.hour  ?? '时',
  }
})

function categoryTitle(cat: ShenshaCategory): string {
  return t(`bazi.shensha.category.${cat}.title`)
}

function categorySub(cat: ShenshaCategory): string {
  return t(`bazi.shensha.category.${cat}.sub`)
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="shensha-section">
    <h3>◈ {{ t('bazi.shensha.title') }}</h3>

    <div v-if="hasAny">
      <div
        v-for="g in groups"
        :key="g.category"
        :class="['shensha-group', g.category]"
      >
        <div class="shensha-group-title">
          <strong>{{ categoryTitle(g.category) }}</strong>
          <span class="shensha-group-sub">· {{ categorySub(g.category) }}</span>
        </div>
        <div class="shensha-list">
          <div
            v-for="(item, idx) in g.items"
            :key="`${item.key}-${item.pillar}-${idx}`"
            class="shensha-chip"
            :title="chipTooltip(item)"
          >
            <span class="pillar-badge">{{ pillarLabels[item.pillar] }}</span>
            <span class="chip-name">{{ item.name }}</span>
            <span v-if="item.short" class="chip-desc">{{ item.short }}</span>
          </div>
        </div>
      </div>

      <div class="shensha-footer">{{ t('bazi.shensha.footerTip') }}</div>
    </div>

    <div v-else class="shensha-empty">{{ t('bazi.shensha.empty') }}</div>
  </div>

  <!-- 简约 -->
  <div v-else class="shensha-section">
    <h4>{{ t('bazi.shensha.title') }}</h4>

    <div v-if="hasAny">
      <div
        v-for="g in groups"
        :key="g.category"
        :class="['shensha-group', g.category]"
      >
        <div class="shensha-group-title">
          <strong>{{ categoryTitle(g.category) }}</strong>
          <span class="shensha-group-sub">{{ categorySub(g.category) }}</span>
        </div>
        <div class="shensha-list">
          <div
            v-for="(item, idx) in g.items"
            :key="`${item.key}-${item.pillar}-${idx}`"
            class="shensha-chip"
            :title="chipTooltip(item)"
          >
            <span class="pillar-badge">{{ pillarLabels[item.pillar] }}</span>
            <span class="chip-name">{{ item.name }}</span>
            <span v-if="item.short" class="chip-desc">{{ item.short }}</span>
          </div>
        </div>
      </div>

      <div class="shensha-footer">{{ t('bazi.shensha.footerTip') }}</div>
    </div>

    <div v-else class="shensha-empty">{{ t('bazi.shensha.empty') }}</div>
  </div>
</template>
