<script setup lang="ts">
import { computed, onMounted, provide, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { BIRTH_STORE_KEY } from '@/composables/useBirthStore'
import BirthForm from '@/components/common/BirthForm.vue'
import CollapsibleSection from '@/components/common/CollapsibleSection.vue'
import ShareToast from '@/components/common/ShareToast.vue'
import SharePreviewDialog from '@/components/common/SharePreviewDialog.vue'
import ResultBanner from '@/components/common/ResultBanner.vue'
import { useSkeletonReveal } from '@/composables/useSkeletonReveal'
import { useShareCard } from '@/composables/useShareCard'
import { buildShareUrl, normalizeQuery, readIntInRange } from '@/lib/shareUrl'
import ZiweiMeta from './components/ZiweiMeta.vue'
import SihuaLegend from './components/SihuaLegend.vue'
import SanfangToggle from './components/SanfangToggle.vue'
import ZiweiPalaceChart from './components/ZiweiPalaceChart.vue'
import ZiweiMobile from './components/ZiweiMobile.vue'
import InterpretCards from './components/InterpretCards.vue'
import SoulPalaceView from './components/SoulPalaceView.vue'
import PalaceMajorView from './components/PalaceMajorView.vue'
import MinorStarsView from './components/MinorStarsView.vue'
import DaxianGrid from './components/DaxianGrid.vue'
import DecadalDetail from './components/DecadalDetail.vue'
import ZiweiYear from './components/ZiweiYear.vue'
import { buildZiweiChart, prefetchZiweiEngine } from './core/ziwei'
import { useZiweiStore } from './stores/ziweiStore'
import type { ZiweiChart } from './types'

const { t } = useI18n()
const route = useRoute()
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

async function onPaipan() {
  skeleton.start(() => resultBannerEl.value)
  try {
    chart.value = await buildZiweiChart(ziweiStore.birth)
    if (chart.value) ziweiStore.recordComputed()
  } catch (err) {
    console.error('[ziwei] calculate failed:', err)
    chart.value = null
  }
}

function onRepaipan() {
  chart.value = null
  ziweiStore.clearComputed()
  skeleton.reset(() => inputCardEl.value)
}

/**
 * 刷新 / 切窗回来后，若 ziweiStore 里有 lastComputed 且与当前 birth 指纹一致，
 * 直接重算并跳过骨架屏（P4 · 输入指纹模式，对齐 bazi / liuren）。
 *
 * 关键点：
 *   - 不触发 skeleton 动画：用 revealImmediately 立即露出结果区
 *   - iztro 异步：失败（如版本变更 / 数据脏）则清空快照，回到默认起始态
 *   - URL deeplink 命中时**优先走 deeplink hydrate** 路径，本函数会被跳过
 */
async function tryRestoreLastResult(): Promise<boolean> {
  if (!ziweiStore.shouldRestore) return false
  try {
    const fresh = await buildZiweiChart(ziweiStore.birth)
    if (!fresh) {
      ziweiStore.clearComputed()
      return false
    }
    chart.value = fresh
    skeleton.revealImmediately()
    return true
  } catch (err) {
    console.error('[ziwei] restore failed:', err)
    ziweiStore.clearComputed()
    chart.value = null
    return false
  }
}

/**
 * 排盘失败友好态：与 bazi/chenggu/xingming/lingqian/liuren/huangli 6 模块一致。
 * 触发条件：骨架屏已揭示但 chart 仍为 null（例：FortuneError(invalid-input)、iztro 内部异常）。
 * 渲染：替换整个 result-zone 为单一 compute-error-card，避免空盘 + 一堆空盒子的劣质 UX。
 */
const showComputeError = computed(() => skeleton.revealed.value && chart.value === null)

function go(name: 'home') {
  router.push({ name })
}

/**
 * 分享 / 保存命盘卡片：复用 useShareCard，截图根 div 由 shareCardEl 持有，
 * 包裹整个 result-zone 内容（不含 actions）。
 */
const shareCardEl = ref<HTMLElement | null>(null)
const { toastState, shareCard, saveCard, previewCard } = useShareCard()
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

/**
 * Deeplink 参数：紫微斗数算法以时辰（小时）为最小粒度，无须 minute；
 * longitude / birthplace 仅 UI 展示，不参与计算，不放入 query。
 */
const shareUrl = computed(() => {
  const b = ziweiStore.birth
  return buildShareUrl('ziwei', {
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

onMounted(() => {
  // 进入页面后，闲时预热 iztro chunk —— 让点击"排盘"几乎无网络等待
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => prefetchZiweiEngine(), { timeout: 1500 })
  } else {
    setTimeout(() => prefetchZiweiEngine(), 800)
  }

  const q = normalizeQuery(route.query as Record<string, string | string[] | undefined>)
  const hasInputs = ['year', 'month', 'day', 'hour'].some((k) => k in q)
  if (!hasInputs) {
    void tryRestoreLastResult()
    return
  }

  const b = ziweiStore.birth
  ziweiStore.update({
    calendar: q.calendar === 'lunar' ? 'lunar' : 'solar',
    year: readIntInRange(q, 'year', 1900, 2100, b.year),
    month: readIntInRange(q, 'month', 1, 12, b.month),
    day: readIntInRange(q, 'day', 1, 31, b.day),
    hour: readIntInRange(q, 'hour', 0, 23, b.hour),
    gender: q.gender === 'female' ? 'female' : 'male',
  })
  void Promise.resolve().then(() => onPaipan())
})

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

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="ziwei.resultBanner.title" subtitle-key="ziwei.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <div v-if="showComputeError" class="gf-container">
        <div class="compute-error-card">
          <h3>◈ {{ t('ziwei.computeError.title') }}</h3>
          <p>{{ t('ziwei.computeError.hint') }}</p>
          <button class="gf-btn gf-btn-outline" @click="onRepaipan">
            {{ t('ziwei.btn.repaipanIcon') }} {{ t('ziwei.computeError.retry') }}
          </button>
        </div>
      </div>
      <template v-else>
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

        <CollapsibleSection
          v-if="chart?.soulPalaceCard"
          :label="t('ziwei.collapse.sectionSoulPalace')"
        >
          <SoulPalaceView :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection
          v-if="chart?.palaceMajorReadings?.length"
          :label="t('ziwei.collapse.sectionPalaceMajor')"
        >
          <PalaceMajorView :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection
          v-if="chart?.minorStarReadings?.length"
          :label="t('ziwei.collapse.sectionMinorStars')"
        >
          <MinorStarsView :chart="chart" />
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

        <CollapsibleSection
          v-if="chart?.currentDecadal"
          :label="t('ziwei.collapse.sectionDecadalDetail')"
        >
          <DecadalDetail :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection
          v-if="chart?.flowYears?.length"
          :label="t('ziwei.collapse.sectionFlowYear')"
        >
          <ZiweiYear :chart="chart" />
        </CollapsibleSection>
      </div>
      </div><!-- /ziwei-share-card -->

      <div class="action-bar">
        <button type="button" class="gf-btn" @click="onPreview">
          {{ t('ziwei.btn.shareIcon') }} {{ t('ziwei.btn.share') }}
        </button>
        <button type="button" class="gf-btn gf-btn-outline" @click="onRepaipan">
          {{ t('ziwei.btn.repaipanIcon') }} {{ t('ziwei.btn.repaipan') }}
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

    <div v-if="skeleton.revealed.value" ref="resultBannerEl">
      <ResultBanner title-key="ziwei.resultBanner.title" subtitle-key="ziwei.resultBanner.subtitle" />
    </div>

    <div v-if="skeleton.revealed.value" class="result-zone revealed">
      <main v-if="showComputeError" class="mn-container">
        <div class="compute-error-card mn">
          <h3>{{ t('ziwei.computeError.title') }}</h3>
          <p>{{ t('ziwei.computeError.hint') }}</p>
          <button class="mn-btn mn-btn-outline" @click="onRepaipan">
            {{ t('ziwei.computeError.retry') }}
          </button>
        </div>
      </main>
      <template v-else>
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

        <CollapsibleSection
          v-if="chart?.soulPalaceCard"
          :label="t('ziwei.collapse.sectionSoulPalaceMn')"
        >
          <SoulPalaceView :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection
          v-if="chart?.palaceMajorReadings?.length"
          :label="t('ziwei.collapse.sectionPalaceMajorMn')"
        >
          <PalaceMajorView :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection
          v-if="chart?.minorStarReadings?.length"
          :label="t('ziwei.collapse.sectionMinorStarsMn')"
        >
          <MinorStarsView :chart="chart" />
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

        <CollapsibleSection
          v-if="chart?.currentDecadal"
          :label="t('ziwei.collapse.sectionDecadalDetailMn')"
        >
          <DecadalDetail :chart="chart" />
        </CollapsibleSection>

        <CollapsibleSection
          v-if="chart?.flowYears?.length"
          :label="t('ziwei.collapse.sectionFlowYearMn')"
        >
          <ZiweiYear :chart="chart" />
        </CollapsibleSection>
      </main>
      </div><!-- /ziwei-share-card -->

      <div class="actions mn-container">
        <button type="button" class="mn-btn" @click="onPreview">{{ t('ziwei.btn.share') }}</button>
        <button type="button" class="mn-btn mn-btn-ghost" @click="onRepaipan">{{ t('ziwei.btn.repaipan') }}</button>
      </div>
      </template>
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

  <!-- 分享卡预览对话框 -->
  <SharePreviewDialog
    v-model:open="previewOpen"
    :image="previewImage"
    :share-url="shareUrl"
    :disabled="!previewImage"
    @save="onSave"
    @share="onShare"
  />
</template>
