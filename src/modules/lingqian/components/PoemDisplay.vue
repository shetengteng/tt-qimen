<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { LingqianItem } from '../types'

/**
 * 4 行签诗 + 典故段（古文不翻译，按主题样式呈现）。
 * 缺省状态下显示占位文本。
 */
interface Props {
  item: LingqianItem | null
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const poemLines = computed(() => props.item?.poem ?? ['—', '—', '—', '—'])
</script>

<template>
  <!-- 国风：金边米卡 + 朱红印 -->
  <article v-if="isGuofeng" class="lq-card">
    <slot name="header" />

    <div class="lq-poem">
      <div class="lq-poem-title">{{ t('lingqian.poem.label') }}</div>
      <div class="lq-poem-body">
        <span v-for="(line, i) in poemLines" :key="i" class="lq-poem-line">{{ line }}</span>
      </div>
    </div>

    <div v-if="props.item" class="lq-tale">
      <strong>{{ t('lingqian.poem.taleLabel') }}</strong>
      {{ t('lingqian.poem.taleIntro', { title: props.item.title }) }}
    </div>

    <div class="lq-poem-seal">
      <span class="gf-seal">{{ t('lingqian.poem.seal') }}</span>
    </div>
  </article>

  <!-- 简约：白卡 + 紫调强调块 -->
  <article v-else class="lq-card">
    <slot name="header" />

    <div class="lq-poem">
      <div class="lq-poem-title">{{ t('lingqian.poem.label') }}</div>
      <div class="lq-poem-body">
        <span v-for="(line, i) in poemLines" :key="i" class="lq-poem-line">{{ line }}</span>
      </div>
    </div>

    <div v-if="props.item" class="lq-tale">
      <div class="lq-tale-label">{{ t('lingqian.poem.taleLabelMn') }}</div>
      <p class="lq-tale-body">
        {{ t('lingqian.poem.taleIntro', { title: props.item.title }) }}
      </p>
    </div>
  </article>
</template>
