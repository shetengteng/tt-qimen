<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useJiemengStore } from '../stores/jiemengStore'

/**
 * 最近搜索 chip 列表（localStorage 记忆 5 条）。
 * 当列表为空时整段 DOM 隐藏，避免视觉上突兀。
 */
const emit = defineEmits<{
  (e: 'pick', keyword: string): void
}>()

const { t } = useI18n()
const store = useJiemengStore()

function onPick(k: string) {
  emit('pick', k)
}
function onClear() {
  store.clearRecent()
}
</script>

<template>
  <div v-if="store.recentSearches.length > 0" class="jm-recent">
    <span class="jm-recent-label">{{ t('jiemeng.recent.label') }}</span>
    <button
      v-for="k in store.recentSearches"
      :key="k"
      type="button"
      class="jm-recent-chip"
      :class="{ active: store.query === k }"
      @click="onPick(k)"
    >
      {{ k }}
    </button>
    <a href="#" class="jm-recent-clear" @click.prevent="onClear">
      {{ t('jiemeng.recent.clear') }}
    </a>
  </div>
</template>
