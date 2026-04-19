<script setup lang="ts">
/**
 * 流年区块（从 DayunTimeline 拆出）。
 * 拆分原因：原型把「大运」和「流年」做成两个独立的可折叠区块，
 * Vue 端要在 BaziPage 里用同一个 CollapsibleSection 包两次，
 * 必须把流年逻辑独立成组件，否则两个 section 会一起折叠。
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { flowYears } from '../data/mockBazi'

const { t, locale } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

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
  // 简约主题：tone 取自 tagsMn（与 zh-CN tags 对齐）
  // 其他语言降级为纯文本 tag
  const fy = flowYears[idx]
  if (locale.value === 'zh-CN' && fy.tagsMn?.length) return fy.tagsMn
  return flowTags(idx).map<FlowTagMn>((label) => ({ label }))
}
</script>

<template>
  <!-- 国风 -->
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

  <!-- 简约 -->
  <section v-else class="flow-section">
    <div class="fortune-header">
      <div class="meta">{{ t('bazi.flow.subtitleMn') }}</div>
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
