<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import BirthForm from './components/BirthForm.vue'
import FourPillarsTable from './components/FourPillarsTable.vue'
import ShishenStructure from './components/ShishenStructure.vue'
import ElementsRadar from './components/ElementsRadar.vue'
import InterpretBlock from './components/InterpretBlock.vue'
import DayunTimeline from './components/DayunTimeline.vue'
import { meta as baziMeta, pillarsByLocale } from './data/mockBazi'
import { useBaziDrawings, type BaziArc } from './composables/useBaziDrawings'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'

const { t, tm, locale } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const fourPillarsEl = ref<InstanceType<typeof FourPillarsTable> | null>(null)
const dayunEl = ref<InstanceType<typeof DayunTimeline> | null>(null)

const arcs = computed<BaziArc[]>(() => {
  const r = tm('bazi.relations') as Record<string, string>
  return [
    { type: 'chong', from: 0, to: 2, label: r.chong, dir: 'up' },
    { type: 'zixing', from: 0, to: 3, label: r.zixing, dir: 'down' },
    { type: 'anhe', from: 1, to: 3, label: r.anhe, dir: 'down' },
  ]
})

const pillarsLocalized = computed(() => {
  const map = pillarsByLocale as Record<string, typeof pillarsByLocale['zh-CN']>
  return map[locale.value] ?? pillarsByLocale['zh-CN']
})

const meta = computed(() => ({
  solar: locale.value === 'en' ? baziMeta.solarEn : baziMeta.solar,
  lunar: locale.value === 'en' ? baziMeta.lunarEn : baziMeta.lunar,
}))

const metaLabels = computed(() => {
  const m = tm('bazi.chartMeta') as Record<string, string>
  return { solar: m.solarLabel, lunar: m.lunarLabel }
})

const drawings = useBaziDrawings({
  getRelationsSvg: () => fourPillarsEl.value?.svgRef() ?? null,
  getRelationsTable: () => fourPillarsEl.value?.tableRef() ?? null,
  relationsArcs: () => arcs.value,
  getConnectorsSvg: () => dayunEl.value?.svgRef() ?? null,
  getConnectorsTrack: () => dayunEl.value?.trackRef() ?? null,
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
  skeleton.start(() => resultBannerEl.value)
}
function onRepaipan() {
  skeleton.reset(() => inputCardEl.value)
}
function go(name: 'home') {
  router.push({ name })
}
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
      <div class="gf-container" style="padding-top: 0;">
        <FourPillarsTable
          ref="fourPillarsEl"
          :pillars="pillarsLocalized"
          :meta="meta"
          :meta-labels="metaLabels"
          :arcs="arcs"
        />
        <ShishenStructure />
        <ElementsRadar />
        <InterpretBlock />
      </div>

      <div class="gf-divider">
        <span>◆ {{ t('bazi.fortune.title') }} ◆</span>
      </div>

      <DayunTimeline ref="dayunEl" />

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
        <FourPillarsTable
          ref="fourPillarsEl"
          :pillars="pillarsLocalized"
          :meta="meta"
          :meta-labels="metaLabels"
          :arcs="arcs"
        />
        <ShishenStructure />
        <ElementsRadar />
        <InterpretBlock />
      </main>

      <hr class="mn-divider">

      <DayunTimeline ref="dayunEl" />

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
