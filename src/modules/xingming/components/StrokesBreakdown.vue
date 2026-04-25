<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { XingmingResult } from '../types'
import { elementI18nPath } from '../utils/i18nHelpers'

interface Props {
  result: XingmingResult
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const chars = computed(() => props.result.chars)
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="xm-breakdown gf-breakdown">
    <h3 class="xm-breakdown-title">
      <span class="ds-ornament">◆</span>
      {{ t('xingming.breakdown.title') }}
      <span class="ds-ornament">◆</span>
    </h3>
    <div class="xm-chars">
      <div v-for="(c, i) in chars" :key="i" class="xm-char-card">
        <div class="xm-char-glyph">{{ c.char }}</div>
        <div class="xm-char-strokes">
          {{ t('xingming.breakdown.simplified') }}
          <strong class="xm-char-num">{{ c.simplified }}</strong>
          ·
          {{ t('xingming.breakdown.kangxi') }}
          <strong class="xm-char-num">{{ c.kangxi }}</strong>
        </div>
        <div class="xm-char-element">{{ t(elementI18nPath(c.element)) }}</div>
      </div>
    </div>
    <p class="xm-breakdown-note">
      {{ t('xingming.breakdown.hintPrefix') }}
      <strong>{{ t('xingming.breakdown.kangxiWord') }}</strong>
      {{ t('xingming.breakdown.hintSuffix') }}
    </p>
  </div>

  <!-- 简约 -->
  <div v-else class="xm-breakdown mn-card mn-breakdown">
    <h3 class="xm-breakdown-title">{{ t('xingming.breakdown.title') }}</h3>
    <div class="xm-chars">
      <div v-for="(c, i) in chars" :key="i" class="xm-char-card">
        <div class="xm-char-glyph">{{ c.char }}</div>
        <div class="xm-char-strokes">
          {{ t('xingming.breakdown.simplified') }} {{ c.simplified }}
          ·
          {{ t('xingming.breakdown.kangxi') }}
          <strong class="xm-char-num">{{ c.kangxi }}</strong>
        </div>
        <span class="xm-char-element">{{ t(elementI18nPath(c.element)) }}</span>
      </div>
    </div>
    <p class="xm-breakdown-note">
      {{ t('xingming.breakdown.hintPrefix') }}
      <strong>{{ t('xingming.breakdown.kangxiWord') }}</strong>
      {{ t('xingming.breakdown.hintSuffix') }}
    </p>
  </div>
</template>
