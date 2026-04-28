<script setup lang="ts">
/**
 * 流年卡（M2 §11 + M3 §3.3 流年总评）
 *
 * 展示当前公历年起 10 年的流年信息：
 *  - 默认折叠仅显示当年
 *  - 可展开看后续 9 年
 *  - 每段：年份 + 干支 + 流年命宫 + 流年四化（按流年天干起）
 *  - 每段底部：60 甲子流年总评（按 cell.ganzhi 取自 data/yearlyReview.{lang}.ts）
 *
 * 数据来源：`chart.flowYears`（由 core/ziwei.ts 预先计算）
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { SihuaKey, ZiweiChart } from '../types'
import type { GanZhiKey, Verdict, YearlyReviewEntry } from '../data'
import { loadYearlyReview } from '../data/lazy'
import type { Locale } from '@/locales'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const flowYears = computed(() => props.chart?.flowYears ?? [])
const expanded = ref(false)

const visibleCells = computed(() => {
  const all = flowYears.value
  if (!all.length) return []
  return expanded.value ? all : [all[0]]
})

const titleText = computed(() =>
  isGuofeng.value
    ? t('ziwei.flowYear.title')
    : t('ziwei.flowYear.titleMn'),
)

const toggleText = computed(() =>
  expanded.value
    ? t('ziwei.flowYear.collapse')
    : t('ziwei.flowYear.expandFmt', { count: Math.max(flowYears.value.length - 1, 0) }),
)

function shortSihua(k: SihuaKey): string {
  return t(`ziwei.sihuaShort.${k}`)
}

/**
 * 流年总评矩阵（按当前 locale 异步加载，60 段一次到位）
 *
 * 与 SihuaReadingView 单格懒加载不同，这里 chart.flowYears 一次产出 10 段，
 * 通过整张矩阵共享访问最经济（避免 10 次单 entry 的 Promise.all）。
 */
const yearlyMatrix = ref<Record<string, YearlyReviewEntry> | null>(null)

watch(
  locale,
  async (lang) => {
    yearlyMatrix.value = await loadYearlyReview(lang as Locale)
  },
  { immediate: true },
)

function reviewOf(ganzhi: string): YearlyReviewEntry | null {
  if (!ganzhi || !yearlyMatrix.value) return null
  return yearlyMatrix.value[ganzhi as GanZhiKey] ?? null
}

function verdictTone(v: Verdict): 'jade' | 'plain' | 'danger' {
  if (v === 'ji') return 'jade'
  if (v === 'xiong') return 'danger'
  return 'plain'
}

function verdictLabel(v: Verdict): string {
  return t(`ziwei.palaceMajor.verdict.${v}`)
}
</script>

<template>
  <section v-if="flowYears.length" class="ziwei-flowyear-section">
    <div class="ziwei-flowyear-header">
      <h2>{{ titleText }}</h2>
      <button
        v-if="flowYears.length > 1"
        type="button"
        class="ziwei-flowyear-toggle"
        @click="expanded = !expanded"
      >
        {{ toggleText }}
      </button>
    </div>

    <ul class="ziwei-flowyear-list">
      <li
        v-for="cell in visibleCells"
        :key="cell.year"
        :class="['ziwei-flowyear-cell', { current: cell.current }]"
      >
        <div class="ziwei-flowyear-head">
          <span class="ziwei-flowyear-year">{{ cell.year }}</span>
          <span class="ziwei-flowyear-gz">{{ cell.ganzhi }}</span>
          <span class="ziwei-flowyear-palace">
            {{ t(`ziwei.palaceNamesShort.${cell.palaceKey}`) }}
          </span>
          <template v-if="reviewOf(cell.ganzhi)">
            <span
              class="ziwei-flowyear-verdict"
              :data-tone="verdictTone(reviewOf(cell.ganzhi)!.verdict)"
            >
              {{ verdictLabel(reviewOf(cell.ganzhi)!.verdict) }}
            </span>
          </template>
        </div>
        <div v-if="cell.mutagens.length" class="ziwei-flowyear-mutagens">
          <span
            v-for="(m, idx) in cell.mutagens"
            :key="idx"
            :class="['ziwei-flowyear-tag', `tag-sihua-${m.sihua}`]"
          >
            {{ m.name }}<span class="sihua-mark">{{ t('ziwei.sihuaMarkFmt', { label: shortSihua(m.sihua) }) }}</span>
            <span v-if="m.palaceKey" class="palace-mark">
              · {{ t(`ziwei.palaceNamesShort.${m.palaceKey}`) }}
            </span>
          </span>
        </div>
        <p
          v-if="reviewOf(cell.ganzhi)"
          class="ziwei-flowyear-review"
        >
          {{ reviewOf(cell.ganzhi)!.text }}
        </p>
      </li>
    </ul>
  </section>
</template>
