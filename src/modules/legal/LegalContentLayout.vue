<script setup lang="ts">
/**
 * 内容页（about/disclaimer/data-source/privacy）共享布局
 *
 * - 双主题（guofeng / minimal）样式分离，与各业务模块对齐
 * - 内容由调用方通过 i18n keys 注入：title / lastUpdated / sections[]
 * - 每个 section 支持 heading + paragraphs[] + 可选 list[]
 *
 * 使用方式：
 *   <LegalContentLayout :title-key="'about.title'" :last-updated-key="'about.lastUpdated'" :sections-key="'about.sections'" />
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

interface Section {
  heading: string
  paragraphs: string[]
  list?: string[]
}

const props = defineProps<{
  titleKey: string
  lastUpdatedKey: string
  sectionsKey: string
}>()

const { t, tm, rt } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const sections = computed<Section[]>(() => {
  const raw = tm(props.sectionsKey) as Array<Record<string, unknown>> | undefined
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({
    heading: String(rt(item.heading as string)),
    paragraphs: Array.isArray(item.paragraphs)
      ? (item.paragraphs as string[]).map((p) => String(rt(p)))
      : [],
    list: Array.isArray(item.list)
      ? (item.list as string[]).map((p) => String(rt(p)))
      : undefined,
  }))
})

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <main v-if="isGuofeng" class="gf-container legal-page">
    <button type="button" class="gf-btn gf-btn-outline legal-back" @click="goHome">
      ← {{ t('common.button.back') }}
    </button>

    <header class="legal-hero">
      <h1 class="legal-title">{{ t(props.titleKey) }}</h1>
      <p class="legal-meta">{{ t(props.lastUpdatedKey) }}</p>
    </header>

    <article class="legal-article">
      <section v-for="(s, i) in sections" :key="i" class="legal-section">
        <h2 class="legal-heading">{{ s.heading }}</h2>
        <p v-for="(p, pi) in s.paragraphs" :key="pi" class="legal-paragraph">{{ p }}</p>
        <ul v-if="s.list && s.list.length" class="legal-list">
          <li v-for="(li, lii) in s.list" :key="lii">{{ li }}</li>
        </ul>
      </section>
    </article>
  </main>

  <main v-else class="mn-container legal-page legal-page--mn">
    <button type="button" class="mn-btn mn-btn-outline legal-back" @click="goHome">
      ← {{ t('common.button.back') }}
    </button>

    <header class="legal-hero legal-hero--mn">
      <h1 class="legal-title legal-title--mn">{{ t(props.titleKey) }}</h1>
      <p class="legal-meta legal-meta--mn">{{ t(props.lastUpdatedKey) }}</p>
    </header>

    <article class="legal-article legal-article--mn">
      <section v-for="(s, i) in sections" :key="i" class="legal-section">
        <h2 class="legal-heading legal-heading--mn">{{ s.heading }}</h2>
        <p v-for="(p, pi) in s.paragraphs" :key="pi" class="legal-paragraph legal-paragraph--mn">{{ p }}</p>
        <ul v-if="s.list && s.list.length" class="legal-list legal-list--mn">
          <li v-for="(li, lii) in s.list" :key="lii">{{ li }}</li>
        </ul>
      </section>
    </article>
  </main>
</template>

<style scoped>
.legal-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  position: relative;
  z-index: 1;
}

.legal-back {
  margin-bottom: 24px;
}

.legal-hero {
  text-align: center;
  margin-bottom: 32px;
}

.legal-title {
  font-family: var(--gf-font-kaiti, var(--font-display));
  font-size: clamp(1.75rem, 4vw, 2.2rem);
  margin: 0 0 12px;
  color: var(--color-ink, var(--color-accent));
  letter-spacing: 0.08em;
}

.legal-meta {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-ink-muted, var(--color-ink-soft));
  letter-spacing: 0.05em;
}

.legal-article {
  background: var(--color-bg-elev, rgba(255, 255, 255, 0.6));
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
  border-radius: var(--radius-lg, 8px);
  padding: 32px 24px;
}

.legal-section + .legal-section {
  margin-top: 28px;
}

.legal-heading {
  font-family: var(--gf-font-kaiti, var(--font-display));
  font-size: 1.2rem;
  margin: 0 0 12px;
  color: var(--color-accent);
  border-left: 3px solid var(--color-accent);
  padding-left: 12px;
  letter-spacing: 0.06em;
}

.legal-paragraph {
  margin: 0 0 12px;
  line-height: 1.85;
  color: var(--color-ink);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

.legal-list {
  margin: 8px 0 16px;
  padding-left: 22px;
}

.legal-list li {
  line-height: 1.85;
  color: var(--color-ink);
  font-size: 0.95rem;
  margin-bottom: 6px;
}

/* ============ minimal ============ */
.legal-page--mn {
  max-width: 720px;
}

.legal-hero--mn {
  text-align: left;
}

.legal-title--mn {
  font-family: var(--mn-font-sans, var(--font-display));
  font-size: clamp(1.6rem, 3.5vw, 2rem);
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: -0.01em;
  border: none;
  margin: 0 0 8px;
}

.legal-meta--mn {
  color: var(--color-ink-muted, var(--color-ink-soft));
  font-size: 0.8rem;
}

.legal-article--mn {
  background: transparent;
  border: none;
  padding: 0;
}

.legal-heading--mn {
  font-family: var(--mn-font-sans, var(--font-display));
  font-weight: 600;
  border-left: 2px solid var(--color-accent);
  padding-left: 10px;
  letter-spacing: -0.01em;
}

.legal-paragraph--mn,
.legal-list--mn li {
  color: var(--color-ink);
  font-size: 0.95rem;
  line-height: 1.75;
}

@media (max-width: 640px) {
  .legal-page {
    padding: 16px 12px 32px;
  }
  .legal-article {
    padding: 24px 16px;
  }
}
</style>
