<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import ZiweiPalace from './ZiweiPalace.vue'
import type { ZiweiChart, PalaceKey } from '../types'
import { useZiweiRelations, type ZiweiRelationsConfig } from '../composables/useZiweiRelations'

interface Props {
  /** 真实命盘；由外层 result-zone v-if 保证非空 */
  chart?: ZiweiChart | null
  showSanfang: boolean
}

const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const palaces = computed(() => props.chart?.palaces ?? [])
const meta = computed(() => props.chart?.meta ?? null)

const chartEl = ref<HTMLElement | null>(null)
const svgEl = ref<SVGElement | null>(null)

const enabled = computed(() => props.showSanfang && !!props.chart)

const config = computed<ZiweiRelationsConfig>(() => {
  const sfz = props.chart?.sanfangSiZheng
  if (!sfz) {
    return { benming: 'ming' as PalaceKey, triad: [], duigong: 'ming' as PalaceKey }
  }
  return {
    benming: sfz.benming,
    triad: [...sfz.triad],
    duigong: sfz.duigong,
  }
})

const { schedule } = useZiweiRelations({
  getChart: () => chartEl.value,
  getSvg: () => svgEl.value,
  config,
  enabled,
})

defineExpose<{ schedule: () => void }>({ schedule })
</script>

<template>
  <div
    v-if="chart && meta"
    ref="chartEl"
    :class="['ziwei-chart', { 'show-sanfang': showSanfang }]"
  >
    <svg
      ref="svgEl"
      class="ziwei-relations-svg"
      aria-hidden="true"
    />

    <ZiweiPalace
      v-for="p in palaces"
      :key="p.key"
      :palace="p"
      :use-slot="true"
    />

    <!-- 中宫 -->
    <div class="center-palace">
      <div class="center-title">
        {{ isGuofeng ? t('ziwei.centerPalace.title') : t('ziwei.centerPalace.titleMn') }}
      </div>

      <template v-if="isGuofeng">
        <div class="center-item">
          <strong>{{ t('ziwei.centerPalace.ownerLabel') }}</strong> ·
          {{ meta.ownerName || '—' }} · {{ meta.gender }}
        </div>
        <div class="center-item">
          <strong>{{ t('ziwei.centerPalace.fiveLabel') }}</strong> ·
          {{ t('ziwei.centerPalace.fiveFmt', { name: meta.fiveElementsClass, age: meta.qiyunAge }) }}
        </div>
        <div class="center-item">
          <strong>{{ t('ziwei.centerPalace.mingShenLabel') }}</strong> ·
          {{ t('ziwei.centerPalace.mingShenFmt', { ming: meta.mingZhu, shen: meta.shenZhu }) }}
        </div>
        <div v-if="meta.doujun" class="center-item">
          <strong>{{ t('ziwei.centerPalace.doujunLabel') }}</strong> · {{ meta.doujun }}
        </div>
        <div class="center-hint">{{ t('ziwei.centerPalace.hint') }}</div>
      </template>

      <template v-else>
        <div class="center-row">
          <span class="k">{{ t('ziwei.centerPalace.ownerLabel') }}</span>
          <span class="v">
            {{ t('ziwei.centerPalace.ownerFmt', {
              name: meta.ownerName || '—',
              gender: meta.gender,
            }) }}
          </span>
        </div>
        <div class="center-row">
          <span class="k">{{ t('ziwei.centerPalace.solarLabel') }}</span>
          <span class="v">{{ meta.solar }}</span>
        </div>
        <div class="center-row">
          <span class="k">{{ t('ziwei.centerPalace.fiveLabel') }}</span>
          <span class="v">{{ t('ziwei.centerPalace.fiveFmt', { name: meta.fiveElementsClass, age: meta.qiyunAge }) }}</span>
        </div>
        <div class="center-row">
          <span class="k">{{ t('ziwei.centerPalace.mingShenLabel') }}</span>
          <span class="v">{{ t('ziwei.centerPalace.mingShenFmt', { ming: meta.mingZhu, shen: meta.shenZhu }) }}</span>
        </div>
        <div v-if="meta.doujun" class="center-row">
          <span class="k">{{ t('ziwei.centerPalace.doujunLabel') }}</span>
          <span class="v">{{ meta.doujun }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
