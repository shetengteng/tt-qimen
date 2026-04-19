<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const { t, locale } = useI18n()
const theme = useThemeStore()

const ariaLabel = computed(() => t('common.theme'))
</script>

<template>
  <div class="theme-switch" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="t in theme.list"
      :key="t"
      role="radio"
      :aria-checked="theme.id === t"
      :class="['theme-switch__opt', { 'is-active': theme.id === t }]"
      type="button"
      @click="theme.set(t)"
    >
      {{ theme.registry[t].displayName[locale] ?? theme.registry[t].displayName['zh-CN'] }}
    </button>
  </div>
</template>

<style scoped>
.theme-switch {
  display: inline-flex;
  gap: var(--space-1);
  padding: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elev);
}

.theme-switch__opt {
  padding: var(--space-1) var(--space-3);
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--color-ink-soft);
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: var(--transition-fast);
}

.theme-switch__opt:hover {
  color: var(--color-ink);
}

.theme-switch__opt.is-active {
  background: var(--color-accent);
  color: var(--color-accent-on);
}
</style>
