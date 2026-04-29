<script setup lang="ts">
import { computed, onMounted, provide, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { BIRTH_STORE_KEY } from '@/composables/useBirthStore'
import BirthForm from '@/components/common/BirthForm.vue'
import AskAiButton from '@/components/ai/AskAiButton.vue'
import { useAiSidebarStore } from '@/stores/aiSidebar'
import ShareToast from '@/components/common/ShareToast.vue'
import SharePreviewDialog from '@/components/common/SharePreviewDialog.vue'
import ResultBanner from '@/components/common/ResultBanner.vue'
import { Button } from '@/components/ui/button'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'
import { buildShareUrl, normalizeQuery, readIntInRange } from '@/lib/shareUrl'
import WeightBalance from './components/WeightBalance.vue'
import WeightTable from './components/WeightTable.vue'
import PoemDisplay from './components/PoemDisplay.vue'
import InterpretBlock from './components/InterpretBlock.vue'
import { useChengguStore } from './stores/chengguStore'
import { calculateChenggu } from './core/chenggu'
import type { ChengguResult } from './types'

const { t } = useI18n()
const route = useRoute()
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

const aiSidebar = useAiSidebarStore()
const aiUserContext = computed(() => ({
  gender: chengguStore.birth.gender,
}))

function onAskAi() {
  if (!result.value) return
  aiSidebar.show({
    moduleId: 'chenggu',
    chart: result.value,
    userContext: aiUserContext.value,
  })
}

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

const { toastState, shareCard, saveCard, previewCard } = useShareCard()
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

/**
 * Deeplink 用 query：仅取参与称骨计算的最小必要字段（calendar/year/month/day/hour/gender）。
 * 排除 minute / longitude / birthplace —— 称骨算法不依赖这些字段。
 */
const shareUrl = computed(() => {
  const b = chengguStore.birth
  return buildShareUrl('chenggu', {
    calendar: b.calendar,
    year: b.year,
    month: b.month,
    day: b.day,
    hour: b.hour,
    gender: b.gender,
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

/**
 * 扫码进入：若 URL 带 calendar/year/.../gender 等字段，hydrate 到 store 并自动排盘一次。
 *
 * 仅在 onMounted 一次性消费 query；后续用户编辑表单不再受 query 影响。
 * 不在 watch route 内重复触发，避免 push 时（含路由 query 变化）出现意外重排盘。
 */
onMounted(() => {
  const q = normalizeQuery(route.query as Record<string, string | string[] | undefined>)
  const hasInputs = ['year', 'month', 'day', 'hour'].some((k) => k in q)
  if (!hasInputs) return

  const b = chengguStore.birth
  chengguStore.update({
    calendar: q.calendar === 'lunar' ? 'lunar' : 'solar',
    year: readIntInRange(q, 'year', 1900, 2100, b.year),
    month: readIntInRange(q, 'month', 1, 12, b.month),
    day: readIntInRange(q, 'day', 1, 31, b.day),
    hour: readIntInRange(q, 'hour', 0, 23, b.hour),
    gender: q.gender === 'female' ? 'female' : 'male',
  })
  // nextTick 等 BirthForm 同步状态再 paipan，避免输入框还停在旧值
  void Promise.resolve().then(() => onPaipan())
})

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
            :show-advanced="false"
            @paipan="onPaipan"
          />
        </div>
        <WeightBalance :result="result" />
      </div>
    </div>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="chenggu.resultBanner.title" subtitle-key="chenggu.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="compute-error-card">
        <h3>◈ {{ t('chenggu.computeError.title') }}</h3>
        <p>{{ t('chenggu.computeError.hint') }}</p>
        <Button type="button" variant="outline" @click="onRepaipan">
          {{ t('chenggu.btn.repaipanIcon') }} {{ t('chenggu.computeError.retry') }}
        </Button>
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
          <Button type="button" variant="default" @click="onPreview">
            {{ t('chenggu.btn.shareIcon') }} {{ t('chenggu.btn.share') }}
          </Button>
          <AskAiButton :disabled="!result" @click="onAskAi" />
          <Button type="button" variant="outline" @click="onRepaipan">
            {{ t('chenggu.btn.repaipanIcon') }} {{ t('chenggu.btn.repaipan') }}
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
            :show-advanced="false"
            @paipan="onPaipan"
          />
        </div>
        <WeightBalance :result="result" />
      </div>
    </main>

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="chenggu.resultBanner.title" subtitle-key="chenggu.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('chenggu.computeError.title') }}</h3>
          <p>{{ t('chenggu.computeError.hint') }}</p>
          <Button type="button" variant="outline" @click="onRepaipan">
            {{ t('chenggu.computeError.retry') }}
          </Button>
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
          <Button type="button" variant="default" @click="onPreview">{{ t('chenggu.btn.share') }}</Button>
          <AskAiButton :disabled="!result" @click="onAskAi" />
          <Button type="button" variant="ghost" @click="onRepaipan">{{ t('chenggu.btn.repaipan') }}</Button>
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

  <SharePreviewDialog
    v-model:open="previewOpen"
    :image="previewImage"
    :share-url="shareUrl"
    :disabled="!previewImage"
    @save="onSave"
    @share="onShare"
  />
  <ShareToast :state="toastState" />

</template>
