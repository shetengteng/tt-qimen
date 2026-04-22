<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart } from '../types'
import { getPatternLongEntry, getPatternLongInterpret } from '../data/patternLongInterpret'
import InlineAnnotsBar, { type AnnotItem } from '@/components/common/InlineAnnotsBar.vue'
import { useAnnotBar } from '@/composables/useAnnotBar'

interface Props {
  chart?: BaziChart | null
}
const props = defineProps<Props>()

defineExpose({
  /** 暴露给父组件：actions slot 用，挂"展开/收起 注释"按钮 */
  toggleAllAnnot: () => annotBar.toggleAll(),
  isAnyAnnotOpen: () => annotBar.isAnyOpen.value,
  closeAllAnnot: () => annotBar.closeAll(),
})

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

/**
 * 第三段 · 完整格局解读的古籍出处条目。
 * 含 classical（原文关键句）+ source（书名 · 章节 · 行号）。
 * 仅中文 locale 渲染。
 */
const patternEntry = computed(() => {
  if (!props.chart) return null
  if (locale.value === 'en') return null
  return getPatternLongEntry(props.chart.pattern.name)
})
const patternName = computed(() => props.chart?.pattern.name ?? '')

const expanded = ref(false)
function toggleExpand() {
  expanded.value = !expanded.value
}

/**
 * v3.1.1 注释交互：4 条格局 tag 的展开释义。
 * 使用 i18n `bazi.interpret.tagAnnots[]` 提供 short/long；
 * 与 `bazi.interpret.tags` / `tagsMn` 按数组下标一一对应。
 *
 * 设计上 tags 不会随 chart 变化（始终 4 条：身/格/用神/忌神），
 * 因此这里直接按下标取注释；若 i18n 未配置则 short/long 留空，
 * UI 会显示「待接入运行时数据」占位（行为与原型一致）。
 */
interface PatternAnnotMeta { focus: string; short?: string; long?: string }

const tagAnnotMeta = computed<PatternAnnotMeta[]>(() => {
  const raw = (tm('bazi.interpret.tagAnnots') as PatternAnnotMeta[]) ?? []
  return Array.isArray(raw) ? raw : []
})

const annotItems = computed<AnnotItem[]>(() => {
  const labels = isGuofeng.value ? tags.value : tagsMn.value
  return labels.map((label, idx) => {
    const meta = tagAnnotMeta.value[idx] ?? { focus: `tag-${idx}` }
    return {
      focus: meta.focus || `tag-${idx}`,
      label,
      short: meta.short,
      long: meta.long,
    }
  })
})

const annotBar = useAnnotBar(annotItems)

function onTagClick(focus: string) {
  annotBar.toggleOne(focus)
}

const annotLabel = computed(() => t('bazi.collapse.annotLabel.pattern'))
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
        <div v-if="patternEntry" class="pattern-expand-source">
          <p class="source-classical">「{{ patternEntry.classical }}」</p>
          <p class="source-cite">—— {{ patternEntry.source }}</p>
        </div>
      </div>
    </div>

    <div class="interpret-tags">
      <button
        v-for="(tag, idx) in tags"
        :key="annotItems[idx]?.focus ?? tag"
        type="button"
        class="interpret-tag annot-trigger"
        :data-annot-focus="annotItems[idx]?.focus ?? tag"
        :aria-expanded="annotBar.isOpen(annotItems[idx]?.focus ?? tag)"
        @click="onTagClick(annotItems[idx]?.focus ?? tag)"
      >{{ tag }}</button>
    </div>

    <InlineAnnotsBar
      layout="tag"
      :items="annotBar.openItems.value"
      :ariaLabelText="annotLabel"
    />
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
        <div v-if="patternEntry" class="pattern-expand-source">
          <p class="source-classical">「{{ patternEntry.classical }}」</p>
          <p class="source-cite">—— {{ patternEntry.source }}</p>
        </div>
      </div>
    </div>

    <div class="interpret-tags">
      <button
        type="button"
        class="mn-badge annot-trigger"
        :data-annot-focus="annotItems[0]?.focus ?? 'tag-0'"
        :aria-expanded="annotBar.isOpen(annotItems[0]?.focus ?? 'tag-0')"
        @click="onTagClick(annotItems[0]?.focus ?? 'tag-0')"
      >{{ tagsMn[0] }}</button>
      <button
        type="button"
        class="mn-badge annot-trigger"
        :data-annot-focus="annotItems[1]?.focus ?? 'tag-1'"
        :aria-expanded="annotBar.isOpen(annotItems[1]?.focus ?? 'tag-1')"
        @click="onTagClick(annotItems[1]?.focus ?? 'tag-1')"
      >{{ tagsMn[1] }}</button>
      <button
        type="button"
        class="mn-badge mn-badge-success annot-trigger"
        :data-annot-focus="annotItems[2]?.focus ?? 'tag-2'"
        :aria-expanded="annotBar.isOpen(annotItems[2]?.focus ?? 'tag-2')"
        @click="onTagClick(annotItems[2]?.focus ?? 'tag-2')"
      >{{ tagsMn[2] }}</button>
      <button
        type="button"
        class="mn-badge mn-badge-danger annot-trigger"
        :data-annot-focus="annotItems[3]?.focus ?? 'tag-3'"
        :aria-expanded="annotBar.isOpen(annotItems[3]?.focus ?? 'tag-3')"
        @click="onTagClick(annotItems[3]?.focus ?? 'tag-3')"
      >{{ tagsMn[3] }}</button>
    </div>

    <InlineAnnotsBar
      layout="tag"
      :items="annotBar.openItems.value"
      :ariaLabelText="annotLabel"
    />
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

.pattern-expand-source {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
}
.pattern-expand-source p {
  margin: 0;
  line-height: 1.7;
}
.pattern-expand-source .source-classical {
  font-size: 13px;
  opacity: 0.75;
  font-style: italic;
  letter-spacing: 0.3px;
}
.pattern-expand-source .source-cite {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.55;
  text-align: right;
}
</style>
