<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { GridName, XingmingResult } from '../types'
import { elementI18nPath } from '../utils/i18nHelpers'

interface Props {
  result: XingmingResult
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

/* ---------------- 仪表盘几何常量 ---------------- */
/** SVG viewBox: 0 0 200 130；半径 80，圆心 (100, 110)；半圆从 (20,110) → (180,110) */
const ARC_LENGTH = 251 // π * 80 ≈ 251.327, 取整

/**
 * 4 段区间（语义档位）：
 *   bad   0  - 60   (60% → arc 60%)
 *   mid   60 - 75   (15% → arc 15%)
 *   good  75 - 90   (15% → arc 15%)
 *   great 90 - 100  (10% → arc 10%)
 */
const SEG = [
  { key: 'bad', from: 0, to: 60 },
  { key: 'mid', from: 60, to: 75 },
  { key: 'good', from: 75, to: 90 },
  { key: 'great', from: 90, to: 100 },
] as const

/** 把 [from,to] 区间映射为 dasharray + dashoffset，用于在同一条 path 上裁出该段 */
function segDashArray(from: number, to: number): string {
  const len = (ARC_LENGTH * (to - from)) / 100
  const gap = ARC_LENGTH - len
  return `${len.toFixed(2)} ${gap.toFixed(2)}`
}
function segDashOffset(from: number): number {
  return -((ARC_LENGTH * from) / 100)
}

/* ---------------- 加载动画：displayedScore 从 0 → score ---------------- */
const targetScore = computed(() => props.result.overallScore)
const displayedScore = ref(0)

/** prefers-reduced-motion 用户跳过动画 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let rafId: number | null = null
function animateTo(target: number, duration = 1200) {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (prefersReducedMotion()) {
    displayedScore.value = target
    return
  }
  const start = performance.now()
  const from = displayedScore.value
  const ease = (t: number) => 1 - Math.pow(1 - t, 3) // ease-out cubic
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    displayedScore.value = from + (target - from) * ease(t)
    if (t < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      rafId = null
      displayedScore.value = target
    }
  }
  rafId = requestAnimationFrame(tick)
}

onMounted(() => animateTo(targetScore.value))
watch(targetScore, (v) => animateTo(v))
onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})

/** 用于显示的整数分数（clamp 到 [0,100]，避免动画初末浮点误差） */
const displayedScoreInt = computed(() =>
  Math.max(0, Math.min(100, Math.round(displayedScore.value))),
)
/** 指针角度：score/100 * 180 - 90，落在 [-90°, +90°] */
const needleRotate = computed(() => (displayedScore.value / 100) * 180 - 90)

/* ---------------- 5 项评分展示 ---------------- */
const GRID_ORDER: GridName[] = ['tian', 'ren', 'di', 'wai', 'zong']

interface ScoreItem {
  gridName: GridName
  number: number
  level: string
  tagClass: 'good' | 'warn' | 'mid'
}

const LEVEL_TAG_CLASS: Record<string, 'good' | 'warn' | 'mid'> = {
  大吉: 'good',
  吉: 'good',
  中吉: 'good',
  中平: 'mid',
  凶: 'warn',
  大凶: 'warn',
}

const scoreItems = computed<ScoreItem[]>(() =>
  GRID_ORDER.map((k) => {
    const g = props.result.grids[k]
    return {
      gridName: k,
      number: g.number,
      level: g.entry.level,
      tagClass: LEVEL_TAG_CLASS[g.entry.level] ?? 'mid',
    }
  }),
)

/* ---------------- 综合档位 / 描述文案 ---------------- */
const badgeLabel = computed(() =>
  t(`xingming.overall.badge.${props.result.overallBadgeKey}`),
)

const overallSummary = computed(() => {
  const r = props.result
  const ren = r.grids.ren.entry
  const zong = r.grids.zong.entry
  return t('xingming.overall.summary', {
    name: r.fullName,
    badgeWord: t(`xingming.overall.badgeWord.${r.overallBadgeKey}`),
    renElement: t(elementI18nPath(ren.element)),
    renLevel: t(`xingming.levels.${ren.level}`),
    zongElement: t(elementI18nPath(zong.element)),
    zongLevel: t(`xingming.levels.${zong.level}`),
    score: r.overallScore,
  })
})

/** 仪表盘 ARIA label */
const gaugeAriaLabel = computed(() =>
  t('xingming.overall.gaugeAria', {
    score: props.result.overallScore,
    badge: badgeLabel.value,
  }),
)
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="xm-score-card gf-score-card">
    <div class="xm-gauge-wrap">
      <svg
        class="xm-gauge"
        viewBox="0 0 200 130"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        :aria-label="gaugeAriaLabel"
      >
        <path
          class="xm-gauge-track"
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
        />
        <path
          v-for="s in SEG"
          :key="s.key"
          :class="['xm-gauge-seg', `is-${s.key}`]"
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          :stroke-dasharray="segDashArray(s.from, s.to)"
          :stroke-dashoffset="segDashOffset(s.from)"
        />
        <!--
          指针重设计 (2026-04-26)：
          旧菱形 (M 100 110 L 96 70 L 100 32 L 104 70 Z) 缺动力学，根部被 hub 半遮断点；
          新锥形 polygon：5 点 (针根→针腰→针尖)，针根宽 6px 完全落入 hub-outer (r=9) 内被自然覆盖，
          针腰收 2px (流线感)，针尖落在弧顶外侧 4px (视觉指向更明确)。
        -->
        <g
          class="xm-gauge-needle-group"
          :style="{ transform: `rotate(${needleRotate}deg)` }"
        >
          <polygon
            class="xm-gauge-needle"
            points="100,28 101.4,80 100.6,108 99.4,108 98.6,80"
          />
        </g>
        <circle class="xm-gauge-hub-outer" cx="100" cy="110" r="9" />
        <circle class="xm-gauge-hub" cx="100" cy="110" r="5" />
      </svg>
      <div class="xm-score-center">
        <div class="xm-score-value">{{ displayedScoreInt }}</div>
        <div class="xm-score-unit">/ 100</div>
      </div>
    </div>
    <div class="xm-score-label">
      {{ t('xingming.overall.label') }}
      <span class="xm-score-badge">{{ badgeLabel }}</span>
    </div>

    <div class="xm-score-items">
      <div v-for="item in scoreItems" :key="item.gridName" class="xm-score-item">
        <span class="xm-s-name">{{ t(`xingming.grids.${item.gridName}`) }}</span>
        <span class="xm-s-num">{{ item.number }}</span>
        <span :class="['xm-s-tag', item.tagClass]">
          {{ t(`xingming.levels.${item.level}`) }}
        </span>
      </div>
    </div>

    <p class="xm-score-desc">{{ overallSummary }}</p>
  </div>

  <!-- 简约 -->
  <div v-else class="xm-score-card mn-score-card">
    <div class="xm-gauge-wrap">
      <svg
        class="xm-gauge"
        viewBox="0 0 200 130"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        :aria-label="gaugeAriaLabel"
      >
        <path
          class="xm-gauge-track"
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
        />
        <path
          v-for="s in SEG"
          :key="s.key"
          :class="['xm-gauge-seg', `is-${s.key}`]"
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          :stroke-dasharray="segDashArray(s.from, s.to)"
          :stroke-dashoffset="segDashOffset(s.from)"
        />
        <g
          class="xm-gauge-needle-group"
          :style="{ transform: `rotate(${needleRotate}deg)` }"
        >
          <polygon
            class="xm-gauge-needle"
            points="100,28 101.4,80 100.6,108 99.4,108 98.6,80"
          />
        </g>
        <circle class="xm-gauge-hub-outer" cx="100" cy="110" r="9" />
        <circle class="xm-gauge-hub" cx="100" cy="110" r="5" />
      </svg>
      <div class="xm-score-center">
        <div class="xm-score-num">{{ displayedScoreInt }}<small>/100</small></div>
      </div>
    </div>
    <div class="xm-score-label">
      {{ t('xingming.overall.label') }}
      <span class="xm-score-badge">{{ badgeLabel }}</span>
    </div>

    <div class="xm-score-items">
      <div v-for="item in scoreItems" :key="item.gridName" class="xm-score-item">
        <span class="xm-s-name">{{ t(`xingming.grids.${item.gridName}`) }}</span>
        <span class="xm-s-num">{{ item.number }}</span>
        <span :class="['xm-s-tag', item.tagClass]">
          {{ t(`xingming.levels.${item.level}`) }}
        </span>
      </div>
    </div>

    <p class="xm-score-desc">{{ overallSummary }}</p>
  </div>
</template>
