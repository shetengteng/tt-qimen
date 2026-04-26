<script setup lang="ts">
/**
 * 全站顶部免责横幅
 *
 * 视觉与原 AppHeader 内的 .gf-disclaimer / .mn-disclaimer 完全一致：
 *   - guofeng：金描米黄底，居中艺术体
 *   - minimal：浅米黄底，无装饰边
 * 抽出独立组件的目的：让"免责声明"成为一个 first-class 的 UI 单元，
 * AppHeader 不再为这两行重复模板买单。
 *
 * 原 CSS 类（gf-disclaimer / mn-disclaimer）由各主题包内已存在的全局规则提供，
 * 这里继续沿用以保持视觉一致；不在本组件 scoped 内重复定义。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')
</script>

<template>
  <div v-if="isGuofeng" class="gf-disclaimer">{{ t('disclaimer') }}</div>
  <div v-else class="mn-disclaimer">{{ t('disclaimer') }}</div>
</template>
