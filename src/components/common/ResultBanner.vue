<script setup lang="ts">
/**
 * ResultBanner — 模块结果区域顶部的"揭示横幅"
 *
 * 用法（page）：
 *   <ResultBanner
 *     v-if="skeleton.revealed.value"
 *     ref="resultBannerComp"
 *     title-key="bazi.resultBanner.title"
 *     subtitle-key="bazi.resultBanner.subtitle"
 *   />
 *
 * 接入 useResultSkeleton：
 *   const resultBannerComp = ref<ComponentPublicInstance | null>(null)
 *   skeleton.start(() => (resultBannerComp.value?.$el as HTMLElement) ?? null)
 *
 * 视觉设计：
 *   - 国风：金描朱砂渐变带 + 上下双线 + 装饰菱形（◈）+ 大字楷体
 *   - 简约：单行标题 + 副标题 + 底部细线（无装饰符）
 *   两种风格的 CSS 在各 `themes/{theme}/components/bazi.css` 内已定义为全局规则
 *   （`:root[data-theme='...'] .result-banner ...`），本组件直接套用 class，无需 scoped 样式。
 *
 * 重要：根 div 不带 `v-if="skeleton.revealed.value"`，这个守护放在调用方
 *   （和原模板保持完全一致：v-if 决定挂载与否，挂载后即处于 revealed 态）。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

interface Props {
  /** 标题 i18n key（如 `bazi.resultBanner.title`） */
  titleKey: string
  /** 副标题 i18n key（如 `bazi.resultBanner.subtitle`） */
  subtitleKey: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const titleText = computed(() => t(props.titleKey))
const subtitleText = computed(() => t(props.subtitleKey))
</script>

<template>
  <div v-if="isGuofeng" class="result-banner revealed">
    <h2 class="result-banner-title">
      <span class="result-banner-decor">◈</span>
      {{ titleText }}
      <span class="result-banner-decor">◈</span>
    </h2>
    <div class="result-banner-subtitle">{{ subtitleText }}</div>
  </div>
  <div v-else class="result-banner revealed">
    <h2 class="result-banner-title">{{ titleText }}</h2>
    <div class="result-banner-sub">{{ subtitleText }}</div>
    <div class="result-banner-line" />
  </div>
</template>
