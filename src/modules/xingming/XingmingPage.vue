<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareToast from '@/components/common/ShareToast.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'
import NameInput from './components/NameInput.vue'
import StrokesBreakdown from './components/StrokesBreakdown.vue'
import FiveGrids from './components/FiveGrids.vue'
import GridDetail from './components/GridDetail.vue'
import OverallGauge from './components/OverallGauge.vue'
import { useXingmingStore } from './stores/xingmingStore'
import { calculateXingming } from './core/xingming'
import { StrokesNotFoundError } from './core/strokes'
import type { XingmingResult } from './types'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const store = useXingmingStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const shareCardEl = ref<HTMLElement | null>(null)

const result = shallowRef<XingmingResult | null>(null)
const errorMessage = ref<string | null>(null)

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
})

async function onCalculate() {
  errorMessage.value = null
  try {
    result.value = await calculateXingming(store.input)
  } catch (err) {
    if (err instanceof StrokesNotFoundError) {
      errorMessage.value = t('xingming.computeError.rareChar', { char: err.char })
    } else if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = t('xingming.computeError.hint')
    }
    console.error('[xingming] calculate failed:', err)
    result.value = null
  }
  skeleton.start(() => resultBannerEl.value)
}

function onRecalculate() {
  result.value = null
  errorMessage.value = null
  skeleton.reset(() => inputCardEl.value)
}

function go(name: 'home') {
  router.push({ name })
}

const { toastState, shareCard, saveCard } = useShareCard()
function buildShareOpts() {
  const fullName = store.input.surname + store.input.givenName
  return {
    fileName: `xingming-${fullName}-${themeStore.id}`,
    title: t('xingming.share.title'),
    text: t('xingming.share.text'),
  }
}
function onShare() {
  shareCard(shareCardEl.value, buildShareOpts())
}
function onSave() {
  saveCard(shareCardEl.value, buildShareOpts())
}

const showComputeError = computed(
  () => skeleton.revealed.value && result.value === null,
)
</script>

<template>
  <!-- ============ 国风 ============ -->
  <main v-if="isGuofeng">
    <div class="gf-container xm-container">
      <div class="page-title">
        <h1>{{ t('xingming.pageTitle') }}</h1>
        <div class="subtitle">{{ t('xingming.pageSubtitle') }}</div>
      </div>

      <div ref="inputCardEl">
        <NameInput
          :title="t('xingming.inputCardTitle')"
          :primary-label="t('xingming.btn.calculate')"
          @calculate="onCalculate"
        />
      </div>
    </div>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">
        <span class="result-banner-decor">◈</span>
        {{ t('xingming.resultBanner.title') }}
        <span class="result-banner-decor">◈</span>
      </h2>
      <div class="result-banner-subtitle">{{ t('xingming.resultBanner.subtitle') }}</div>
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="compute-error-card">
        <h3>◈ {{ t('xingming.computeError.title') }}</h3>
        <p>{{ errorMessage || t('xingming.computeError.hint') }}</p>
        <button class="gf-btn gf-btn-outline" @click="onRecalculate">
          ✎ {{ t('xingming.computeError.retry') }}
        </button>
      </div>

      <template v-else-if="result">
        <div ref="shareCardEl" class="xingming-share-card">
          <div class="gf-container xm-container" style="padding-top: 0;">
            <StrokesBreakdown :result="result" />

            <div class="gf-divider"><span>◆ {{ t('xingming.section.fivegrids') }} ◆</span></div>

            <div class="xm-wuge-layout">
              <FiveGrids :result="result" />
              <GridDetail :result="result" />
            </div>

            <div class="gf-divider"><span>◆ {{ t('xingming.section.overall') }} ◆</span></div>

            <OverallGauge :result="result" />

            <p class="xm-disclaimer">{{ t('xingming.disclaimer') }}</p>
          </div>
        </div>

        <div class="action-bar">
          <button type="button" class="gf-btn" @click="onShare">
            ◈ {{ t('xingming.btn.share') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onSave">
            ◐ {{ t('xingming.btn.save') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onRecalculate">
            ✎ {{ t('xingming.btn.recalculate') }}
          </button>
        </div>
      </template>
    </div>
  </main>

  <!-- ============ 简约 ============ -->
  <template v-else>
    <main class="mn-container xm-container">
      <section class="page-hero">
        <div class="page-breadcrumb">
          <a href="#" @click.prevent="go('home')">{{ t('xingming.breadcrumbHome') }}</a> /
          {{ t('xingming.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('xingming.pageTitle') }}</h1>
        <p>{{ t('xingming.pageSubtitle') }}</p>
      </section>

      <div ref="inputCardEl">
        <NameInput
          :title="t('xingming.inputCardTitle')"
          :primary-label="t('xingming.btn.calculate')"
          @calculate="onCalculate"
        />
      </div>
    </main>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">{{ t('xingming.resultBanner.title') }}</h2>
      <div class="result-banner-sub">{{ t('xingming.resultBanner.subtitle') }}</div>
      <div class="result-banner-line" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('xingming.computeError.title') }}</h3>
          <p>{{ errorMessage || t('xingming.computeError.hint') }}</p>
          <button class="mn-btn mn-btn-outline" @click="onRecalculate">
            {{ t('xingming.computeError.retry') }}
          </button>
        </div>
      </main>

      <template v-else-if="result">
        <div ref="shareCardEl" class="xingming-share-card">
          <main class="mn-container xm-container" style="padding-top: 0;">
            <StrokesBreakdown :result="result" />
          </main>

          <hr class="mn-divider">

          <main class="mn-container xm-container" style="padding-top: 0;">
            <div class="xm-wuge-layout">
              <FiveGrids :result="result" />
              <GridDetail :result="result" />
            </div>
          </main>

          <hr class="mn-divider">

          <main class="mn-container xm-container" style="padding-top: 0;">
            <OverallGauge :result="result" />
            <p class="xm-disclaimer">{{ t('xingming.disclaimer') }}</p>
          </main>
        </div>

        <div class="actions mn-container">
          <button type="button" class="mn-btn" @click="onShare">{{ t('xingming.btn.share') }}</button>
          <button type="button" class="mn-btn mn-btn-outline" @click="onSave">{{ t('xingming.btn.save') }}</button>
          <button type="button" class="mn-btn mn-btn-ghost" @click="onRecalculate">{{ t('xingming.btn.recalculate') }}</button>
        </div>
      </template>
    </div>
  </template>

  <!-- 骨架遮罩（与 bazi / chenggu 保持一致的视觉体验） -->
  <div :class="['skeleton-overlay', { visible: skeleton.skeletonVisible.value }]">
    <div class="skeleton-card">
      <div class="skeleton-ring" />
      <div v-if="isGuofeng" class="skeleton-text">{{ t('xingming.skeleton.title') }}</div>
      <div v-else class="skeleton-title">{{ t('xingming.skeleton.title') }}</div>
      <div v-if="isGuofeng" class="skeleton-subtext">{{ t('xingming.skeleton.subtitle') }}</div>
      <div v-else class="skeleton-sub">{{ t('xingming.skeleton.subtitle') }}</div>
      <div class="skeleton-dots"><span>·</span><span>·</span><span>·</span></div>
    </div>
  </div>

  <ShareToast :state="toastState" />
</template>
