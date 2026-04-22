<script setup lang="ts">
/**
 * 月历缩略图。
 * - 7 列 × 6 行，含跨月补足
 * - 黄道日 / 黑道日：绿 / 红徽标（简约）或 border（国风）
 * - activeMatter 非空时，高亮所有"宜"该事由的本月日
 * - 点击某日：发射 `day-click` 事件，父级打开详情卡
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useHuangliStore } from '../stores/huangliStore'
import { getHuangliMonth, findGoodDaysByMatter } from '../core/huangli'
import type { HuangliMonthDay } from '../types'

const emit = defineEmits<{
  (e: 'day-click', day: HuangliMonthDay): void
}>()

const { t, tm, rt } = useI18n()
const themeStore = useThemeStore()
const store = useHuangliStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const weekdays = computed<string[]>(() => {
  const raw = tm('huangli.calendar.weekdays') as unknown as unknown[]
  return raw.map((v) => (typeof v === 'string' ? v : rt(v as Parameters<typeof rt>[0])))
})

const monthData = computed(() => getHuangliMonth(store.year, store.month))

const goodSetByMatter = computed<Set<number>>(() => {
  const m = store.activeMatter
  if (!m) return new Set()
  return new Set(findGoodDaysByMatter(monthData.value, m))
})

const title = computed(() =>
  t('huangli.calendar.title', { year: store.year, month: store.month }),
)

const prevLabel = computed(() => {
  const m = store.month === 1 ? 12 : store.month - 1
  return t('huangli.calendar.prevMonthFmt', { month: m })
})
const nextLabel = computed(() => {
  const m = store.month === 12 ? 1 : store.month + 1
  return t('huangli.calendar.nextMonthFmt', { month: m })
})

function onPrev() { store.shiftMonth(-1) }
function onNext() { store.shiftMonth(1) }

function onDayClick(d: HuangliMonthDay) {
  if (!d.inMonth) {
    store.setDate(d.year, d.month, d.day)
    return
  }
  emit('day-click', d)
}

function matterHint() {
  const m = store.activeMatter
  if (!m) return ''
  const raw = tm('huangli.matters.names') as unknown as Record<string, unknown>
  const v = raw[m]
  const name = typeof v === 'string' ? v : rt(v as Parameters<typeof rt>[0])
  return `${t('huangli.calendar.matterHintPrefix')} ${name ?? ''}`
}
</script>

<template>
  <div :class="['hl-cal', isGuofeng ? 'hl-cal--gf' : 'hl-cal--mn']">
    <div class="hl-cal-head">
      <button
        type="button"
        :class="isGuofeng ? 'gf-btn gf-btn-outline' : 'mn-btn mn-btn-ghost'"
        @click="onPrev"
      >
        ← {{ prevLabel }}
      </button>
      <span class="hl-cal-title">{{ title }}</span>
      <button
        type="button"
        :class="isGuofeng ? 'gf-btn gf-btn-outline' : 'mn-btn mn-btn-ghost'"
        @click="onNext"
      >
        {{ nextLabel }} →
      </button>
    </div>

    <div v-if="store.activeMatter" class="hl-cal-filter">
      <span class="hl-cal-filter-text">{{ matterHint() }}</span>
      <button
        type="button"
        class="hl-cal-filter-clear"
        @click="store.setActiveMatter(null)"
      >
        {{ t('huangli.calendar.clearMatter') }}
      </button>
    </div>

    <div class="hl-cal-grid">
      <div v-for="w in weekdays" :key="`wk-${w}`" class="hl-cal-wk">{{ w }}</div>
      <button
        v-for="(d, idx) in monthData.days"
        :key="`d-${idx}`"
        type="button"
        :class="[
          'hl-cal-day',
          { 'is-off': !d.inMonth },
          { 'is-today': d.isToday },
          { 'is-huangdao': d.inMonth && d.ecliptic === '黄道' },
          { 'is-heidao': d.inMonth && d.ecliptic === '黑道' },
          { 'is-match': d.inMonth && goodSetByMatter.has(d.day) },
        ]"
        @click="onDayClick(d)"
      >
        <span class="hl-cal-day-num">{{ d.day }}</span>
        <span class="hl-cal-day-lunar">{{ d.lunarShort }}</span>
      </button>
    </div>

    <div class="hl-cal-legend">
      <span class="hl-cal-legend-item">
        <span class="hl-cal-dot hl-cal-dot--hd" /> {{ t('huangli.calendar.legendHuangdao') }}
      </span>
      <span class="hl-cal-legend-item">
        <span class="hl-cal-dot hl-cal-dot--hei" /> {{ t('huangli.calendar.legendHeidao') }}
      </span>
      <span v-if="store.activeMatter" class="hl-cal-legend-item">
        <span class="hl-cal-dot hl-cal-dot--match" /> {{ t('huangli.calendar.legendGood') }}
      </span>
    </div>
  </div>
</template>
