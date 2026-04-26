<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import type { Aspect, LiurenResult } from '../types'
import { getPalaceDisplayName } from '../data/palaceLabels'
import type { LiurenLocale } from '../data/palacesLocale'

/**
 * 分面 tabs + 解读卡 + 宜忌。
 * 当前分面由上游 v-model 控制；result 由外层 v-else-if 保证非空。
 *
 * 本地化策略：
 *   - readings/suitable/avoid 已由 calculateLiuren(input, locale) 在 result.palace 中本地化
 *   - 标题中的宫名（zh-CN/zh-TW 汉字、en 拼音）由 getPalaceDisplayName 取
 *   - tabs 标签 / 吉凶判语用 i18n keys
 */
interface Props {
  aspect: Aspect
  /** 已计算的六壬结果；调用方用 v-else-if 保证非空 */
  result: LiurenResult
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:aspect', v: Aspect): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const ASPECTS: readonly Aspect[] = ['overall', 'career', 'love', 'wealth', 'health', 'travel']

const palace = computed(() => props.result.palace)
const palaceDisplayName = computed(() =>
  getPalaceDisplayName(palace.value.name, localeStore.id as LiurenLocale),
)

const readingText = computed(() => palace.value.readings[props.aspect])
const listSep = computed(() => (localeStore.id === 'en' ? ', ' : '、'))
const suitable = computed(() =>
  palace.value.suitable.length ? palace.value.suitable.join(listSep.value) : '—',
)
const avoid = computed(() =>
  palace.value.avoid.length ? palace.value.avoid.join(listSep.value) : '—',
)

const verdictClass = computed(() => {
  const j = palace.value.jiXiong
  if (j === 'ji') return 'ji'
  if (j === 'xiong') return 'xiong'
  return 'ping'
})

const verdictLabel = computed(() => t(`liuren.verdict.${palace.value.jiXiong}`))

const title = computed(() => `${palaceDisplayName.value} · ${t(`liuren.aspect.${props.aspect}`)}`)

function pickAspect(a: Aspect) {
  emit('update:aspect', a)
}
</script>

<template>
  <!-- tabs（两主题 class 命名一致，样式由主题 CSS 差异化） -->
  <div class="lr-aspect-tabs">
    <button
      v-for="a in ASPECTS"
      :key="a"
      type="button"
      class="lr-aspect-tab"
      :class="{ active: a === aspect }"
      @click="pickAspect(a)"
    >{{ t(`liuren.aspect.${a}`) }}</button>
  </div>

  <!-- 国风解读卡 -->
  <div v-if="isGuofeng" class="lr-reading-card">
    <div class="lr-reading-header">
      <h3 class="lr-reading-title">{{ title }}</h3>
      <span :class="['lr-reading-verdict', verdictClass]">{{ verdictLabel }}</span>
    </div>
    <p class="lr-reading-body">{{ readingText }}</p>
    <div class="lr-yiji">
      <div class="lr-yiji-item">
        <span class="lr-yiji-label yi">{{ t('liuren.reading.suitable') }}</span>
        <span class="lr-yiji-content">{{ suitable }}</span>
      </div>
      <div class="lr-yiji-item">
        <span class="lr-yiji-label ji">{{ t('liuren.reading.avoid') }}</span>
        <span class="lr-yiji-content">{{ avoid }}</span>
      </div>
    </div>
  </div>

  <!-- 简约解读卡 -->
  <div v-else class="lr-reading-card">
    <div class="lr-reading-header">
      <h3 class="lr-reading-title">{{ title }}</h3>
      <span :class="['lr-reading-verdict', verdictClass]">{{ verdictLabel }}</span>
    </div>
    <p class="lr-reading-body">{{ readingText }}</p>
    <div class="lr-yiji">
      <div class="lr-yiji-box yi">
        <div class="lr-yiji-label">◎ {{ t('liuren.reading.suitable') }}</div>
        <div class="lr-yiji-content">{{ suitable }}</div>
      </div>
      <div class="lr-yiji-box ji">
        <div class="lr-yiji-label">✕ {{ t('liuren.reading.avoid') }}</div>
        <div class="lr-yiji-content">{{ avoid }}</div>
      </div>
    </div>
  </div>
</template>
