<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { MODULES, type ModuleId } from '@/router'

const { t } = useI18n()
const router = useRouter()

function go(id: ModuleId) {
  router.push({ name: id })
}
</script>

<template>
  <main class="ds-container home">
    <header class="home__hero">
      <h1 class="home__title">{{ t('brand') }}</h1>
      <p class="home__tagline">{{ t('tagline') }}</p>
      <p class="home__intro">{{ t('home.intro') }}</p>
    </header>

    <section class="home__grid">
      <button
        v-for="m in MODULES"
        :key="m.id"
        class="ds-card home__module"
        type="button"
        @click="go(m.id)"
      >
        <span class="home__module-order">{{ m.order.toString().padStart(2, '0') }}</span>
        <h2 class="home__module-name">{{ t(`modules.${m.id}`) }}</h2>
        <p class="home__module-sub">{{ t(`${m.id}.subtitle`) }}</p>
        <span class="home__module-cta">{{ t('home.enter') }} →</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
.home {
  position: relative;
  z-index: 1;
}

.home__hero {
  text-align: center;
  margin-bottom: var(--space-12);
}

.home__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--color-accent);
  margin: 0 0 var(--space-2);
  letter-spacing: 0.06em;
}

.home__tagline {
  font-family: var(--font-display);
  color: var(--color-ink-soft);
  font-size: clamp(1rem, 2vw, 1.15rem);
  margin: 0 0 var(--space-4);
  letter-spacing: 0.12em;
}

.home__intro {
  max-width: 580px;
  margin: 0 auto;
  color: var(--color-ink-muted);
  line-height: 1.8;
}

.home__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}

.home__module {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-align: left;
  cursor: pointer;
  transition: transform var(--transition-base);
  font-family: inherit;
  color: inherit;
}

.home__module:hover {
  transform: translateY(-2px);
}

.home__module-order {
  font-family: var(--font-en);
  color: var(--color-ink-muted);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
}

.home__module-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--color-ink);
}

.home__module-sub {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 0.9rem;
  flex: 1;
  letter-spacing: 0.04em;
}

.home__module-cta {
  margin-top: var(--space-3);
  color: var(--color-accent);
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
