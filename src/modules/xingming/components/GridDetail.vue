<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import type { GridName, XingmingResult } from '../types'
import { elementI18nPath, levelI18nPath } from '../utils/i18nHelpers'

interface Props {
  result: XingmingResult
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

/**
 * EN locale 下 81 数理仅翻译 summary（skeleton-only 策略），
 * description 不再渲染长描述以避免中英混排；改用一句 summary 作为正文。
 * zh-CN/zh-TW 仍按完整 description 渲染。
 */
const useSummaryAsBody = computed(() => localeStore.id === 'en')

const DETAIL_ORDER: GridName[] = ['tian', 'ren', 'di', 'wai', 'zong']

interface DetailRow {
  gridName: GridName
  number: number
  elementLabel: string
  levelLabel: string
  body: string
}

const rows = computed<DetailRow[]>(() =>
  DETAIL_ORDER.map((k) => {
    const g = props.result.grids[k]
    return {
      gridName: k,
      number: g.number,
      elementLabel: t(elementI18nPath(g.entry.element)),
      levelLabel: t(levelI18nPath(g.entry.level)),
      body: useSummaryAsBody.value ? g.entry.summary : g.entry.description,
    }
  }),
)

/** 等级 → verdict 类名（与 FiveGrids 保持一致；按算法层中文枚举映射） */
const LEVEL_VERDICT_CLASS: Record<string, string> = {
  大吉: 'dj',
  吉: 'ji',
  中吉: 'ji',
  中平: 'mid',
  凶: 'xiong',
  大凶: 'xiong',
}
function verdictClass(gridName: GridName) {
  const lv = props.result.grids[gridName].entry.level
  return LEVEL_VERDICT_CLASS[lv] ?? 'mid'
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
          {{ row.elementLabel }} ·
          {{ row.levelLabel }}
        </span>
      </div>
      <p class="xm-ge-detail-body">{{ row.body }}</p>
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
          {{ row.elementLabel }}
        </span>
        <span :class="['xm-ge-verdict', verdictClass(row.gridName)]">
          {{ row.levelLabel }}
        </span>
      </div>
      <p class="xm-ge-detail-body">{{ row.body }}</p>
    </div>
  </div>
</template>
