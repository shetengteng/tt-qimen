<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="sanfang-toggle-bar">
    <span v-if="modelValue" class="sanfang-hint">{{ t('ziwei.sanfang.hint') }}</span>
    <button
      v-if="modelValue"
      type="button"
      class="sanfang-toggle active"
      @click="toggle"
    >
      {{ isGuofeng ? t('ziwei.sanfang.toggleOff') : t('ziwei.sanfang.toggleOffMn') }}
    </button>
    <button
      v-else
      type="button"
      class="sanfang-toggle"
      @click="toggle"
    >
      {{ isGuofeng ? t('ziwei.sanfang.reopen') : t('ziwei.sanfang.reopenMn') }}
    </button>
  </div>
</template>
