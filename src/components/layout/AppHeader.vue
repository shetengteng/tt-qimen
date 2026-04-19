<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ThemeSwitch from './ThemeSwitch.vue'
import LangSwitch from './LangSwitch.vue'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <header class="app-header">
    <div class="ds-container app-header__inner">
      <button
        type="button"
        class="app-header__brand"
        @click="router.push({ name: 'home' })"
      >
        <span class="app-header__brand-mark">◈</span>
        <span class="app-header__brand-name">{{ t('brand') }}</span>
      </button>

      <nav class="app-header__nav">
        <LangSwitch />
        <ThemeSwitch />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--color-bg) 92%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--space-3);
  padding-inline: var(--space-6);
}

.app-header__brand {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: var(--font-display);
  color: var(--color-accent);
}

.app-header__brand-mark {
  font-size: 1.4rem;
  line-height: 1;
}

.app-header__brand-name {
  font-size: 1.1rem;
  letter-spacing: 0.12em;
}

.app-header__nav {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}
</style>
