<script setup lang="ts">
/**
 * 紫微 · 六吉六煞入宫卡（设计文档 §3.3 第三行 / §5 步骤 4）
 *
 * 输入：chart.minorStarReadings（由 buildMinorStarsReadings 派生，按 slot 升序）
 * 数据：runtime 通过 getMinorStarEntry(starKey, palaceKey, locale) 取 text + verdict
 *
 * 渲染策略：
 *  - 顶部卡片标题：i18n `ziwei.minorStars.title`
 *  - 顶部摘要：本盘有几颗吉星 × 几颗煞星
 *  - 分组：先 6 吉再 6 煞（金/玉色调与朱/墨色调对比）；每段一行
 *  - 行头：宫名 chip + 副星 chip（吉=jade、煞=danger）+ verdict 角标
 *  - 行体：text 正文（与 PalaceMajor 同样不折叠）
 *  - 副星不存在借宫概念
 *  - 空集兜底：minorStarReadings.length === 0 → 显示 empty 文案
 *
 * 注意：单段 50-80 字（与 PalaceMajor 对齐），列表整体由外层 CollapsibleSection 折叠。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ZiweiChart, MinorStarReading } from '../types'
import {
  getMinorStarEntry,
  type MinorStarEntry,
  type Verdict,
} from '../data'
import type { Locale } from '@/locales'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

const readings = computed<MinorStarReading[]>(
  () => props.chart?.minorStarReadings ?? [],
)

interface Row {
  reading: MinorStarReading
  entry: MinorStarEntry | null
}

const luckyRows = computed<Row[]>(() => {
  return readings.value
    .filter((r) => r.isLucky)
    .map((reading) => ({
      reading,
      entry: getMinorStarEntry(
        reading.starKey,
        reading.palaceKey,
        locale.value as Locale,
      ),
    }))
})

const maleficRows = computed<Row[]>(() => {
  return readings.value
    .filter((r) => !r.isLucky)
    .map((reading) => ({
      reading,
      entry: getMinorStarEntry(
        reading.starKey,
        reading.palaceKey,
        locale.value as Locale,
      ),
    }))
})

const summary = computed(() => {
  const lucky = luckyRows.value.length
  const malefic = maleficRows.value.length
  if (lucky === 0 && malefic === 0) return ''
  return t('ziwei.minorStars.summaryFmt', { lucky, malefic })
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
 * 占位检测：英文 144 段 minorStars 当前仍是 `[EN draft] ... pending professional translation.`
 * 命中后用 i18n 短提示替换正文 + 顶部 banner 一次性告知用户。
 */
function isEnPlaceholder(text: string): boolean {
  return text.startsWith('[EN draft]')
}

const showEnPendingBanner = computed(() => {
  if (locale.value !== 'en') return false
  const allRows = [...luckyRows.value, ...maleficRows.value]
  return allRows.some((row) => row.entry && isEnPlaceholder(row.entry.text))
})

function displayText(text: string): string {
  if (isEnPlaceholder(text)) {
    return t('ziwei.minorStars.placeholderLineEn')
  }
  return text
}
</script>

<template>
  <section class="ziwei-minor-stars">
    <header class="ziwei-minor-stars__head">
      <h3 class="ziwei-minor-stars__title">
        {{ t('ziwei.minorStars.title') }}
      </h3>
      <p v-if="summary" class="ziwei-minor-stars__summary">{{ summary }}</p>
      <p v-if="showEnPendingBanner" class="ziwei-minor-stars__en-banner">
        {{ t('ziwei.minorStars.enPendingBanner') }}
      </p>
    </header>

    <template v-if="luckyRows.length || maleficRows.length">
      <section v-if="luckyRows.length" class="ziwei-minor-stars__group ziwei-minor-stars__group--lucky">
        <h4 class="ziwei-minor-stars__group-title">
          {{ t('ziwei.minorStars.luckyGroup') }}
        </h4>
        <ol class="ziwei-minor-stars__list">
          <li
            v-for="(row, idx) in luckyRows"
            :key="`lucky-${row.reading.palaceKey}-${row.reading.starKey}-${idx}`"
            class="ziwei-minor-stars__row is-lucky"
          >
            <div class="ziwei-minor-stars__row-head">
              <span class="ziwei-minor-stars__chip ziwei-minor-stars__chip--palace">
                {{ t(`ziwei.palaceNamesShort.${row.reading.palaceKey}`) }}
              </span>
              <span class="ziwei-minor-stars__chip ziwei-minor-stars__chip--lucky">
                {{ row.reading.starName }}
              </span>
              <span
                v-if="row.entry"
                class="ziwei-minor-stars__verdict"
                :data-tone="verdictTone(row.entry.verdict)"
              >
                {{ verdictLabel(row.entry.verdict) }}
              </span>
            </div>
            <p v-if="row.entry" class="ziwei-minor-stars__text">
              {{ displayText(row.entry.text) }}
            </p>
            <p v-else class="ziwei-minor-stars__text ziwei-minor-stars__text--empty">
              {{ t('ziwei.minorStars.entryMissing') }}
            </p>
          </li>
        </ol>
      </section>

      <section v-if="maleficRows.length" class="ziwei-minor-stars__group ziwei-minor-stars__group--malefic">
        <h4 class="ziwei-minor-stars__group-title">
          {{ t('ziwei.minorStars.maleficGroup') }}
        </h4>
        <ol class="ziwei-minor-stars__list">
          <li
            v-for="(row, idx) in maleficRows"
            :key="`malefic-${row.reading.palaceKey}-${row.reading.starKey}-${idx}`"
            class="ziwei-minor-stars__row is-malefic"
          >
            <div class="ziwei-minor-stars__row-head">
              <span class="ziwei-minor-stars__chip ziwei-minor-stars__chip--palace">
                {{ t(`ziwei.palaceNamesShort.${row.reading.palaceKey}`) }}
              </span>
              <span class="ziwei-minor-stars__chip ziwei-minor-stars__chip--malefic">
                {{ row.reading.starName }}
              </span>
              <span
                v-if="row.entry"
                class="ziwei-minor-stars__verdict"
                :data-tone="verdictTone(row.entry.verdict)"
              >
                {{ verdictLabel(row.entry.verdict) }}
              </span>
            </div>
            <p v-if="row.entry" class="ziwei-minor-stars__text">
              {{ displayText(row.entry.text) }}
            </p>
            <p v-else class="ziwei-minor-stars__text ziwei-minor-stars__text--empty">
              {{ t('ziwei.minorStars.entryMissing') }}
            </p>
          </li>
        </ol>
      </section>
    </template>

    <p v-else class="ziwei-minor-stars__empty">
      {{ t('ziwei.minorStars.empty') }}
    </p>
  </section>
</template>
