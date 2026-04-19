<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { meta as mockMeta } from '../data/mockZiwei'
import type { ZiweiChart } from '../types'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const meta = computed(() => props.chart?.meta ?? mockMeta)
</script>

<template>
  <!-- 国风：横向四元宫信息条 -->
  <div v-if="isGuofeng" class="ziwei-meta-bar">
    <div class="meta-item">
      {{ t('ziwei.chartMeta.solarLabel') }} <strong>{{ meta.solar }}</strong>
    </div>
    <div class="meta-item">
      {{ t('ziwei.chartMeta.lunarLabel') }} <strong>{{ meta.lunar }}</strong>
    </div>
    <div class="meta-item">
      {{ t('ziwei.chartMeta.fiveElementsLabel') }} <strong>{{ meta.fiveElementsClass }}</strong>
    </div>
    <div class="meta-item">
      {{ t('ziwei.chartMeta.mingShenLabel') }}
      <strong>{{ meta.mingZhu }}</strong> · <strong>{{ meta.shenZhu }}</strong>
    </div>
  </div>

  <!-- 简约：左右分栏 -->
  <div v-else class="ziwei-meta-bar">
    <div class="ziwei-meta-left">
      <div class="ziwei-meta-badge">
        <strong>{{ meta.fiveElementsClass }}</strong> ·
        {{ t('ziwei.chartMeta.mingShenLabel') }}
        <strong>{{ meta.mingZhu }}</strong> · <strong>{{ meta.shenZhu }}</strong>
      </div>
    </div>
    <div class="ziwei-meta-right">
      <div class="row">
        {{ t('ziwei.chartMeta.solarLabel') }} <strong>{{ meta.solar }}</strong>
      </div>
      <div class="row">
        {{ t('ziwei.chartMeta.lunarLabel') }} <strong>{{ meta.lunar }}</strong>
      </div>
    </div>
  </div>
</template>
