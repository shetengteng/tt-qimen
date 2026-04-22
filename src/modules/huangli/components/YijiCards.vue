<script setup lang="ts">
/**
 * 宜忌双卡：左边"宜"、右边"忌"，每项一个 tag。
 * 数据直接来自 tyme4ts.getRecommends() / getAvoids()。
 */
import { useI18n } from 'vue-i18n'
import type { HuangliDay } from '../types'

defineProps<{
  day: HuangliDay
}>()

const { t } = useI18n()
</script>

<template>
  <div class="hl-yiji-section">
    <div class="hl-yiji-card hl-yiji-card--yi">
      <div class="hl-yiji-header">
        <div class="hl-yiji-stamp hl-yiji-stamp--yi">宜</div>
        <div>
          <div class="hl-yiji-title">{{ t('huangli.yiji.yiTitle') }}</div>
          <div class="hl-yiji-subtitle">{{ t('huangli.yiji.yiSubtitle') }}</div>
        </div>
      </div>
      <div v-if="day.recommends.length > 0" class="hl-yiji-list">
        <span v-for="w in day.recommends" :key="`yi-${w}`" class="hl-yiji-tag">{{ w }}</span>
      </div>
      <div v-else class="hl-yiji-empty">{{ t('huangli.yiji.empty') }}</div>
    </div>

    <div class="hl-yiji-card hl-yiji-card--ji">
      <div class="hl-yiji-header">
        <div class="hl-yiji-stamp hl-yiji-stamp--ji">忌</div>
        <div>
          <div class="hl-yiji-title">{{ t('huangli.yiji.jiTitle') }}</div>
          <div class="hl-yiji-subtitle">{{ t('huangli.yiji.jiSubtitle') }}</div>
        </div>
      </div>
      <div v-if="day.avoids.length > 0" class="hl-yiji-list">
        <span v-for="w in day.avoids" :key="`ji-${w}`" class="hl-yiji-tag">{{ w }}</span>
      </div>
      <div v-else class="hl-yiji-empty">{{ t('huangli.yiji.empty') }}</div>
    </div>
  </div>
</template>
