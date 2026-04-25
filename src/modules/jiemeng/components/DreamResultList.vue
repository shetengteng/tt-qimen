<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DreamEntry } from '../types'

/**
 * 搜索结果 / 分类浏览共用列表。
 * 高亮：对于 searchQuery 非空的情况，将标题内的关键词包一层 <mark>；
 *       标题里没有该关键词时保持原样。
 * 空态：当 items 为空时展示引导用户使用分类的提示。
 */
const props = defineProps<{
  items: readonly DreamEntry[]
  /** 用于结果头部的上下文：分类 key 或搜索词 */
  searchQuery?: string
  category?: string | null
  total: number
}>()

const emit = defineEmits<{
  (e: 'pick', entry: DreamEntry): void
}>()

const { t } = useI18n()

/** 头部文案：根据 searchQuery / category 决定展示内容 */
const title = computed(() => {
  if (props.searchQuery) {
    return t('jiemeng.result.searchHead', { q: props.searchQuery })
  }
  if (props.category) {
    return t('jiemeng.result.categoryHead', {
      name: t(`jiemeng.category.${props.category}`),
    })
  }
  return t('jiemeng.result.allHead')
})

const countLabel = computed(() =>
  t('jiemeng.result.countFmt', { n: props.total }),
)

function highlight(title: string, q?: string): string {
  if (!q) return escapeHtml(title)
  const needle = q.trim()
  if (!needle) return escapeHtml(title)
  const safeTitle = escapeHtml(title)
  const safeNeedle = escapeHtml(needle)
  return safeTitle.replace(
    new RegExp(escapeRegExp(safeNeedle), 'g'),
    (m) => `<mark>${m}</mark>`,
  )
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<template>
  <section class="jm-results">
    <div class="jm-results-head">
      <span class="jm-results-title" v-html="title" />
      <span class="jm-results-count">{{ countLabel }}</span>
    </div>

    <div v-if="items.length > 0" class="jm-entry-list">
      <button
        v-for="entry in items"
        :key="entry.id"
        type="button"
        class="jm-entry"
        @click="emit('pick', entry)"
      >
        <div class="jm-entry-head">
          <span class="jm-entry-title" v-html="highlight(entry.title, searchQuery)" />
          <span class="jm-entry-category">{{ t(`jiemeng.category.${entry.category}`) }}</span>
        </div>
        <p class="jm-entry-summary">{{ entry.summary }}</p>
        <div class="jm-entry-foot">
          <div v-if="entry.tags?.length" class="jm-entry-tags">
            <span
              v-for="tag in entry.tags"
              :key="tag"
              class="jm-entry-tag"
              :class="`tag-${tag}`"
            >
              {{ t(`jiemeng.tag.${tag}`) }}
            </span>
          </div>
          <span class="jm-entry-cta" aria-hidden="true">
            {{ t('jiemeng.entry.detailCta') }} <span class="jm-entry-cta-arrow">→</span>
          </span>
        </div>
      </button>
    </div>

    <div v-else class="jm-empty">
      <div class="jm-empty-icon">◇</div>
      <p class="jm-empty-title">{{ t('jiemeng.empty.title') }}</p>
      <p class="jm-empty-desc">{{ t('jiemeng.empty.desc') }}</p>
    </div>
  </section>
</template>
