<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { decades, flowYears } from '../data/mockBazi'

const { t, tm, locale } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const trackEl = ref<HTMLElement | null>(null)
const svgEl = ref<SVGElement | null>(null)

defineExpose<{ trackRef: () => HTMLElement | null; svgRef: () => SVGElement | null }>({
  trackRef: () => trackEl.value,
  svgRef: () => svgEl.value,
})

const verdictLabel = (v: 'ji' | 'zhong' | 'xiong') => {
  if (v === 'ji') return t('bazi.fortune.verdictJi')
  if (v === 'xiong') return t('bazi.fortune.verdictXiong')
  return t('bazi.fortune.verdictZhong')
}

const flowHint = (idx: number) => {
  const fy = flowYears[idx]
  if (locale.value === 'zh-TW') return fy.hintTw
  if (locale.value === 'en') return fy.hintEn
  return fy.hint
}
const flowTags = (idx: number) => {
  const fy = flowYears[idx]
  if (locale.value === 'zh-TW') return fy.tagsTw
  if (locale.value === 'en') return fy.tagsEn
  return fy.tags
}
type FlowTagMn = { label: string; tone?: 'warning' | 'success' | 'danger' }
const flowTagsMn = (idx: number): FlowTagMn[] => {
  // Minimal theme: tones come from `tagsMn` (already aligned with zh-CN tags).
  // For other locales we degrade gracefully to flat tags.
  const fy = flowYears[idx]
  if (locale.value === 'zh-CN' && fy.tagsMn?.length) return fy.tagsMn
  return flowTags(idx).map<FlowTagMn>((label) => ({ label }))
}
const flowFortune = computed(() => tm('bazi.fortune') as Record<string, string>)
</script>

<template>
  <!-- 国风 -->
  <section v-if="isGuofeng" class="fortune-section">
    <div class="section-title">{{ flowFortune.title }}</div>
    <div class="section-subtitle">{{ flowFortune.subtitle }}</div>

    <div class="fortune-timeline">
      <svg ref="svgEl" class="fortune-track-connectors" aria-hidden="true" />
      <div ref="trackEl" class="fortune-track">
        <div
          v-for="d in decades"
          :key="d.age"
          :class="['decade', { current: d.current }]"
        >
          <div class="decade-age">{{ d.age }}</div>
          <div class="decade-ganzhi">{{ d.ganzhi }}</div>
          <div class="decade-shishen">{{ d.shishen }}</div>
          <div :class="['decade-label', d.verdict]">{{ verdictLabel(d.verdict) }}</div>
        </div>
      </div>
    </div>

    <div class="current-fortune-detail">
      <div class="detail-header">
        <div class="detail-ganzhi">乙酉</div>
        <div class="detail-meta">
          <div class="detail-title">{{ flowFortune.currentDetailTitle }}</div>
          <div class="detail-subtitle">{{ flowFortune.currentDetailSubtitle }}</div>
        </div>
        <div class="decade-label ji">{{ flowFortune.currentBadge }}</div>
      </div>
      <p class="detail-hint">{{ flowFortune.currentDetailHint }}</p>
      <div class="hint-list">
        <div class="hint-item">
          <span class="hint-label">{{ flowFortune.yi }}</span>
          <span class="hint-content">{{ flowFortune.yiContent }}</span>
        </div>
        <div class="hint-item">
          <span class="hint-label avoid">{{ flowFortune.ji }}</span>
          <span class="hint-content">{{ flowFortune.jiContent }}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 简约 -->
  <section v-else class="fortune-section">
    <div class="fortune-header">
      <div>
        <h2>{{ flowFortune.titleMn }}</h2>
        <div class="meta" style="margin-top: 4px;">{{ flowFortune.subtitleMn1 }}</div>
      </div>
      <div class="meta">{{ flowFortune.subtitleMn2 }}</div>
    </div>

    <div class="fortune-timeline">
      <svg ref="svgEl" class="fortune-track-connectors" aria-hidden="true" />
      <div ref="trackEl" class="fortune-track">
        <div
          v-for="d in decades"
          :key="d.age"
          :class="['decade', { current: d.current }]"
        >
          <div class="decade-age">{{ d.age }}</div>
          <div class="decade-ganzhi">{{ d.ganzhi }}</div>
          <div class="decade-ss">{{ d.shishenMn }}</div>
          <span :class="['decade-verdict', d.verdict]">{{ verdictLabel(d.verdict) }}</span>
        </div>
      </div>
    </div>

    <div class="current-detail">
      <div class="detail-lead">
        <div class="detail-lead-gz">乙酉</div>
        <div class="detail-lead-range">35 - 44 {{ '岁' }}<br>2025 - 2034</div>
      </div>
      <div class="detail-body">
        <h3>{{ flowFortune.currentDetailTitleMn }}</h3>
        <p class="sub">{{ flowFortune.currentDetailSubtitleMn }}</p>
        <p>{{ flowFortune.currentDetailHint }}</p>
        <div class="detail-hints">
          <div class="hint yi">
            <strong>◎ {{ flowFortune.yi }}</strong>
            {{ flowFortune.yiContent }}
          </div>
          <div class="hint ji">
            <strong>✕ {{ flowFortune.ji }}</strong>
            {{ flowFortune.jiContent }}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 流年 -->
  <section v-if="isGuofeng" class="flow-years">
    <div
      class="section-title"
      style="text-align: center; font-size: 28px; color: var(--gf-ink); margin-bottom: var(--gf-space-sm);"
    >{{ t('bazi.flow.title') }}</div>
    <div style="text-align: center; color: var(--gf-ink-soft); font-size: 14px;">
      {{ t('bazi.flow.subtitle') }}
    </div>

    <div class="flow-year-grid">
      <div
        v-for="(fy, idx) in flowYears"
        :key="fy.year"
        :class="['flow-year', { current: fy.current }]"
      >
        <div class="flow-year-header">
          <div class="flow-year-year">{{ fy.year }}</div>
          <div class="flow-year-ganzhi">{{ fy.ganzhi }}</div>
        </div>
        <div class="flow-year-shishen">
          {{ fy.shishen }}<template v-if="fy.current"> | {{ t('bazi.flow.currentSuffix') }}</template>
        </div>
        <p class="flow-year-hint">{{ flowHint(idx) }}</p>
        <div class="flow-year-tags">
          <span v-for="tag in flowTags(idx)" :key="tag" class="flow-year-tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: var(--gf-space-lg);">
      <button class="gf-btn gf-btn-outline">{{ t('bazi.btn.moreYears') }}</button>
    </div>
  </section>

  <section v-else class="flow-section">
    <div class="fortune-header">
      <div>
        <h2>{{ t('bazi.flow.titleMn') }}</h2>
        <div class="meta" style="margin-top: 4px;">{{ t('bazi.flow.subtitleMn') }}</div>
      </div>
    </div>

    <div class="flow-grid">
      <div
        v-for="(fy, idx) in flowYears"
        :key="fy.year"
        :class="['flow-card', { current: fy.current }]"
      >
        <div class="flow-head">
          <span class="flow-year">
            {{ fy.year }}<template v-if="fy.current"> · {{ t('bazi.flow.currentSuffix') }}</template>
          </span>
          <span class="flow-gz">{{ fy.ganzhi }}</span>
        </div>
        <div class="flow-ss">{{ fy.shishen }}</div>
        <p class="flow-hint">{{ flowHint(idx) }}</p>
        <div class="flow-tags">
          <span
            v-for="(tag, i) in flowTagsMn(idx)"
            :key="i"
            :class="[
              'mn-badge',
              tag.tone === 'warning' ? 'mn-badge-warning' : '',
              tag.tone === 'success' ? 'mn-badge-success' : '',
              tag.tone === 'danger' ? 'mn-badge-danger' : '',
            ]"
          >{{ tag.label }}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: var(--mn-space-6);">
      <button class="mn-btn mn-btn-outline">{{ t('bazi.btn.moreYears') }}</button>
    </div>
  </section>
</template>
