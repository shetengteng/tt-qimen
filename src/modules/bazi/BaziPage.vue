<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import BirthForm from './components/BirthForm.vue'
import FourPillarsTable from './components/FourPillarsTable.vue'
import ShishenStructure from './components/ShishenStructure.vue'
import ElementsRadar from './components/ElementsRadar.vue'
import InterpretBlock from './components/InterpretBlock.vue'
import DayunTimeline from './components/DayunTimeline.vue'
import FlowYears from './components/FlowYears.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import { meta as baziMeta, pillarsByLocale, type PillarCell } from './data/mockBazi'
import { useBaziDrawings, type BaziArc } from './composables/useBaziDrawings'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { calculateBazi } from './core/bazi'
import { detectZhiRelations } from './core/zhiRelations'
import type { BaziChart, PillarInfo } from './types'

const { t, tm, locale } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const fourPillarsEl = ref<InstanceType<typeof FourPillarsTable> | null>(null)
const dayunEl = ref<InstanceType<typeof DayunTimeline> | null>(null)

const chart = shallowRef<BaziChart | null>(null)

/** 把 PillarInfo 转换为 UI 用的 PillarCell（兼容旧 FourPillarsTable 模板） */
function toPillarCell(p: PillarInfo, isDay: boolean): PillarCell {
  return {
    gan: p.gan,
    zhi: p.zhi,
    ganAttr: isDay ? `${p.ganYinYang}${p.ganElement} · 日主` : `${p.ganYinYang}${p.ganElement}`,
    zhiAttr: `${p.zhiYinYang}${p.zhiElement}`,
    shishen: p.tenGod,
    nayin: p.nayin,
    canggang: p.hideStems.map(h => h.gan),
    cangganSingle: p.hideStemSingle,
  }
}

const arcs = computed<BaziArc[]>(() => {
  if (chart.value) {
    const p = chart.value.pillars
    return detectZhiRelations(p.year, p.month, p.day, p.hour)
  }
  // 未排盘前回退到 i18n 中的示意文案，保持视觉占位
  const r = tm('bazi.relations') as Record<string, string>
  return [
    { type: 'chong', from: 0, to: 2, label: r.chong, desc: r.chongDescMn, dir: 'up' },
    { type: 'zixing', from: 0, to: 3, label: r.zixing, desc: r.zixingDescMn, dir: 'down' },
    { type: 'anhe', from: 1, to: 3, label: r.anhe, desc: r.anheDescMn, dir: 'down' },
  ]
})

const pillarsLocalized = computed(() => {
  if (chart.value) {
    const c = chart.value.pillars
    return [
      toPillarCell(c.year, false),
      toPillarCell(c.month, false),
      toPillarCell(c.day, true),
      toPillarCell(c.hour, false),
    ]
  }
  const map = pillarsByLocale as Record<string, typeof pillarsByLocale['zh-CN']>
  return map[locale.value] ?? pillarsByLocale['zh-CN']
})

const meta = computed(() => {
  if (chart.value) return {
    solar: chart.value.meta.solar,
    lunar: chart.value.meta.lunar,
    genderTitle: chart.value.meta.genderTitle,
  }
  return {
    solar: locale.value === 'en' ? baziMeta.solarEn : baziMeta.solar,
    lunar: locale.value === 'en' ? baziMeta.lunarEn : baziMeta.lunar,
    genderTitle: userStore.birth.gender === 'female' ? '坤造' as const : '乾造' as const,
  }
})

const metaLabels = computed(() => {
  const m = tm('bazi.chartMeta') as Record<string, string>
  return { solar: m.solarLabel, lunar: m.lunarLabel }
})

/** 四柱表头副标题 */
const headerSubs = computed(() => {
  if (!chart.value) return undefined
  const b = userStore.birth
  return [
    { key: 'year' as const, sub: String(b.year) },
    { key: 'month' as const, sub: String(b.month) },
    { key: 'day' as const, sub: String(b.day) },
    { key: 'hour' as const, sub: hourLabelOf(b.hour) },
  ]
})

function hourLabelOf(hour: number): string {
  const labels = (tm('bazi.hours') as string[]) ?? []
  let idx = Math.floor((hour + 1) / 2) % 12
  if (hour === 23) idx = 12
  if (hour === 0) idx = 0
  return labels[idx] ?? `${hour}`
}

const drawings = useBaziDrawings({
  getRelationsSvg: () => fourPillarsEl.value?.svgRef() ?? null,
  getRelationsTable: () => fourPillarsEl.value?.tableRef() ?? null,
  relationsArcs: () => arcs.value,
  getConnectorsSvg: () => dayunEl.value?.svgRef() ?? null,
  getConnectorsTrack: () => dayunEl.value?.trackRef() ?? null,
})

watch(isGuofeng, () => {
  nextTick(() => {
    drawings.schedule()
    window.setTimeout(drawings.schedule, 250)
    window.setTimeout(drawings.schedule, 700)
  })
})

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
  onReveal: () => {
    window.setTimeout(drawings.schedule, 150)
    window.setTimeout(drawings.schedule, 700)
  },
})

function onPaipan() {
  try {
    chart.value = calculateBazi(userStore.birth)
  } catch (err) {
    console.error('[bazi] calculate failed:', err)
    chart.value = null
  }
  skeleton.start(() => resultBannerEl.value)
}
function onRepaipan() {
  chart.value = null
  skeleton.reset(() => inputCardEl.value)
}
function go(name: 'home') {
  router.push({ name })
}

onMounted(() => {
  if (!userStore.isDefault) {
    onPaipan()
  }
})

watch(
  () => userStore.birth.gender,
  () => {
    if (chart.value) {
      onPaipan()
    }
  },
)
</script>

<template>
  <!-- ============ 国风 ============ -->
  <main v-if="isGuofeng">
    <div class="gf-container">
      <div class="page-title">
        <h1>{{ t('bazi.pageTitle') }}</h1>
        <div class="subtitle">{{ t('bazi.pageSubtitle') }}</div>
      </div>

      <div ref="inputCardEl">
        <BirthForm @paipan="onPaipan" />
      </div>
    </div>

    <div ref="resultBannerEl" :class="['result-banner', { revealed: skeleton.revealed.value }]">
      <h2 class="result-banner-title">
        <span class="result-banner-decor">◈</span>
        {{ t('bazi.resultBanner.title') }}
        <span class="result-banner-decor">◈</span>
      </h2>
      <div class="result-banner-subtitle">{{ t('bazi.resultBanner.subtitle') }}</div>
    </div>

    <div :class="['result-zone', { revealed: skeleton.revealed.value }]">
      <CollapsibleSection :label="t('bazi.collapse.sectionChart')">
        <FourPillarsTable
          ref="fourPillarsEl"
          :pillars="pillarsLocalized"
          :meta="meta"
          :meta-labels="metaLabels"
          :arcs="arcs"
          :header-subs="headerSubs"
        />
        <ShishenStructure :chart="chart" />
        <ElementsRadar :chart="chart" />
      </CollapsibleSection>

      <CollapsibleSection :label="t('bazi.collapse.sectionInterpret')">
        <InterpretBlock :chart="chart" />
      </CollapsibleSection>

      <div class="gf-divider">
        <span>◆ {{ t('bazi.fortune.title') }} ◆</span>
      </div>

      <CollapsibleSection :label="t('bazi.collapse.sectionFortune')">
        <DayunTimeline ref="dayunEl" :chart="chart" />
      </CollapsibleSection>

      <CollapsibleSection :label="t('bazi.collapse.sectionFlow')">
        <FlowYears :chart="chart" />
      </CollapsibleSection>

      <div class="action-bar">
        <button class="gf-btn">{{ t('bazi.btn.shareIcon') }} {{ t('bazi.btn.share') }}</button>
        <button class="gf-btn gf-btn-outline">{{ t('bazi.btn.saveIcon') }} {{ t('bazi.btn.save') }}</button>
        <button class="gf-btn gf-btn-outline" @click="onRepaipan">
          {{ t('bazi.btn.repaipanIcon') }} {{ t('bazi.btn.repaipan') }}
        </button>
      </div>
    </div>
  </main>

  <!-- ============ 简约 ============ -->
  <template v-else>
    <main class="mn-container">
      <section class="page-hero">
        <div class="page-breadcrumb">
          <a href="#" @click.prevent="go('home')">{{ t('bazi.breadcrumbHome') }}</a> /
          {{ t('bazi.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('bazi.pageTitle') }}</h1>
        <p>{{ t('bazi.pageSubtitle') }}</p>
      </section>

      <div ref="inputCardEl">
        <BirthForm @paipan="onPaipan" />
      </div>
    </main>

    <div ref="resultBannerEl" :class="['result-banner', { revealed: skeleton.revealed.value }]">
      <h2 class="result-banner-title">{{ t('bazi.resultBanner.title') }}</h2>
      <div class="result-banner-sub">{{ t('bazi.resultBanner.subtitle') }}</div>
      <div class="result-banner-line" />
    </div>

    <div :class="['result-zone', { revealed: skeleton.revealed.value }]">
      <main class="mn-container" style="padding-top: 0;">
        <CollapsibleSection :label="t('bazi.collapse.sectionChartMn')">
          <FourPillarsTable
            ref="fourPillarsEl"
            :pillars="pillarsLocalized"
            :meta="meta"
            :meta-labels="metaLabels"
            :arcs="arcs"
            :header-subs="headerSubs"
          />
          <ShishenStructure :chart="chart" />
          <ElementsRadar :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection :label="t('bazi.collapse.sectionInterpretMn')">
          <InterpretBlock :chart="chart" />
        </CollapsibleSection>
      </main>

      <hr class="mn-divider">

      <main class="mn-container" style="padding-top: 0;">
        <CollapsibleSection :label="t('bazi.collapse.sectionFortuneMn')">
          <DayunTimeline ref="dayunEl" :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection :label="t('bazi.collapse.sectionFlowMn')">
          <FlowYears :chart="chart" />
        </CollapsibleSection>
      </main>

      <div class="actions mn-container">
        <button class="mn-btn">{{ t('bazi.btn.share') }}</button>
        <button class="mn-btn mn-btn-outline">{{ t('bazi.btn.save') }}</button>
        <button class="mn-btn mn-btn-ghost" @click="onRepaipan">{{ t('bazi.btn.repaipan') }}</button>
      </div>
    </div>
  </template>

  <!-- 骨架遮罩 -->
  <div :class="['skeleton-overlay', { visible: skeleton.skeletonVisible.value }]">
    <div class="skeleton-card">
      <div class="skeleton-ring" />
      <div v-if="isGuofeng" class="skeleton-text">{{ t('bazi.skeleton.title') }}</div>
      <div v-else class="skeleton-title">{{ t('bazi.skeleton.title') }}</div>
      <div v-if="isGuofeng" class="skeleton-subtext">{{ t('bazi.skeleton.subtitle') }}</div>
      <div v-else class="skeleton-sub">{{ t('bazi.skeleton.subtitle') }}</div>
      <div class="skeleton-dots"><span>·</span><span>·</span><span>·</span></div>
    </div>
  </div>
</template>
