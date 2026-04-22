<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { ChengguResult } from '../types'

interface Props {
  result?: ChengguResult | null
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const PLACEHOLDER = '五两一钱之命，为古法中"贵显"之相。歌诀言"一世荣华"，并非今人所谓必然富贵，而是指心性与格局较为开阔，一生多得遇合，工作上易得贵人提携。'

const body = computed(() => props.result?.poem.description ?? PLACEHOLDER)
</script>

<template>
  <!-- 国风 -->
  <div v-if="isGuofeng" class="cg-interpret-card">
    <h3>{{ t('chenggu.interpret.title') }}</h3>
    <p>{{ body }}</p>
    <p class="cg-interpret-note">{{ t('chenggu.interpret.note') }}</p>
  </div>

  <!-- 简约 -->
  <div v-else class="cg-interpret-card">
    <h3>{{ t('chenggu.interpret.titleMn') }}</h3>
    <p>{{ body }}</p>
    <p class="cg-interpret-note">{{ t('chenggu.interpret.note') }}</p>
  </div>
</template>
