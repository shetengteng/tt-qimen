<script setup lang="ts">
import { computed } from 'vue'
import ZiweiPalace from './ZiweiPalace.vue'
import type { Palace, ZiweiChart } from '../types'

interface Props {
  /** 真实命盘；由外层 result-zone v-if 保证非空 */
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const palaces = computed<Palace[]>(() => {
  const list = props.chart?.palaces ?? []
  return [...list].sort((a, b) => a.slot - b.slot)
})
</script>

<template>
  <div class="ziwei-mobile">
    <div class="mobile-palaces-grid">
      <ZiweiPalace
        v-for="p in palaces"
        :key="p.key"
        :palace="p"
      />
    </div>
  </div>
</template>
