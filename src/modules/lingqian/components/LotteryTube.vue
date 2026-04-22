<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

/**
 * 摇签筒视觉块（始终摇晃以呈现"诚心抽签"的氛围）。
 * 不承担任何抽签逻辑；点击交互由 LingqianInput.vue 上的按钮触发。
 *
 * 国风：朱红+鎏金签筒、4 根斜插的签条、竖排"观音灵签"
 * 简约：紫调圆角签筒、3 根细签条、竖排"观音灵签"（::after 由 CSS 注入）
 */

defineProps<{
  /** 摇晃强度（reserved，预留给后续低端机降级 / 抽中瞬间放大） */
  shaking?: boolean
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="lq-shake-scene">
    <div class="lq-scene-halo" aria-hidden="true" />

    <div class="lq-tube">
      <span class="lq-tube-shine" aria-hidden="true" />
      <span class="lq-tube-grain" aria-hidden="true" />
      <div class="lq-tube-stick" />
      <div class="lq-tube-stick" />
      <div class="lq-tube-stick" />
      <div class="lq-tube-stick" />
      <div class="lq-tube-label">{{ t('lingqian.tubeLabel') }}</div>
    </div>

    <div class="lq-tube-shadow" aria-hidden="true" />

    <ul class="lq-scene-dust" aria-hidden="true">
      <li></li><li></li><li></li><li></li><li></li><li></li>
    </ul>
  </div>

  <!-- 简约 -->
  <div v-else class="lq-shake-scene">
    <div class="lq-scene-halo" aria-hidden="true" />

    <div class="lq-tube-wrap">
      <div class="lq-tube">
        <span class="lq-tube-shine" aria-hidden="true" />
      </div>
      <div class="lq-tube-stick s1" />
      <div class="lq-tube-stick s2" />
      <div class="lq-tube-stick s3" />
    </div>

    <div class="lq-tube-shadow" aria-hidden="true" />

    <ul class="lq-scene-dust" aria-hidden="true">
      <li></li><li></li><li></li><li></li><li></li><li></li>
    </ul>
  </div>
</template>
