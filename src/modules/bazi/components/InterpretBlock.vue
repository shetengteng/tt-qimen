<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart } from '../types'
import { getPatternLongInterpret } from '../data/patternLongInterpret'

interface Props {
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const { t, tm, locale } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const fallbackTagsGf = computed(() => (tm('bazi.interpret.tags') as string[]) ?? [])
const fallbackTagsMn = computed(() => (tm('bazi.interpret.tagsMn') as string[]) ?? [])

const p1 = computed(() => props.chart?.interpret.paragraph1 ?? t('bazi.interpret.p1'))
const p2 = computed(() => props.chart?.interpret.paragraph2 ?? t('bazi.interpret.p2'))

const tags = computed(() => props.chart?.interpret.tags ?? fallbackTagsGf.value)
const tagsMn = computed(() => props.chart?.interpret.tags ?? fallbackTagsMn.value)

/**
 * 第三段 · 完整格局解读（200 字左右）。
 * 只有 chart 存在且为中文 locale 时才渲染（英文版暂未提供翻译）。
 */
const patternLong = computed<string | null>(() => {
  if (!props.chart) return null
  if (locale.value === 'en') return null
  return getPatternLongInterpret(props.chart.pattern.name)
})
const patternName = computed(() => props.chart?.pattern.name ?? '')

const expanded = ref(false)
function toggleExpand() {
  expanded.value = !expanded.value
}
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="interpret-section">
    <h3>◈ {{ t('bazi.interpret.title') }}</h3>
    <p>{{ p1 }}</p>
    <p>{{ p2 }}</p>

    <div v-if="patternLong" class="pattern-expand">
      <button
        type="button"
        class="pattern-expand-toggle"
        :aria-expanded="expanded"
        @click="toggleExpand"
      >
        <span class="pattern-expand-caret" :class="{ open: expanded }">▸</span>
        <span>{{ expanded ? '收起' : '查看' }}{{ patternName }}完整解读</span>
      </button>
      <div v-if="expanded" class="pattern-expand-content">
        <p>{{ patternLong }}</p>
      </div>
    </div>

    <div class="interpret-tags">
      <span v-for="tag in tags" :key="tag" class="interpret-tag">{{ tag }}</span>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="interpret">
    <h3>{{ t('bazi.interpret.title') }}</h3>
    <p>{{ p1 }}</p>
    <p>{{ p2 }}</p>

    <div v-if="patternLong" class="pattern-expand">
      <button
        type="button"
        class="pattern-expand-toggle"
        :aria-expanded="expanded"
        @click="toggleExpand"
      >
        <span class="pattern-expand-caret" :class="{ open: expanded }">▸</span>
        <span>{{ expanded ? '收起' : '查看' }}{{ patternName }}完整解读</span>
      </button>
      <div v-if="expanded" class="pattern-expand-content">
        <p>{{ patternLong }}</p>
      </div>
    </div>

    <div class="interpret-tags">
      <span class="mn-badge">{{ tagsMn[0] }}</span>
      <span class="mn-badge">{{ tagsMn[1] }}</span>
      <span class="mn-badge mn-badge-success">{{ tagsMn[2] }}</span>
      <span class="mn-badge mn-badge-danger">{{ tagsMn[3] }}</span>
    </div>
  </div>
</template>

<style scoped>
.pattern-expand {
  margin: 8px 0 12px;
  font-size: 14px;
}

.pattern-expand-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: 1px dashed currentColor;
  border-radius: 6px;
  color: inherit;
  opacity: 0.8;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}
.pattern-expand-toggle:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.04);
}
.pattern-expand-toggle:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.pattern-expand-caret {
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 12px;
}
.pattern-expand-caret.open {
  transform: rotate(90deg);
}

.pattern-expand-content {
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.03);
  border-left: 2px solid currentColor;
}
.pattern-expand-content p {
  margin: 0;
  line-height: 1.9;
  font-size: inherit;
  color: inherit;
  opacity: 0.92;
}
</style>
