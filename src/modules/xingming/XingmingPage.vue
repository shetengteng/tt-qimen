<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import ShareToast from '@/components/common/ShareToast.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'
import NameInput from './components/NameInput.vue'
import StrokesBreakdown from './components/StrokesBreakdown.vue'
import FiveGrids from './components/FiveGrids.vue'
import GridDetail from './components/GridDetail.vue'
import SancaiCard from './components/SancaiCard.vue'
import OverallGauge from './components/OverallGauge.vue'
import { useXingmingStore } from './stores/xingmingStore'
import { calculateXingming } from './core/xingming'
import { StrokesNotFoundError } from './core/strokes'
import { FortuneError, type FortuneErrorCode } from '@/lib/errors'
import type { NumerologyLocale } from './data/numerology'
import type { XingmingResult } from './types'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const store = useXingmingStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const shareCardEl = ref<HTMLElement | null>(null)

const result = shallowRef<XingmingResult | null>(null)
const errorMessage = ref<string | null>(null)

/**
 * 结构化错误状态（仅 FortuneError 路径用）；rareChar / 兜底走 errorMessage 字符串。
 * 同时存在两条管道是历史遗留 + 体验考量：
 *   - StrokesNotFoundError 已有定向 friendly 文案 + char 参数化，单独保留
 *   - FortuneError 走 byCode i18n 模板，未来加 locale 切换更自然
 */
interface ComputeErrorState {
  code: FortuneErrorCode
  details?: Readonly<Record<string, unknown>>
}
const computeError = ref<ComputeErrorState | null>(null)

/** 从任意 err 归一化为 ComputeErrorState（仅 FortuneError 时返回 non-null）。 */
function toComputeError(err: unknown): ComputeErrorState | null {
  if (FortuneError.is(err)) {
    return { code: err.code, details: err.details }
  }
  return null
}

/** 根据 code + details 取对应 i18n hint 文案。 */
const computeErrorHint = computed<string>(() => {
  const e = computeError.value
  if (!e) return errorMessage.value ?? t('xingming.computeError.hint')
  const d = e.details ?? {}
  switch (e.code) {
    case 'invalid-input': {
      const reason = d.reason as string | undefined
      const field = d.field as string | undefined
      if (reason === 'non-cjk' && field) {
        return t(`xingming.computeError.byCode.nonCjk.${field}`)
      }
      if (reason === 'empty' && field) {
        return t(`xingming.computeError.byCode.empty.${field}`)
      }
      if (reason === 'length' && field) {
        return t(`xingming.computeError.byCode.length.${field}`)
      }
      return t('xingming.computeError.byCode.invalidInput')
    }
    case 'dep-load-failed':
      return t('xingming.computeError.byCode.depLoadFailed')
    case 'invariant':
      return t('xingming.computeError.byCode.invariant')
    default:
      return t('xingming.computeError.byCode.unknown')
  }
})

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
})

/** 把 locale store id 收敛为 81 数理表支持的 locale；其它/未知值回退到简体 */
function asNumerologyLocale(id: string): NumerologyLocale {
  if (id === 'zh-TW' || id === 'en') return id
  return 'zh-CN'
}

async function runCalculate(silent = false) {
  if (!silent) {
    errorMessage.value = null
    computeError.value = null
  }
  try {
    result.value = await calculateXingming(
      store.input,
      asNumerologyLocale(localeStore.id),
    )
    computeError.value = null
    errorMessage.value = null
    // 成功路径才记 lastComputed —— 失败 (rareChar / FortuneError) 不应让下次刷新自动恢复错误页
    store.recordComputed(store.input)
  } catch (err) {
    if (err instanceof StrokesNotFoundError) {
      errorMessage.value = t('xingming.computeError.rareChar', { char: err.char })
      computeError.value = null
    } else if (FortuneError.is(err)) {
      computeError.value = toComputeError(err)
      errorMessage.value = null
      console.warn('[xingming] FortuneError:', err.code, err.details)
    } else {
      computeError.value = { code: 'unknown' }
      errorMessage.value = null
      console.error('[xingming] calculate failed (non-FortuneError):', err)
    }
    result.value = null
    // 失败路径主动清掉 lastComputed，避免后续被错误恢复
    store.clearComputed()
  }
}

async function onCalculate() {
  await runCalculate(false)
  skeleton.start(() => resultBannerEl.value)
}

// 已有结果时，跟随 locale 切换静默重算（不重放骨架动画）
watch(
  () => localeStore.id,
  async () => {
    if (result.value) await runCalculate(true)
  },
)

/**
 * onMounted 缓存恢复（2026-04-26 P-A 缓存轮）：
 *   - 若 store 中存在 lastComputed 快照、且与当前 input 一致 → silent runCalculate + revealImmediately
 *   - 用户体验：刷新页面 / 跨 session 进入，上次结果直接出现在视野，无需再点"开始测名"
 *   - 失败的输入不会被恢复（runCalculate 失败时主动 clearComputed，见上方）
 */
onMounted(async () => {
  if (store.shouldRestore()) {
    await runCalculate(true)
    if (result.value) {
      skeleton.revealImmediately()
    }
  }
})

function onRecalculate() {
  result.value = null
  errorMessage.value = null
  computeError.value = null
  store.clearComputed() // 重新测算时不要保留 cached 状态
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
  () =>
    skeleton.revealed.value
    && result.value === null
    && (errorMessage.value !== null || computeError.value !== null),
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
        <p>{{ computeErrorHint }}</p>
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

            <div class="gf-divider"><span>◆ {{ t('xingming.section.sancai') }} ◆</span></div>

            <SancaiCard :result="result" />

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
          <p>{{ computeErrorHint }}</p>
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
            <SancaiCard :result="result" />
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
