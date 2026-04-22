<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart, ShenshaCategory, ShenshaHit } from '../types'
import { getShenshaMeaning } from '../data/shenshaMeaning'
import InlineAnnotsBar, { type AnnotItem } from '@/components/common/InlineAnnotsBar.vue'
import { useAnnotBar, type AnnotBarApi } from '@/composables/useAnnotBar'

interface Props {
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const { t, tm, locale } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

function chipTooltip(item: ShenshaHit): string {
  if (locale.value === 'en') return ''
  const m = getShenshaMeaning(item.key)
  const parts: string[] = []
  if (item.short) parts.push(item.short)
  if (m.long) parts.push(m.long)
  return parts.join('\n')
}

const pillarLabels = computed(() => {
  const labels = (tm('bazi.shensha.pillarAbbr') as Record<string, string>) ?? {}
  return {
    year:  labels.year  ?? '年',
    month: labels.month ?? '月',
    day:   labels.day   ?? '日',
    hour:  labels.hour  ?? '时',
  }
})

function categoryTitle(cat: ShenshaCategory): string {
  return t(`bazi.shensha.category.${cat}.title`)
}

function categorySub(cat: ShenshaCategory): string {
  return t(`bazi.shensha.category.${cat}.sub`)
}

/**
 * v3.1.1 注释交互（神煞 · 分组就近展开版本）：
 *
 * 与 §11 一致的「锚点 + 聚合容器」模型，但聚合容器不再是 section 唯一一个，
 * 而是跟随分组（吉神 / 中性 / 凶神）就近渲染：
 *   ┌─ shensha-group.auspicious ─┐
 *   │  shensha-list ........     │
 *   │  inline-annots-bar.chip ←  │ 该组展开项落在这里
 *   └────────────────────────────┘
 *
 * 这样吉神的释义不会越过中性/凶神组，保留卡片间的就近视觉关联。
 *
 * focus 形如 `${pillar}-${key}-${idx}`，确保跨柱位 / 跨组的同名神煞不冲突。
 */
function annotFocus(item: ShenshaHit, idx: number): string {
  return `${item.pillar}-${item.key}-${idx}`
}

interface Group {
  category: ShenshaCategory
  items: ShenshaHit[]
  /** 该组的展开 items（计算自原始 ShenshaHit + 就近 AnnotItem 列表） */
  annotItems: AnnotItem[]
  /** 该组独立的 useAnnotBar 实例 */
  bar: AnnotBarApi
}

const auspiciousItems = computed<ShenshaHit[]>(() =>
  (props.chart?.shensha ?? []).filter(h => h.category === 'auspicious'),
)
const neutralItems = computed<ShenshaHit[]>(() =>
  (props.chart?.shensha ?? []).filter(h => h.category === 'neutral'),
)
const inauspiciousItems = computed<ShenshaHit[]>(() =>
  (props.chart?.shensha ?? []).filter(h => h.category === 'inauspicious'),
)

function toAnnotItems(items: ShenshaHit[]): AnnotItem[] {
  return items.map((it, idx) => {
    const meaning = getShenshaMeaning(it.key)
    return {
      focus: annotFocus(it, idx),
      label: `${pillarLabels.value[it.pillar]}柱 · ${it.name}`,
      short: it.short,
      long: meaning.long,
    }
  })
}

const auspiciousAnnots = computed<AnnotItem[]>(() => toAnnotItems(auspiciousItems.value))
const neutralAnnots = computed<AnnotItem[]>(() => toAnnotItems(neutralItems.value))
const inauspiciousAnnots = computed<AnnotItem[]>(() => toAnnotItems(inauspiciousItems.value))

const auspiciousBar = useAnnotBar(auspiciousAnnots)
const neutralBar = useAnnotBar(neutralAnnots)
const inauspiciousBar = useAnnotBar(inauspiciousAnnots)

const groups = computed<Group[]>(() => {
  const all: Group[] = [
    { category: 'auspicious',   items: auspiciousItems.value,   annotItems: auspiciousAnnots.value,   bar: auspiciousBar },
    { category: 'neutral',      items: neutralItems.value,      annotItems: neutralAnnots.value,      bar: neutralBar },
    { category: 'inauspicious', items: inauspiciousItems.value, annotItems: inauspiciousAnnots.value, bar: inauspiciousBar },
  ]
  return all.filter(g => g.items.length > 0)
})

const hasAny = computed(() => groups.value.length > 0)

function onChipClick(group: Group, item: ShenshaHit, idx: number) {
  group.bar.toggleOne(annotFocus(item, idx))
}
function isChipOpen(group: Group, item: ShenshaHit, idx: number): boolean {
  return group.bar.isOpen(annotFocus(item, idx))
}

const annotLabel = computed(() => t('bazi.collapse.annotLabel.shensha'))

/**
 * BaziPage 顶部「展开注释 / 收起注释」按钮要覆盖 3 组所有 chip，
 * 因此聚合 3 个 bar：任何一组展开 → isAnyOpen=true；
 * 切换时根据当前是否任意展开决定是「全收起」还是「全展开」。
 */
const isAnyAnnotOpen = computed<boolean>(
  () => auspiciousBar.isAnyOpen.value || neutralBar.isAnyOpen.value || inauspiciousBar.isAnyOpen.value,
)
function toggleAllAnnot() {
  if (isAnyAnnotOpen.value) {
    auspiciousBar.closeAll()
    neutralBar.closeAll()
    inauspiciousBar.closeAll()
  } else {
    if (auspiciousAnnots.value.length && !auspiciousBar.isAnyOpen.value) auspiciousBar.toggleAll()
    if (neutralAnnots.value.length && !neutralBar.isAnyOpen.value) neutralBar.toggleAll()
    if (inauspiciousAnnots.value.length && !inauspiciousBar.isAnyOpen.value) inauspiciousBar.toggleAll()
  }
}
function closeAllAnnot() {
  auspiciousBar.closeAll()
  neutralBar.closeAll()
  inauspiciousBar.closeAll()
}

defineExpose({
  toggleAllAnnot,
  isAnyAnnotOpen: () => isAnyAnnotOpen.value,
  closeAllAnnot,
})
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="shensha-section">
    <h3>◈ {{ t('bazi.shensha.title') }}</h3>

    <div v-if="hasAny">
      <div
        v-for="g in groups"
        :key="g.category"
        :class="['shensha-group', g.category]"
      >
        <div class="shensha-group-title">
          <strong>{{ categoryTitle(g.category) }}</strong>
          <span class="shensha-group-sub">· {{ categorySub(g.category) }}</span>
        </div>
        <div class="shensha-list">
          <button
            v-for="(item, idx) in g.items"
            :key="`${item.key}-${item.pillar}-${idx}`"
            type="button"
            class="shensha-chip annot-trigger"
            :title="chipTooltip(item)"
            :data-annot-focus="annotFocus(item, idx)"
            :aria-expanded="isChipOpen(g, item, idx)"
            @click="onChipClick(g, item, idx)"
          >
            <span class="pillar-badge">{{ pillarLabels[item.pillar] }}</span>
            <span class="chip-name">{{ item.name }}</span>
            <span v-if="item.short" class="chip-desc">{{ item.short }}</span>
          </button>
        </div>

        <InlineAnnotsBar
          layout="chip"
          :items="g.bar.openItems.value"
          :ariaLabelText="`${categoryTitle(g.category)} · ${annotLabel}`"
        />
      </div>

      <div class="shensha-footer">{{ t('bazi.shensha.footerTip') }}</div>
    </div>

    <div v-else class="shensha-empty">{{ t('bazi.shensha.empty') }}</div>
  </div>

  <!-- 简约 -->
  <div v-else class="shensha-section">
    <h4>{{ t('bazi.shensha.title') }}</h4>

    <div v-if="hasAny">
      <div
        v-for="g in groups"
        :key="g.category"
        :class="['shensha-group', g.category]"
      >
        <div class="shensha-group-title">
          <strong>{{ categoryTitle(g.category) }}</strong>
          <span class="shensha-group-sub">{{ categorySub(g.category) }}</span>
        </div>
        <div class="shensha-list">
          <button
            v-for="(item, idx) in g.items"
            :key="`${item.key}-${item.pillar}-${idx}`"
            type="button"
            class="shensha-chip annot-trigger"
            :title="chipTooltip(item)"
            :data-annot-focus="annotFocus(item, idx)"
            :aria-expanded="isChipOpen(g, item, idx)"
            @click="onChipClick(g, item, idx)"
          >
            <span class="pillar-badge">{{ pillarLabels[item.pillar] }}</span>
            <span class="chip-name">{{ item.name }}</span>
            <span v-if="item.short" class="chip-desc">{{ item.short }}</span>
          </button>
        </div>

        <InlineAnnotsBar
          layout="chip"
          :items="g.bar.openItems.value"
          :ariaLabelText="`${categoryTitle(g.category)} · ${annotLabel}`"
        />
      </div>

      <div class="shensha-footer">{{ t('bazi.shensha.footerTip') }}</div>
    </div>

    <div v-else class="shensha-empty">{{ t('bazi.shensha.empty') }}</div>
  </div>
</template>
