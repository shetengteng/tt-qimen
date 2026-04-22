<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { ChengguResult } from '../types'

interface Props {
  result?: ChengguResult | null
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const PLACEHOLDER_POEM = [
  '一世荣华事事通',
  '不须劳碌自享通',
  '职位高显声名显',
  '前呼后拥似蛟龙',
]

const poemLines = computed<string[]>(() => props.result?.poem.poem ?? PLACEHOLDER_POEM)
const weightTitle = computed<string>(() => props.result?.poem.weight ?? t('chenggu.placeholder.displayWeight'))

/**
 * 歌诀文案规则：原文不做任何翻译 / 简繁转换，中英繁三语皆保留古文原貌（设计文档 §8）。
 * 仅解读部分的标题与副眉走 i18n。
 */
</script>

<template>
  <!-- 国风：宋纹纸 + 金色描边 + 印章角饰 -->
  <section v-if="isGuofeng" class="cg-poem-section">
    <div class="cg-poem-card">
      <div class="cg-poem-title">{{ weightTitle }}</div>
      <div class="cg-poem-verse">
        <span v-for="(line, i) in poemLines" :key="i" class="cg-poem-line">{{ line }}</span>
      </div>
      <div class="cg-poem-stamp">
        <span class="gf-seal">{{ t('chenggu.poem.seal') }}</span>
      </div>
    </div>
  </section>

  <!-- 简约：白底细线 + 浅灰分隔 + 徽章式骨重 -->
  <section v-else class="cg-poem-section">
    <div class="cg-poem-card">
      <span class="cg-poem-badge">{{ weightTitle }}</span>
      <div class="cg-poem-eyebrow">{{ t('chenggu.poem.eyebrow') }}</div>
      <p class="cg-poem-verse">
        <span v-for="(line, i) in poemLines" :key="i" class="cg-poem-line">{{ line }}</span>
      </p>
      <div class="cg-poem-divider"></div>
      <div class="cg-poem-meta">{{ t('chenggu.poem.meta') }}</div>
    </div>
  </section>
</template>
