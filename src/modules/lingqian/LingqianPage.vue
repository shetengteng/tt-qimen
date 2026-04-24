<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareToast from '@/components/common/ShareToast.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'

import LingqianInput from './components/LingqianInput.vue'
import LotteryTube from './components/LotteryTube.vue'
import LotteryCenterpiece, { type CenterpieceStage } from './components/LotteryCenterpiece.vue'
import LingqianTitle from './components/LingqianTitle.vue'
import PoemDisplay from './components/PoemDisplay.vue'
import JieyueXianji from './components/JieyueXianji.vue'
import TopicTabs from './components/TopicTabs.vue'

import { useLingqianStore } from './stores/lingqianStore'
import {
  drawLingqian,
  getLingqianItemById,
  loadGuanyinData,
  TOPIC_KEYS,
  type LingqianLocale,
  type TopicKey,
} from './core/lingqian'
import type { LingqianItem, LingqianResult } from './types'

const { t, locale } = useI18n()

/** 把 vue-i18n 的 locale 字符串窄化为 lingqian core 接受的 LingqianLocale（未知回落 zh-CN）。 */
function normalizeLocale(v: unknown): LingqianLocale {
  if (v === 'zh-TW' || v === 'en' || v === 'zh-CN') return v
  return 'zh-CN'
}
const lingqianLocale = computed<LingqianLocale>(() => normalizeLocale(locale.value))
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

/** 抽签中标志：驱动 LotteryTube 的剧烈摇晃动画 */
const drawing = ref(false)

/** 中央特写阶段：hidden → flying → showing → holding → fading → hidden */
const centerpieceStage = ref<CenterpieceStage>('hidden')

/**
 * 抽签仪式时序（与两主题 CSS 对齐）：
 *   t=0     点击启签 · drawing=true · centerpieceStage='flying' · 签筒开始剧烈抖
 *   t=1500  centerpieceStage='showing'：放大签条落定、签号/等级/标题淡入
 *   t=1700  centerpieceStage='holding'：阅读停留 1500ms
 *   t=3200  centerpieceStage='fading'：特写开始淡出（400ms）
 *   t=3600  centerpieceStage='hidden' · drawing=false · 触发 skeleton.start()
 *           · Vue <Transition> 开始 leave 过渡（300ms）
 *   t=3950  Transition leave 完成、节点出 DOM · skeleton reveal · 结果区淡入
 *
 * 严格串行：用户要求"动画完全结束后再显示结果区"。skeleton.start() 放在 hidden 阶段，
 * 内部 delay=350ms（= Transition leave 300ms + 50ms 缓冲）保证特写节点真正出 DOM 后
 * 才揭示 banner，不再有任何叠化/抢节奏。
 *
 * reduced-motion 场景：整个仪式压缩到 ~1.5s，特写仅做 fade-in/out、不做变换；
 * 结果区同样等 Transition 完全结束后再淡入，保持叙事完整。
 */
const TIMELINE = {
  showing: 1500,
  holding: 1700,
  fading: 3200,
  hidden: 3600,
  // hidden → skeleton.reveal 的间隔（= Transition leave 300ms + 50ms 缓冲，确保 DOM 脱钩后再揭示）
  skeletonDelayAfterHidden: 350,
} as const
const RM_TIMELINE = {
  showing: 200,
  holding: 300,
  fading: 800,
  hidden: 1200,
  skeletonDelayAfterHidden: 250,
} as const

const paipanTimers: number[] = []
function clearPaipanTimers() {
  for (const id of paipanTimers) window.clearTimeout(id)
  paipanTimers.length = 0
}
function schedulePaipanStep(fn: () => void, ms: number) {
  const id = window.setTimeout(fn, ms)
  paipanTimers.push(id)
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const skeleton = useSkeletonReveal({
  // delay: centerpiece 进入 'hidden' 后，等 Vue <Transition> leave（300ms） + 50ms 缓冲 = 350ms
  // 再让 reveal 翻转为 true，确保特写节点完全脱离视觉后才揭示结果区（严格 serial）。
  // 具体何时调用 start() 见 onPaipan 里 hidden 阶段的 schedulePaipanStep。
  // 注意：这里只用了非 RM 的 350ms；reduced-motion 用户视觉差异实际可忽略。
  delay: TIMELINE.skeletonDelayAfterHidden,
  scrollOffset: 30,
  scrollHoldMs: 280,
})

function topicFromPreference(preferred: string): TopicKey {
  return (TOPIC_KEYS as readonly string[]).includes(preferred)
    ? (preferred as TopicKey)
    : 'family'
}

function onPaipan() {
  clearPaipanTimers()

  // P4 快照恢复 / 上一次抽签遗留下来的 revealed=true + 旧 result：如果不先隐藏，下面写入 result.value
  // 会立刻在"还未淡出"的结果区暴露新签，用户感知为"动画出现前就泄露了结果"。这里先重置 skeleton、
  // 清空 result，等下面 draw 完再写入。inputCardEl 作为滚动锚，让视觉焦点回到签筒上方。
  skeleton.reset(() => inputCardEl.value)
  result.value = null

  let item: LingqianItem | null = null
  try {
    item = drawLingqian({ lastId: lingqianStore.lastId, locale: lingqianLocale.value })
  } catch (err) {
    console.error('[lingqian] draw failed:', err)
    item = null
  }

  if (item) {
    const drawnAt = Date.now()
    const topic = lingqianStore.preferredTopic
    const question = lingqianStore.question || undefined
    lingqianStore.recordDraw(item.id, { topic, question, drawnAt })
    result.value = { item, drawnAt, question, topic }
    currentTopic.value = topicFromPreference(topic)
  }

  drawing.value = true
  centerpieceStage.value = 'flying'
  skeleton.scrollTo(tubeSceneEl.value, 80)

  const timeline = prefersReducedMotion() ? RM_TIMELINE : TIMELINE
  schedulePaipanStep(() => { centerpieceStage.value = 'showing' }, timeline.showing)
  schedulePaipanStep(() => { centerpieceStage.value = 'holding' }, timeline.holding)
  schedulePaipanStep(() => { centerpieceStage.value = 'fading' }, timeline.fading)
  schedulePaipanStep(() => {
    centerpieceStage.value = 'hidden'
    drawing.value = false
    skeleton.start(() => resultBannerEl.value)
  }, timeline.hidden)
}

function onRepaipan() {
  clearPaipanTimers()
  result.value = null
  drawing.value = false
  centerpieceStage.value = 'hidden'
  lingqianStore.clearLastResult()
  skeleton.reset(() => inputCardEl.value)
}

/**
 * 刷新 / 切换窗口回来后，若 store 里有 lastResult，重建已抽结果并跳过全套抽签动画，
 * 让用户看到上一次的签文（P4 · 按签 ID 缓存）。
 *
 * 关键点：
 *   - 数据集加载要在 restore 之前完成（getLingqianItemById 读的是同 locale 缓存）
 *   - 不触发 skeleton 动画：直接让 revealed 立即为 true，避免骨架闪一下
 *   - 若缓存里找不到该 id（比如数据集版本更迭），清空快照避免脏状态
 */
function tryRestoreLastResult() {
  const snap = lingqianStore.lastResult
  if (!snap || snap.itemId <= 0) return
  const item = getLingqianItemById(snap.itemId, lingqianLocale.value)
  if (!item) {
    lingqianStore.clearLastResult()
    return
  }
  result.value = {
    item,
    drawnAt: snap.drawnAt,
    question: snap.question || undefined,
    topic: snap.topic,
  }
  currentTopic.value = topicFromPreference(snap.topic)
  centerpieceStage.value = 'hidden'
  drawing.value = false
  skeleton.revealImmediately()
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
  void loadGuanyinData(lingqianLocale.value).then(() => {
    tryRestoreLastResult()
  })
})

// 语言切换：懒加载对应数据集；若当前已有结果，结果文本不会立即改变（上一轮抽得的 item 固定），
// 用户点"再摇"/下次抽签时自动用新 locale 的数据。保持当前观感稳定。
watch(lingqianLocale, (next) => {
  void loadGuanyinData(next)
})

onUnmounted(() => {
  clearPaipanTimers()
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
                level: t(`lingqian.level.${result.item.level}`),
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

  <!--
    抽签仪式分三幕：
      1. 签筒剧烈摇晃（LotteryTube :drawing）
      2. 中央特写 overlay 上浮：签号 + 等级 + 典故标题（LotteryCenterpiece :stage）
      3. 特写淡出 + 结果区淡入（200ms 叠化）
    原全屏 skeleton 遮罩已退役。
  -->
  <LotteryCenterpiece :item="result?.item ?? null" :stage="centerpieceStage" />

  <ShareToast :state="toastState" />
</template>
