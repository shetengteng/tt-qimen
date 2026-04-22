<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { ChengguResult } from '../types'

interface Props {
  /** 已排盘结果；调用方用 v-if="result" 保证非空 */
  result: ChengguResult
}
const props = defineProps<Props>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const body = computed(() => props.result.poem.description)
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
