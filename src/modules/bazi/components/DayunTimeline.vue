<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart, Tendency } from '../types'

interface DecadeCell {
  age: string
  ganzhi: string
  shishen: string
  shishenMn: string
  verdict: 'ji' | 'zhong' | 'xiong'
  current?: boolean
}

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
  if (!props.chart) return []
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

/**
 * 当前大运详情卡的视图模型。
 *
 * 当 chart 不存在时，由 `BaziPage.vue` 顶层 `showComputeError` 拦截，
 * 本组件根本不会被渲染。所以这里仅在 chart 存在时返回有效对象，
 * 不再回退到 `bazi.fortune.currentDetailHint / yiContent / jiContent /
 * currentDetailSubtitleMn` 等 1990-05-20 男的硬编码示例文案。
 *
 * 见 `design/bazi/2026-04-21-03-八字文案校验报告.md` § 7（"主路径硬编码"修复）。
 */
interface CurrentDetailVm {
  ganzhi: string
  ageRange: string
  yearRange: string
  /** 当前大运一句话提示（来自 chart.decades[*].hint，C 类规则化模板生成） */
  hint: string
  /** 大运十神简称（如 "正印 · 正财"），用于副标题 */
  tenGod: string
  /** badge css class（ji/zhong/xiong），决定颜色 */
  badgeClass: 'ji' | 'zhong' | 'xiong'
  /** badge 文字（吉/中/凶） */
  badge: string
}
const currentDetail = computed<CurrentDetailVm | null>(() => {
  if (!currentDecade.value) return null
  const cd = currentDecade.value
  const cls = tendencyClass(cd.tendency)
  return {
    ganzhi: cd.ganzhi,
    ageRange: `${cd.startAge} - ${cd.endAge}`,
    yearRange: `${cd.startYear} - ${cd.endYear}`,
    hint: cd.hint,
    tenGod: cd.tenGod,
    badgeClass: cls,
    badge: verdictLabel(cls),
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

    <div v-if="currentDetail" class="current-fortune-detail">
      <div class="detail-header">
        <div class="detail-ganzhi">{{ currentDetail.ganzhi }}</div>
        <div class="detail-meta">
          <div class="detail-title">
            {{ t('bazi.fortune.currentDetailTitle', { age: currentDetail.ageRange }) }}
          </div>
          <div class="detail-subtitle">{{ currentDetail.ageRange }} {{ '岁' }} · {{ currentDetail.yearRange }}</div>
        </div>
        <div :class="['decade-label', currentDetail.badgeClass]">{{ currentDetail.badge }}</div>
      </div>
      <p class="detail-hint">{{ currentDetail.hint }}</p>
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

    <div v-if="currentDetail" class="current-detail">
      <div class="detail-lead">
        <div class="detail-lead-gz">{{ currentDetail.ganzhi }}</div>
        <div class="detail-lead-range">{{ currentDetail.ageRange }} {{ '岁' }}<br>{{ currentDetail.yearRange }}</div>
      </div>
      <div class="detail-body">
        <h3>{{ t('bazi.fortune.currentDetailTitleMn', { tenGod: currentDetail.tenGod }) }}</h3>
        <p class="sub">
          {{ t('bazi.fortune.currentDetailSubtitleMn', {
            ganzhi: currentDetail.ganzhi,
            tenGod: currentDetail.tenGod,
            verdict: currentDetail.badge,
          }) }}
        </p>
        <p>{{ currentDetail.hint }}</p>
      </div>
    </div>
  </section>

</template>
