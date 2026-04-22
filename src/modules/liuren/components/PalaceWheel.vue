<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { PALACES, PALACES_ORDER } from '../data/palaces'
import type { PalaceName } from '../types'

/**
 * 六宫盘：
 *   - 国风：圆环 + 中心大字（最终命中宫）
 *   - 简约：3×2 网格 + 命中 ✓ 角标
 *
 * 未起卦时不显示中心大字；命中宫以 active 高亮。
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
const isGuofeng = computed(() => themeStore.id === 'guofeng')

/** 6 个宫位的静态信息（按 PALACES_ORDER 的顺序） */
const palaces = computed(() =>
  PALACES_ORDER.map((name, idx) => {
    const p = PALACES[name]
    return {
      idx: idx + 1,
      name,
      tag: p.tag,
      element: p.element,
      jiXiong: p.jiXiong,
      active: props.current === name,
    }
  }),
)

const currentPalace = computed(() => (props.current ? PALACES[props.current] : null))
</script>

<template>
  <!-- 国风：圆环布局（6 个小圆 + 中心大圆） -->
  <section v-if="isGuofeng" class="lr-wheel-section">
    <div class="lr-wheel">
      <div class="lr-wheel-center">
        <div v-if="currentPalace" class="lr-wheel-center-main">{{ currentPalace.name }}</div>
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
        <div class="lr-palace-name">{{ p.name }}</div>
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
        <div class="lr-palace-name">{{ p.name }}</div>
        <div class="lr-palace-tag">{{ p.tag }} · {{ p.element }}</div>
      </div>
    </div>
  </section>
</template>
