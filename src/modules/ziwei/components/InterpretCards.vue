<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { interpretCards as mockCards } from '../data/mockZiwei'
import type { ZiweiChart } from '../types'

interface Props {
  chart?: ZiweiChart | null
}

const props = defineProps<Props>()

const { t } = useI18n()

const cards = computed(() => props.chart?.interpretCards ?? mockCards)
</script>

<template>
  <section class="ziwei-interpret-section">
    <article
      v-for="card in cards"
      :key="card.key"
      class="ziwei-interpret-card"
    >
      <h3>{{ t(`ziwei.interpret.cards.${card.key}.title`) }}</h3>
      <p>{{ t(`ziwei.interpret.cards.${card.key}.text`) }}</p>
      <div class="tags">
        <span
          v-for="(tag, idx) in card.tags"
          :key="idx"
          :class="['tag', tag.tone || 'plain']"
        >
          {{ tag.label }}
        </span>
      </div>
    </article>
  </section>
</template>
