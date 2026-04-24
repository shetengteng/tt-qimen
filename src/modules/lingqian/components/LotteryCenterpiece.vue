<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { LingqianItem, LingqianLevel } from '../types'

/**
 * 中央特写：全屏 overlay，展示抽得签的"签号 + 等级 + 典故标题"。
 *
 * 动画阶段由 `stage` 驱动（从 LingqianPage 传入）：
 *   - hidden  : 不渲染
 *   - flying  : overlay 背景淡入 + 放大签条从下方/缩小态飞入中央（0-450ms）
 *   - showing : 签条定格 + 签号/等级/标题文字渐次上浮（450-650ms）
 *   - holding : 停留（650-2150ms = 1500ms 阅读停留）
 *   - fading  : 签条与 overlay 一起淡出（2150-2550ms = 400ms 淡出）
 *
 * 视觉一致性：
 *   - 放大版签条复用 LotteryTube 的 lq-main-stick 色调，但尺寸放大
 *   - 等级徽章复用 .lq-qian-level.up/.mid/.down 的色系
 *
 * 无障碍：
 *   - 整个特写含 role="status" aria-live="polite"，让屏幕阅读器播报签号 + 等级 + 标题
 *   - reduced-motion 下阶段缩短到 80ms 过渡，不做飞入动效
 */
export type CenterpieceStage = 'hidden' | 'flying' | 'showing' | 'holding' | 'fading'

interface Props {
  /** 本轮抽得的签；null 时组件不渲染 */
  item: LingqianItem | null
  /** 当前动画阶段，由父组件驱动 */
  stage: CenterpieceStage
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

const visible = computed(() => props.stage !== 'hidden' && props.item !== null)
const rootClass = computed(() => ({
  'lq-centerpiece': true,
  [`lq-centerpiece--${props.stage}`]: true,
}))
const tierClass = computed(() => (props.item ? LEVEL_TIER[props.item.level] : 'mid'))
const ariaLabel = computed(() => {
  if (!props.item) return ''
  return t('lingqian.centerpiece.ariaLabel', {
    num: props.item.id,
    level: props.item.level,
    title: props.item.title,
  })
})
</script>

<template>
  <Transition name="lq-centerpiece-fade">
    <div
      v-if="visible && item"
      :class="rootClass"
      role="status"
      aria-live="polite"
      :aria-label="ariaLabel"
    >
      <div class="lq-centerpiece-scrim" aria-hidden="true" />

      <div class="lq-centerpiece-stage">
        <div class="lq-centerpiece-stick" aria-hidden="true">
          <span class="lq-centerpiece-stick-shine" />
          <span class="lq-centerpiece-stick-glow" />
        </div>

        <div class="lq-centerpiece-info">
          <div class="lq-centerpiece-number">
            <span v-if="isGuofeng" class="lq-centerpiece-number-label">
              {{ t('lingqian.qianTitle.qianLabel') }}
            </span>
            <span v-else class="lq-centerpiece-number-prefix">
              {{ t('lingqian.qianTitle.qianPrefix') }}
            </span>
            <span class="lq-centerpiece-number-value">{{ item.id }}</span>
            <span v-if="!isGuofeng" class="lq-centerpiece-number-suffix">
              {{ t('lingqian.qianTitle.qianSuffix') }}
            </span>
          </div>

          <span :class="['lq-centerpiece-level', tierClass]">
            {{ item.level }}
          </span>

          <div class="lq-centerpiece-title">{{ item.title }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>
