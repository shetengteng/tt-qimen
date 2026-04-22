<script setup lang="ts">
/**
 * 流年区块（从 DayunTimeline 拆出）。
 * 拆分原因：原型把「大运」和「流年」做成两个独立的可折叠区块，
 * Vue 端要在 BaziPage 里用同一个 CollapsibleSection 包两次，
 * 必须把流年逻辑独立成组件，否则两个 section 会一起折叠。
 *
 * v3.1.1：「查看更多年份」交互
 *   - 默认显示前 INITIAL_VISIBLE 年（5 年）
 *   - 点击「查看更多年份 →」按钮一次，扩展 STEP 年（5 年）
 *   - 已显示全部年份时按钮自动隐藏；mock 4 年场景下也直接隐藏
 *   - 容器高度变化通过 toggle-expand emit 通知父级 BaziPage 调 syncHeight
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { flowYears as fallbackFlow, MOCK_BAZI_IS_MOCK, type FlowYearCell } from '../data/mockBazi'
import type { BaziChart } from '../types'

interface Props {
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const emit = defineEmits<{
  /** 「查看更多年份」点击后触发（带新的 visibleCount），父级用于 syncHeight */
  'toggle-expand': [visibleCount: number]
}>()

const INITIAL_VISIBLE = 5
const STEP = 5

const { t, locale } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

/** 真实命盘下的流年映射（不分多语言，只展示中文模板） */
interface FlowYearVm {
  year: number
  ganzhi: string
  shishen: string
  hint: string
  tags: string[]
  current?: boolean
}

const allFlowYears = computed<FlowYearVm[]>(() => {
  if (!props.chart) {
    if (import.meta.env.DEV && MOCK_BAZI_IS_MOCK) {
      console.warn(
        '[FlowYears] using mockBazi.flowYears fallback (chart is null). '
        + 'mock data contains modern commercial terms without classical sources. '
        + 'See design/bazi/2026-04-22-03-八字文案溯源改造方案TODO.md § 2.6',
      )
    }
    return fallbackFlow.map<FlowYearVm>(fy => ({
      year: fy.year,
      ganzhi: fy.ganzhi,
      shishen: fy.shishen,
      hint: fy.hint,
      tags: fy.tags,
      current: fy.current,
    }))
  }
  return props.chart.flowYears.map<FlowYearVm>(fy => ({
    year: fy.year,
    ganzhi: fy.ganzhi,
    shishen: fy.tenGod,
    hint: fy.hint,
    tags: fy.tags,
    current: fy.current,
  }))
})

/** 当前可见年份数 —— 由「查看更多年份」按钮逐步扩展 */
const visibleCount = ref(INITIAL_VISIBLE)

/** 切换 chart 或 mock 时重置 visibleCount，避免上一次展开状态残留 */
watch(
  () => allFlowYears.value.length,
  () => { visibleCount.value = INITIAL_VISIBLE },
)

const flowYears = computed<FlowYearVm[]>(() =>
  allFlowYears.value.slice(0, visibleCount.value),
)
const showMoreBtn = computed(() => visibleCount.value < allFlowYears.value.length)
function onShowMore() {
  visibleCount.value = Math.min(
    visibleCount.value + STEP,
    allFlowYears.value.length,
  )
  emit('toggle-expand', visibleCount.value)
}

const flowHint = (idx: number) => {
  if (props.chart) return flowYears.value[idx].hint
  // mock：保留原多语言行为
  const fy = fallbackFlow[idx] as FlowYearCell | undefined
  if (!fy) return ''
  if (locale.value === 'zh-TW') return fy.hintTw
  if (locale.value === 'en') return fy.hintEn
  return fy.hint
}
const flowTags = (idx: number) => {
  if (props.chart) return flowYears.value[idx].tags
  const fy = fallbackFlow[idx] as FlowYearCell | undefined
  if (!fy) return []
  if (locale.value === 'zh-TW') return fy.tagsTw
  if (locale.value === 'en') return fy.tagsEn
  return fy.tags
}
type FlowTagMn = { label: string; tone?: 'warning' | 'success' | 'danger' }
const flowTagsMn = (idx: number): FlowTagMn[] => {
  if (props.chart) return flowYears.value[idx].tags.map<FlowTagMn>(label => ({ label }))
  const fy = fallbackFlow[idx] as FlowYearCell | undefined
  if (!fy) return []
  if (locale.value === 'zh-CN' && fy.tagsMn?.length) return fy.tagsMn
  return flowTags(idx).map<FlowTagMn>((label: string) => ({ label }))
}
</script>

<template>
  <!-- 国风 -->
  <section v-if="isGuofeng" class="flow-years">
    <div
      class="section-title"
      style="text-align: center; font-size: 28px; color: var(--gf-ink); margin-bottom: var(--gf-space-sm);"
    >{{ t('bazi.flow.title') }}</div>
    <div style="text-align: center; color: var(--gf-ink-soft); font-size: 14px;">
      {{ t('bazi.flow.subtitle') }}
    </div>

    <div class="flow-year-grid">
      <div
        v-for="(fy, idx) in flowYears"
        :key="fy.year"
        :class="['flow-year', { current: fy.current }]"
      >
        <div class="flow-year-header">
          <div class="flow-year-year">{{ fy.year }}</div>
          <div class="flow-year-ganzhi">{{ fy.ganzhi }}</div>
        </div>
        <div class="flow-year-shishen">
          {{ fy.shishen }}<template v-if="fy.current"> | {{ t('bazi.flow.currentSuffix') }}</template>
        </div>
        <p class="flow-year-hint">{{ flowHint(idx) }}</p>
        <div class="flow-year-tags">
          <span v-for="tag in flowTags(idx)" :key="tag" class="flow-year-tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div v-if="showMoreBtn" style="text-align: center; margin-top: var(--gf-space-lg);">
      <button type="button" class="gf-btn gf-btn-outline" @click="onShowMore">
        {{ t('bazi.btn.moreYears') }}
      </button>
    </div>
  </section>

  <!-- 简约 -->
  <section v-else class="flow-section">
    <div class="fortune-header">
      <div class="meta">{{ t('bazi.flow.subtitleMn') }}</div>
    </div>

    <div class="flow-grid">
      <div
        v-for="(fy, idx) in flowYears"
        :key="fy.year"
        :class="['flow-card', { current: fy.current }]"
      >
        <div class="flow-head">
          <span class="flow-year">
            {{ fy.year }}<template v-if="fy.current"> · {{ t('bazi.flow.currentSuffix') }}</template>
          </span>
          <span class="flow-gz">{{ fy.ganzhi }}</span>
        </div>
        <div class="flow-ss">{{ fy.shishen }}</div>
        <p class="flow-hint">{{ flowHint(idx) }}</p>
        <div class="flow-tags">
          <span
            v-for="(tag, i) in flowTagsMn(idx)"
            :key="i"
            :class="[
              'mn-badge',
              tag.tone === 'warning' ? 'mn-badge-warning' : '',
              tag.tone === 'success' ? 'mn-badge-success' : '',
              tag.tone === 'danger' ? 'mn-badge-danger' : '',
            ]"
          >{{ tag.label }}</span>
        </div>
      </div>
    </div>

    <div v-if="showMoreBtn" style="text-align: center; margin-top: var(--mn-space-6);">
      <button type="button" class="mn-btn mn-btn-outline" @click="onShowMore">
        {{ t('bazi.btn.moreYears') }}
      </button>
    </div>
  </section>
</template>
