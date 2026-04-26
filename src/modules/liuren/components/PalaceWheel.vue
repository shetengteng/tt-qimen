<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import { PALACES_ORDER } from '../data/palaces'
import { getLocalizedPalace, type LiurenLocale } from '../data/palacesLocale'
import { getPalaceDisplayName } from '../data/palaceLabels'
import type { PalaceName } from '../types'

/**
 * 六宫盘：
 *   - 国风：圆环 + 中心大字（最终命中宫）
 *   - 简约：3×2 网格 + 命中 ✓ 角标
 *
 * 未起卦时不显示中心大字；命中宫以 active 高亮。
 *
 * 本地化策略：宫名 displayName 通过 getPalaceDisplayName(name, locale) 取，tag 通过 getLocalizedPalace 取。
 */
interface Props {
  /** 当前命中的宫名（未起卦为 null） */
  current: PalaceName | null
  /** 三步路径（可选，未使用时数组为空，组件不做特殊可视化） */
  path?: readonly PalaceName[]
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const locale = computed<LiurenLocale>(() => localeStore.id as LiurenLocale)

const palaces = computed(() =>
  PALACES_ORDER.map((name, idx) => {
    const p = getLocalizedPalace(name, locale.value)
    return {
      idx: idx + 1,
      name,
      displayName: getPalaceDisplayName(name, locale.value),
      tag: p.tag,
      element: p.element,
      jiXiong: p.jiXiong,
      active: props.current === name,
    }
  }),
)

const currentPalace = computed(() =>
  props.current ? getLocalizedPalace(props.current, locale.value) : null,
)

const currentDisplayName = computed(() =>
  props.current ? getPalaceDisplayName(props.current, locale.value) : null,
)
</script>

<template>
  <!-- 国风：圆环布局（6 个小圆 + 中心大圆） -->
  <section v-if="isGuofeng" class="lr-wheel-section">
    <div class="lr-wheel">
      <div class="lr-wheel-center">
        <div v-if="currentPalace" class="lr-wheel-center-main">{{ currentDisplayName }}</div>
        <div v-else class="lr-wheel-center-main lr-wheel-center-main--idle">◉</div>
        <div class="lr-wheel-center-label">{{ t('liuren.wheel.centerLabel') }}</div>
      </div>
      <div
        v-for="p in palaces"
        :key="p.name"
        class="lr-palace"
        :class="{ active: p.active }"
        :data-pos="p.idx"
      >
        <div class="lr-palace-name">{{ p.displayName }}</div>
        <div class="lr-palace-badge">{{ p.tag }}</div>
      </div>
    </div>
  </section>

  <!-- 简约：3×2 卡片网格 -->
  <section v-else class="lr-wheel-section">
    <div class="lr-palace-grid">
      <div
        v-for="p in palaces"
        :key="p.name"
        class="lr-palace"
        :class="{ active: p.active }"
        :data-pos="p.idx"
      >
        <span class="lr-palace-num">{{ p.idx }}</span>
        <div class="lr-palace-name">{{ p.displayName }}</div>
        <div class="lr-palace-tag">{{ p.tag }} · {{ p.element }}</div>
      </div>
    </div>
  </section>
</template>
