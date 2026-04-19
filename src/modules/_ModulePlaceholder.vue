<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = defineProps<{ moduleId: string }>()
const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <main class="ds-container module-placeholder">
    <header class="module-placeholder__hero">
      <button
        type="button"
        class="ds-button ds-button--ghost module-placeholder__back"
        @click="router.push({ name: 'home' })"
      >
        ← {{ t('common.button.back') }}
      </button>
      <h1>{{ t(`${props.moduleId}.title`) }}</h1>
      <p class="module-placeholder__sub">{{ t(`${props.moduleId}.subtitle`) }}</p>
    </header>

    <section class="ds-card module-placeholder__body">
      <p>{{ t('common.underConstruction') }}</p>
    </section>
  </main>
</template>

<style scoped>
.module-placeholder {
  position: relative;
  z-index: 1;
}

.module-placeholder__hero {
  margin-bottom: var(--space-8);
  text-align: center;
}

.module-placeholder__back {
  margin-bottom: var(--space-4);
}

.module-placeholder__hero h1 {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  color: var(--color-accent);
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  letter-spacing: 0.06em;
}

.module-placeholder__sub {
  margin: 0;
  color: var(--color-ink-soft);
  letter-spacing: 0.08em;
}

.module-placeholder__body {
  text-align: center;
  color: var(--color-ink-muted);
  padding: var(--space-12) var(--space-6);
  font-size: 1.05rem;
  letter-spacing: 0.04em;
}
</style>
