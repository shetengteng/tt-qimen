<script setup lang="ts">
/**
 * 当前大限详情卡（M2 §10）
 *
 * 展示当前所处大限段的：
 *  - 区间 + 干支 + 落入本命哪个宫
 *  - 该宫主星（含亮度）
 *  - 大限四化（按大限天干起，逐一显示星名 + 化哪一种 + 落入本命哪个宫）
 *
 * 数据来源：`chart.currentDecadal`（由 core/ziwei.ts 预先计算）
 * 无当前大限或越界（如未起运 / 命主超 120 岁）时不渲染。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { SihuaKey, ZiweiChart } from '../types'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const detail = computed(() => props.chart?.currentDecadal ?? null)

const titleText = computed(() =>
  isGuofeng.value
    ? t('ziwei.decadalDetail.title')
    : t('ziwei.decadalDetail.titleMn'),
)

const subtitleText = computed(() => {
  const d = detail.value
  if (!d) return ''
  return t('ziwei.decadalDetail.subtitleFmt', {
    age: d.age,
    palace: t(`ziwei.palaceNamesShort.${d.palaceKey}`),
    ganzhi: d.ganzhi,
  })
})

function shortSihua(k: SihuaKey): string {
  return t(`ziwei.sihuaShort.${k}`)
}
</script>

<template>
  <section v-if="detail" class="ziwei-decadal-section">
    <div class="ziwei-decadal-header">
      <h2>{{ titleText }}</h2>
      <div class="ziwei-decadal-meta">{{ subtitleText }}</div>
    </div>

    <div class="ziwei-decadal-content">
      <!-- 主星行 -->
      <div class="ziwei-decadal-row">
        <span class="ziwei-decadal-label">{{ t('ziwei.decadalDetail.mainStarsLabel') }}</span>
        <div class="ziwei-decadal-tags">
          <template v-if="detail.mainStars.length">
            <span
              v-for="(s, idx) in detail.mainStars"
              :key="idx"
              class="ziwei-decadal-tag tag-main"
            >
              {{ s.brightness ? `${s.name}${s.brightness}` : s.name }}
            </span>
          </template>
          <span v-else class="ziwei-decadal-tag tag-empty">
            {{ t('ziwei.decadalDetail.empty') }}
          </span>
        </div>
      </div>

      <!-- 大限四化 -->
      <div class="ziwei-decadal-row">
        <span class="ziwei-decadal-label">{{ t('ziwei.decadalDetail.mutagensLabel') }}</span>
        <div class="ziwei-decadal-tags">
          <template v-if="detail.mutagens.length">
            <span
              v-for="(m, idx) in detail.mutagens"
              :key="idx"
              :class="['ziwei-decadal-tag', `tag-sihua-${m.sihua}`]"
            >
              {{ m.name }}<span class="sihua-mark">化{{ shortSihua(m.sihua) }}</span>
              <span v-if="m.palaceKey" class="palace-mark">
                · {{ t(`ziwei.palaceNamesShort.${m.palaceKey}`) }}
              </span>
            </span>
          </template>
          <span v-else class="ziwei-decadal-tag tag-empty">
            {{ t('ziwei.decadalDetail.empty') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
