<script setup lang="ts">
/**
 * 紫微 · 命宫主星论命卡（设计文档 §3.3 第一行 / §5 步骤 4）
 *
 * 输入：chart.soulPalaceCard（由 buildSoulPalaceCard 派生）+ 当前 i18n locale
 * 数据：runtime 通过 getSoulPalaceEntry(starKey, locale) 取得文本与 keywords
 *
 * 渲染策略：
 *  - 卡片标题：i18n `ziwei.soulPalace.title`
 *  - 副标题：星名 + 是否借宫 + 亮度/四化标记
 *  - 论命正文：来自 data/soulPalace.{lang}.ts 的 text 字段
 *  - 关键词 chip 列表：来自 data 的 keywords 字段
 *  - 借宫提示：仅在 borrowed=true 时显示，避免污染主流程
 *  - 兜底：chart.soulPalaceCard === null（命宫与迁移宫均无主星）→ 显示 empty 文案
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ZiweiChart } from '../types'
import { getSoulPalaceEntry, type SoulPalaceEntry } from '../data'
import type { Locale } from '@/locales'

interface Props {
  /** 真实命盘；由外层 result-zone v-if 保证非空 */
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

const soulCard = computed(() => props.chart?.soulPalaceCard ?? null)

const entry = computed<SoulPalaceEntry | null>(() => {
  if (!soulCard.value) return null
  return getSoulPalaceEntry(soulCard.value.starKey, locale.value as Locale)
})

const subtitle = computed(() => {
  if (!soulCard.value) return ''
  const star = soulCard.value.starName
  const base = soulCard.value.borrowed
    ? t('ziwei.soulPalace.subtitleBorrowedFmt', { star })
    : t('ziwei.soulPalace.subtitleFmt', { star })
  const parts: string[] = [base]
  if (soulCard.value.brightness) {
    parts.push(t('ziwei.soulPalace.brightnessFmt', { label: soulCard.value.brightness }))
  }
  if (soulCard.value.sihua) {
    parts.push(
      t('ziwei.soulPalace.sihuaFmt', { label: t(`ziwei.sihuaShort.${soulCard.value.sihua}`) })
    )
  }
  return parts.join(' ')
})
</script>

<template>
  <section class="ziwei-soul-palace">
    <header class="ziwei-soul-palace__head">
      <h3 class="ziwei-soul-palace__title">{{ t('ziwei.soulPalace.title') }}</h3>
      <p v-if="subtitle" class="ziwei-soul-palace__subtitle">{{ subtitle }}</p>
    </header>

    <article v-if="entry" class="ziwei-soul-palace__body">
      <p class="ziwei-soul-palace__text">{{ entry.text }}</p>

      <div v-if="soulCard?.borrowed" class="ziwei-soul-palace__borrowed">
        {{ t('ziwei.soulPalace.borrowedHint') }}
      </div>

      <div v-if="entry.keywords?.length" class="ziwei-soul-palace__keywords">
        <span class="ziwei-soul-palace__keywords-label">
          {{ t('ziwei.soulPalace.keywordsLabel') }}
        </span>
        <span
          v-for="kw in entry.keywords"
          :key="kw"
          class="ziwei-soul-palace__chip"
        >
          {{ kw }}
        </span>
      </div>
    </article>

    <p v-else class="ziwei-soul-palace__empty">
      {{ t('ziwei.soulPalace.empty') }}
    </p>
  </section>
</template>
