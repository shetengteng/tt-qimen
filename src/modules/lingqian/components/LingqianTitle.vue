<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { LingqianItem, LingqianLevel } from '../types'

/**
 * 签号大字 + 等级徽章 + 典故名。
 * 等级映射到三类色彩 tier：
 *   - up   : 上上 / 上吉
 *   - mid  : 中吉 / 中平
 *   - down : 中凶 / 下下
 *
 * tier 仅用于 CSS class，文本内容保留汉字原文。
 */
interface Props {
  item: LingqianItem | null
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const LEVEL_TIER: Readonly<Record<LingqianLevel, 'up' | 'mid' | 'down'>> = {
  上上: 'up',
  上吉: 'up',
  中吉: 'mid',
  中平: 'mid',
  中凶: 'down',
  下下: 'down',
}

const numberText = computed(() => props.item?.id ?? '—')
const levelText = computed(() => props.item?.level ?? '—')
const titleText = computed(() => props.item?.title ?? t('lingqian.placeholder.title'))
const tierClass = computed(() => (props.item ? LEVEL_TIER[props.item.level] : 'mid'))
</script>

<template>
  <header v-if="isGuofeng" class="lq-title-header">
    <div class="lq-qian-number">
      <div class="lq-qian-number-label">{{ t('lingqian.qianTitle.qianLabel') }}</div>
      <div class="lq-qian-number-value">{{ numberText }}</div>
    </div>
    <div class="lq-qian-meta">
      <div class="lq-qian-name">{{ titleText }}</div>
      <span :class="['lq-qian-level', tierClass]">{{ levelText }}</span>
    </div>
  </header>

  <header v-else class="lq-title-header">
    <div class="lq-qian-number-box">
      <span class="lq-qian-number-label">{{ t('lingqian.qianTitle.qianPrefix') }}</span>
      <span class="lq-qian-num">{{ numberText }}</span>
      <span class="lq-qian-number-label">{{ t('lingqian.qianTitle.qianSuffix') }}</span>
    </div>
    <div class="lq-qian-meta">
      <div class="lq-qian-name">{{ titleText }}</div>
      <span :class="['lq-qian-level', tierClass]">{{ levelText }}</span>
    </div>
  </header>
</template>
