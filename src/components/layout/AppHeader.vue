<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ThemeSwitch from './ThemeSwitch.vue'
import LangSwitch from './LangSwitch.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const isGuofeng = computed(() => themeStore.id === 'guofeng')
const currentName = computed(() => route.name as string | undefined)

const navItems = [
  { id: 'home',     to: { name: 'home' } },
  { id: 'bazi',     to: { name: 'bazi' } },
  { id: 'ziwei',    to: { name: 'ziwei' } },
  { id: 'chenggu',  to: { name: 'chenggu' } },
  { id: 'liuren',   to: { name: 'liuren' } },
  { id: 'lingqian', to: { name: 'lingqian' } },
  { id: 'xingming', to: { name: 'xingming' } },
  { id: 'huangli',  to: { name: 'huangli' } },
  { id: 'jiemeng',  to: { name: 'jiemeng' } },
] as const

function isActive(name: string): boolean {
  if (name === 'home') return currentName.value === 'home'
  return currentName.value === name
}
</script>

<template>
  <template v-if="isGuofeng">
    <div class="gf-disclaimer">{{ t('disclaimer') }}</div>
    <header class="gf-header">
      <div class="gf-header-inner">
        <a
          href="#/"
          class="gf-logo"
          @click.prevent="router.push({ name: 'home' })"
        >
          <span class="gf-logo-mark">{{ t('brandMark') }}</span>
          {{ t('brandFull') }}
        </a>
        <nav class="gf-nav">
          <a
            v-for="item in navItems"
            :key="item.id"
            href="#"
            :class="{ active: isActive(item.id) }"
            @click.prevent="router.push(item.to)"
          >
            {{ t(`nav.${item.id}`) }}
          </a>
        </nav>
        <div class="gf-toolbar">
          <LangSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  </template>

  <template v-else>
    <div class="mn-disclaimer">{{ t('disclaimer') }}</div>
    <header class="mn-header">
      <div class="mn-header-inner">
        <a
          href="#/"
          class="mn-logo"
          @click.prevent="router.push({ name: 'home' })"
        >
          <span class="mn-logo-mark">{{ t('brandMark') }}</span>
          {{ t('brand') }}
        </a>
        <nav class="mn-nav">
          <a
            v-for="item in navItems"
            :key="item.id"
            href="#"
            :class="{ active: isActive(item.id) }"
            @click.prevent="router.push(item.to)"
          >
            {{ t(`nav.${item.id}`) }}
          </a>
        </nav>
        <div class="mn-toolbar">
          <LangSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  </template>
</template>
