<script setup lang="ts">
/**
 * 黄历择日模块主页。
 *
 * 设计与其他占卜模块不同：无 "排盘中" 骨架动画；查询输入与结果展示共存。
 * 因为数据来自 tyme4ts 本地计算，查询本身即可得结果（同步）。
 *
 * 页面结构（来自 design/prototypes/{guofeng,minimal}/huangli.html）：
 *   1. 页头 / 面包屑
 *   2. DateQueryCard
 *   3. 分享卡 wrapper（share target）：
 *        - TodayCard
 *        - YijiCards
 *        - ShenshaCards
 *        - MatterGrid
 *        - MiniCalendar
 *   4. 动作栏（分享/保存/回到今日）
 *   5. DayDetailDialog（点击月历某日后弹框展示，独立于分享卡）
 */
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareToast from '@/components/common/ShareToast.vue'
import SharePreviewDialog from '@/components/common/SharePreviewDialog.vue'
import { useShareCard } from '@/composables/useShareCard'
import { FortuneError, type FortuneErrorCode } from '@/lib/errors'
import { buildShareUrl, normalizeQuery, readIntInRange } from '@/lib/shareUrl'

import AskAiButton from '@/components/ai/AskAiButton.vue'
import { useAiSidebarStore } from '@/stores/aiSidebar'
import DateQueryCard from './components/DateQueryCard.vue'
import { Button } from '@/components/ui/button'
import TodayCard from './components/TodayCard.vue'
import YijiCards from './components/YijiCards.vue'
import ShenshaCards from './components/ShenshaCards.vue'
import MatterGrid from './components/MatterGrid.vue'
import MiniCalendar from './components/MiniCalendar.vue'
import DayDetailDialog from './components/DayDetailDialog.vue'
import SolarTermDialog from './components/SolarTermDialog.vue'

import { useHuangliStore } from './stores/huangliStore'
import { getHuangliDay } from './core/huangli'
import type { HuangliDay, HuangliMonthDay } from './types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const store = useHuangliStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const shareCardEl = ref<HTMLElement | null>(null)

interface ComputeErrorState {
  code: FortuneErrorCode
  details?: Readonly<Record<string, unknown>>
}

const computeError = ref<ComputeErrorState | null>(null)

/**
 * 把 catch 到的 err 归一化为 ComputeErrorState：
 *   - FortuneError: 直接取 code/details
 *   - 其他 Error: 兜底为 'unknown'
 */
function toComputeError(err: unknown): ComputeErrorState {
  if (FortuneError.is(err)) {
    return { code: err.code, details: err.details }
  }
  return { code: 'unknown' }
}

/** 根据 code 取对应 i18n hint 文案（含参数插值，如年份范围）。 */
const computeErrorHint = computed<string>(() => {
  const e = computeError.value
  if (!e) return ''
  switch (e.code) {
    case 'invalid-input':
      return t('huangli.computeError.byCode.invalidInput')
    case 'out-of-range': {
      const min = (e.details?.supportedMin as number | undefined) ?? 1901
      const max = (e.details?.supportedMax as number | undefined) ?? 2099
      return t('huangli.computeError.byCode.outOfRange', { min, max })
    }
    default:
      return t('huangli.computeError.byCode.unknown')
  }
})

const aiSidebar = useAiSidebarStore()
function onAskAi() {
  if (!day.value) return
  aiSidebar.show({ moduleId: 'huangli', chart: day.value })
}

const day = computed<HuangliDay | null>(() => {
  try {
    computeError.value = null
    return getHuangliDay(store.year, store.month, store.day)
  } catch (err) {
    console.error('[huangli] compute day failed:', err)
    computeError.value = toComputeError(err)
    return null
  }
})

/**
 * 详情：点击月历某日后弹框展示；再点 X / 遮罩 / Esc 都可关闭。
 * detailDay 与 detailOpen 双向绑定 —— v-model:open=false 即清空 detailDay。
 *
 * 同时把"当前 dialog 显示的日"传回 MiniCalendar 用 outline ring 高亮，
 * dialog 关闭时 detailDay=null → selectedDateKey=null → ring 消失。
 */
const detailDay = shallowRef<HuangliDay | null>(null)
const detailOpen = computed({
  get: () => detailDay.value !== null,
  set: (v: boolean) => {
    if (!v) detailDay.value = null
  },
})
const selectedDateKey = computed<string | null>(() => {
  const d = detailDay.value
  if (!d) return null
  return `${d.year}-${d.month}-${d.day}`
})
/**
 * 节气科普 dialog 状态（B3）。
 * 双 dialog 不同时开，避免 reka-ui 焦点冲突。
 */
const termName = shallowRef<string | null>(null)
const pendingDay = shallowRef<HuangliDay | null>(null)
const termOpen = computed({
  get: () => termName.value !== null,
  set: (v: boolean) => {
    if (!v) termName.value = null
  },
})

/**
 * 月历 cell 点击：
 *   - 节气日 → 优先弹科普卡（pendingDay 暂存当日数据，便于后续 view-day 跳转）
 *   - 普通日 → 直接弹日详情
 */
function onCalendarClick(md: HuangliMonthDay) {
  let d: HuangliDay
  try {
    d = getHuangliDay(md.year, md.month, md.day)
  } catch (err) {
    if (FortuneError.is(err)) {
      console.warn('[huangli] open day detail blocked by FortuneError:', err.code, err.details)
    } else {
      console.error('[huangli] open day detail failed:', err)
    }
    detailDay.value = null
    return
  }
  if (md.solarTerm) {
    pendingDay.value = d
    termName.value = md.solarTerm
  } else {
    detailDay.value = d
  }
}
function onDetailClose() {
  detailDay.value = null
}
/**
 * 用户在节气科普卡里点「查看当日详情」：
 *   1. 关掉 SolarTermDialog
 *   2. 打开 DayDetailDialog 显示当日完整黄历
 */
function onTermViewDay() {
  const d = pendingDay.value
  termName.value = null
  pendingDay.value = null
  if (d) detailDay.value = d
}

function onBackToToday() {
  store.setToToday()
  store.setActiveMatter(null)
  detailDay.value = null
}

function go(name: 'home') {
  router.push({ name })
}

const { toastState, shareCard, saveCard, previewCard } = useShareCard()
function buildShareOpts() {
  const iso = day.value?.dateIso ?? 'today'
  return {
    fileName: `huangli-${iso}-${themeStore.id}`,
    title: t('huangli.share.title'),
    text: t('huangli.share.text'),
  }
}
function onShare() { shareCard(shareCardEl.value, buildShareOpts()) }
function onSave() { saveCard(shareCardEl.value, buildShareOpts()) }

const shareUrl = computed(() => {
  return buildShareUrl('huangli', {
    year: store.year,
    month: store.month,
    day: store.day,
  })
})

const previewOpen = ref(false)
const previewImage = ref('')
async function onPreview() {
  if (!shareCardEl.value) return
  previewImage.value = ''
  previewOpen.value = true
  try {
    previewImage.value = await previewCard(shareCardEl.value, { fileName: buildShareOpts().fileName })
  } catch (err) {
    console.error('[huangli] preview failed:', err)
    previewOpen.value = false
  }
}

onMounted(() => {
  const q = normalizeQuery(route.query)
  if (Object.keys(q).length === 0) return
  const y = readIntInRange(q, 'year', 1901, 2099, store.year)
  const m = readIntInRange(q, 'month', 1, 12, store.month)
  const d = readIntInRange(q, 'day', 1, 31, store.day)
  store.setDate(y, m, d)
})
</script>

<template>
  <!-- ============ 国风 ============ -->
  <main v-if="isGuofeng">
    <div class="gf-container">
      <div class="page-title">
        <h1>{{ t('huangli.pageTitle') }}</h1>
        <div class="subtitle">{{ t('huangli.pageSubtitle') }}</div>
      </div>

      <DateQueryCard />

      <div v-if="computeError" class="compute-error-card">
        <h3>◈ {{ t('huangli.computeError.title') }}</h3>
        <p>{{ computeErrorHint }}</p>
        <Button type="button" variant="outline" @click="onBackToToday">
          ↻ {{ t('huangli.computeError.retry') }}
        </Button>
      </div>

      <template v-else-if="day">
        <div ref="shareCardEl" class="huangli-share-card">
          <TodayCard :day="day" />
          <YijiCards :day="day" />
          <ShenshaCards :day="day" />
          <div class="gf-divider"><span>{{ t('huangli.matters.sectionTitle') }}</span></div>
          <MatterGrid :day="day" />
          <div class="gf-divider"><span>{{ t('huangli.calendar.divider') }}</span></div>
          <MiniCalendar :selected-date-key="selectedDateKey" @day-click="onCalendarClick" />
        </div>

        <div class="action-bar">
          <Button type="button" variant="default" @click="onPreview">
            {{ t('huangli.btn.shareIcon') }} {{ t('huangli.btn.share') }}
          </Button>
          <AskAiButton :disabled="!day" @click="onAskAi" />
          <Button type="button" variant="outline" @click="onBackToToday">
            {{ t('huangli.btn.resetIcon') }} {{ t('huangli.btn.reset') }}
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
          <a href="#" @click.prevent="go('home')">{{ t('huangli.breadcrumbHome') }}</a> /
          {{ t('huangli.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('huangli.pageTitle') }}</h1>
        <p>{{ t('huangli.pageSubtitle') }}</p>
      </section>

      <DateQueryCard />

      <div v-if="computeError" class="compute-error-card mn">
        <h3>{{ t('huangli.computeError.title') }}</h3>
        <p>{{ computeErrorHint }}</p>
        <Button type="button" variant="outline" @click="onBackToToday">
          {{ t('huangli.computeError.retry') }}
        </Button>
      </div>

      <template v-else-if="day">
        <div ref="shareCardEl" class="huangli-share-card">
          <TodayCard :day="day" />
          <YijiCards :day="day" />
          <ShenshaCards :day="day" />
          <MatterGrid :day="day" />
          <MiniCalendar :selected-date-key="selectedDateKey" @day-click="onCalendarClick" />
        </div>

        <div class="actions mn-container">
          <Button type="button" variant="default" @click="onPreview">{{ t('huangli.btn.share') }}</Button>
          <AskAiButton :disabled="!day" @click="onAskAi" />
          <Button type="button" variant="ghost" @click="onBackToToday">
            {{ t('huangli.btn.reset') }}
          </Button>
        </div>
      </template>
    </main>
  </template>

  <DayDetailDialog
    v-model:open="detailOpen"
    :day="detailDay"
    @close="onDetailClose"
  />

  <SolarTermDialog
    v-model:open="termOpen"
    :term-name="termName"
    @view-day="onTermViewDay"
  />

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
