<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { decades as fallbackDecades, type DecadeCell } from '../data/mockBazi'
import type { BaziChart, Tendency } from '../types'

interface Props {
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const trackEl = ref<HTMLElement | null>(null)
const svgEl = ref<SVGElement | null>(null)

defineExpose<{ trackRef: () => HTMLElement | null; svgRef: () => SVGElement | null }>({
  trackRef: () => trackEl.value,
  svgRef: () => svgEl.value,
})

const verdictLabel = (v: 'ji' | 'zhong' | 'xiong') => {
  if (v === 'ji') return t('bazi.fortune.verdictJi')
  if (v === 'xiong') return t('bazi.fortune.verdictXiong')
  return t('bazi.fortune.verdictZhong')
}

const flowFortune = computed(() => tm('bazi.fortune') as Record<string, string>)

const genderBadgeText = computed(() => {
  const title = props.chart?.meta.genderTitle
  if (title === '坤造') return flowFortune.value.genderBadgeFemale
  if (title === '乾造') return flowFortune.value.genderBadgeMale
  return ''
})

/** Tendency → 旧的 ji/zhong/xiong 颜色枚举（仅用于 CSS class） */
function tendencyClass(t: Tendency): 'ji' | 'zhong' | 'xiong' {
  if (t === 'favorable') return 'ji'
  if (t === 'unfavorable') return 'xiong'
  return 'zhong'
}

const decades = computed<DecadeCell[]>(() => {
  if (!props.chart) return fallbackDecades
  return props.chart.decades.map(d => ({
    age: `${d.startAge} - ${d.endAge}`,
    ganzhi: d.ganzhi,
    shishen: d.tenGod,
    shishenMn: d.tenGod.replace(' · ', '·'),
    verdict: tendencyClass(d.tendency),
    current: d.current,
  }))
})

/** 当前大运（找不到时取第一段，避免空白） */
const currentDecade = computed(() => {
  if (!props.chart) return null
  const idx = props.chart.currentDecadeIdx
  return idx >= 0 ? props.chart.decades[idx] : props.chart.decades[0]
})

/** 当前详情 ganzhi + range 文案（无 chart 时回退原型示例 "乙酉 / 35-44 / 2025-2034"） */
const currentDetail = computed(() => {
  if (!currentDecade.value) {
    return {
      ganzhi: '乙酉',
      ageRange: '35 - 44',
      yearRange: '2025 - 2034',
      hint: flowFortune.value.currentDetailHint,
    }
  }
  const cd = currentDecade.value
  return {
    ganzhi: cd.ganzhi,
    ageRange: `${cd.startAge} - ${cd.endAge}`,
    yearRange: `${cd.startYear} - ${cd.endYear}`,
    hint: cd.hint,
  }
})
</script>

<template>
  <!-- 国风 -->
  <section v-if="isGuofeng" class="fortune-section">
    <div class="section-title">
      {{ flowFortune.title }}
      <span
        v-if="genderBadgeText"
        class="gender-badge"
        :title="flowFortune.genderBadgeHint"
      >{{ genderBadgeText }}</span>
    </div>
    <div class="section-subtitle">{{ flowFortune.subtitle }}</div>

    <div class="fortune-timeline">
      <svg ref="svgEl" class="fortune-track-connectors" aria-hidden="true" />
      <div ref="trackEl" class="fortune-track">
        <div
          v-for="d in decades"
          :key="d.age"
          :class="['decade', { current: d.current }]"
        >
          <div class="decade-age">{{ d.age }}</div>
          <div class="decade-ganzhi">{{ d.ganzhi }}</div>
          <div class="decade-shishen">{{ d.shishen }}</div>
          <div :class="['decade-label', d.verdict]">{{ verdictLabel(d.verdict) }}</div>
        </div>
      </div>
    </div>

    <div class="current-fortune-detail">
      <div class="detail-header">
        <div class="detail-ganzhi">{{ currentDetail.ganzhi }}</div>
        <div class="detail-meta">
          <div class="detail-title">{{ flowFortune.currentDetailTitle }}</div>
          <div class="detail-subtitle">{{ currentDetail.ageRange }} {{ '岁' }} · {{ currentDetail.yearRange }}</div>
        </div>
        <div class="decade-label ji">{{ flowFortune.currentBadge }}</div>
      </div>
      <p class="detail-hint">{{ currentDetail.hint }}</p>
      <div class="hint-list">
        <div class="hint-item">
          <span class="hint-label">{{ flowFortune.yi }}</span>
          <span class="hint-content">{{ flowFortune.yiContent }}</span>
        </div>
        <div class="hint-item">
          <span class="hint-label avoid">{{ flowFortune.ji }}</span>
          <span class="hint-content">{{ flowFortune.jiContent }}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 简约 -->
  <section v-else class="fortune-section">
    <div class="fortune-header">
      <div class="meta">{{ flowFortune.subtitleMn1 }}</div>
      <div class="meta">{{ flowFortune.subtitleMn2 }}</div>
      <span
        v-if="genderBadgeText"
        class="gender-badge"
        :title="flowFortune.genderBadgeHint"
      >{{ genderBadgeText }}</span>
    </div>

    <div class="fortune-timeline">
      <svg ref="svgEl" class="fortune-track-connectors" aria-hidden="true" />
      <div ref="trackEl" class="fortune-track">
        <div
          v-for="d in decades"
          :key="d.age"
          :class="['decade', { current: d.current }]"
        >
          <div class="decade-age">{{ d.age }}</div>
          <div class="decade-ganzhi">{{ d.ganzhi }}</div>
          <div class="decade-ss">{{ d.shishenMn }}</div>
          <span :class="['decade-verdict', d.verdict]">{{ verdictLabel(d.verdict) }}</span>
        </div>
      </div>
    </div>

    <div class="current-detail">
      <div class="detail-lead">
        <div class="detail-lead-gz">{{ currentDetail.ganzhi }}</div>
        <div class="detail-lead-range">{{ currentDetail.ageRange }} {{ '岁' }}<br>{{ currentDetail.yearRange }}</div>
      </div>
      <div class="detail-body">
        <h3>{{ flowFortune.currentDetailTitleMn }}</h3>
        <p class="sub">{{ flowFortune.currentDetailSubtitleMn }}</p>
        <p>{{ currentDetail.hint }}</p>
        <div class="detail-hints">
          <div class="hint yi">
            <strong>◎ {{ flowFortune.yi }}</strong>
            {{ flowFortune.yiContent }}
          </div>
          <div class="hint ji">
            <strong>✕ {{ flowFortune.ji }}</strong>
            {{ flowFortune.jiContent }}
          </div>
        </div>
      </div>
    </div>
  </section>

</template>
