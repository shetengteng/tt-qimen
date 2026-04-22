<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareToast from '@/components/common/ShareToast.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'

import LingqianInput from './components/LingqianInput.vue'
import LotteryTube from './components/LotteryTube.vue'
import LingqianTitle from './components/LingqianTitle.vue'
import PoemDisplay from './components/PoemDisplay.vue'
import JieyueXianji from './components/JieyueXianji.vue'
import TopicTabs from './components/TopicTabs.vue'

import { useLingqianStore } from './stores/lingqianStore'
import { drawLingqian, TOPIC_KEYS, type TopicKey } from './core/lingqian'
import type { LingqianItem, LingqianResult } from './types'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const lingqianStore = useLingqianStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const shareCardEl = ref<HTMLElement | null>(null)
const tubeSceneEl = ref<HTMLElement | null>(null)

const result = shallowRef<LingqianResult | null>(null)
const currentTopic = ref<TopicKey>('family')

/** 抽签中标志：驱动 LotteryTube 的剧烈摇晃动画，并替代原全屏 skeleton 弹框 */
const drawing = ref(false)

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
  onReveal: () => {
    drawing.value = false
  },
})

function topicFromPreference(preferred: string): TopicKey {
  return (TOPIC_KEYS as readonly string[]).includes(preferred)
    ? (preferred as TopicKey)
    : 'family'
}

function onPaipan() {
  let item: LingqianItem | null = null
  try {
    item = drawLingqian({ lastId: lingqianStore.lastId })
  } catch (err) {
    console.error('[lingqian] draw failed:', err)
    item = null
  }

  if (item) {
    lingqianStore.recordDraw(item.id)
    result.value = {
      item,
      drawnAt: Date.now(),
      question: lingqianStore.question || undefined,
      topic: lingqianStore.preferredTopic,
    }
    currentTopic.value = topicFromPreference(lingqianStore.preferredTopic)
  } else {
    result.value = null
  }

  drawing.value = true
  skeleton.scrollTo(tubeSceneEl.value, 80)
  skeleton.start(() => resultBannerEl.value)
}

function onRepaipan() {
  result.value = null
  drawing.value = false
  skeleton.reset(() => inputCardEl.value)
}

function go(name: 'home') {
  router.push({ name })
}

const { toastState, shareCard, saveCard } = useShareCard()
function buildShareOpts() {
  const item = result.value?.item
  return {
    fileName: `lingqian-${item?.id ?? 'idle'}-${themeStore.id}`,
    title: t('lingqian.share.title'),
    text: t('lingqian.share.text'),
  }
}
function onShare() {
  shareCard(shareCardEl.value, buildShareOpts())
}
function onSave() {
  saveCard(shareCardEl.value, buildShareOpts())
}

const showComputeError = computed(() => skeleton.revealed.value && result.value === null)

onMounted(() => {
  currentTopic.value = topicFromPreference(lingqianStore.preferredTopic)
})

watch(
  () => lingqianStore.preferredTopic,
  (next) => {
    if (!result.value) currentTopic.value = topicFromPreference(next)
  },
)
</script>

<template>
  <!-- ============ 国风 ============ -->
  <main v-if="isGuofeng">
    <div class="gf-container">
      <div class="page-title">
        <h1>{{ t('lingqian.pageTitle') }}</h1>
        <div class="subtitle">{{ t('lingqian.pageSubtitle') }}</div>
      </div>

      <div ref="inputCardEl">
        <LingqianInput @paipan="onPaipan" @reset="onRepaipan" />
      </div>

      <div ref="tubeSceneEl">
        <LotteryTube :drawing="drawing" />
      </div>
    </div>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">
        <span class="result-banner-decor">◈</span>
        {{ t('lingqian.resultBanner.title') }}
        <span class="result-banner-decor">◈</span>
      </h2>
      <div class="result-banner-subtitle">{{ t('lingqian.resultBanner.subtitle') }}</div>
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="compute-error-card">
        <h3>◈ {{ t('lingqian.computeError.title') }}</h3>
        <p>{{ t('lingqian.computeError.hint') }}</p>
        <button class="gf-btn gf-btn-outline" @click="onRepaipan">
          {{ t('lingqian.btn.repaipanIcon') }} {{ t('lingqian.computeError.retry') }}
        </button>
      </div>

      <template v-else-if="result">
        <div ref="shareCardEl" class="lingqian-share-card">
          <div class="gf-container" style="padding-top: 0;">
            <div class="gf-divider">
              <span>◆ {{ t('lingqian.divider.qianTitle', {
                num: result.item.id,
                level: result.item.level,
              }) }} ◆</span>
            </div>

            <PoemDisplay :item="result.item">
              <template #header>
                <LingqianTitle :item="result.item" />
              </template>
            </PoemDisplay>

            <JieyueXianji :item="result.item" />

            <TopicTabs
              :item="result.item"
              :topic="currentTopic"
              @update:topic="currentTopic = $event"
            />
          </div>
        </div>

        <div class="action-bar">
          <button type="button" class="gf-btn" @click="onShare">
            {{ t('lingqian.btn.shareIcon') }} {{ t('lingqian.btn.share') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onSave">
            {{ t('lingqian.btn.saveIcon') }} {{ t('lingqian.btn.save') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onRepaipan">
            {{ t('lingqian.btn.repaipanIcon') }} {{ t('lingqian.btn.repaipan') }}
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
          <a href="#" @click.prevent="go('home')">{{ t('lingqian.breadcrumbHome') }}</a> /
          {{ t('lingqian.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('lingqian.pageTitle') }}</h1>
        <p>{{ t('lingqian.pageSubtitle') }}</p>
      </section>

      <div ref="inputCardEl">
        <LingqianInput @paipan="onPaipan" @reset="onRepaipan" />
      </div>

      <div ref="tubeSceneEl">
        <LotteryTube :drawing="drawing" />
      </div>
    </main>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl" class="result-banner revealed">
      <h2 class="result-banner-title">{{ t('lingqian.resultBanner.title') }}</h2>
      <div class="result-banner-sub">{{ t('lingqian.resultBanner.subtitle') }}</div>
      <div class="result-banner-line" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('lingqian.computeError.title') }}</h3>
          <p>{{ t('lingqian.computeError.hint') }}</p>
          <button class="mn-btn mn-btn-outline" @click="onRepaipan">
            {{ t('lingqian.computeError.retry') }}
          </button>
        </div>
      </main>

      <template v-else-if="result">
        <div ref="shareCardEl" class="lingqian-share-card">
          <main class="mn-container" style="padding-top: 0;">
            <PoemDisplay :item="result.item">
              <template #header>
                <LingqianTitle :item="result.item" />
              </template>
            </PoemDisplay>

            <JieyueXianji :item="result.item" />

            <TopicTabs
              :item="result.item"
              :topic="currentTopic"
              @update:topic="currentTopic = $event"
            />
          </main>
        </div>

        <div class="actions mn-container">
          <button type="button" class="mn-btn" @click="onShare">{{ t('lingqian.btn.share') }}</button>
          <button type="button" class="mn-btn mn-btn-outline" @click="onSave">{{ t('lingqian.btn.save') }}</button>
          <button type="button" class="mn-btn mn-btn-ghost" @click="onRepaipan">{{ t('lingqian.btn.repaipan') }}</button>
        </div>
      </template>
    </div>
  </template>

  <!-- 注：全屏 skeleton 遮罩已替换为签筒本体的"抽签中"剧烈摇晃动画（见 LotteryTube :drawing）。 -->

  <ShareToast :state="toastState" />
</template>
