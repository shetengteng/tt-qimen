<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import ShareToast from '@/components/common/ShareToast.vue'
import SharePreviewDialog from '@/components/common/SharePreviewDialog.vue'
import ResultBanner from '@/components/common/ResultBanner.vue'
import { Button } from '@/components/ui/button'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'
import { buildShareUrl, normalizeQuery, readIntInRange } from '@/lib/shareUrl'
import AskAiButton from '@/components/ai/AskAiButton.vue'
import { useAiSidebarStore } from '@/stores/aiSidebar'
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
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const store = useXingmingStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const shareCardEl = ref<HTMLElement | null>(null)

const result = shallowRef<XingmingResult | null>(null)

const aiSidebar = useAiSidebarStore()
function onAskAi() {
  if (!result.value) return
  aiSidebar.show({ moduleId: 'xingming', chart: result.value })
}
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
 * onMounted 缓存恢复（2026-04-26 P-A 缓存轮）+ 扫码 deeplink hydrate：
 *   - URL 带 surname/givenName 等字段时优先消费，写入 store 后立即 runCalculate
 *   - 否则走原有缓存恢复路径（lastComputed 与当前 input 一致 → silent runCalculate）
 *
 * 失败的输入不会被恢复（runCalculate 失败时主动 clearComputed）。
 */
onMounted(async () => {
  const q = normalizeQuery(route.query as Record<string, string | string[] | undefined>)
  const hasInputs = 'surname' in q || 'givenName' in q
  if (hasInputs) {
    const surname = (q.surname || '').slice(0, 2).trim()
    const givenName = (q.givenName || '').slice(0, 2).trim()
    if (surname && givenName) {
      const birthYear = readIntInRange(q, 'birthYear', 1900, 2100, 0)
      store.update({
        surname,
        givenName,
        gender: q.gender === 'female' ? 'female' : 'male',
        birthYear: birthYear > 0 ? birthYear : null,
      })
      await runCalculate(true)
      if (result.value) {
        skeleton.revealImmediately()
      }
      return
    }
  }

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

const { toastState, shareCard, saveCard, previewCard } = useShareCard()
function buildShareOpts() {
  const fullName = store.input.surname + store.input.givenName
  return {
    fileName: `xingming-${fullName}-${themeStore.id}`,
    title: t('xingming.share.title'),
    text: t('xingming.share.text'),
  }
}

/**
 * Deeplink 参数：surname/givenName 是中文字符，URLSearchParams 会自动 percent-encode；
 * birthYear 可选（仅五行起名扩展用，且影响很小，但仍纳入以确保扫码后命名口径一致）。
 */
const shareUrl = computed(() => {
  const i = store.input
  return buildShareUrl('xingming', {
    surname: i.surname,
    givenName: i.givenName,
    gender: i.gender,
    birthYear: i.birthYear ?? null,
  })
})

const previewOpen = ref(false)
const previewImage = ref('')

async function onPreview() {
  previewImage.value = ''
  previewOpen.value = true
  previewImage.value = await previewCard(shareCardEl.value, {})
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

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="xingming.resultBanner.title" subtitle-key="xingming.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="compute-error-card">
        <h3>◈ {{ t('xingming.computeError.title') }}</h3>
        <p>{{ computeErrorHint }}</p>
        <Button type="button" variant="outline" @click="onRecalculate">
          ✎ {{ t('xingming.computeError.retry') }}
        </Button>
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
          <Button type="button" variant="default" @click="onPreview">
            ◈ {{ t('xingming.btn.share') }}
          </Button>
          <AskAiButton :disabled="!result" @click="onAskAi" />
          <Button type="button" variant="outline" @click="onRecalculate">
            ✎ {{ t('xingming.btn.recalculate') }}
          </Button>
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

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="xingming.resultBanner.title" subtitle-key="xingming.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('xingming.computeError.title') }}</h3>
          <p>{{ computeErrorHint }}</p>
          <Button type="button" variant="outline" @click="onRecalculate">
            {{ t('xingming.computeError.retry') }}
          </Button>
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
          <Button type="button" variant="default" @click="onPreview">{{ t('xingming.btn.share') }}</Button>
          <AskAiButton :disabled="!result" @click="onAskAi" />
          <Button type="button" variant="ghost" @click="onRecalculate">{{ t('xingming.btn.recalculate') }}</Button>
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

  <SharePreviewDialog
    v-model:open="previewOpen"
    :image="previewImage"
    :share-url="shareUrl"
    :disabled="!previewImage"
    @save="onSave"
    @share="onShare"
  />

</template>
