<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { Button } from '@/components/ui/button'
import type { BaziChart } from '../types'
import { TEN_GOD_INFO, type TenGodLongDetail } from '../data/tenGods'

interface ShishenItem {
  pillar: string
  gan: string
  shishen: string
  desc: string
  descMn: string
  /** 详细四段（trait/suit/caution/relation）——展开态用 */
  long?: TenGodLongDetail
  /** 古籍原文关键句（≤ 40 字） */
  classical: string
  /** 原文锚点 */
  source: string
}

interface Props {
  /** 真实命盘；由外层 result-zone v-if 保证非空 */
  chart?: BaziChart | null
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle-detail', open: boolean): void
}>()

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

/**
 * 折叠态：仅渲染短版说明（desc / descMn），保持 4 柱并排紧凑布局。
 * 展开态：逐柱铺开 long 四段（trait/suit/caution/relation）+ classical/source 溯源。
 *   - long 四字段为 C 类现代化知识卡片（未单独古籍溯源，参见 tenGods.ts 注释）
 *   - classical / source 来自 TEN_GOD_INFO 顶层（《三命通会》卷五 / 卷六，简体）
 * 展开面板高度变化会向父组件 emit('toggle-detail')，由 BaziPage 触发 CollapsibleSection 重算高度。
 */
const items = computed<ShishenItem[]>(() => {
  if (!props.chart) return []
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
      classical: info.classical,
      source: info.source,
    })
  }
  return list
})

const visibleGfItems = computed<ShishenItem[]>(() => items.value)
const visibleMnItems = computed<ShishenItem[]>(() => items.value)

const detailOpen = ref(false)
function toggleDetail() {
  detailOpen.value = !detailOpen.value
  emit('toggle-detail', detailOpen.value)
}

const longFieldLabel = computed(() => ({
  trait: t('bazi.shishen.longField.trait'),
  suit: t('bazi.shishen.longField.suit'),
  caution: t('bazi.shishen.longField.caution'),
  relation: t('bazi.shishen.longField.relation'),
}))
</script>

<template>
  <div v-if="isGuofeng" class="shishen-structure">
    <h3>◈ {{ t('bazi.shishen.sectionTitle') }}</h3>
    <div class="shishen-list">
      <div v-for="(it, idx) in visibleGfItems" :key="idx" class="shishen-item">
        <div class="ss-head">
          <span class="ss-gan">{{ it.gan }}</span>{{ it.pillar }}
        </div>
        <div class="ss-text">
          <strong>{{ it.shishen }}</strong>{{ '：' }}{{ it.desc }}
        </div>
      </div>
    </div>

    <div class="shishen-detail-toggle-wrap">
      <Button
        type="button"
        variant="outline"
        size="sm"
        class="shishen-detail-toggle"
        :aria-expanded="detailOpen"
        aria-controls="shishen-detail-panel-gf"
        @click="toggleDetail"
      >
        {{ detailOpen ? t('bazi.btn.shishenDetailCollapse') : t('bazi.btn.shishenDetail') }}
      </Button>
    </div>

    <div
      v-show="detailOpen"
      id="shishen-detail-panel-gf"
      class="shishen-detail-panel"
      role="region"
      :aria-label="t('bazi.shishen.detailPanelLabel')"
    >
      <div v-for="(it, idx) in visibleGfItems" :key="`long-${idx}`" class="ss-long-entry">
        <div class="ss-long-meta">
          <span class="ss-long-gan">{{ it.gan }}</span>
          <span class="ss-long-pillar">{{ it.pillar }}</span>
          <span class="ss-long-shishen">{{ it.shishen }}</span>
        </div>
        <template v-if="it.long">
          <p class="ss-long-text">
            <span class="ss-long-label">{{ longFieldLabel.trait }}：</span>{{ it.long.trait }}
          </p>
          <p class="ss-long-text">
            <span class="ss-long-label">{{ longFieldLabel.suit }}：</span>{{ it.long.suit }}
          </p>
          <p class="ss-long-text">
            <span class="ss-long-label">{{ longFieldLabel.caution }}：</span>{{ it.long.caution }}
          </p>
          <p class="ss-long-text">
            <span class="ss-long-label">{{ longFieldLabel.relation }}：</span>{{ it.long.relation }}
          </p>
        </template>
        <div v-if="it.classical && it.source" class="ss-long-source">
          <p class="ss-long-classical">「{{ it.classical }}」</p>
          <p class="ss-long-cite">—— {{ it.source }}</p>
        </div>
      </div>
    </div>
  </div>

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
      </div>
    </div>

    <div class="shishen-detail-toggle-wrap">
      <Button
        type="button"
        variant="outline"
        size="sm"
        class="shishen-detail-toggle"
        :aria-expanded="detailOpen"
        aria-controls="shishen-detail-panel-mn"
        @click="toggleDetail"
      >
        {{ detailOpen ? t('bazi.btn.shishenDetailCollapse') : t('bazi.btn.shishenDetail') }}
      </Button>
    </div>

    <div
      v-show="detailOpen"
      id="shishen-detail-panel-mn"
      class="shishen-detail-panel"
      role="region"
      :aria-label="t('bazi.shishen.detailPanelLabel')"
    >
      <div v-for="(it, idx) in visibleMnItems" :key="`long-${idx}`" class="ss-long-entry">
        <div class="ss-long-meta">
          <span class="ss-long-pillar">{{ it.pillar }}</span>
          <span class="ss-long-gan">{{ it.gan }}</span>
          <span class="ss-long-shishen">{{ it.shishen }}</span>
        </div>
        <template v-if="it.long">
          <p class="ss-long-text">
            <span class="ss-long-label">{{ longFieldLabel.trait }}：</span>{{ it.long.trait }}
          </p>
          <p class="ss-long-text">
            <span class="ss-long-label">{{ longFieldLabel.suit }}：</span>{{ it.long.suit }}
          </p>
          <p class="ss-long-text">
            <span class="ss-long-label">{{ longFieldLabel.caution }}：</span>{{ it.long.caution }}
          </p>
          <p class="ss-long-text">
            <span class="ss-long-label">{{ longFieldLabel.relation }}：</span>{{ it.long.relation }}
          </p>
        </template>
        <div v-if="it.classical && it.source" class="ss-long-source">
          <p class="ss-long-classical">「{{ it.classical }}」</p>
          <p class="ss-long-cite">—— {{ it.source }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * 仅提供「基础结构 / 尺寸 / 布局」，主题色（background/border-color/color）
 * 交给 src/themes/{guofeng,minimal}/components/bazi.css 里的
 * :root[data-theme='...'] .ss-long-* 覆盖，避免 shorthand 覆盖主题色。
 */
.shishen-detail-toggle-wrap {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.shishen-detail-panel {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ss-long-entry {
  padding: 14px 16px;
  border-left-width: 3px;
  border-left-style: solid;
  border-radius: 6px;
}

.ss-long-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  font-size: 14px;
}

.ss-long-gan {
  font-weight: 600;
  font-size: 16px;
}

.ss-long-pillar {
  font-size: 13px;
  opacity: 0.75;
}

.ss-long-shishen {
  margin-left: auto;
  font-weight: 500;
}

.ss-long-text {
  margin: 6px 0;
  font-size: 14px;
  line-height: 1.75;
}

.ss-long-label {
  font-weight: 500;
  margin-right: 4px;
}

.ss-long-source {
  margin-top: 10px;
  padding-top: 8px;
  border-top-width: 1px;
  border-top-style: dashed;
  border-top-color: rgba(0, 0, 0, 0.12);
}

.ss-long-source p {
  margin: 0;
  line-height: 1.7;
}

.ss-long-classical {
  font-size: 13px;
  opacity: 0.75;
  letter-spacing: 0.3px;
}

.ss-long-cite {
  margin-top: 3px;
  font-size: 12px;
  opacity: 0.55;
}
</style>
