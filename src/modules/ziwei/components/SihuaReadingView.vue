<script setup lang="ts">
/**
 * 紫微 · 四化论命卡（设计文档 §3.3 第三行 / §5 步骤 4）
 *
 * 输入：chart.palaces 中的命宫（isMing=true）— 取其干支首字符为命宫天干
 * 数据：runtime 通过 loadSihuaReadingForStem(stemKey, locale) 异步取出 4 段（禄/权/科/忌）
 *
 * 渲染策略：
 *  - 命宫无干支或天干识别失败：显示 stemMissing 文案
 *  - 资产懒加载未到位时（首次切语言瞬间）：4 段保持 loading 占位，避免 layout shift
 *  - 4 段按"禄/权/科/忌"固定顺序渲染：每段一星 + 论断 + verdict tag
 *  - verdict tone 复用 minorStars / palaceMajor 的 tone 体系
 *
 * 注意：本卡片是"命宫天干 → 4 段"模式，与 SoulPalace（一段命宫主星）正交，
 * 因此不与 SoulPalaceView 合并；UI 层独立卡，便于将来扩展"大限/流年天干"系列。
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ZiweiChart, SihuaKey } from '../types'
import {
  ZH_STEM_TO_KEY,
  type HeavenlyStemKey,
  type SihuaReadingEntry,
  type Verdict,
} from '../data'
import { loadSihuaReadingForStem } from '../data/lazy'
import type { Locale } from '@/locales'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

const SIHUA_ORDER: SihuaKey[] = ['lu', 'quan', 'ke', 'ji']

const mingPalace = computed(() => props.chart?.palaces.find((p) => p.isMing) ?? null)

const stemKey = computed<HeavenlyStemKey | null>(() => {
  const ganzhi = mingPalace.value?.ganzhi ?? ''
  if (!ganzhi) return null
  return ZH_STEM_TO_KEY[ganzhi[0]] ?? null
})

const stemZh = computed(() => mingPalace.value?.ganzhi?.[0] ?? '')

const subtitle = computed(() => {
  if (!stemZh.value) return ''
  return t('ziwei.sihuaReading.subtitleFmt', { stem: stemZh.value })
})

interface Row {
  sihua: SihuaKey
  entry: SihuaReadingEntry | null
}

const rows = ref<Row[]>([])

watch(
  [stemKey, locale],
  async ([sk, lang]) => {
    if (!sk) {
      rows.value = []
      return
    }
    const all = await loadSihuaReadingForStem(sk, lang as Locale)
    if (!all) {
      rows.value = []
      return
    }
    rows.value = SIHUA_ORDER.map((s) => ({ sihua: s, entry: all[s] ?? null }))
  },
  { immediate: true },
)

function verdictTone(v: Verdict): 'jade' | 'plain' | 'danger' {
  if (v === 'ji') return 'jade'
  if (v === 'xiong') return 'danger'
  return 'plain'
}

function verdictLabel(v: Verdict): string {
  return t(`ziwei.palaceMajor.verdict.${v}`)
}

function sihuaLabel(s: SihuaKey): string {
  return t(`ziwei.sihuaReading.sihuaLabel.${s}`)
}
</script>

<template>
  <section class="ziwei-sihua-reading">
    <header class="ziwei-sihua-reading__head">
      <h3 class="ziwei-sihua-reading__title">{{ t('ziwei.sihuaReading.title') }}</h3>
      <p v-if="subtitle" class="ziwei-sihua-reading__subtitle">{{ subtitle }}</p>
    </header>

    <p v-if="!stemKey" class="ziwei-sihua-reading__empty">
      {{ t('ziwei.sihuaReading.stemMissing') }}
    </p>

    <ol v-else class="ziwei-sihua-reading__list">
      <li
        v-for="row in rows"
        :key="row.sihua"
        :class="['ziwei-sihua-reading__row', `tag-sihua-${row.sihua}`]"
      >
        <div class="ziwei-sihua-reading__row-head">
          <span :class="['ziwei-sihua-reading__chip', `chip-${row.sihua}`]">
            {{ sihuaLabel(row.sihua) }}
          </span>
          <span v-if="row.entry" class="ziwei-sihua-reading__star">
            {{ row.entry.star }}
          </span>
          <span
            v-if="row.entry"
            class="ziwei-sihua-reading__verdict"
            :data-tone="verdictTone(row.entry.verdict)"
          >
            {{ verdictLabel(row.entry.verdict) }}
          </span>
        </div>
        <p v-if="row.entry" class="ziwei-sihua-reading__text">
          {{ row.entry.text }}
        </p>
        <p v-else class="ziwei-sihua-reading__text ziwei-sihua-reading__text--empty">
          {{ t('ziwei.sihuaReading.entryMissing') }}
        </p>
      </li>
    </ol>
  </section>
</template>
