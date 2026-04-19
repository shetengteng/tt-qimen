<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

interface ShishenItem {
  pillar: string
  gan: string
  shishen: string
  desc: string
  descMn: string
}

const { t, tm } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const items = computed(() => (tm('bazi.shishen.items') as ShishenItem[]) ?? [])
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="shishen-structure">
    <h3>◈ {{ t('bazi.shishen.sectionTitle') }}</h3>
    <div class="shishen-list">
      <div v-for="(it, idx) in items" :key="idx" class="shishen-item">
        <div class="ss-head">
          <span class="ss-gan">{{ it.gan }}</span>{{ it.pillar }}
        </div>
        <div class="ss-text">
          <strong>{{ it.shishen }}</strong>{{ '：' }}{{ it.desc }}
        </div>
      </div>
    </div>
  </div>

  <!-- 简约 -->
  <div v-else class="shishen-structure">
    <h4>
      {{ t('bazi.shishen.sectionTitle') }}
      <span class="tag">{{ t('bazi.shishen.sectionTag') }}</span>
    </h4>
    <div class="shishen-list">
      <div v-for="(it, idx) in items.slice(0, 3)" :key="idx" class="shishen-item">
        <div class="shishen-item-title">
          {{ it.pillar }} <strong>{{ it.gan }}</strong>
          <span class="ss-tag">{{ it.shishen }}</span>
        </div>
        <div class="shishen-item-desc">{{ it.descMn }}</div>
      </div>
    </div>
    <div class="shishen-detail-trigger">{{ t('bazi.btn.shishenDetail') }}</div>
  </div>
</template>
