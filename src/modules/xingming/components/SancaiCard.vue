<script setup lang="ts">
/**
 * 三才配置卡片
 *
 * 展示天/人/地三才五行（三列）+ 中间生克关系箭头 + 下方 verdict badge。
 * 等级 5 档（大吉 / 吉 / 中吉 / 凶 / 大凶），独立维度，不影响 81 数理评分。
 *
 * 双主题：
 *  - guofeng：红黑金调；slot 用 .xm-sancai-slot.gf 样式 + 圆形描边
 *  - minimal：极简灰白；slot 用方角卡 + 等级色彩 token
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { SancaiSlot, SancaiRelation, XingmingResult } from '../types'
import { elementI18nPath } from '../utils/i18nHelpers'

interface Props {
  result: XingmingResult
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const verdict = computed(() => props.result.sancai)

interface SlotView {
  slot: SancaiSlot
  element: string
}

const slots = computed<SlotView[]>(() => [
  { slot: 'tian', element: verdict.value.combo[0] },
  { slot: 'ren', element: verdict.value.combo[1] },
  { slot: 'di', element: verdict.value.combo[2] },
])

interface RelationView {
  relation: SancaiRelation
  shortLabel: string
  fullLabel: string
}

const relations = computed<RelationView[]>(() => [
  {
    relation: verdict.value.tianToRen,
    shortLabel: t(`xingming.sancai.relation.${verdict.value.tianToRen}`),
    fullLabel: t(`xingming.sancai.relationFull.${verdict.value.tianToRen}`),
  },
  {
    relation: verdict.value.renToDi,
    shortLabel: t(`xingming.sancai.relation.${verdict.value.renToDi}`),
    fullLabel: t(`xingming.sancai.relationFull.${verdict.value.renToDi}`),
  },
])

/** 关系 → 颜色语义 class（生=吉 / 克=凶 / 比和=中性 / 泄/耗=弱凶） */
function relationClass(r: SancaiRelation): string {
  if (r === 'sheng') return 'is-sheng'
  if (r === 'tongHe') return 'is-tonghe'
  if (r === 'ke') return 'is-ke'
  return 'is-soft'
}

const levelKey = computed(() => verdict.value.levelKey)
const levelText = computed(() => t(`xingming.sancai.level.${levelKey.value}`))
const summaryText = computed(() => t(`xingming.sancai.summary.${levelKey.value}`))
const hintText = computed(() => t('xingming.sancai.hint'))

const ariaLabel = computed(() =>
  t('xingming.sancai.diagramAria', {
    tian: t(elementI18nPath(verdict.value.combo[0])),
    ren: t(elementI18nPath(verdict.value.combo[1])),
    di: t(elementI18nPath(verdict.value.combo[2])),
    tianToRen: relations.value[0].fullLabel,
    renToDi: relations.value[1].fullLabel,
    level: levelText.value,
  }),
)
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="xm-sancai gf-sancai" role="group" :aria-label="ariaLabel">
    <div class="xm-sancai-head">
      <div class="xm-sancai-title">{{ t('xingming.sancai.sectionTitle') }}</div>
      <div class="xm-sancai-subtitle">{{ t('xingming.sancai.sectionSubtitle') }}</div>
    </div>

    <div class="xm-sancai-diagram">
      <template v-for="(s, idx) in slots" :key="s.slot">
        <div class="xm-sancai-slot" :class="`is-${s.slot}`">
          <div class="xm-sancai-slot-name">{{ t(`xingming.sancai.slotLabel.${s.slot}`) }}</div>
          <div class="xm-sancai-slot-element">{{ t(elementI18nPath(s.element as never)) }}</div>
        </div>
        <div
          v-if="idx < relations.length"
          class="xm-sancai-rel"
          :class="relationClass(relations[idx].relation)"
          :title="relations[idx].fullLabel"
        >
          <span class="xm-sancai-rel-arrow" aria-hidden="true">→</span>
          <span class="xm-sancai-rel-text">{{ relations[idx].shortLabel }}</span>
        </div>
      </template>
    </div>

    <div class="xm-sancai-verdict" :class="`level-${levelKey}`">
      <span class="xm-sancai-verdict-label">{{ levelText }}</span>
      <span class="xm-sancai-verdict-summary">{{ summaryText }}</span>
    </div>

    <p class="xm-sancai-hint">{{ hintText }}</p>
  </div>

  <!-- 简约 -->
  <div v-else class="xm-sancai mn-sancai" role="group" :aria-label="ariaLabel">
    <div class="xm-sancai-head">
      <div class="xm-sancai-title">{{ t('xingming.sancai.sectionTitle') }}</div>
      <div class="xm-sancai-subtitle">{{ t('xingming.sancai.sectionSubtitle') }}</div>
    </div>

    <div class="xm-sancai-diagram">
      <template v-for="(s, idx) in slots" :key="s.slot">
        <div class="xm-sancai-slot" :class="`is-${s.slot}`">
          <div class="xm-sancai-slot-name">{{ t(`xingming.sancai.slotLabel.${s.slot}`) }}</div>
          <div class="xm-sancai-slot-element">{{ t(elementI18nPath(s.element as never)) }}</div>
        </div>
        <div
          v-if="idx < relations.length"
          class="xm-sancai-rel"
          :class="relationClass(relations[idx].relation)"
          :title="relations[idx].fullLabel"
        >
          <span class="xm-sancai-rel-arrow" aria-hidden="true">→</span>
          <span class="xm-sancai-rel-text">{{ relations[idx].shortLabel }}</span>
        </div>
      </template>
    </div>

    <div class="xm-sancai-verdict" :class="`level-${levelKey}`">
      <span class="xm-sancai-verdict-label">{{ levelText }}</span>
      <span class="xm-sancai-verdict-summary">{{ summaryText }}</span>
    </div>

    <p class="xm-sancai-hint">{{ hintText }}</p>
  </div>
</template>
