<script setup lang="ts">
import { computed, provide, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { BIRTH_STORE_KEY } from '@/composables/useBirthStore'
import BirthForm from '@/modules/bazi/components/BirthForm.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import ShareToast from '@/components/common/ShareToast.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'
import ZiweiMeta from './components/ZiweiMeta.vue'
import SihuaLegend from './components/SihuaLegend.vue'
import SanfangToggle from './components/SanfangToggle.vue'
import ZiweiPalaceChart from './components/ZiweiPalaceChart.vue'
import ZiweiMobile from './components/ZiweiMobile.vue'
import InterpretCards from './components/InterpretCards.vue'
import DaxianGrid from './components/DaxianGrid.vue'
import { buildZiweiChart } from './core/ziwei'
import { useZiweiStore } from './stores/ziweiStore'
import type { ZiweiChart } from './types'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const ziweiStore = useZiweiStore()
provide(BIRTH_STORE_KEY, ziweiStore)
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

function onPaipan() {
  try {
    chart.value = buildZiweiChart(ziweiStore.birth)
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

/**
 * 分享 / 保存命盘卡片：复用 useShareCard，截图根 div 由 shareCardEl 持有，
 * 包裹整个 result-zone 内容（不含 actions）。
 */
const shareCardEl = ref<HTMLElement | null>(null)
const { toastState, shareCard, saveCard } = useShareCard()
function buildShareOpts() {
  const b = ziweiStore.birth
  const mm = String(b.month).padStart(2, '0')
  const dd = String(b.day).padStart(2, '0')
  return {
    fileName: `ziwei-${b.year}-${mm}-${dd}-${b.gender}-${themeStore.id}`,
    title: t('ziwei.share.title'),
    text: t('ziwei.share.text'),
  }
}
function onShare() {
  shareCard(shareCardEl.value, buildShareOpts())
}
function onSave() {
  saveCard(shareCardEl.value, buildShareOpts())
}

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

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">
        <span class="result-banner-decor">◈</span>
        {{ t('ziwei.resultBanner.title') }}
        <span class="result-banner-decor">◈</span>
      </h2>
      <div class="result-banner-subtitle">{{ t('ziwei.resultBanner.subtitle') }}</div>
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div ref="shareCardEl" class="ziwei-share-card">
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
      </div><!-- /ziwei-share-card -->

      <div class="action-bar">
        <button type="button" class="gf-btn" @click="onShare">
          {{ t('ziwei.btn.shareIcon') }} {{ t('ziwei.btn.share') }}
        </button>
        <button type="button" class="gf-btn gf-btn-outline" @click="onSave">
          {{ t('ziwei.btn.saveIcon') }} {{ t('ziwei.btn.save') }}
        </button>
        <button type="button" class="gf-btn gf-btn-outline" @click="onRepaipan">
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

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">{{ t('ziwei.resultBanner.title') }}</h2>
      <div class="result-banner-sub">{{ t('ziwei.resultBanner.subtitle') }}</div>
      <div class="result-banner-line" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div ref="shareCardEl" class="ziwei-share-card">
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
      </div><!-- /ziwei-share-card -->

      <div class="actions mn-container">
        <button type="button" class="mn-btn" @click="onShare">{{ t('ziwei.btn.share') }}</button>
        <button type="button" class="mn-btn mn-btn-outline" @click="onSave">{{ t('ziwei.btn.save') }}</button>
        <button type="button" class="mn-btn mn-btn-ghost" @click="onRepaipan">{{ t('ziwei.btn.repaipan') }}</button>
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

  <!-- 分享 / 保存的反馈 toast（fixed 定位） -->
  <ShareToast :state="toastState" />
</template>
