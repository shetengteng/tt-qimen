<script setup lang="ts">
import { computed, provide, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { BIRTH_STORE_KEY } from '@/composables/useBirthStore'
import BirthForm from '@/modules/bazi/components/BirthForm.vue'
import ShareToast from '@/components/common/ShareToast.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'
import WeightBalance from './components/WeightBalance.vue'
import WeightTable from './components/WeightTable.vue'
import PoemDisplay from './components/PoemDisplay.vue'
import InterpretBlock from './components/InterpretBlock.vue'
import { useChengguStore } from './stores/chengguStore'
import { calculateChenggu } from './core/chenggu'
import type { ChengguResult } from './types'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const chengguStore = useChengguStore()
provide(BIRTH_STORE_KEY, chengguStore)
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const shareCardEl = ref<HTMLElement | null>(null)

const result = shallowRef<ChengguResult | null>(null)

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
})

function onPaipan() {
  try {
    result.value = calculateChenggu(chengguStore.birth, localeStore.id)
  } catch (err) {
    console.error('[chenggu] calculate failed:', err)
    result.value = null
  }
  skeleton.start(() => resultBannerEl.value)
}

function onRepaipan() {
  result.value = null
  skeleton.reset(() => inputCardEl.value)
}

watch(
  () => localeStore.id,
  () => {
    if (!result.value) return
    try {
      result.value = calculateChenggu(chengguStore.birth, localeStore.id)
    } catch (err) {
      console.error('[chenggu] re-localize failed:', err)
    }
  },
)

function go(name: 'home') {
  router.push({ name })
}

const { toastState, shareCard, saveCard } = useShareCard()
function buildShareOpts() {
  const b = chengguStore.birth
  const mm = String(b.month).padStart(2, '0')
  const dd = String(b.day).padStart(2, '0')
  return {
    fileName: `chenggu-${b.year}-${mm}-${dd}-${b.gender}-${themeStore.id}`,
    title: t('chenggu.share.title'),
    text: t('chenggu.share.text'),
  }
}
function onShare() {
  shareCard(shareCardEl.value, buildShareOpts())
}
function onSave() {
  saveCard(shareCardEl.value, buildShareOpts())
}

const showComputeError = computed(() => skeleton.revealed.value && result.value === null)
</script>

<template>
  <!-- ============ 国风 ============ -->
  <main v-if="isGuofeng">
    <div class="gf-container">
      <div class="page-title">
        <h1>{{ t('chenggu.pageTitle') }}</h1>
        <div class="subtitle">{{ t('chenggu.pageSubtitle') }}</div>
      </div>

      <!-- 左：输入；右：天秤（国风两列布局）-->
      <div class="cg-layout">
        <div ref="inputCardEl">
          <BirthForm
            :title="t('chenggu.inputCardTitle')"
            :primary-label="t('chenggu.btn.paipan')"
            @paipan="onPaipan"
          />
        </div>
        <WeightBalance :result="result" />
      </div>
    </div>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">
        <span class="result-banner-decor">◈</span>
        {{ t('chenggu.resultBanner.title') }}
        <span class="result-banner-decor">◈</span>
      </h2>
      <div class="result-banner-subtitle">{{ t('chenggu.resultBanner.subtitle') }}</div>
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="compute-error-card">
        <h3>◈ {{ t('chenggu.computeError.title') }}</h3>
        <p>{{ t('chenggu.computeError.hint') }}</p>
        <button class="gf-btn gf-btn-outline" @click="onRepaipan">
          {{ t('chenggu.btn.repaipanIcon') }} {{ t('chenggu.computeError.retry') }}
        </button>
      </div>

      <template v-else-if="result">
        <div ref="shareCardEl" class="chenggu-share-card">
          <div class="gf-container" style="padding-top: 0;">
            <div class="gf-divider"><span>◆ {{ t('chenggu.section.breakdown') }} ◆</span></div>
            <WeightTable :result="result" />

            <div class="gf-divider">
              <span>◆ {{ result.poem.weight }} · {{ t('chenggu.section.poem') }} ◆</span>
            </div>
            <PoemDisplay :result="result" />
            <InterpretBlock :result="result" />
          </div>
        </div>

        <div class="action-bar">
          <button type="button" class="gf-btn" @click="onShare">
            {{ t('chenggu.btn.shareIcon') }} {{ t('chenggu.btn.share') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onSave">
            {{ t('chenggu.btn.saveIcon') }} {{ t('chenggu.btn.save') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onRepaipan">
            {{ t('chenggu.btn.repaipanIcon') }} {{ t('chenggu.btn.repaipan') }}
          </button>
        </div>
      </template>
    </div>
  </main>

  <!-- ============ 简约 ============ -->
  <template v-else>
    <main class="mn-container">
      <section class="page-hero">
        <div class="page-breadcrumb">
          <a href="#" @click.prevent="go('home')">{{ t('chenggu.breadcrumbHome') }}</a> /
          {{ t('chenggu.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('chenggu.pageTitle') }}</h1>
        <p>{{ t('chenggu.pageSubtitle') }}</p>
      </section>

      <div class="cg-layout">
        <div ref="inputCardEl">
          <BirthForm
            :title="t('chenggu.inputCardTitle')"
            :primary-label="t('chenggu.btn.paipan')"
            @paipan="onPaipan"
          />
        </div>
        <WeightBalance :result="result" />
      </div>
    </main>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">{{ t('chenggu.resultBanner.title') }}</h2>
      <div class="result-banner-sub">{{ t('chenggu.resultBanner.subtitle') }}</div>
      <div class="result-banner-line" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('chenggu.computeError.title') }}</h3>
          <p>{{ t('chenggu.computeError.hint') }}</p>
          <button class="mn-btn mn-btn-outline" @click="onRepaipan">
            {{ t('chenggu.computeError.retry') }}
          </button>
        </div>
      </main>

      <template v-else-if="result">
        <div ref="shareCardEl" class="chenggu-share-card">
          <main class="mn-container" style="padding-top: 0;">
            <WeightTable :result="result" />
          </main>

          <hr class="mn-divider">

          <main class="mn-container" style="padding-top: 0;">
            <PoemDisplay :result="result" />
            <InterpretBlock :result="result" />
          </main>
        </div>

        <div class="actions mn-container">
          <button type="button" class="mn-btn" @click="onShare">{{ t('chenggu.btn.share') }}</button>
          <button type="button" class="mn-btn mn-btn-outline" @click="onSave">{{ t('chenggu.btn.save') }}</button>
          <button type="button" class="mn-btn mn-btn-ghost" @click="onRepaipan">{{ t('chenggu.btn.repaipan') }}</button>
        </div>
      </template>
    </div>
  </template>

  <!-- 骨架遮罩 -->
  <div :class="['skeleton-overlay', { visible: skeleton.skeletonVisible.value }]">
    <div class="skeleton-card">
      <div class="skeleton-ring" />
      <div v-if="isGuofeng" class="skeleton-text">{{ t('chenggu.skeleton.title') }}</div>
      <div v-else class="skeleton-title">{{ t('chenggu.skeleton.title') }}</div>
      <div v-if="isGuofeng" class="skeleton-subtext">{{ t('chenggu.skeleton.subtitle') }}</div>
      <div v-else class="skeleton-sub">{{ t('chenggu.skeleton.subtitle') }}</div>
      <div class="skeleton-dots"><span>·</span><span>·</span><span>·</span></div>
    </div>
  </div>

  <ShareToast :state="toastState" />
</template>
