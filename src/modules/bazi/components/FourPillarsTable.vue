<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziArc } from '../composables/useBaziDrawings'
import type { PillarCell } from '../data/mockBazi'

interface Props {
  pillars: PillarCell[]
  meta: { solar: string; lunar: string }
  /** Headings displayed in the chart-meta row. */
  metaLabels: { solar: string; lunar: string }
  /** Arcs already localised — pushed straight to the SVG drawer. */
  arcs: BaziArc[]
}

const props = defineProps<Props>()
defineExpose<{ tableRef: () => HTMLElement | null; svgRef: () => SVGElement | null }>({
  tableRef: () => tableEl.value,
  svgRef: () => svgEl.value,
})

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const tableEl = ref<HTMLElement | null>(null)
const svgEl = ref<SVGElement | null>(null)

const pillarsLabels = computed(() => tm('bazi.pillars') as Record<string, string>)
const rowLabels = computed(() => tm('bazi.rowLabel') as Record<string, string>)

const headers = computed(() => [
  { key: 'year', label: pillarsLabels.value.year, sub: '1990', dayMaster: false },
  { key: 'month', label: pillarsLabels.value.month, sub: '5', dayMaster: false },
  { key: 'day', label: pillarsLabels.value.day, sub: '20', dayMaster: true },
  { key: 'hour', label: pillarsLabels.value.hour, sub: t('bazi.hours.6'), dayMaster: false },
])

function highlight(rel: string | null) {
  if (!tableEl.value) return
  const FOCUS = ['focus-chong', 'focus-zixing', 'focus-anhe']
  FOCUS.forEach((c) => tableEl.value!.classList.remove(c))
  if (rel) tableEl.value.classList.add(`focus-${rel}`)
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="chart-section">
    <div class="chart-header">
      <h2 style="margin: 0; font-size: 22px; color: var(--gf-ink);">{{ t('bazi.chartTitle') }}</h2>
      <div class="chart-meta">
        {{ metaLabels.solar }} <strong>{{ meta.solar }}</strong>
        {{ metaLabels.lunar }} <strong>{{ meta.lunar }}</strong>
      </div>
    </div>

    <div ref="tableEl" class="bazi-table">
      <div class="bazi-table-grid">
        <div class="bazi-head" />
        <div
          v-for="h in headers"
          :key="h.key"
          :class="['bazi-head', { day: h.dayMaster }]"
        >
          {{ h.label }}<span class="bazi-head-sub">{{ h.sub }}</span>
        </div>

        <!-- 天干 -->
        <div class="bazi-row-label">{{ rowLabels.gan }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`gan-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <div class="bazi-cell-gan">{{ p.gan }}</div>
          <div class="bazi-cell-attr">{{ p.ganAttr }}</div>
        </div>

        <!-- 地支 -->
        <div class="bazi-row-label">{{ rowLabels.zhi }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`zhi-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <div class="bazi-cell-zhi">{{ p.zhi }}</div>
          <div class="bazi-cell-attr">{{ p.zhiAttr }}</div>
        </div>

        <!-- 藏干 -->
        <div class="bazi-row-label">{{ rowLabels.canggan }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`cg-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <div :class="['bazi-cell-canggan', { single: p.cangganSingle }]">
            <span v-for="(c, i) in p.canggang" :key="i">{{ c }}</span>
            <em v-if="p.cangganSingle" class="canggan-hint">{{ t('bazi.canggangHint') }}</em>
          </div>
        </div>

        <!-- 十神 -->
        <div class="bazi-row-label">{{ rowLabels.shishen }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`ss-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <span :class="['bazi-cell-shishen', { rizhu: idx === 2 }]">
            {{ idx === 2 ? t('bazi.rizhuTag') : p.shishen }}
          </span>
        </div>

        <!-- 纳音 -->
        <div class="bazi-row-label">{{ rowLabels.nayin }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`ny-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <div class="bazi-cell-nayin">{{ p.nayin }}</div>
        </div>
      </div>
      <svg ref="svgEl" class="bazi-relations-svg" preserveAspectRatio="none" />
    </div>

    <div class="bazi-relations-legend">
      <span
        v-for="arc in arcs"
        :key="arc.type"
        :class="`r-${arc.type}`"
        :data-rel="arc.type"
        @mouseenter="highlight(arc.type)"
        @mouseleave="highlight(null)"
      >{{ arc.label }}</span>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else>
    <div class="chart-header">
      <div>
        <h2 style="margin: 0; font-size: 22px;">{{ t('bazi.chartTitle') }}</h2>
      </div>
      <div class="chart-meta">
        <div>{{ metaLabels.solar }} <strong>{{ meta.solar }}</strong></div>
        <div>{{ metaLabels.lunar }} <strong>{{ meta.lunar }}</strong></div>
      </div>
    </div>

    <div ref="tableEl" class="bazi-table">
      <div class="bazi-table-grid">
        <div class="bazi-head" />
        <div
          v-for="h in headers"
          :key="h.key"
          :class="['bazi-head', { day: h.dayMaster }]"
        >
          {{ h.label }}<span class="bazi-head-sub">{{ h.sub }}</span>
        </div>

        <div class="bazi-row-label">{{ rowLabels.gan }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`gan-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <div class="bazi-cell-gan">{{ p.gan }}</div>
          <div class="bazi-cell-attr">{{ p.ganAttr }}</div>
        </div>

        <div class="bazi-row-label">{{ rowLabels.zhi }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`zhi-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <div class="bazi-cell-zhi">{{ p.zhi }}</div>
          <div class="bazi-cell-attr">{{ p.zhiAttr }}</div>
        </div>

        <div class="bazi-row-label">{{ rowLabels.canggan }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`cg-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <div :class="['bazi-cell-canggan', { single: p.cangganSingle }]">
            <span v-for="(c, i) in p.canggang" :key="i">{{ c }}</span>
            <em v-if="p.cangganSingle" class="canggan-hint">{{ t('bazi.canggangHint') }}</em>
          </div>
        </div>

        <div class="bazi-row-label">{{ rowLabels.shishen }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`ss-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <span :class="['bazi-cell-shishen', { rizhu: idx === 2 }]">
            {{ idx === 2 ? t('bazi.rizhuTag') : p.shishen }}
          </span>
        </div>

        <div class="bazi-row-label">{{ rowLabels.nayin }}</div>
        <div
          v-for="(p, idx) in pillars"
          :key="`ny-${idx}`"
          :class="['bazi-cell', { day: idx === 2 }]"
        >
          <div class="bazi-cell-nayin">{{ p.nayin }}</div>
        </div>
      </div>
      <svg ref="svgEl" class="bazi-relations-svg" />
    </div>

    <div class="bazi-relations-legend">
      <span
        v-for="arc in arcs"
        :key="arc.type"
        :data-rel="arc.type"
        @mouseenter="highlight(arc.type)"
        @mouseleave="highlight(null)"
      >
        <i :class="['dot', arc.type]" />
        {{ arc.label }}
      </span>
    </div>
  </div>
</template>
