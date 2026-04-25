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
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareToast from '@/components/common/ShareToast.vue'
import { useShareCard } from '@/composables/useShareCard'

import DateQueryCard from './components/DateQueryCard.vue'
import TodayCard from './components/TodayCard.vue'
import YijiCards from './components/YijiCards.vue'
import ShenshaCards from './components/ShenshaCards.vue'
import MatterGrid from './components/MatterGrid.vue'
import MiniCalendar from './components/MiniCalendar.vue'
import DayDetailDialog from './components/DayDetailDialog.vue'

import { useHuangliStore } from './stores/huangliStore'
import { getHuangliDay } from './core/huangli'
import type { HuangliDay, HuangliMonthDay } from './types'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const store = useHuangliStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const shareCardEl = ref<HTMLElement | null>(null)

const computeError = ref<string | null>(null)
const day = computed<HuangliDay | null>(() => {
  try {
    computeError.value = null
    return getHuangliDay(store.year, store.month, store.day)
  } catch (err) {
    console.error('[huangli] compute day failed:', err)
    computeError.value = err instanceof Error ? err.message : String(err)
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
function onCalendarClick(md: HuangliMonthDay) {
  try {
    const d = getHuangliDay(md.year, md.month, md.day)
    detailDay.value = d
  } catch (err) {
    console.error('[huangli] open day detail failed:', err)
    detailDay.value = null
  }
}
function onDetailClose() {
  detailDay.value = null
}

function onBackToToday() {
  store.setToToday()
  store.setActiveMatter(null)
  detailDay.value = null
}

function go(name: 'home') {
  router.push({ name })
}

const { toastState, shareCard, saveCard } = useShareCard()
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
        <p>{{ t('huangli.computeError.hint') }}</p>
        <button class="gf-btn gf-btn-outline" @click="onBackToToday">
          ↻ {{ t('huangli.computeError.retry') }}
        </button>
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
          <button type="button" class="gf-btn" @click="onShare">
            {{ t('huangli.btn.shareIcon') }} {{ t('huangli.btn.share') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onSave">
            {{ t('huangli.btn.saveIcon') }} {{ t('huangli.btn.save') }}
          </button>
          <button type="button" class="gf-btn gf-btn-outline" @click="onBackToToday">
            {{ t('huangli.btn.resetIcon') }} {{ t('huangli.btn.reset') }}
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
          <a href="#" @click.prevent="go('home')">{{ t('huangli.breadcrumbHome') }}</a> /
          {{ t('huangli.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('huangli.pageTitle') }}</h1>
        <p>{{ t('huangli.pageSubtitle') }}</p>
      </section>

      <DateQueryCard />

      <div v-if="computeError" class="compute-error-card mn">
        <h3>{{ t('huangli.computeError.title') }}</h3>
        <p>{{ t('huangli.computeError.hint') }}</p>
        <button class="mn-btn mn-btn-outline" @click="onBackToToday">
          {{ t('huangli.computeError.retry') }}
        </button>
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
          <button type="button" class="mn-btn" @click="onShare">{{ t('huangli.btn.share') }}</button>
          <button type="button" class="mn-btn mn-btn-outline" @click="onSave">{{ t('huangli.btn.save') }}</button>
          <button type="button" class="mn-btn mn-btn-ghost" @click="onBackToToday">
            {{ t('huangli.btn.reset') }}
          </button>
        </div>
      </template>
    </main>
  </template>

  <DayDetailDialog
    v-model:open="detailOpen"
    :day="detailDay"
    @close="onDetailClose"
  />

  <ShareToast :state="toastState" />
</template>
