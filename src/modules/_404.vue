<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <main class="ds-container not-found">
    <h1>404</h1>
    <p>{{ t('common.nodata') }}</p>
    <button type="button" class="ds-button" @click="router.push({ name: 'home' })">
      {{ t('common.button.back') }}
    </button>
  </main>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: var(--space-16) var(--space-6);
  position: relative;
  z-index: 1;
}

.not-found h1 {
  font-family: var(--font-en);
  font-size: 5rem;
  margin: 0 0 var(--space-4);
  color: var(--color-accent);
}

.not-found p {
  color: var(--color-ink-muted);
  margin-bottom: var(--space-6);
}
</style>
