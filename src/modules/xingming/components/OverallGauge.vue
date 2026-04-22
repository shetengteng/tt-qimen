<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { GridName, XingmingResult } from '../types'

interface Props {
  result: XingmingResult
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

/** 仪表盘 arc 总长约 251（半径 80 的半圆 = π * 80 ≈ 251） */
const ARC_LENGTH = 251

const score = computed(() => props.result.overallScore)

/** dashoffset = ARC * (1 - score/100) */
const dashOffset = computed(() => Math.round(ARC_LENGTH * (1 - score.value / 100)))

/** 指针角度 = score/100 * 180 - 90（范围 -90°..90°，原 SVG 已绕 (100,110) 旋转） */
const needleRotate = computed(() =>
  (score.value / 100) * 180 - 90,
)

/** 5 项评分展示 */
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

/** 综合档位文案 */
const badgeLabel = computed(() => {
  const b = props.result.overallBadge
  return t(`xingming.overall.badge.${b === '优' ? 'excellent' : b === '良' ? 'good' : b === '中' ? 'fair' : 'poor'}`)
})
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="xm-score-card gf-score-card">
    <div class="xm-gauge-wrap">
      <svg class="xm-gauge" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
        <path class="xm-gauge-track" d="M 20 110 A 80 80 0 0 1 180 110" fill="none" />
        <path
          class="xm-gauge-fill"
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          :stroke-dasharray="ARC_LENGTH"
          :stroke-dashoffset="dashOffset"
        />
        <line
          class="xm-gauge-needle"
          x1="100" y1="110" x2="100" y2="35"
          :transform="`rotate(${needleRotate} 100 110)`"
        />
        <circle class="xm-gauge-hub" cx="100" cy="110" r="5" />
        <text class="xm-gauge-tick" x="20" y="125" text-anchor="middle">0</text>
        <text class="xm-gauge-tick" x="100" y="20" text-anchor="middle">50</text>
        <text class="xm-gauge-tick" x="180" y="125" text-anchor="middle">100</text>
      </svg>
      <div class="xm-score-center">
        <div class="xm-score-value">{{ score }}</div>
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

    <p class="xm-score-desc">{{ result.overallSummary }}</p>
  </div>

  <!-- 简约 -->
  <div v-else class="xm-score-card mn-score-card">
    <div class="xm-gauge-wrap">
      <svg class="xm-gauge" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
        <path class="xm-gauge-track" d="M 20 110 A 80 80 0 0 1 180 110" fill="none" />
        <path
          class="xm-gauge-fill"
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          :stroke-dasharray="ARC_LENGTH"
          :stroke-dashoffset="dashOffset"
        />
        <line
          class="xm-gauge-needle"
          x1="100" y1="110" x2="100" y2="35"
          :transform="`rotate(${needleRotate} 100 110)`"
        />
        <circle class="xm-gauge-hub" cx="100" cy="110" r="5" />
      </svg>
      <div class="xm-score-center">
        <div class="xm-score-num">{{ score }}<small>/100</small></div>
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

    <p class="xm-score-desc">{{ result.overallSummary }}</p>
  </div>
</template>
