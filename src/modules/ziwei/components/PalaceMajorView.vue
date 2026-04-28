<script setup lang="ts">
/**
 * 紫微 · 各宫主星简析卡（设计文档 §3.3 第二行 / §5 步骤 4）
 *
 * 输入：chart.palaceMajorReadings（由 buildPalaceMajorReadings 派生，按 slot 升序）
 * 数据：runtime 通过 getPalaceMajorEntry(starKey, palaceKey, locale) 取得文本 + 吉凶
 *
 * 渲染策略：
 *  - 顶部卡片标题：i18n `ziwei.palaceMajor.title`
 *  - 顶部摘要：本盘有几段主星 × 几段借宫
 *  - 列表：每段一行，行头是宫名 chip + 主星 chip + 吉/中/凶 verdict 角标，行体是文本
 *  - 借宫的视觉降权：左侧加细边框 + 浅金底色；标题加 "借" 前缀
 *  - 空集兜底：palaceMajorReadings.length === 0 → 显示 empty 文案
 *
 * 注意：单段不超过 80 字（设计文档约束），UI 不滚动、不折叠每段；
 * 列表整体如太长由 CollapsibleSection 在外层折叠。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ZiweiChart, PalaceMajorReading } from '../types'
import {
  getPalaceMajorEntry,
  type PalaceMajorEntry,
  type Verdict,
} from '../data'
import type { Locale } from '@/locales'

interface Props {
  /** 真实命盘；由外层 result-zone v-if 保证非空 */
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

const readings = computed<PalaceMajorReading[]>(
  () => props.chart?.palaceMajorReadings ?? [],
)

interface Row {
  reading: PalaceMajorReading
  entry: PalaceMajorEntry | null
}

const rows = computed<Row[]>(() => {
  return readings.value.map((reading) => {
    const entry = getPalaceMajorEntry(
      reading.starKey,
      reading.palaceKey,
      locale.value as Locale,
    )
    return { reading, entry }
  })
})

const summary = computed(() => {
  const total = readings.value.length
  if (total === 0) return ''
  const borrowed = readings.value.filter((r) => r.borrowed).length
  return t('ziwei.palaceMajor.summaryFmt', { total, borrowed })
})

function verdictTone(v: Verdict): 'jade' | 'plain' | 'danger' {
  if (v === 'ji') return 'jade'
  if (v === 'xiong') return 'danger'
  return 'plain'
}

function verdictLabel(v: Verdict): string {
  return t(`ziwei.palaceMajor.verdict.${v}`)
}

/**
 * 占位检测：英文 168 段 palaceMajor 当前为 `[EN draft] ... pending professional translation.`
 * 这是给翻译人员看的内部标记、不应直接展示给用户。检测命中后用 i18n 短提示替换正文，
 * 同时顶部 banner 一次性告知用户"英文长篇尚在审译"，避免每段重复噪音。
 */
function isEnPlaceholder(text: string): boolean {
  return text.startsWith('[EN draft]')
}

const showEnPendingBanner = computed(() => {
  if (locale.value !== 'en') return false
  return rows.value.some((row) => row.entry && isEnPlaceholder(row.entry.text))
})

function displayText(text: string): string {
  if (isEnPlaceholder(text)) {
    return t('ziwei.palaceMajor.placeholderLineEn')
  }
  return text
}
</script>

<template>
  <section class="ziwei-palace-major">
    <header class="ziwei-palace-major__head">
      <h3 class="ziwei-palace-major__title">
        {{ t('ziwei.palaceMajor.title') }}
      </h3>
      <p v-if="summary" class="ziwei-palace-major__summary">{{ summary }}</p>
      <p v-if="showEnPendingBanner" class="ziwei-palace-major__en-banner">
        {{ t('ziwei.palaceMajor.enPendingBanner') }}
      </p>
    </header>

    <ol v-if="rows.length" class="ziwei-palace-major__list">
      <li
        v-for="(row, idx) in rows"
        :key="`${row.reading.palaceKey}-${row.reading.starKey}-${idx}`"
        class="ziwei-palace-major__row"
        :class="{
          'is-borrowed': row.reading.borrowed,
        }"
      >
        <div class="ziwei-palace-major__row-head">
          <span class="ziwei-palace-major__chip ziwei-palace-major__chip--palace">
            {{ t(`ziwei.palaceNamesShort.${row.reading.palaceKey}`) }}
          </span>
          <span class="ziwei-palace-major__chip ziwei-palace-major__chip--star">
            <template v-if="row.reading.borrowed">
              {{ t('ziwei.palaceMajor.borrowedPrefix') }}
            </template>
            {{ row.reading.starName
            }}<template v-if="row.reading.brightness">
              {{ row.reading.brightness }}
            </template>
          </span>
          <span
            v-if="row.reading.sihua"
            class="ziwei-palace-major__chip ziwei-palace-major__chip--sihua"
          >
            {{ t(`ziwei.sihuaShort.${row.reading.sihua}`) }}
          </span>
          <span
            v-if="row.entry"
            class="ziwei-palace-major__verdict"
            :data-tone="verdictTone(row.entry.verdict)"
          >
            {{ verdictLabel(row.entry.verdict) }}
          </span>
        </div>
        <p v-if="row.entry" class="ziwei-palace-major__text">
          {{ displayText(row.entry.text) }}
        </p>
        <p v-else class="ziwei-palace-major__text ziwei-palace-major__text--empty">
          {{ t('ziwei.palaceMajor.entryMissing') }}
        </p>
      </li>
    </ol>

    <p v-else class="ziwei-palace-major__empty">
      {{ t('ziwei.palaceMajor.empty') }}
    </p>
  </section>
</template>
