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

const DETAIL_ORDER: GridName[] = ['tian', 'ren', 'di', 'wai', 'zong']

interface DetailRow {
  gridName: GridName
  number: number
  element: string
  level: string
  description: string
}

const rows = computed<DetailRow[]>(() =>
  DETAIL_ORDER.map((k) => {
    const g = props.result.grids[k]
    return {
      gridName: k,
      number: g.number,
      element: g.entry.element,
      level: g.entry.level,
      description: g.entry.description,
    }
  }),
)

/** 等级 → verdict 类名（与 FiveGrids 保持一致） */
const LEVEL_VERDICT_CLASS: Record<string, string> = {
  大吉: 'dj',
  吉: 'ji',
  中吉: 'ji',
  中平: 'mid',
  凶: 'xiong',
  大凶: 'xiong',
}
function verdictClass(level: string) {
  return LEVEL_VERDICT_CLASS[level] ?? 'mid'
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="xm-ge-details gf-ge-details">
    <div
      v-for="row in rows"
      :key="row.gridName"
      :class="['xm-ge-detail', { 'is-ren': row.gridName === 'ren' }]"
    >
      <div class="xm-ge-detail-head">
        <span class="xm-ge-detail-title">
          {{ t(`xingming.grids.${row.gridName}`) }} ·
          {{ row.number }} {{ t('xingming.detail.strokesUnit') }} ·
          {{ row.element }} ·
          {{ t(`xingming.levels.${row.level}`) }}
        </span>
      </div>
      <p class="xm-ge-detail-body">{{ row.description }}</p>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="xm-ge-details mn-ge-details">
    <div
      v-for="row in rows"
      :key="row.gridName"
      :class="['xm-ge-detail', { 'is-ren': row.gridName === 'ren' }]"
    >
      <div class="xm-ge-detail-head">
        <span class="xm-ge-detail-title">
          {{ t(`xingming.grids.${row.gridName}`) }} ·
          {{ row.number }} {{ t('xingming.detail.strokesUnit') }} ·
          {{ row.element }}
        </span>
        <span :class="['xm-ge-verdict', verdictClass(row.level)]">
          {{ t(`xingming.levels.${row.level}`) }}
        </span>
      </div>
      <p class="xm-ge-detail-body">{{ row.description }}</p>
    </div>
  </div>
</template>
