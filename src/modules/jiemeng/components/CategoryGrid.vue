<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJiemengStore } from '../stores/jiemengStore'
import { DREAM_CATEGORIES } from '../data/categories'
import { getCategoryCounts } from '../core/jiemeng'
import type { DreamCategoryKey } from '../types'

/**
 * 8 分类网格：点击某张卡触发分类筛选（或切换回"全部"）。
 * 计数直接由 core.getCategoryCounts 推导，数据变更时无需手动维护。
 */
const emit = defineEmits<{
  (e: 'pick', key: DreamCategoryKey): void
}>()

const { t } = useI18n()
const store = useJiemengStore()

const counts = computed(() => getCategoryCounts())

function onPick(key: DreamCategoryKey) {
  emit('pick', key)
}
</script>

<template>
  <section class="jm-cat-section">
    <div class="jm-cat-head">
      <h2 class="jm-cat-title">{{ t('jiemeng.category.sectionTitle') }}</h2>
      <p class="jm-cat-subtitle">{{ t('jiemeng.category.sectionSubtitle') }}</p>
    </div>
    <div class="jm-cat-grid">
      <button
        v-for="cat in DREAM_CATEGORIES"
        :key="cat.key"
        type="button"
        class="jm-cat-card"
        :class="{ active: store.activeCategory === cat.key }"
        @click="onPick(cat.key)"
      >
        <span class="jm-cat-icon">{{ cat.icon }}</span>
        <div class="jm-cat-name">{{ t(`jiemeng.category.${cat.key}`) }}</div>
        <div class="jm-cat-count">{{ t('jiemeng.category.countFmt', { n: counts[cat.key] }) }}</div>
      </button>
    </div>
  </section>
</template>
