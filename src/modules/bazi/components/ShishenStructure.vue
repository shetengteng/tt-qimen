<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { BaziChart } from '../types'
import { TEN_GOD_INFO, type TenGodLongDetail } from '../data/tenGods'

interface ShishenItem {
  pillar: string
  gan: string
  shishen: string
  desc: string
  descMn: string
  /**
   * 详细解读（可选）。来自 TEN_GOD_INFO[shishen].long；
   * mock fallback 不带 long，仅短简化版。
   */
  long?: TenGodLongDetail
}

interface Props {
  /** 真实命盘；不传则回退到 i18n mock */
  chart?: BaziChart | null
}
const props = defineProps<Props>()

/**
 * 通知父组件「就地展开/收起」状态变化 —— 父组件（BaziPage）需要重新计算
 * 外层 CollapsibleSection 的高度，避免内容被裁切。
 */
const emit = defineEmits<{
  'toggle-detail': [expanded: boolean]
}>()

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const fallbackItems = computed(() => (tm('bazi.shishen.items') as ShishenItem[]) ?? [])

/**
 * 真实命盘下展开 4 柱（年/月/日/时）。
 * mock 数据只有 3 项（年/月/时），保持向后兼容。
 *
 * 设计文档：design/bazi/2026-04-21-03-注释交互设计方案.md
 *  ──「查看详细十神解读」沿用 InterpretBlock pattern-expand 的就地展开形态。
 */
const items = computed<ShishenItem[]>(() => {
  if (!props.chart) return fallbackItems.value
  const pillarLabels = tm('bazi.pillars') as Record<string, string>
  const list: ShishenItem[] = []
  const cfgs: Array<{ key: 'year' | 'month' | 'day' | 'hour'; label: string }> = [
    { key: 'year', label: pillarLabels.year },
    { key: 'month', label: pillarLabels.month },
    { key: 'day', label: pillarLabels.day },
    { key: 'hour', label: pillarLabels.hour },
  ]
  for (const c of cfgs) {
    const p = props.chart.pillars[c.key]
    // 日柱固定显示「日主」，与 FourPillarsTable 内的 rizhuTag 一致
    const isDay = c.key === 'day'
    const shishen = isDay ? '日主' : p.tenGod
    const info = TEN_GOD_INFO[shishen as keyof typeof TEN_GOD_INFO]
    list.push({
      pillar: c.label,
      gan: p.gan,
      shishen,
      desc: info.desc,
      descMn: info.descMn,
      long: info.long,
    })
  }
  return list
})

/** 简约模式默认折叠后只显示前 3 项；详细解读会一并展开第 4 项与各项 long */
const expanded = ref(false)
function toggleExpand() {
  expanded.value = !expanded.value
  emit('toggle-detail', expanded.value)
}
const visibleMnItems = computed<ShishenItem[]>(() =>
  expanded.value ? items.value : items.value.slice(0, 3),
)

/**
 * 详细解读触发器是否需要渲染：
 * - 至少有一项含 long （即真实命盘 + TEN_GOD_INFO 配套）；
 * - 或简约模式下 items.length > 3 时（哪怕没有 long，也要让用户看到全部）。
 */
const hasMoreItems = computed(() => items.value.length > 3)
const hasLongDetail = computed(() => items.value.some(it => it.long))
const showDetailToggle = computed(() => hasLongDetail.value || hasMoreItems.value)

const detailToggleLabel = computed(() =>
  expanded.value
    ? t('bazi.btn.shishenDetailCollapse')
    : t('bazi.btn.shishenDetail'),
)

/** 国风模式默认就显示全部 4 柱（不裁剪），仅"详细解读" long 区域受 expanded 控制 */
const visibleGfItems = computed<ShishenItem[]>(() => items.value)
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="shishen-structure">
    <h3>◈ {{ t('bazi.shishen.sectionTitle') }}</h3>
    <div class="shishen-list">
      <div v-for="(it, idx) in visibleGfItems" :key="idx" class="shishen-item">
        <div class="ss-head">
          <span class="ss-gan">{{ it.gan }}</span>{{ it.pillar }}
        </div>
        <div class="ss-text">
          <strong>{{ it.shishen }}</strong>{{ '：' }}{{ it.desc }}

          <!-- 详细解读：四段式 trait/suit/caution/relation -->
          <div v-if="expanded && it.long" class="ss-long">
            <dl>
              <dt>{{ t('bazi.shishen.longField.trait') }}</dt>
              <dd>{{ it.long.trait }}</dd>
              <dt>{{ t('bazi.shishen.longField.suit') }}</dt>
              <dd>{{ it.long.suit }}</dd>
              <dt>{{ t('bazi.shishen.longField.caution') }}</dt>
              <dd>{{ it.long.caution }}</dd>
              <dt>{{ t('bazi.shishen.longField.relation') }}</dt>
              <dd>{{ it.long.relation }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailToggle" class="shishen-detail-toggle-wrap">
      <button
        type="button"
        class="shishen-detail-toggle"
        :aria-expanded="expanded"
        @click="toggleExpand"
      >
        <span class="shishen-detail-caret" :class="{ open: expanded }">▸</span>
        <span>{{ detailToggleLabel }}</span>
      </button>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="shishen-structure">
    <h4>
      {{ t('bazi.shishen.sectionTitle') }}
      <span class="tag">{{ t('bazi.shishen.sectionTag') }}</span>
    </h4>
    <div class="shishen-list">
      <div v-for="(it, idx) in visibleMnItems" :key="idx" class="shishen-item">
        <div class="shishen-item-title">
          {{ it.pillar }} <strong>{{ it.gan }}</strong>
          <span class="ss-tag">{{ it.shishen }}</span>
        </div>
        <div class="shishen-item-desc">{{ it.descMn }}</div>

        <div v-if="expanded && it.long" class="ss-long">
          <dl>
            <dt>{{ t('bazi.shishen.longField.trait') }}</dt>
            <dd>{{ it.long.trait }}</dd>
            <dt>{{ t('bazi.shishen.longField.suit') }}</dt>
            <dd>{{ it.long.suit }}</dd>
            <dt>{{ t('bazi.shishen.longField.caution') }}</dt>
            <dd>{{ it.long.caution }}</dd>
            <dt>{{ t('bazi.shishen.longField.relation') }}</dt>
            <dd>{{ it.long.relation }}</dd>
          </dl>
        </div>
      </div>
    </div>

    <button
      v-if="showDetailToggle"
      type="button"
      class="shishen-detail-trigger"
      :aria-expanded="expanded"
      @click="toggleExpand"
    >
      <span class="shishen-detail-caret" :class="{ open: expanded }">▾</span>
      <span>{{ detailToggleLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.shishen-detail-toggle-wrap {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.shishen-detail-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: transparent;
  border: 1px dashed currentColor;
  border-radius: 6px;
  color: inherit;
  opacity: 0.8;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}
.shishen-detail-toggle:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.04);
}
.shishen-detail-toggle:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* 国风「查看详细十神解读」的 caret 旋转：▸ → ▾ */
.shishen-detail-toggle-wrap .shishen-detail-caret {
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 12px;
}
.shishen-detail-toggle-wrap .shishen-detail-caret.open {
  transform: rotate(90deg);
}
/* 简约主题的 caret 旋转由 minimal/bazi.css 定义（▾ → ▴），
   此处不再 scoped 复写，避免选择器优先级冲突 */

.ss-long {
  margin-top: 10px;
  padding: 10px 12px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  border-left: 2px solid currentColor;
  opacity: 0.92;
}
.ss-long dl {
  margin: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 12px;
  font-size: 13px;
  line-height: 1.7;
}
.ss-long dt {
  font-weight: 600;
  letter-spacing: 0.05em;
  opacity: 0.85;
}
.ss-long dd {
  margin: 0;
  color: inherit;
}

@media (max-width: 640px) {
  .ss-long dl {
    grid-template-columns: 1fr;
    gap: 2px 0;
  }
  .ss-long dt {
    margin-top: 6px;
  }
  .ss-long dt:first-child {
    margin-top: 0;
  }
}
</style>
