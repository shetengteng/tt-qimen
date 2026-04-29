<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { MODULES, type ModuleId } from '@/router'
import { Button } from '@/components/ui/button'

interface ModuleVM {
  id: ModuleId
  short: string
  title: string
  desc: string
  descMn: string
  tags: string[]
  tagsMn: string[]
  badge?: string
}

const { t, tm, rt } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()

const isGuofeng = computed(() => themeStore.id === 'guofeng')

const modulesVM = computed<ModuleVM[]>(() =>
  MODULES.map((m) => {
    const data = tm(`modules.${m.id}`) as Record<string, unknown>
    return {
      id: m.id,
      short: String(data?.short ?? ''),
      title: String(data?.title ?? ''),
      desc: String(data?.desc ?? ''),
      descMn: String(data?.descMn ?? data?.desc ?? ''),
      tags: ((data?.tags ?? []) as unknown[]).map(String),
      tagsMn: ((data?.tagsMn ?? data?.tags ?? []) as unknown[]).map(String),
      badge: data?.badge ? String(data.badge) : undefined,
    }
  }),
)

const featuresGf = computed(
  () => (tm('features.items') as Array<Record<string, string>>).map((item) => ({
    icon: String(rt(item.icon)),
    title: String(rt(item.title)),
    desc: String(rt(item.desc)),
  })),
)

const featuresMn = computed(
  () => (tm('features.itemsMn') as Array<Record<string, string>>).map((item) => ({
    icon: String(rt(item.icon)),
    title: String(rt(item.title)),
    desc: String(rt(item.desc)),
  })),
)

function go(id: ModuleId) {
  router.push({ name: id })
}
</script>

<template>
  <!-- ============ 国风主题 ============ -->
  <main v-if="isGuofeng">
    <section class="hero gf-container">
      <span class="gf-seal hero-seal">{{ t('home.hero.sealRight') }}</span>
      <span class="gf-seal hero-seal-left">{{ t('home.hero.sealLeft') }}</span>

      <div class="hero-ornament">{{ t('home.hero.ornament') }}</div>
      <h1 class="hero-title">
        {{ t('home.hero.titleMain') }}<span class="accent">{{ t('home.hero.titleAccent') }}</span>
      </h1>
      <p class="hero-subtitle">
        {{ t('home.hero.subtitle1') }}<br>
        {{ t('home.hero.subtitle2') }}
      </p>
      <div class="hero-cta">
        <Button as="a" href="#" variant="default" size="lg" @click.prevent="go('bazi')">
          <span>{{ t('home.hero.ctaPrimaryIcon') }}</span> {{ t('home.hero.ctaPrimary') }}
        </Button>
        <Button as="a" href="#modules" variant="outline" size="lg">
          <span>{{ t('home.hero.ctaSecondaryIcon') }}</span> {{ t('home.hero.ctaSecondary') }}
        </Button>
      </div>
    </section>

    <div class="gf-container">
      <div class="huangli-bar">
        <div class="huangli-date">
          <div class="huangli-date-day">{{ t('home.huangli.day') }}</div>
          <div class="huangli-date-month">{{ t('home.huangli.monthLunar') }}</div>
          <div class="huangli-date-month">{{ t('home.huangli.lunarDay') }}</div>
        </div>
        <div>
          <div class="huangli-info-row">
            <span class="huangli-label">{{ t('home.huangli.ganzhiLabel') }}</span>
            <span class="huangli-value">{{ t('home.huangli.ganzhi') }}</span>
          </div>
          <div class="huangli-yi">
            <span class="huangli-yi-label">{{ t('home.huangli.yi') }}</span>
            <span class="huangli-value">{{ t('home.huangli.yiValue') }}</span>
          </div>
          <div class="huangli-ji">
            <span class="huangli-ji-label">{{ t('home.huangli.ji') }}</span>
            <span class="huangli-value">{{ t('home.huangli.jiValue') }}</span>
          </div>
        </div>
        <a href="#" class="huangli-detail-link" @click.prevent="go('huangli')">
          {{ t('home.huangli.detailLink') }}
        </a>
      </div>

      <div class="gf-divider">
        <span>{{ t('home.sectionDivider') }}</span>
      </div>

      <section class="modules-section" id="modules">
        <h2 class="section-title">{{ t('home.sectionTitle') }}</h2>
        <p class="section-subtitle">{{ t('home.sectionSubtitle') }}</p>

        <div class="module-grid">
          <a
            v-for="m in modulesVM"
            :key="m.id"
            href="#"
            class="gf-card module-card"
            @click.prevent="go(m.id)"
          >
            <div class="module-icon">{{ m.short }}</div>
            <h3 class="gf-card-title">{{ m.title }}</h3>
            <p class="gf-card-desc">{{ m.desc }}</p>
            <div class="module-tags">
              <span
                v-for="(tag, i) in m.tags"
                :key="tag"
                :class="['module-tag', { hot: i === 0 && m.badge }]"
              >
                {{ tag }}
              </span>
            </div>
          </a>
        </div>
      </section>

      <div class="gf-divider">
        <span>{{ t('home.featuresDivider') }}</span>
      </div>

      <section class="features-section">
        <div v-for="f in featuresGf" :key="f.title" class="feature">
          <div class="feature-icon">{{ f.icon }}</div>
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.desc }}</p>
        </div>
      </section>
    </div>
  </main>

  <!-- ============ 简约主题 ============ -->
  <main v-else class="mn-container">
    <section class="hero">
      <div class="hero-eyebrow">
        <span class="dot"></span>
        {{ t('home.hero.eyebrow') }}
      </div>
      <h1 class="hero-title">
        {{ t('home.hero.titleMnLine1') }}<br>
        <span class="accent">{{ t('home.hero.titleMnLine2A') }}</span>{{ t('home.hero.titleMnLine2B') }}
      </h1>
      <p class="hero-subtitle">
        {{ t('home.hero.subtitleMn1') }}<br>
        {{ t('home.hero.subtitleMn2') }}
      </p>
      <div class="hero-cta">
        <Button as="a" href="#" variant="default" size="lg" @click.prevent="go('bazi')">
          {{ t('home.hero.ctaMnPrimary') }}
          <span>→</span>
        </Button>
        <Button as="a" href="#modules" variant="outline" size="lg">
          {{ t('home.hero.ctaMnSecondary') }}
        </Button>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <div class="stat-num">{{ t('home.stats.methodsValue') }}</div>
          <div class="stat-label">{{ t('home.stats.methods') }}</div>
        </div>
        <div class="stat">
          <div class="stat-num">{{ t('home.stats.jiemengEntriesValue') }}</div>
          <div class="stat-label">{{ t('home.stats.jiemengEntries') }}</div>
        </div>
        <div class="stat">
          <div class="stat-num">{{ t('home.stats.lingqianValue') }}</div>
          <div class="stat-label">{{ t('home.stats.lingqian') }}</div>
        </div>
        <div class="stat">
          <div class="stat-num">{{ t('home.stats.offlineValue') }}</div>
          <div class="stat-label">{{ t('home.stats.offline') }}</div>
        </div>
      </div>
    </section>

    <div class="huangli-today">
      <div class="hl-date">
        <div class="hl-day">{{ t('home.huangli.day') }}</div>
        <div class="hl-month">{{ t('home.huangli.monthMnLine1') }}</div>
        <div class="hl-month" style="margin-top: 4px;">{{ t('home.huangli.monthMnLine2') }}</div>
      </div>
      <div>
        <div>
          <div class="hl-info-label">{{ t('home.huangli.todayLabel') }}</div>
          <div class="hl-content" style="font-weight: 500;">{{ t('home.huangli.ganzhi') }}</div>
        </div>
        <div class="hl-yi-row">
          <span class="hl-tag yi">{{ t('home.huangli.yi') }}</span>
          <span class="hl-content">{{ t('home.huangli.yiValue') }}</span>
        </div>
        <div class="hl-ji-row">
          <span class="hl-tag ji">{{ t('home.huangli.ji') }}</span>
          <span class="hl-content">{{ t('home.huangli.jiValue') }}</span>
        </div>
      </div>
      <Button as="a" href="#" variant="outline" @click.prevent="go('huangli')">
        {{ t('home.huangli.detailLinkMn') }}
        <span>→</span>
      </Button>
    </div>

    <section class="modules-section" id="modules">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.sectionTitleMn') }}</h2>
        <p class="section-sub">{{ t('home.sectionSubMn') }}</p>
      </div>
      <div class="module-grid">
        <a
          v-for="m in modulesVM"
          :key="m.id"
          href="#"
          class="module-card"
          @click.prevent="go(m.id)"
        >
          <div class="mn-card mn-card-interactive">
            <div class="module-icon">{{ m.short }}</div>
            <h3 class="mn-card-title">
              {{ m.title }}
              <span v-if="m.badge" class="mn-badge">{{ m.badge }}</span>
            </h3>
            <p class="mn-card-desc">{{ m.descMn }}</p>
            <div class="module-tags">
              <span
                v-for="(tag, i) in m.tagsMn"
                :key="tag"
                :class="['mn-badge', i === 0 && m.badge ? '' : 'mn-badge-neutral']"
              >
                {{ tag }}
              </span>
            </div>
            <span class="module-arrow">→</span>
          </div>
        </a>
      </div>
    </section>

    <hr class="mn-divider">

    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.featuresTitleMn') }}</h2>
        <p class="section-sub">{{ t('home.featuresSubMn') }}</p>
      </div>
      <div class="features-grid">
        <div v-for="f in featuresMn" :key="f.title" class="feature">
          <div class="feature-icon">{{ f.icon }}</div>
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.desc }}</p>
        </div>
      </div>
    </section>
  </main>
</template>
