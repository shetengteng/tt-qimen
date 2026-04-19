<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()

const isGuofeng = computed(() => themeStore.id === 'guofeng')
</script>

<template>
  <footer v-if="isGuofeng" class="gf-footer">
    <div>{{ t('footer.branding') }}</div>
    <div style="margin-top: 12px;">
      <a href="#about">{{ t('footer.about') }}</a> ·
      <a href="#disclaimer">{{ t('footer.disclaimerLink') }}</a> ·
      <a href="#data-source">{{ t('footer.dataSource') }}</a> ·
      <a href="#privacy">{{ t('footer.privacy') }}</a>
    </div>
    <div style="margin-top: 16px; font-size: 12px;">
      {{ t('footer.copyright') }}
    </div>
  </footer>

  <footer v-else class="mn-footer">
    <div style="margin-bottom: 12px;">{{ t('footer.brandingMn') }}</div>
    <div>
      <a href="#about">{{ t('footer.about') }}</a>
      <a href="#disclaimer">{{ t('footer.disclaimerLink') }}</a>
      <a href="#data-source">{{ t('footer.dataSource') }}</a>
      <a href="#privacy">{{ t('footer.privacyMn') }}</a>
    </div>
    <div style="margin-top: 16px; font-size: 12px;">
      {{ t('footer.copyrightMn') }}
    </div>
  </footer>
</template>
