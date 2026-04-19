<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import BirthForm from '@/modules/bazi/components/BirthForm.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import ZiweiMeta from './components/ZiweiMeta.vue'
import SihuaLegend from './components/SihuaLegend.vue'
import SanfangToggle from './components/SanfangToggle.vue'
import ZiweiPalaceChart from './components/ZiweiPalaceChart.vue'
import ZiweiMobile from './components/ZiweiMobile.vue'
import InterpretCards from './components/InterpretCards.vue'
import DaxianGrid from './components/DaxianGrid.vue'
import { buildZiweiChart } from './core/ziwei'
import type { ZiweiChart } from './types'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const chartRef = ref<InstanceType<typeof ZiweiPalaceChart> | null>(null)

const showSanfang = ref(true)
const chart = shallowRef<ZiweiChart | null>(null)

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
  onReveal: () => {
    window.setTimeout(() => chartRef.value?.schedule(), 150)
    window.setTimeout(() => chartRef.value?.schedule(), 700)
  },
})

watch(isGuofeng, () => {
  nextTick(() => {
    chartRef.value?.schedule()
    window.setTimeout(() => chartRef.value?.schedule(), 250)
    window.setTimeout(() => chartRef.value?.schedule(), 700)
  })
})

watch(showSanfang, () => {
  nextTick(() => chartRef.value?.schedule())
})

function onPaipan() {
  try {
    chart.value = buildZiweiChart(userStore.birth)
  } catch (err) {
    console.error('[ziwei] calculate failed:', err)
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
        <h1>{{ t('ziwei.pageTitle') }}</h1>
        <div class="subtitle">{{ t('ziwei.pageSubtitle') }}</div>
      </div>

      <div ref="inputCardEl">
        <BirthForm
          :title="t('ziwei.inputCardTitle')"
          :primary-label="t('ziwei.btn.paipan')"
          @paipan="onPaipan"
        />
      </div>
    </div>

    <div ref="resultBannerEl" :class="['result-banner', { revealed: skeleton.revealed.value }]">
      <h2 class="result-banner-title">
        <span class="result-banner-decor">◈</span>
        {{ t('ziwei.resultBanner.title') }}
        <span class="result-banner-decor">◈</span>
      </h2>
      <div class="result-banner-subtitle">{{ t('ziwei.resultBanner.subtitle') }}</div>
    </div>

    <div :class="['result-zone', { revealed: skeleton.revealed.value }]">
      <div class="gf-container" style="padding-top: 0;">
        <CollapsibleSection :label="t('ziwei.collapse.sectionMeta')">
          <ZiweiMeta :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection :label="t('ziwei.collapse.sectionChart')">
          <SihuaLegend />
          <SanfangToggle v-model="showSanfang" />
          <ZiweiPalaceChart ref="chartRef" :chart="chart" :show-sanfang="showSanfang" />
          <ZiweiMobile :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection :label="t('ziwei.collapse.sectionInterpret')">
          <InterpretCards :chart="chart" />
        </CollapsibleSection>
      </div>

      <div class="gf-divider">
        <span>◆ {{ t('ziwei.daxian.title') }} ◆</span>
      </div>

      <div class="gf-container" style="padding-top: 0;">
        <CollapsibleSection :label="t('ziwei.collapse.sectionDaxian')">
          <DaxianGrid :chart="chart" />
        </CollapsibleSection>
      </div>

      <div class="action-bar">
        <button class="gf-btn">{{ t('ziwei.btn.shareIcon') }} {{ t('ziwei.btn.share') }}</button>
        <button class="gf-btn gf-btn-outline">{{ t('ziwei.btn.saveIcon') }} {{ t('ziwei.btn.save') }}</button>
        <button class="gf-btn gf-btn-outline" @click="onRepaipan">
          {{ t('ziwei.btn.repaipanIcon') }} {{ t('ziwei.btn.repaipan') }}
        </button>
      </div>
    </div>
  </main>

  <!-- ============ 简约 ============ -->
  <template v-else>
    <main class="mn-container">
      <section class="page-hero">
        <div class="page-breadcrumb">
          <a href="#" @click.prevent="go('home')">{{ t('ziwei.breadcrumbHome') }}</a> /
          {{ t('ziwei.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('ziwei.pageTitle') }}</h1>
        <p>{{ t('ziwei.pageSubtitle') }}</p>
      </section>

      <div ref="inputCardEl">
        <BirthForm
          :title="t('ziwei.inputCardTitle')"
          :primary-label="t('ziwei.btn.paipan')"
          @paipan="onPaipan"
        />
      </div>
    </main>

    <div ref="resultBannerEl" :class="['result-banner', { revealed: skeleton.revealed.value }]">
      <h2 class="result-banner-title">{{ t('ziwei.resultBanner.title') }}</h2>
      <div class="result-banner-sub">{{ t('ziwei.resultBanner.subtitle') }}</div>
      <div class="result-banner-line" />
    </div>

    <div :class="['result-zone', { revealed: skeleton.revealed.value }]">
      <main class="mn-container" style="padding-top: 0;">
        <CollapsibleSection :label="t('ziwei.collapse.sectionMetaMn')">
          <ZiweiMeta :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection :label="t('ziwei.collapse.sectionChartMn')">
          <SihuaLegend />
          <SanfangToggle v-model="showSanfang" />
          <ZiweiPalaceChart ref="chartRef" :chart="chart" :show-sanfang="showSanfang" />
          <ZiweiMobile :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection :label="t('ziwei.collapse.sectionInterpretMn')">
          <InterpretCards :chart="chart" />
        </CollapsibleSection>
      </main>

      <hr class="mn-divider">

      <main class="mn-container" style="padding-top: 0;">
        <CollapsibleSection :label="t('ziwei.collapse.sectionDaxianMn')">
          <DaxianGrid :chart="chart" />
        </CollapsibleSection>
      </main>

      <div class="actions mn-container">
        <button class="mn-btn">{{ t('ziwei.btn.share') }}</button>
        <button class="mn-btn mn-btn-outline">{{ t('ziwei.btn.save') }}</button>
        <button class="mn-btn mn-btn-ghost" @click="onRepaipan">{{ t('ziwei.btn.repaipan') }}</button>
      </div>
    </div>
  </template>

  <!-- 骨架遮罩 -->
  <div :class="['skeleton-overlay', { visible: skeleton.skeletonVisible.value }]">
    <div class="skeleton-card">
      <div class="skeleton-ring" />
      <div v-if="isGuofeng" class="skeleton-text">{{ t('ziwei.skeleton.title') }}</div>
      <div v-else class="skeleton-title">{{ t('ziwei.skeleton.title') }}</div>
      <div v-if="isGuofeng" class="skeleton-subtext">{{ t('ziwei.skeleton.subtitle') }}</div>
      <div v-else class="skeleton-sub">{{ t('ziwei.skeleton.subtitle') }}</div>
      <div class="skeleton-dots"><span>·</span><span>·</span><span>·</span></div>
    </div>
  </div>
</template>
