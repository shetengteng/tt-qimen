<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ShareToast from '@/components/common/ShareToast.vue'
import { useShareCard } from '@/composables/useShareCard'

import DreamInput from './components/DreamInput.vue'
import RecentSearches from './components/RecentSearches.vue'
import CategoryGrid from './components/CategoryGrid.vue'
import DreamResultList from './components/DreamResultList.vue'
import DreamDetail from './components/DreamDetail.vue'

import { useJiemengStore } from './stores/jiemengStore'
import {
  getDreamById,
  getDreamsByCategory,
  searchDream,
} from './core/jiemeng'
import type { DreamCategoryKey, DreamEntry } from './types'

/**
 * 解梦模块主页：搜索 / 分类浏览 / 词条详情 / 最近搜索 · 单列垂直流。
 *
 * 两种结果来源：
 *   - 搜索：query 非空 → fuse.search（若同时选中 category，则再按类过滤）
 *   - 分类浏览：query 为空 + 选中 category → DREAM_ENTRIES 按类过滤
 *   - 都为空 → 隐藏结果区，只展示分类网格（鼓励用户操作）
 */
const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const store = useJiemengStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const resultsEl = ref<HTMLElement | null>(null)
const detailEl = ref<HTMLElement | null>(null)
const shareCardEl = ref<HTMLElement | null>(null)

const selectedEntry = computed<DreamEntry | null>(() =>
  store.selectedId ? getDreamById(store.selectedId) : null,
)

const displayItems = computed<readonly DreamEntry[]>(() => {
  const q = store.query.trim()
  if (q) {
    return searchDream(q, { category: store.activeCategory ?? undefined, limit: 30 }).items
  }
  if (store.activeCategory) {
    return getDreamsByCategory(store.activeCategory).items
  }
  return []
})

const hasDisplayItems = computed(() => displayItems.value.length > 0)
const hasActiveFilter = computed(
  () => !!store.query.trim() || store.activeCategory !== null,
)

function scrollTo(el: HTMLElement | null) {
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onSearch() {
  const q = store.query.trim()
  if (q) store.pushRecent(q)
  store.setSelectedId(null)
  nextTick(() => scrollTo(resultsEl.value))
}
function onReset() {
  store.reset()
  store.setSelectedId(null)
}
function onPickRecent(k: string) {
  store.setQuery(k)
  store.setActiveCategory(null)
  store.setSelectedId(null)
  store.pushRecent(k)
  nextTick(() => scrollTo(resultsEl.value))
}
function onPickCategory(key: DreamCategoryKey) {
  store.setActiveCategory(store.activeCategory === key ? null : key)
  store.setSelectedId(null)
  nextTick(() => scrollTo(resultsEl.value))
}
function onPickEntry(entry: DreamEntry) {
  store.setSelectedId(entry.id)
  nextTick(() => scrollTo(detailEl.value))
}
function onCloseDetail() {
  store.setSelectedId(null)
  nextTick(() => scrollTo(resultsEl.value))
}

function go(name: 'home') {
  router.push({ name })
}

const { toastState, shareCard, saveCard } = useShareCard()
function buildShareOpts() {
  const e = selectedEntry.value
  return {
    fileName: `jiemeng-${e?.id ?? 'idle'}-${themeStore.id}`,
    title: t('jiemeng.share.title'),
    text: t('jiemeng.share.text'),
  }
}
function onShare() {
  shareCard(shareCardEl.value, buildShareOpts())
}
function onSave() {
  saveCard(shareCardEl.value, buildShareOpts())
}
</script>

<template>
  <!-- ============ 国风 ============ -->
  <main v-if="isGuofeng">
    <div class="gf-container">
      <div class="page-title">
        <h1>{{ t('jiemeng.pageTitle') }}</h1>
        <div class="subtitle">{{ t('jiemeng.pageSubtitle') }}</div>
      </div>

      <DreamInput @search="onSearch" @reset="onReset" />

      <RecentSearches @pick="onPickRecent" />

      <CategoryGrid @pick="onPickCategory" />

      <div v-if="hasActiveFilter" ref="resultsEl" class="jm-results-zone">
        <DreamResultList
          :items="displayItems"
          :search-query="store.query.trim() || undefined"
          :category="store.query.trim() ? null : store.activeCategory"
          :total="displayItems.length"
          @pick="onPickEntry"
        />
      </div>

      <template v-if="selectedEntry">
        <div class="gf-divider jm-detail-divider">
          <span>◆ {{ selectedEntry.title }} ◆</span>
        </div>
        <div ref="detailEl">
          <div ref="shareCardEl" class="jm-share-card">
            <div class="gf-container" style="padding-top: 0;">
              <DreamDetail :entry="selectedEntry" />
            </div>
          </div>

          <div class="action-bar">
            <button type="button" class="gf-btn" @click="onShare">
              {{ t('jiemeng.btn.shareIcon') }} {{ t('jiemeng.btn.share') }}
            </button>
            <button type="button" class="gf-btn gf-btn-outline" @click="onSave">
              {{ t('jiemeng.btn.saveIcon') }} {{ t('jiemeng.btn.save') }}
            </button>
            <button type="button" class="gf-btn gf-btn-outline" @click="onCloseDetail">
              {{ t('jiemeng.btn.anotherIcon') }} {{ t('jiemeng.btn.another') }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </main>

  <!-- ============ 简约 ============ -->
  <template v-else>
    <main class="mn-container">
      <section class="page-hero">
        <div class="page-breadcrumb">
          <a href="#" @click.prevent="go('home')">{{ t('jiemeng.breadcrumbHome') }}</a> /
          {{ t('jiemeng.breadcrumbCurrent') }}
        </div>
        <h1>{{ t('jiemeng.pageTitle') }}</h1>
        <p>{{ t('jiemeng.pageSubtitle') }}</p>
      </section>

      <DreamInput @search="onSearch" @reset="onReset" />

      <RecentSearches @pick="onPickRecent" />

      <CategoryGrid @pick="onPickCategory" />

      <div v-if="hasActiveFilter" ref="resultsEl" class="jm-results-zone">
        <DreamResultList
          :items="displayItems"
          :search-query="store.query.trim() || undefined"
          :category="store.query.trim() ? null : store.activeCategory"
          :total="displayItems.length"
          @pick="onPickEntry"
        />
      </div>

      <template v-if="selectedEntry">
        <div ref="detailEl">
          <div ref="shareCardEl" class="jm-share-card">
            <DreamDetail :entry="selectedEntry" />
          </div>

          <div class="actions jm-actions">
            <button type="button" class="mn-btn" @click="onShare">{{ t('jiemeng.btn.share') }}</button>
            <button type="button" class="mn-btn mn-btn-outline" @click="onSave">{{ t('jiemeng.btn.save') }}</button>
            <button type="button" class="mn-btn mn-btn-ghost" @click="onCloseDetail">{{ t('jiemeng.btn.another') }}</button>
          </div>
        </div>
      </template>
    </main>
  </template>

  <ShareToast :state="toastState" />
</template>
