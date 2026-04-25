<script setup lang="ts">
/**
 * 单日详情卡（月历点击后展开）。
 *
 * 布局（与 prototypes/huangli.html 一致）：
 *   行1  十二建星 + 一句解读
 *   行2  [吉神]    [凶神]
 *   行3  [冲煞]    [彭祖忌]
 *   行4  [胎神]    [方位]
 *   行5  [宜]      [忌]
 *   行6  [吉时]     (占一行)
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DUTY_MEANING } from '../data/dutyMeaning'
import { translateGod, type GodLocale } from '../data/godNames'
import LuckyHoursDial from './LuckyHoursDial.vue'
import type { HuangliDay } from '../types'

const props = withDefaults(
  defineProps<{
    day: HuangliDay
    /** 当被 Dialog 嵌入时，隐藏自身 head（dialog 已提供 title + close） */
    embedded?: boolean
  }>(),
  { embedded: false },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t, locale } = useI18n()

/** 把 vue-i18n 当前 locale 收敛到 godNames 支持的三档之一。 */
const godLocale = computed<GodLocale>(() => {
  const code = locale.value
  if (code.startsWith('zh-TW') || code === 'zh-Hant') return 'zh-TW'
  if (code.startsWith('en')) return 'en'
  return 'zh-CN'
})

const godsLocalized = computed(() =>
  props.day.gods.map((g) => ({ raw: g, label: translateGod(g, godLocale.value) })),
)
const fiendsLocalized = computed(() =>
  props.day.fiends.map((f) => ({ raw: f, label: translateGod(f, godLocale.value) })),
)

const eclipticText = computed(() =>
  props.day.ecliptic === '黄道'
    ? t('huangli.todayCard.ecliptic.yellow')
    : t('huangli.todayCard.ecliptic.black'),
)

const headDate = computed(() =>
  t('huangli.detail.dateFmt', {
    date: props.day.dateIso,
    weekday: props.day.weekday,
  }),
)
const headLunar = computed(() =>
  t('huangli.detail.lunarFmt', {
    lunar: `${props.day.lunarYearGanzhi} ${props.day.lunarMonthDay}`,
    ecliptic: eclipticText.value,
  }),
)

const dutyIntro = computed(() =>
  t('huangli.detail.dutyIntroFmt', { duty: props.day.duty }),
)
const dutyMeaning = computed(() => DUTY_MEANING[props.day.duty] ?? '')

const chongText = computed(() =>
  t('huangli.todayCard.chongFmt', {
    zodiac: props.day.chong.zodiac,
    ganzhi: props.day.chong.ganzhi,
    direction: props.day.shaDirection,
  }),
)

const pengzuPair = computed(() => [props.day.pengzuGan, props.day.pengzuZhi])

const directionsText = computed(() =>
  t('huangli.detail.directionsFmt', {
    joy: props.day.joyDirection,
    wealth: props.day.wealthDirection,
    fu: props.day.fuDirection,
  }),
)

const luckyHoursText = computed(() =>
  props.day.luckyHours.length === 0
    ? t('huangli.detail.empty')
    : props.day.luckyHours.map((h) => `${h.name}(${h.ganzhi} · ${h.star})`).join(' / '),
)

/** R3：圆盘需要 isToday 来高亮当前时辰 */
const isTodayProp = computed<boolean>(() => {
  const now = new Date()
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return props.day.dateIso === todayIso
})
</script>

<template>
  <div :class="['hl-detail-card', { 'hl-detail-card--embedded': embedded }]">
    <div v-if="!embedded" class="hl-detail-head">
      <div>
        <span class="hl-detail-date">{{ headDate }}</span>
        <span class="hl-detail-lunar">{{ headLunar }}</span>
      </div>
      <button
        type="button"
        class="hl-detail-close"
        :aria-label="t('huangli.detail.closeAria')"
        @click="emit('close')"
      >
        ×
      </button>
    </div>
    <div v-else class="hl-detail-subhead">
      <span class="hl-detail-date">{{ headDate }}</span>
      <span class="hl-detail-lunar">{{ headLunar }}</span>
    </div>

    <div class="hl-detail-body">
      <div class="hl-dd-section">
        <div class="hl-dd-head">{{ t('huangli.detail.duty') }}</div>
        <div class="hl-dd-content">
          <span class="hl-dd-tag hl-dd-tag--primary">{{ dutyIntro }}</span>
          <span class="hl-dd-meaning">{{ dutyMeaning }}</span>
        </div>
      </div>

      <div class="hl-dd-row">
        <div class="hl-dd-section hl-dd-section--half">
          <div class="hl-dd-head">{{ t('huangli.detail.gods') }}</div>
          <div class="hl-dd-content">
            <template v-if="godsLocalized.length > 0">
              <span v-for="g in godsLocalized" :key="`g-${g.raw}`" class="hl-dd-tag hl-dd-tag--good">{{ g.label }}</span>
            </template>
            <span v-else class="hl-dd-empty">{{ t('huangli.detail.empty') }}</span>
          </div>
        </div>
        <div class="hl-dd-section hl-dd-section--half">
          <div class="hl-dd-head">{{ t('huangli.detail.fiends') }}</div>
          <div class="hl-dd-content">
            <template v-if="fiendsLocalized.length > 0">
              <span v-for="f in fiendsLocalized" :key="`f-${f.raw}`" class="hl-dd-tag hl-dd-tag--warn">{{ f.label }}</span>
            </template>
            <span v-else class="hl-dd-empty">{{ t('huangli.detail.empty') }}</span>
          </div>
        </div>
      </div>

      <div class="hl-dd-row">
        <div class="hl-dd-section hl-dd-section--half">
          <div class="hl-dd-head">{{ t('huangli.detail.chongLabel') }}</div>
          <div class="hl-dd-content">{{ chongText }}</div>
        </div>
        <div class="hl-dd-section hl-dd-section--half">
          <div class="hl-dd-head">{{ t('huangli.detail.pengzu') }}</div>
          <div class="hl-dd-content">
            <span v-for="(p, i) in pengzuPair" :key="`pz-${i}`" class="hl-dd-line">{{ p }}</span>
          </div>
        </div>
      </div>

      <div class="hl-dd-row">
        <div class="hl-dd-section hl-dd-section--half">
          <div class="hl-dd-head">{{ t('huangli.detail.fetus') }}</div>
          <div class="hl-dd-content">{{ day.fetus }}</div>
        </div>
        <div class="hl-dd-section hl-dd-section--half">
          <div class="hl-dd-head">{{ t('huangli.detail.directions') }}</div>
          <div class="hl-dd-content">{{ directionsText }}</div>
        </div>
      </div>

      <div class="hl-dd-row">
        <div class="hl-dd-section hl-dd-section--half hl-dd-section--yi">
          <div class="hl-dd-head">{{ t('huangli.detail.yi') }}</div>
          <div class="hl-dd-content">
            <template v-if="day.recommends.length > 0">
              <span v-for="w in day.recommends" :key="`yi-${w}`" class="hl-dd-tag hl-dd-tag--yi">{{ w }}</span>
            </template>
            <span v-else class="hl-dd-empty">{{ t('huangli.detail.empty') }}</span>
          </div>
        </div>
        <div class="hl-dd-section hl-dd-section--half hl-dd-section--ji">
          <div class="hl-dd-head">{{ t('huangli.detail.ji') }}</div>
          <div class="hl-dd-content">
            <template v-if="day.avoids.length > 0">
              <span v-for="w in day.avoids" :key="`ji-${w}`" class="hl-dd-tag hl-dd-tag--ji">{{ w }}</span>
            </template>
            <span v-else class="hl-dd-empty">{{ t('huangli.detail.empty') }}</span>
          </div>
        </div>
      </div>

      <div class="hl-dd-section">
        <div class="hl-dd-head">{{ t('huangli.detail.luckyHours') }}</div>
        <!-- R3：12 时辰圆盘可视化 -->
        <LuckyHoursDial :hours="day.hours" :is-today="isTodayProp" />
        <details class="hl-dd-shichen-fallback">
          <summary>{{ t('huangli.luckyHours.dial.fallbackSummary') }}</summary>
          <div class="hl-dd-content">{{ luckyHoursText }}</div>
        </details>
      </div>
    </div>
  </div>
</template>
