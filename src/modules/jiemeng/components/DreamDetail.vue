<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DreamEntry } from '../types'
import { hasSensitiveContent } from '../core/jiemeng'

/**
 * 词条详情卡：古籍原文 + 现代解读 + 建议 + 免责警示。
 * 不使用 dialog，直接以内嵌卡片形式展示，便于分享卡抓取。
 */
const props = defineProps<{
  entry: DreamEntry | null
}>()

const { t } = useI18n()

/**
 * 命中敏感词时追加柔性文化提示（仅 UI 层温和引导，不屏蔽词条）。
 * 对应设计文档 §8 / todo T-16.4。
 */
const sensitive = computed(() => hasSensitiveContent(props.entry))
</script>

<template>
  <div v-if="entry" class="jm-detail">
    <div class="jm-detail-topbar">
      <h2 class="jm-detail-title">{{ entry.title }}</h2>
      <span class="jm-detail-category">{{ t(`jiemeng.category.${entry.category}`) }}</span>
    </div>

    <div class="jm-detail-section">
      <div class="jm-detail-label">◆ {{ t('jiemeng.detail.classical') }}</div>
      <div class="jm-detail-original">
        {{ entry.classical }}
        <small>— {{ entry.classicalSource || t('jiemeng.detail.classicalSource') }}</small>
      </div>
    </div>

    <div class="jm-detail-section">
      <div class="jm-detail-label">◆ {{ t('jiemeng.detail.modern') }}</div>
      <div class="jm-detail-modern">
        <p v-for="(p, i) in entry.modern" :key="i">{{ p }}</p>
        <p v-if="entry.advice" class="jm-detail-tip">
          <strong>{{ t('jiemeng.detail.adviceLabel') }}</strong>{{ entry.advice }}
        </p>
      </div>
    </div>

    <div v-if="sensitive" class="jm-detail-sensitive">
      {{ t('jiemeng.detail.sensitiveHint') }}
    </div>

    <div class="jm-detail-warning">
      {{ t('jiemeng.detail.warning') }}
    </div>
  </div>
</template>
