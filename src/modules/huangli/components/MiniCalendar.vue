<script setup lang="ts">
/**
 * 月历缩略图。
 * - 7 列 × 6 行，含跨月补足
 * - 黄道日 / 黑道日：guofeng → 黑道红框（黄道金色数字）；minimal → 底部小色点
 * - activeMatter 非空时，高亮所有"宜"该事由的本月日，并加 ✓ 角标
 * - 点击某日（含跨月日）：发射 `day-click` 事件，父级打开详情 dialog
 * - selectedDateKey：父级传入"当前 dialog 显示的日"，本组件用细 outline ring 标记
 * - 键盘可达性：role="grid" + roving tabindex + ↑↓←→/Home/End/PgUp/PgDn/Enter/Space
 *   （仅本月格子参与 roving，跨月格子用 tabindex=-1 直接跳过）
 */
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useHuangliStore } from '../stores/huangliStore'
import {
  getHuangliMonth,
  findGoodDaysByMatter,
} from '../core/huangli'
import type { HuangliMonth, HuangliMonthDay } from '../types'
import MonthYearPicker from './MonthYearPicker.vue'

const props = defineProps<{
  /** 当前 dialog 正在展示的日（用于在月历里加细 outline 高亮）。null = 无 */
  selectedDateKey?: string | null
}>()

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

const monthData = computed<HuangliMonth>(() => getHuangliMonth(store.year, store.month))

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

/* ============================================================
 * 日期格交互
 * ============================================================ */

/** 把 Y-M-D 拼成稳定字符串 key，用于 selected/focused 比较 */
function dayKey(d: { year: number; month: number; day: number }): string {
  return `${d.year}-${d.month}-${d.day}`
}

const selectedDateKey = computed(() => props.selectedDateKey ?? null)

function isSelected(d: HuangliMonthDay): boolean {
  if (!selectedDateKey.value) return false
  return dayKey(d) === selectedDateKey.value
}

/** roving tabindex 焦点：默认聚到今日，没有今日则聚到本月 1 号 */
const focusedKey = ref<string>('')

watch(
  monthData,
  (m) => {
    const today = m.days.find((d) => d.inMonth && d.isToday)
    if (today) {
      focusedKey.value = dayKey(today)
      return
    }
    const first = m.days.find((d) => d.inMonth)
    if (first) focusedKey.value = dayKey(first)
  },
  { immediate: true },
)

const dayBtnRefs = useTemplateRef<HTMLButtonElement[]>('dayBtnRefs')

function focusByKey(key: string) {
  // wait for re-render after month shift before grabbing the new ref
  nextTick(() => {
    const idx = monthData.value.days.findIndex((d) => dayKey(d) === key && d.inMonth)
    if (idx < 0) return
    const el = dayBtnRefs.value?.[idx]
    el?.focus()
  })
}

function onDayClick(d: HuangliMonthDay) {
  // 跨月日 + 本月日 都走 dialog；不再隐式 setDate 跳月，避免视觉上无提示的月份漂移
  emit('day-click', d)
}

/** 键盘导航：仅在本月格子上响应（跨月格子 tabindex=-1，自然不会触发） */
function onDayKeydown(e: KeyboardEvent, d: HuangliMonthDay, idx: number) {
  // Enter / Space → 等价点击
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('day-click', d)
    return
  }

  /** 在 days[] 上按偏移量移动焦点；跨月 → 触发月切换并把焦点保留到新月对应日 */
  function moveBy(delta: number) {
    e.preventDefault()
    const days = monthData.value.days
    const target = idx + delta

    // 仍在当前 6×7 网格内
    if (target >= 0 && target < days.length) {
      const next = days[target]
      if (next.inMonth) {
        focusedKey.value = dayKey(next)
        focusByKey(focusedKey.value)
        return
      }
      // 落到跨月格 → 切到对应月，并把焦点设到该日
      store.setDate(next.year, next.month, next.day)
      focusedKey.value = dayKey(next)
      focusByKey(focusedKey.value)
      return
    }

    // 越界（顶/底） → 跨月翻
    const overflowDelta = delta > 0 ? 1 : -1
    store.shiftMonth(overflowDelta)
    // 翻月后让焦点落在新月的同列同向上下，简单实现：聚到新月今日 / 1 号
    nextTick(() => {
      const newDays = monthData.value.days
      const candidate = newDays.find((x) => x.inMonth)
      if (candidate) {
        focusedKey.value = dayKey(candidate)
        focusByKey(focusedKey.value)
      }
    })
  }

  switch (e.key) {
    case 'ArrowLeft':
      moveBy(-1); return
    case 'ArrowRight':
      moveBy(1); return
    case 'ArrowUp':
      moveBy(-7); return
    case 'ArrowDown':
      moveBy(7); return
    case 'Home': {
      e.preventDefault()
      const first = monthData.value.days.find((x) => x.inMonth)
      if (first) {
        focusedKey.value = dayKey(first)
        focusByKey(focusedKey.value)
      }
      return
    }
    case 'End': {
      e.preventDefault()
      const inMonth = monthData.value.days.filter((x) => x.inMonth)
      const last = inMonth[inMonth.length - 1]
      if (last) {
        focusedKey.value = dayKey(last)
        focusByKey(focusedKey.value)
      }
      return
    }
    case 'PageUp':
      e.preventDefault()
      onPrev()
      return
    case 'PageDown':
      e.preventDefault()
      onNext()
      return
  }
}

/* ============================================================
 * a11y label
 * ============================================================ */
function dayAriaLabel(d: HuangliMonthDay): string {
  const parts: string[] = [
    t('huangli.calendar.dayAriaFmt', {
      year: d.year,
      month: d.month,
      day: d.day,
      weekday: weekdays.value[(new Date(d.year, d.month - 1, d.day)).getDay()],
    }),
  ]
  if (d.inMonth) {
    parts.push(d.ecliptic === '黄道' ? t('huangli.calendar.legendHuangdao') : t('huangli.calendar.legendHeidao'))
    if (d.isToday) parts.push(t('huangli.calendar.todayLabel'))
    if (goodSetByMatter.value.has(d.day)) parts.push(t('huangli.calendar.matchLabel'))
  } else {
    parts.push(t('huangli.calendar.outOfMonthLabel'))
  }
  return parts.join('，')
}

/* ============================================================
 * matter hint + "下一个 ✓ 日" 跳转（最多向后看 3 个月）
 * ============================================================ */
function matterHint(): string {
  const m = store.activeMatter
  if (!m) return ''
  const raw = tm('huangli.matters.names') as unknown as Record<string, unknown>
  const v = raw[m]
  const name = typeof v === 'string' ? v : rt(v as Parameters<typeof rt>[0])
  return `${t('huangli.calendar.matterHintPrefix')} ${name ?? ''}`
}

interface NextGoodHit {
  year: number
  month: number
  day: number
  monthData: HuangliMonth
  monthDay: HuangliMonthDay
}

const nextGoodDay = computed<NextGoodHit | null>(() => {
  const m = store.activeMatter
  if (!m) return null
  // 起点 = 当前 store.day（如果在本月内）；越界则从本月 day=1 起
  const startY = store.year
  const startM = store.month
  const startD = store.day

  function searchInMonth(y: number, mo: number, fromDay: number): NextGoodHit | null {
    const md = getHuangliMonth(y, mo)
    const goods = findGoodDaysByMatter(md, m as Parameters<typeof findGoodDaysByMatter>[1])
    const hit = goods.find((g) => (y > startY || mo > startM) ? true : g > fromDay)
    if (hit === undefined) return null
    const monthDay = md.days.find((d) => d.inMonth && d.day === hit)
    if (!monthDay) return null
    return { year: y, month: mo, day: hit, monthData: md, monthDay }
  }

  for (let i = 0; i < 3; i++) {
    let y = startY
    let mo = startM + i
    while (mo > 12) { mo -= 12; y += 1 }
    const fromDay = i === 0 ? startD : 0
    const found = searchInMonth(y, mo, fromDay)
    if (found) return found
  }
  return null
})

const nextGoodLabel = computed(() => {
  const hit = nextGoodDay.value
  if (!hit) return ''
  return t('huangli.calendar.nextGoodFmt', { month: hit.month, day: hit.day })
})

function onJumpNextGood() {
  const hit = nextGoodDay.value
  if (!hit) return
  // 先翻到对应月（如果不同月），再 emit 让父层弹 dialog
  if (hit.year !== store.year || hit.month !== store.month) {
    store.setDate(hit.year, hit.month, hit.day)
  }
  // 等下一帧再 emit，确保 monthData 已切换
  nextTick(() => emit('day-click', hit.monthDay))
}

/* ============================================================
 * 年月 popover（点击月份标题打开）
 * ============================================================ */
const pickerOpen = ref(false)
function onPickMonth(y: number, m: number) {
  store.setDate(y, m, Math.min(store.day, new Date(y, m, 0).getDate()))
  pickerOpen.value = false
}
</script>

<template>
  <div :class="['hl-cal', isGuofeng ? 'hl-cal--gf' : 'hl-cal--mn']">
    <div class="hl-cal-head">
      <button
        type="button"
        :class="isGuofeng ? 'gf-btn gf-btn-outline' : 'mn-btn mn-btn-ghost'"
        :aria-label="t('huangli.calendar.prevMonthAria', { month: store.month === 1 ? 12 : store.month - 1 })"
        @click="onPrev"
      >
        ← {{ prevLabel }}
      </button>

      <MonthYearPicker
        v-model:open="pickerOpen"
        :year="store.year"
        :month="store.month"
        :is-guofeng="isGuofeng"
        :trigger-text="title"
        :trigger-aria-label="t('huangli.calendar.openPickerAria', { year: store.year, month: store.month })"
        @pick="onPickMonth"
      />

      <button
        type="button"
        :class="isGuofeng ? 'gf-btn gf-btn-outline' : 'mn-btn mn-btn-ghost'"
        :aria-label="t('huangli.calendar.nextMonthAria', { month: store.month === 12 ? 1 : store.month + 1 })"
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

    <div
      class="hl-cal-grid"
      role="grid"
      :aria-label="t('huangli.calendar.gridAria', { year: store.year, month: store.month })"
    >
      <div
        v-for="w in weekdays"
        :key="`wk-${w}`"
        class="hl-cal-wk"
        role="columnheader"
        :aria-label="w"
      >{{ w }}</div>

      <button
        v-for="(d, idx) in monthData.days"
        :key="`d-${idx}`"
        ref="dayBtnRefs"
        type="button"
        role="gridcell"
        :tabindex="d.inMonth && dayKey(d) === focusedKey ? 0 : -1"
        :aria-label="dayAriaLabel(d)"
        :aria-current="d.inMonth && d.isToday ? 'date' : undefined"
        :aria-pressed="d.inMonth && goodSetByMatter.has(d.day) ? true : undefined"
        :aria-selected="isSelected(d) ? true : undefined"
        :class="[
          'hl-cal-day',
          { 'is-off': !d.inMonth },
          { 'is-today': d.isToday },
          { 'is-huangdao': d.inMonth && d.ecliptic === '黄道' },
          { 'is-heidao': d.inMonth && d.ecliptic === '黑道' },
          { 'is-match': d.inMonth && goodSetByMatter.has(d.day) },
          { 'is-selected': isSelected(d) },
        ]"
        @click="onDayClick(d)"
        @keydown="onDayKeydown($event, d, idx)"
      >
        <span class="hl-cal-day-num">{{ d.day }}</span>
        <span class="hl-cal-day-lunar">{{ d.lunarShort }}</span>
        <span
          v-if="d.inMonth && goodSetByMatter.has(d.day)"
          class="hl-cal-day-check"
          aria-hidden="true"
        >✓</span>
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

      <button
        v-if="nextGoodDay"
        type="button"
        class="hl-cal-next-good"
        :aria-label="t('huangli.calendar.nextGoodAria', { month: nextGoodDay.month, day: nextGoodDay.day })"
        @click="onJumpNextGood"
      >
        {{ nextGoodLabel }} →
      </button>
    </div>
  </div>
</template>
