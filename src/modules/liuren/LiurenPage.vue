<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareToast from '@/components/common/ShareToast.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'

import LiurenInput from './components/LiurenInput.vue'
import TimeBar from './components/TimeBar.vue'
import PalaceWheel from './components/PalaceWheel.vue'
import AspectReading from './components/AspectReading.vue'

import { useLiurenStore } from './stores/liurenStore'
import { calculateLiuren } from './core/liuren'
import { seedFromDate, formatCustomLabel } from './core/immediate'
import type { Aspect, LiurenResult } from './types'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const liurenStore = useLiurenStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const shareCardEl = ref<HTMLElement | null>(null)

const result = shallowRef<LiurenResult | null>(null)

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
})

/**
 * "now" 仅用于 immediate 模式的速览展示；首屏挂载后每分钟自动刷新一次，
 * 避免 TimeBar 上方的农历/时辰长期停留在挂载时刻。
 * 起卦动作发生在 onPaipan 内、单独再 seedFromDate(new Date()) 一次保证准确。
 */
const now = ref(new Date())
let timer: number | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (timer != null) {
    clearInterval(timer)
    timer = null
  }
})

const immediateSeed = computed(() => seedFromDate(now.value))

const customSeed = computed(() => {
  const c = liurenStore.custom
  const labels = formatCustomLabel(c.month, c.day, c.hourIndex)
  return {
    month: c.month,
    day: c.day,
    hour: c.hourIndex,
    lunarDateLabel: labels.lunarDateLabel,
    hourBranchLabel: labels.hourBranchLabel,
  }
})

const displaySeed = computed(() =>
  liurenStore.mode === 'immediate' ? immediateSeed.value : customSeed.value,
)

function onPaipan() {
  try {
    const seed = liurenStore.mode === 'immediate'
      ? seedFromDate(new Date())
      : customSeed.value
    result.value = calculateLiuren({
      month: seed.month,
      day: seed.day,
      hour: seed.hour,
      lunarDateLabel: seed.lunarDateLabel,
      hourBranchLabel: seed.hourBranchLabel,
      aspect: liurenStore.aspect,
      question: liurenStore.question,
    })
  } catch (err) {
    console.error('[liuren] calculate failed:', err)
    result.value = null
  }
  skeleton.start(() => resultBannerEl.value)
}

function onRepaipan() {
  result.value = null
  skeleton.reset(() => inputCardEl.value)
}

function onUpdateAspect(v: Aspect) {
  liurenStore.setAspect(v)
  if (result.value) {
    result.value = { ...result.value, aspect: v }
  }
}

function go(name: 'home') {
  router.push({ name })
}

const { toastState, shareCard, saveCard } = useShareCard()
function buildShareOpts() {
  const seed = liurenStore.mode === 'immediate' ? seedFromDate(new Date()) : customSeed.value
  return {
    fileName: `liuren-${seed.month}-${seed.day}-${seed.hour}-${themeStore.id}`,
    title: t('liuren.share.title'),
    text: t('liuren.share.text'),
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
        <h1>{{ t('liuren.pageTitle') }}</h1>
        <div class="subtitle">{{ t('liuren.pageSubtitle') }}</div>
      </div>

      <TimeBar
        :lunar-date-label="displaySeed.lunarDateLabel"
        :hour-branch-label="displaySeed.hourBranchLabel"
        :path="result?.path ?? []"
      />

      <div ref="inputCardEl">
        <LiurenInput
          :current-hour-label="immediateSeed.hourBranchLabel"
          @paipan="onPaipan"
          @reset="onRepaipan"
        />
      </div>
    </div>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">
        <span class="result-banner-decor">◈</span>
        {{ t('liuren.resultBanner.title') }}
        <span class="result-banner-decor">◈</span>
      </h2>
      <div class="result-banner-subtitle">{{ t('liuren.resultBanner.subtitle') }}</div>
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="compute-error-card">
        <h3>◈ {{ t('liuren.computeError.title') }}</h3>
        <p>{{ t('liuren.computeError.hint') }}</p>
        <button class="gf-btn gf-btn-outline" @click="onRepaipan">
          {{ t('liuren.btn.repaipanIcon') }} {{ t('liuren.computeError.retry') }}
        </button>
      </div>

      <template v-else-if="result">
        <div ref="shareCardEl" class="liuren-share-card">
          <div class="gf-container" style="padding-top: 0;">
            <PalaceWheel :current="result.palace.name" :path="result.path" />

            <AspectReading
              :aspect="liurenStore.aspect"
              :result="result"
              @update:aspect="onUpdateAspect"
            />
          </div>
        </div>

        <div class="action-bar">
          <button type="button" class="gf-btn" @click="onShare">
            {{ t('liuren.btn.shareIcon') }} {{ t('liuren.btn.share') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onSave">
            {{ t('liuren.btn.saveIcon') }} {{ t('liuren.btn.save') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onRepaipan">
            {{ t('liuren.btn.repaipanIcon') }} {{ t('liuren.btn.repaipan') }}
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
          <a href="#" @click.prevent="go('home')">{{ t('liuren.breadcrumbHome') }}</a> /
          {{ t('liuren.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('liuren.pageTitle') }}</h1>
        <p>{{ t('liuren.pageSubtitle') }}</p>
      </section>

      <TimeBar
        :lunar-date-label="displaySeed.lunarDateLabel"
        :hour-branch-label="displaySeed.hourBranchLabel"
        :path="result?.path ?? []"
      />

      <div ref="inputCardEl">
        <LiurenInput
          :current-hour-label="immediateSeed.hourBranchLabel"
          @paipan="onPaipan"
          @reset="onRepaipan"
        />
      </div>
    </main>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">{{ t('liuren.resultBanner.title') }}</h2>
      <div class="result-banner-sub">{{ t('liuren.resultBanner.subtitle') }}</div>
      <div class="result-banner-line" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('liuren.computeError.title') }}</h3>
          <p>{{ t('liuren.computeError.hint') }}</p>
          <button class="mn-btn mn-btn-outline" @click="onRepaipan">
            {{ t('liuren.computeError.retry') }}
          </button>
        </div>
      </main>

      <template v-else-if="result">
        <div ref="shareCardEl" class="liuren-share-card">
          <main class="mn-container" style="padding-top: 0;">
            <PalaceWheel :current="result.palace.name" :path="result.path" />
            <AspectReading
              :aspect="liurenStore.aspect"
              :result="result"
              @update:aspect="onUpdateAspect"
            />
          </main>
        </div>

        <div class="actions mn-container">
          <button type="button" class="mn-btn" @click="onShare">{{ t('liuren.btn.share') }}</button>
          <button type="button" class="mn-btn mn-btn-outline" @click="onSave">{{ t('liuren.btn.save') }}</button>
          <button type="button" class="mn-btn mn-btn-ghost" @click="onRepaipan">{{ t('liuren.btn.repaipan') }}</button>
        </div>
      </template>
    </div>
  </template>

  <!-- 骨架遮罩 -->
  <div :class="['skeleton-overlay', { visible: skeleton.skeletonVisible.value }]">
    <div class="skeleton-card">
      <div class="skeleton-ring" />
      <div v-if="isGuofeng" class="skeleton-text">{{ t('liuren.skeleton.title') }}</div>
      <div v-else class="skeleton-title">{{ t('liuren.skeleton.title') }}</div>
      <div v-if="isGuofeng" class="skeleton-subtext">{{ t('liuren.skeleton.subtitle') }}</div>
      <div v-else class="skeleton-sub">{{ t('liuren.skeleton.subtitle') }}</div>
      <div class="skeleton-dots"><span>·</span><span>·</span><span>·</span></div>
    </div>
  </div>

  <ShareToast :state="toastState" />
</template>
