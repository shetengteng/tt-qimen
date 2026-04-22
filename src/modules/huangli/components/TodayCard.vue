<script setup lang="ts">
/**
 * 今日大卡。
 * 左：大号公历日 + 星期 + 农历月日 + 干支年。
 * 中：干支 / 值日 / 胎神 / 冲煞 / 彭祖忌 / 节气（若有）
 * 右：12 建星徽章（黄/黑道底色）
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { HuangliDay } from '../types'

const props = defineProps<{
  day: HuangliDay
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const weekdayText = computed(() => {
  const prefix = t('huangli.todayCard.weekdayPrefix') as string
  return prefix ? `${prefix}${props.day.weekday}` : props.day.weekday
})

const chongText = computed(() =>
  t('huangli.todayCard.chongFmt', {
    zodiac: props.day.chong.zodiac,
    ganzhi: props.day.chong.ganzhi,
    direction: props.day.shaDirection,
  }),
)

const dutyText = computed(() => `${props.day.duty}${t('huangli.todayCard.dutySuffix')}`)
const eclipticText = computed(() =>
  props.day.ecliptic === '黄道'
    ? t('huangli.todayCard.ecliptic.yellow')
    : t('huangli.todayCard.ecliptic.black'),
)
const dutyFullText = computed(() => `${dutyText.value} · ${props.day.twelveStar} · ${eclipticText.value}`)

const ganzhiText = computed(() =>
  `${props.day.pillarYear}年 · ${props.day.pillarMonth}月 · ${props.day.pillarDay}日`,
)

const pengzuText = computed(() => `${props.day.pengzuGan} · ${props.day.pengzuZhi}`)

const termText = computed(() => {
  const fest = props.day.solarFestival || props.day.lunarFestival
  if (fest) return `${props.day.term} · ${fest}`
  return props.day.term
})
</script>

<template>
  <div :class="['hl-today-card', isGuofeng ? 'hl-today-card--gf' : 'hl-today-card--mn']">
    <div class="hl-today-date">
      <div class="hl-today-weekday">{{ weekdayText }}</div>
      <div class="hl-today-day">{{ day.day }}</div>
      <div class="hl-today-full">{{ day.dateIso }}</div>
      <div class="hl-today-lunar">
        农历 {{ day.lunarYearGanzhi }} {{ day.lunarMonthDay }}
      </div>
    </div>

    <div class="hl-today-info">
      <div class="hl-info-line">
        <span class="hl-info-label">{{ t('huangli.todayCard.infoGanzhi') }}</span>
        <span class="hl-info-ganzhi">{{ ganzhiText }}</span>
      </div>
      <div class="hl-info-line">
        <span class="hl-info-label">{{ t('huangli.todayCard.infoDuty') }}</span>
        <span class="hl-info-value">{{ dutyFullText }}</span>
      </div>
      <div class="hl-info-line">
        <span class="hl-info-label">{{ t('huangli.todayCard.infoFetus') }}</span>
        <span class="hl-info-value">{{ day.fetus }}</span>
      </div>
      <div class="hl-info-line">
        <span class="hl-info-label">{{ t('huangli.todayCard.infoChong') }}</span>
        <span class="hl-info-value">{{ chongText }}</span>
      </div>
      <div class="hl-info-line">
        <span class="hl-info-label">{{ t('huangli.todayCard.infoPengzu') }}</span>
        <span class="hl-info-value">{{ pengzuText }}</span>
      </div>
      <div class="hl-info-line">
        <span class="hl-info-label">{{ t('huangli.todayCard.infoTerm') }}</span>
        <span class="hl-info-value">{{ termText }}</span>
      </div>
    </div>

    <div class="hl-today-big" :data-ecliptic="day.ecliptic">
      <div class="hl-big-label">{{ t('huangli.todayCard.bigLabel') }}</div>
      <div class="hl-big-value">{{ day.duty }}</div>
    </div>
  </div>
</template>
