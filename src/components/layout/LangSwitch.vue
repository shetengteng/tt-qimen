<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import type { Locale } from '@/locales'

const { t } = useI18n()
const locale = useLocaleStore()

const ariaLabel = computed(() => t('common.language'))

const labelMap: Record<Locale, string> = {
  'zh-CN': '简',
  'zh-TW': '繁',
  en: 'EN',
}
</script>

<template>
  <div class="lang-switch" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="l in locale.list"
      :key="l"
      role="radio"
      :aria-checked="locale.id === l"
      :class="['lang-switch__opt', { 'is-active': locale.id === l }]"
      type="button"
      @click="locale.set(l)"
    >
      {{ labelMap[l] }}
    </button>
  </div>
</template>

<style scoped>
.lang-switch {
  display: inline-flex;
  gap: var(--space-1);
  padding: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elev);
}

.lang-switch__opt {
  padding: var(--space-1) var(--space-3);
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--color-ink-soft);
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: var(--transition-fast);
  min-width: 32px;
}

.lang-switch__opt:hover {
  color: var(--color-ink);
}

.lang-switch__opt.is-active {
  background: var(--color-accent);
  color: var(--color-accent-on);
}
</style>
