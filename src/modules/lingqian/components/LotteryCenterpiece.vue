<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
/**
 * 等级显示文本：i18n 把数据层中文 key（'上上'/'上吉'/...）转成当前语言的展示文案。
 * 数据层之所以保持中文，是因为 LEVEL_TIER 表用中文做 key 来分配 up/mid/down 徽章色。
 */
const levelLabel = computed(() => (props.item ? t(`lingqian.level.${props.item.level}`) : ''))
const ariaLabel = computed(() => {
  if (!props.item) return ''
  return t('lingqian.centerpiece.ariaLabel', {
    num: props.item.id,
    level: levelLabel.value,
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
          <!--
            签号始终按 prefix + 数字 + suffix 顺序排（中文"第 72 签" / 英文"No. 72"），
            保证数字在中间；主题差异由 CSS 承担（国风大字号 + 金色、简约小字号 + 灰白）。
            原方案把国风单独走 qianLabel "第  签" 作为独立标签，数字被挤到尾部；已废弃。
          -->
          <div class="lq-centerpiece-number">
            <span class="lq-centerpiece-number-prefix">
              {{ t('lingqian.qianTitle.qianPrefix') }}
            </span>
            <span class="lq-centerpiece-number-value">{{ item.id }}</span>
            <span class="lq-centerpiece-number-suffix">
              {{ t('lingqian.qianTitle.qianSuffix') }}
            </span>
          </div>

          <span :class="['lq-centerpiece-level', tierClass]">
            {{ levelLabel }}
          </span>

          <div class="lq-centerpiece-title">{{ item.title }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>
