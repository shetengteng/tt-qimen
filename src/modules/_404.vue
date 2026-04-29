<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <main class="ds-container not-found">
    <h1>404</h1>
    <p>{{ t('common.nodata') }}</p>
    <Button type="button" variant="outline" @click="router.push({ name: 'home' })">
      {{ t('common.button.back') }}
    </Button>
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
