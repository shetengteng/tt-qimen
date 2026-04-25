<script setup lang="ts">
/**
 * 12 时辰吉凶圆盘 · LuckyHoursDial（R3，2026-04-25）。
 *
 * 取代原本的"子时(戊子·青龙) / 寅时(甲寅·明堂) / ..."一行文字，
 * 把 12 时辰用圆盘形式渲染，黄/黑道色块直观区分，是否当前时辰用指针示意。
 *
 * 设计要点：
 *   - 子时位于圆盘 12 点钟方向，顺时针 11 步到 亥时（与传统钟面+地支顺序一致）
 *   - 用 CSS transform: rotate 把 12 个 chip 围圆排布，避免 SVG 写复杂路径
 *   - 黄道色 / 黑道色由双主题 CSS 决定（国风：金 vs 朱 ; 简约：紫 vs 灰）
 *   - 当前时辰检测：仅当 props.isToday=true 时根据 navigator 本机时间高亮
 *   - 点击/聚焦扇区显示 tooltip（name / ganzhi / star / ecliptic）
 *   - a11y：每扇区 button + aria-label，圆盘整体 role=radiogroup
 *
 * Props：
 *   - hours: HourStar[]（必传，长度 12）
 *   - isToday: boolean（是否是今日，决定是否启用本机时辰高亮）
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HourStar } from '../types'

const props = defineProps<{
  hours: readonly HourStar[]
  isToday: boolean
}>()

const { t } = useI18n()

/** 12 地支（与时辰名首字一一对应，仅用于显示首字 fallback） */
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

/**
 * 当前时辰索引（0=子, 11=亥）。仅 isToday=true 时有效。
 * 时辰边界：子 23:00-01:00 / 丑 01:00-03:00 / ... / 亥 21:00-23:00
 */
const currentHourIdx = computed<number>(() => {
  if (!props.isToday) return -1
  const h = new Date().getHours()
  // 子时 = 23 ≤ h or h < 1 → idx 0
  // 丑时 = 1 ≤ h < 3 → idx 1
  // ...
  if (h === 23 || h < 1) return 0
  return Math.floor((h + 1) / 2)
})

const focusedIdx = ref<number | null>(null)

function selectHour(i: number) {
  focusedIdx.value = focusedIdx.value === i ? null : i
}

/** 圆盘上每个扇区的旋转角（度）。 */
function rotateDeg(i: number): number {
  return i * 30
}

/** 扇区显示名（取时辰名第二字 = 地支，例如「甲子时」→「子」） */
function displayName(i: number): string {
  const h = props.hours[i]
  if (h && h.name && h.name.length >= 2) return h.name.charAt(1)
  return BRANCHES[i] ?? '?'
}

function ariaLabelOf(i: number): string {
  const h = props.hours[i]
  if (!h) return BRANCHES[i] ?? ''
  const ecliLabel =
    h.ecliptic === '黄道'
      ? t('huangli.calendar.legendHuangdao')
      : t('huangli.calendar.legendHeidao')
  return t('huangli.luckyHours.dial.cellAria', {
    name: h.name,
    ganzhi: h.ganzhi,
    star: h.star,
    ecliptic: ecliLabel,
  })
}

const focusedHour = computed<HourStar | null>(() => {
  const i = focusedIdx.value
  if (i === null) return null
  return props.hours[i] ?? null
})

const luckyCount = computed<number>(() => props.hours.filter((h) => h.ecliptic === '黄道').length)
</script>

<template>
  <div class="hl-dial">
    <div
      class="hl-dial-ring"
      role="radiogroup"
      :aria-label="t('huangli.luckyHours.dial.ringAria')"
    >
      <!-- 12 时辰扇区（围绕圆心环绕排布）-->
      <button
        v-for="(h, i) in hours"
        :key="`shichen-${i}`"
        type="button"
        role="radio"
        class="hl-dial-cell"
        :class="[
          h.ecliptic === '黄道' ? 'is-huangdao' : 'is-heidao',
          { 'is-current': i === currentHourIdx },
          { 'is-focus': i === focusedIdx },
        ]"
        :style="{ transform: `rotate(${rotateDeg(i)}deg) translateY(calc(var(--hl-dial-radius) * -1)) rotate(${-rotateDeg(i)}deg)` }"
        :aria-label="ariaLabelOf(i)"
        :aria-checked="i === focusedIdx"
        @click="selectHour(i)"
      >
        <span class="hl-dial-cell-name">{{ displayName(i) }}</span>
      </button>

      <!-- 圆心 -->
      <div class="hl-dial-center">
        <div v-if="isToday && currentHourIdx >= 0" class="hl-dial-now">
          <div class="hl-dial-now-label">{{ t('huangli.luckyHours.dial.nowLabel') }}</div>
          <div class="hl-dial-now-name">{{ hours[currentHourIdx]?.name }}</div>
          <div
            class="hl-dial-now-pill"
            :class="hours[currentHourIdx]?.ecliptic === '黄道' ? 'is-huangdao' : 'is-heidao'"
          >
            {{ hours[currentHourIdx]?.ecliptic === '黄道'
              ? t('huangli.calendar.legendHuangdao')
              : t('huangli.calendar.legendHeidao') }}
          </div>
        </div>
        <div v-else class="hl-dial-summary">
          <div class="hl-dial-summary-num">{{ luckyCount }}<span>/12</span></div>
          <div class="hl-dial-summary-label">{{ t('huangli.luckyHours.dial.summaryLabel') }}</div>
        </div>
      </div>
    </div>

    <!-- 焦点态详情（点击扇区展开） -->
    <div v-if="focusedHour" class="hl-dial-detail" role="status" aria-live="polite">
      <span class="hl-dial-detail-name">{{ focusedHour.name }}</span>
      <span class="hl-dial-detail-meta">{{ focusedHour.ganzhi }} · {{ focusedHour.star }}</span>
      <span
        class="hl-dial-detail-pill"
        :class="focusedHour.ecliptic === '黄道' ? 'is-huangdao' : 'is-heidao'"
      >
        {{ focusedHour.ecliptic === '黄道'
          ? t('huangli.calendar.legendHuangdao')
          : t('huangli.calendar.legendHeidao') }}
      </span>
    </div>
    <div v-else class="hl-dial-hint">
      {{ t('huangli.luckyHours.dial.hintTapCell') }}
    </div>
  </div>
</template>
