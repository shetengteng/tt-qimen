<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

/**
 * 摇签筒视觉块（始终摇晃以呈现"诚心抽签"的氛围）。
 * - drawing=true 时进入"抽签中"状态：签筒与签条剧烈抖动，替代弹框 loading。
 * - 组件仅做视觉呈现，不承担抽签逻辑。
 *
 * 结构（两主题统一）：
 *   .lq-shake-scene [.lq-shake-scene--drawing?]
 *     .lq-scene-halo
 *     .lq-tube-wrap                ← 统一承担「整体摇晃」动画
 *       .lq-tube                   ← z-index: 2（遮挡签条底部）
 *         .lq-tube-shine / .lq-tube-grain / .lq-tube-label
 *       .lq-tube-stick × N         ← z-index: 1（顶端露出筒外可见，底部插在筒里被遮挡）
 *     .lq-tube-shadow
 *     .lq-scene-dust > li × 6
 */

const props = defineProps<{
  /** 抽签中：签筒/签条切换到剧烈抖动动画 */
  drawing?: boolean
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const sceneClass = computed(() => ({
  'lq-shake-scene': true,
  'lq-shake-scene--drawing': !!props.drawing,
}))
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" :class="sceneClass">
    <div class="lq-scene-halo" aria-hidden="true" />

    <div class="lq-tube-wrap">
      <div class="lq-tube">
        <span class="lq-tube-shine" aria-hidden="true" />
        <span class="lq-tube-grain" aria-hidden="true" />
        <div class="lq-tube-label">{{ t('lingqian.tubeLabel') }}</div>
      </div>
      <div class="lq-tube-stick" />
      <div class="lq-tube-stick" />
      <div class="lq-tube-stick" />
      <div class="lq-tube-stick" />
      <div class="lq-main-stick" aria-hidden="true">
        <span class="lq-main-stick-glow" />
      </div>
    </div>

    <div class="lq-tube-shadow" aria-hidden="true" />

    <ul class="lq-scene-dust" aria-hidden="true">
      <li></li><li></li><li></li><li></li><li></li><li></li>
    </ul>
  </div>

  <!-- 简约 -->
  <div v-else :class="sceneClass">
    <div class="lq-scene-halo" aria-hidden="true" />

    <div class="lq-tube-wrap">
      <div class="lq-tube">
        <span class="lq-tube-shine" aria-hidden="true" />
      </div>
      <div class="lq-tube-stick s1" />
      <div class="lq-tube-stick s2" />
      <div class="lq-tube-stick s3" />
      <div class="lq-main-stick" aria-hidden="true">
        <span class="lq-main-stick-glow" />
      </div>
    </div>

    <div class="lq-tube-shadow" aria-hidden="true" />

    <ul class="lq-scene-dust" aria-hidden="true">
      <li></li><li></li><li></li><li></li><li></li><li></li>
    </ul>
  </div>
</template>
