<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import ShareToast from '@/components/common/ShareToast.vue'
import SharePreviewDialog from '@/components/common/SharePreviewDialog.vue'
import ResultBanner from '@/components/common/ResultBanner.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'
import { buildShareUrl, normalizeQuery, readIntInRange } from '@/lib/shareUrl'

import AskAiButton from '@/components/ai/AskAiButton.vue'
import { useAiSidebarStore } from '@/stores/aiSidebar'
import LiurenInput from './components/LiurenInput.vue'
import { Button } from '@/components/ui/button'
import TimeBar from './components/TimeBar.vue'
import PalaceWheel from './components/PalaceWheel.vue'
import AspectReading from './components/AspectReading.vue'

import { useLiurenStore } from './stores/liurenStore'
import { calculateLiuren } from './core/liuren'
import { seedFromDate, formatCustomLabel } from './core/immediate'
import type { Aspect, LiurenResult, PalaceName } from './types'
import { getLocalizedPalace, type LiurenLocale } from './data/palacesLocale'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const liurenStore = useLiurenStore()
const localeStore = useLocaleStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const inputCardEl = ref<HTMLElement | null>(null)
const resultBannerEl = ref<HTMLElement | null>(null)
const shareCardEl = ref<HTMLElement | null>(null)

const result = shallowRef<LiurenResult | null>(null)

/**
 * 标记本次结果是否来自 onMounted 静默恢复（而不是用户主动起卦）。
 *
 * 用途（仅当 mode=immediate 且 result 非空）：
 *   - 让 TimeBar 显示快照里的"起卦时刻"农历/时辰，而不是实时刷新的当前时间，
 *     避免"当前农历"+"昨日卦象"的视觉错位
 *   - 在结果区上方显示"上次于 X 时间起卦"提示带，让用户明确这是历史卦象
 *
 * 翻转时机：
 *   - true：onMounted shouldRestore 分支（刷新进入 / 跨日重访）
 *   - false：用户点"起卦"或"重新起卦"（onPaipan(false) / onRepaipan）
 *   - false：deeplink hydrate 路径（onPaipan(false) 通过 deeplink 触发）
 *
 * KeepAlive 切走再切回：onMounted 不重跑，restoredFromCache 维持原值；
 * 切走前是 false（用户主动起的卦）则保持 false，不会突然冒出提示带。
 */
const restoredFromCache = ref(false)

const aiSidebar = useAiSidebarStore()
function onAskAi() {
  if (!result.value) return
  aiSidebar.show({ moduleId: 'liuren', chart: result.value })
}
/**
 * 预览态：用户点击非命中宫位时记录，AspectReading 显示该宫的解读；
 * 退出预览（点命中宫 / 重置 / 重起卦）时设为 null。
 * 不污染 result 与 lastComputed —— 只是 UI 临时视图。
 */
const previewedPalace = shallowRef<PalaceName | null>(null)

const skeleton = useSkeletonReveal({
  delay: 1500,
  scrollOffset: 30,
  scrollHoldMs: 280,
})

/**
 * "now" 仅用于 immediate 模式的速览展示；激活后每分钟自动刷新一次，
 * 避免 TimeBar 上方的农历/时辰长期停留在挂载时刻。
 * 起卦动作发生在 onPaipan 内、单独再 seedFromDate(new Date()) 一次保证准确。
 *
 * KeepAlive：timer 启停跟随 onActivated/onDeactivated，避免用户切到其他模块后
 * 后台 setInterval 仍在 tick 浪费资源。onBeforeUnmount 兜底处理最终销毁。
 */
const now = ref(new Date())
let timer: number | null = null

function startNowTimer() {
  if (timer != null) return
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 60_000)
}

function stopNowTimer() {
  if (timer != null) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  /**
   * 扫码 deeplink hydrate：URL 带 mode/aspect/month/day/hourIndex 时优先消费，
   * 写入 liurenStore 后立即 paipan（覆盖默认的 shouldRestore 静默恢复）。
   *
   * question 不放入 query —— 太长，且属于个人心念，不在分享内容里复刻。
   *
   * KeepAlive 后 onMounted 只在首次挂载时跑一次，重复带 deeplink 进入同模块
   * 不会重新 hydrate（接受这个边缘 case 退化，保留首次扫码进入的核心场景）。
   */
  const q = normalizeQuery(route.query as Record<string, string | string[] | undefined>)
  const hasInputs = 'mode' in q || 'month' in q
  if (hasInputs) {
    if (q.mode === 'custom' || q.mode === 'immediate') {
      liurenStore.setMode(q.mode)
    }
    if (q.aspect && ['overall', 'love', 'career', 'wealth', 'health'].includes(q.aspect)) {
      liurenStore.setAspect(q.aspect as Aspect)
    }
    const c = liurenStore.custom
    liurenStore.setCustom({
      month: readIntInRange(q, 'month', 1, 12, c.month),
      day: readIntInRange(q, 'day', 1, 30, c.day),
      hourIndex: readIntInRange(q, 'hourIndex', 1, 12, c.hourIndex),
    })
    void Promise.resolve().then(() => onPaipan(false))
    return
  }

  /**
   * 缓存恢复：immediate / custom 两种模式都走 lastComputed 静默恢复（用户已选"永久缓存"策略）。
   * 区别：immediate 模式提示带 "上次于 X 时间起卦"；custom 模式不提示（用户自己选的月日时一目了然）。
   */
  if (liurenStore.shouldRestore) {
    restoredFromCache.value = true
    onPaipan(true)
  }
})

onActivated(() => {
  // 立即同步一次，避免 KeepAlive 缓存里 now 还停留在切走时刻
  now.value = new Date()
  startNowTimer()
})

onDeactivated(() => {
  stopNowTimer()
})

onBeforeUnmount(() => {
  stopNowTimer()
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

/**
 * TimeBar 显示用的 seed。immediate 模式有两种状态：
 *   - 用户主动起卦 / 未起卦：实时跟随 now，每分钟刷新
 *   - 静默恢复（restoredFromCache=true）：定格在快照的"起卦时刻"农历/时辰，与卦象数据一致
 * 这样避免"当前农历"显示当下、卦象却是昨日的视觉错位。
 */
const displaySeed = computed(() => {
  if (liurenStore.mode === 'custom') return customSeed.value
  if (restoredFromCache.value && liurenStore.lastComputed) {
    const snap = liurenStore.lastComputed
    return {
      month: snap.month,
      day: snap.day,
      hour: snap.hourIndex,
      lunarDateLabel: snap.lunarDateLabel,
      hourBranchLabel: snap.hourBranchLabel,
    }
  }
  return immediateSeed.value
})

/**
 * 起卦核心。
 *
 * 行为分支（按调用上下文）：
 *   - 普通起卦（silent=false）：用 immediate 模式 seedFromDate(new Date()) 或 custom 模式
 *     customSeed 计算，记录新的 lastComputed 快照（含 drawnAt = Date.now()）。
 *   - 静默恢复（silent=true，从 onMounted shouldRestore 触发）：优先复用 lastComputed
 *     里存的 seed —— 关键是 immediate 模式刷新后**不能**重新调 seedFromDate(new Date())，
 *     否则用户看到的是"今天的卦"但 drawnAt 仍是上次起卦时刻，自相矛盾。
 *     不重写 lastComputed.drawnAt，保持"上次起卦于 X"提示一致。
 *   - locale 切换静默重算（silent=true，从 watch locale 触发）：result 已存在时仅
 *     重算解读文案，seed 从 result 的现状读取（间接走 lastComputed 兜底）。
 *
 * 失败时清空缓存避免下次进入恢复一个脏值。
 */
function onPaipan(silent = false) {
  try {
    let seed: { month: number; day: number; hour: number; lunarDateLabel: string; hourBranchLabel: string }
    const snap = liurenStore.lastComputed
    if (silent && snap) {
      seed = {
        month: snap.month,
        day: snap.day,
        hour: snap.hourIndex,
        lunarDateLabel: snap.lunarDateLabel,
        hourBranchLabel: snap.hourBranchLabel,
      }
    } else {
      seed = liurenStore.mode === 'immediate'
        ? seedFromDate(new Date())
        : customSeed.value
    }
    result.value = calculateLiuren(
      {
        month: seed.month,
        day: seed.day,
        hour: seed.hour,
        lunarDateLabel: seed.lunarDateLabel,
        hourBranchLabel: seed.hourBranchLabel,
        aspect: liurenStore.aspect,
        question: liurenStore.question,
      },
      localeStore.id as LiurenLocale,
    )
    if (!silent) {
      // 仅普通起卦写新快照；silent 路径保留原 drawnAt
      liurenStore.recordComputed(seed)
      // 用户主动起卦的不是恢复态
      restoredFromCache.value = false
    }
  } catch (err) {
    console.error('[liuren] calculate failed:', err)
    result.value = null
    liurenStore.clearComputed()
    restoredFromCache.value = false
  }
  if (silent) {
    skeleton.revealImmediately()
  } else {
    skeleton.start(() => resultBannerEl.value)
  }
}

watch(
  () => localeStore.id,
  () => {
    if (result.value) onPaipan(true)
  },
)

function onRepaipan() {
  result.value = null
  previewedPalace.value = null
  restoredFromCache.value = false
  liurenStore.clearComputed()
  skeleton.reset(() => inputCardEl.value)
}

function onUpdateAspect(v: Aspect) {
  liurenStore.setAspect(v)
  if (result.value) {
    result.value = { ...result.value, aspect: v }
  }
}

function onPreviewPalace(name: PalaceName | null) {
  previewedPalace.value = name
}

/**
 * 给 AspectReading 的 result：默认走 result，如果 previewedPalace 有值则替换 palace 为该宫的本地化版本。
 * path / steps / lunarDateLabel 等 result 字段保留不变（保持上下文一致）。
 */
const displayedResult = computed<LiurenResult | null>(() => {
  if (!result.value) return null
  if (!previewedPalace.value || previewedPalace.value === result.value.palace.name) {
    return result.value
  }
  const localePalace = getLocalizedPalace(previewedPalace.value, localeStore.id as LiurenLocale)
  return { ...result.value, palace: localePalace }
})

const isPreviewing = computed(
  () => previewedPalace.value != null && result.value != null && previewedPalace.value !== result.value.palace.name,
)

/**
 * "上次于 X 时间起卦"提示用的相对时间文案。
 *
 * 仅当 immediate 模式 + restoredFromCache + lastComputed.drawnAt 有效时返回非 null。
 * custom 模式不显示（用户自定义的月日时已经从 TimeBar 直接看到）。
 *
 * 用 Intl.RelativeTimeFormat 走原生 i18n（zh-CN: "5 分钟前" / en: "5 minutes ago"），
 * 不引第三方依赖；< 1 分钟 fallback 到 i18n key `liuren.restored.justNow`，避免
 * Intl 在 numeric:'auto' 下输出"this minute / 0 分钟前"等奇怪格式。
 *
 * 不响应 now —— 用户切走再切回时 KeepAlive 不重渲染，文案"凝固"在恢复瞬间是可接受的；
 * 真要每分钟更新也会跟 setInterval 起卦计时器对齐，但这里属于过度优化。
 */
const restoredAtLabel = computed<string | null>(() => {
  if (!restoredFromCache.value) return null
  if (liurenStore.mode !== 'immediate') return null
  const snap = liurenStore.lastComputed
  if (!snap || !snap.drawnAt) return null
  const diffMs = Date.now() - snap.drawnAt
  if (diffMs < 60_000) return t('liuren.restored.justNow')
  const rtf = new Intl.RelativeTimeFormat(localeStore.id, { numeric: 'auto' })
  if (diffMs < 3_600_000) return rtf.format(-Math.floor(diffMs / 60_000), 'minute')
  if (diffMs < 86_400_000) return rtf.format(-Math.floor(diffMs / 3_600_000), 'hour')
  if (diffMs < 30 * 86_400_000) return rtf.format(-Math.floor(diffMs / 86_400_000), 'day')
  return rtf.format(-Math.floor(diffMs / (30 * 86_400_000)), 'month')
})

function go(name: 'home') {
  router.push({ name })
}

const { toastState, shareCard, saveCard, previewCard } = useShareCard()
function buildShareOpts() {
  const seed = liurenStore.mode === 'immediate' ? seedFromDate(new Date()) : customSeed.value
  return {
    fileName: `liuren-${seed.month}-${seed.day}-${seed.hour}-${themeStore.id}`,
    title: t('liuren.share.title'),
    text: t('liuren.share.text'),
  }
}

/**
 * Deeplink 参数：
 *  - immediate 模式：只带 mode（重新进入仍按当前时间起卦，时间维度自然变化即合理）
 *  - custom 模式：mode + aspect + 农历 month/day/hourIndex（足够复算 + 用户可见）
 *
 * question 不进 query：私人心念，且通常较长。
 */
const shareUrl = computed(() => {
  const m = liurenStore.mode
  if (m === 'immediate') {
    return buildShareUrl('liuren', { mode: 'immediate', aspect: liurenStore.aspect })
  }
  const c = liurenStore.custom
  return buildShareUrl('liuren', {
    mode: 'custom',
    aspect: liurenStore.aspect,
    month: c.month,
    day: c.day,
    hourIndex: c.hourIndex,
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
          @paipan="onPaipan(false)"
          @reset="onRepaipan"
        />
      </div>
    </div>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="liuren.resultBanner.title" subtitle-key="liuren.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="compute-error-card">
        <h3>◈ {{ t('liuren.computeError.title') }}</h3>
        <p>{{ t('liuren.computeError.hint') }}</p>
        <Button type="button" variant="outline" @click="onRepaipan">
          {{ t('liuren.btn.repaipanIcon') }} {{ t('liuren.computeError.retry') }}
        </Button>
      </div>

      <template v-else-if="result && displayedResult">
        <div v-if="restoredAtLabel" class="lr-restored-banner gf-container">
          <span>{{ t('liuren.restored.banner', { time: restoredAtLabel }) }}</span>
          <Button type="button" variant="outline" size="sm" @click="onRepaipan">
            {{ t('liuren.restored.freshen') }}
          </Button>
        </div>

        <div ref="shareCardEl" class="liuren-share-card">
          <div class="gf-container" style="padding-top: 0;">
            <PalaceWheel
              :current="result.palace.name"
              :preview="previewedPalace"
              :path="result.path"
              @preview="onPreviewPalace"
            />

            <div v-if="isPreviewing" class="lr-preview-banner">
              <span>{{ t('liuren.preview.viewing', { palace: displayedResult.palace.name }) }}</span>
              <Button type="button" variant="outline" size="sm" @click="onPreviewPalace(null)">
                {{ t('liuren.preview.back') }}
              </Button>
            </div>

            <AspectReading
              :aspect="liurenStore.aspect"
              :result="displayedResult"
              @update:aspect="onUpdateAspect"
            />
          </div>
        </div>

        <div class="action-bar">
          <Button type="button" variant="default" @click="onPreview">
            {{ t('liuren.btn.shareIcon') }} {{ t('liuren.btn.share') }}
          </Button>
          <AskAiButton :disabled="!result" @click="onAskAi" />
          <Button type="button" variant="outline" @click="onRepaipan">
            {{ t('liuren.btn.repaipanIcon') }} {{ t('liuren.btn.repaipan') }}
          </Button>
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
          @paipan="onPaipan(false)"
          @reset="onRepaipan"
        />
      </div>
    </main>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="liuren.resultBanner.title" subtitle-key="liuren.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('liuren.computeError.title') }}</h3>
          <p>{{ t('liuren.computeError.hint') }}</p>
          <Button type="button" variant="outline" @click="onRepaipan">
            {{ t('liuren.computeError.retry') }}
          </Button>
        </div>
      </main>

      <template v-else-if="result && displayedResult">
        <div v-if="restoredAtLabel" class="lr-restored-banner mn mn-container">
          <span>{{ t('liuren.restored.banner', { time: restoredAtLabel }) }}</span>
          <Button type="button" variant="outline" size="sm" @click="onRepaipan">
            {{ t('liuren.restored.freshen') }}
          </Button>
        </div>

        <div ref="shareCardEl" class="liuren-share-card">
          <main class="mn-container" style="padding-top: 0;">
            <PalaceWheel
              :current="result.palace.name"
              :preview="previewedPalace"
              :path="result.path"
              @preview="onPreviewPalace"
            />

            <div v-if="isPreviewing" class="lr-preview-banner mn">
              <span>{{ t('liuren.preview.viewing', { palace: displayedResult.palace.name }) }}</span>
              <Button type="button" variant="outline" size="sm" @click="onPreviewPalace(null)">
                {{ t('liuren.preview.back') }}
              </Button>
            </div>

            <AspectReading
              :aspect="liurenStore.aspect"
              :result="displayedResult"
              @update:aspect="onUpdateAspect"
            />
          </main>
        </div>

        <div class="actions mn-container">
          <Button type="button" variant="default" @click="onPreview">{{ t('liuren.btn.share') }}</Button>
          <AskAiButton :disabled="!result" @click="onAskAi" />
          <Button type="button" variant="ghost" @click="onRepaipan">{{ t('liuren.btn.repaipan') }}</Button>
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

  <SharePreviewDialog
    v-model:open="previewOpen"
    :image="previewImage"
    :share-url="shareUrl"
    :disabled="!previewImage"
    @save="onSave"
    @share="onShare"
  />

</template>
