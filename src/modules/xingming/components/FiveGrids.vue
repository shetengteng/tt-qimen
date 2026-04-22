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

/**
 * 3×3 网格排布（与原型一致）：
 *   [empty] [天格] [外格]
 *   [人格]  [空]   [空  ]
 *   [空  ]  [地格] [总格]
 */
interface Cell {
  kind: 'empty' | GridName
  gridName?: GridName
}

const CELLS: Cell[] = [
  { kind: 'empty' },
  { kind: 'tian', gridName: 'tian' },
  { kind: 'wai', gridName: 'wai' },
  { kind: 'ren', gridName: 'ren' },
  { kind: 'empty' },
  { kind: 'empty' },
  { kind: 'empty' },
  { kind: 'di', gridName: 'di' },
  { kind: 'zong', gridName: 'zong' },
]

/** 等级 → 简约主题 verdict 类名（ji / dj / xiong） */
const LEVEL_VERDICT_CLASS: Record<string, string> = {
  大吉: 'dj',
  吉: 'ji',
  中吉: 'ji',
  中平: 'mid',
  凶: 'xiong',
  大凶: 'xiong',
}

/** 等级 → 国风 badge 类名（ji / xiong / default） */
const LEVEL_BADGE_CLASS: Record<string, string> = {
  大吉: 'ji',
  吉: 'ji',
  中吉: 'ji',
  中平: '',
  凶: 'xiong',
  大凶: 'xiong',
}

function verdictClassMn(level: string) {
  return LEVEL_VERDICT_CLASS[level] ?? 'mid'
}

function badgeClassGf(level: string) {
  return LEVEL_BADGE_CLASS[level] ?? ''
}

function gridInfo(name: GridName) {
  return props.result.grids[name]
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="xm-fivegrids gf-fivegrids">
    <div class="xm-chart">
      <template v-for="(cell, idx) in CELLS" :key="idx">
        <div v-if="cell.kind === 'empty'" class="xm-cell-empty"></div>
        <div
          v-else
          :class="['xm-ge-box', `xm-ge-${cell.gridName}`]"
        >
          <div class="xm-ge-name">{{ t(`xingming.grids.${cell.gridName}`) }}</div>
          <div class="xm-ge-num">{{ gridInfo(cell.gridName!).number }}</div>
          <span :class="['xm-ge-element', badgeClassGf(gridInfo(cell.gridName!).entry.level)]">
            {{ gridInfo(cell.gridName!).entry.element }} ·
            {{ t(`xingming.levels.${gridInfo(cell.gridName!).entry.level}`) }}
          </span>
        </div>
      </template>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="xm-fivegrids mn-fivegrids">
    <div class="xm-chart">
      <template v-for="(cell, idx) in CELLS" :key="idx">
        <div v-if="cell.kind === 'empty'" class="xm-cell-empty"></div>
        <div
          v-else
          :class="['xm-ge-cell', { 'is-ren': cell.gridName === 'ren' }]"
        >
          <div class="xm-ge-name">{{ t(`xingming.grids.${cell.gridName}`) }}</div>
          <div class="xm-ge-num">{{ gridInfo(cell.gridName!).number }}</div>
          <span :class="['xm-ge-verdict', verdictClassMn(gridInfo(cell.gridName!).entry.level)]">
            {{ gridInfo(cell.gridName!).entry.element }}·{{ t(`xingming.levels.${gridInfo(cell.gridName!).entry.level}`) }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
