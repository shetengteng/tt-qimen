<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'
import { ChevronDown } from 'lucide-vue-next'
import ThemeSwitch from './ThemeSwitch.vue'
import LangSwitch from './LangSwitch.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const isGuofeng = computed(() => themeStore.id === 'guofeng')
const currentName = computed(() => route.name as string | undefined)

interface NavItem {
  readonly id: string
  readonly to: RouteLocationRaw
}

const navItems: readonly NavItem[] = [
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

/**
 * 移动端 Popover 导航：trigger 显示当前页名（fallback 到 brand），
 * 选中条目后路由跳转并关闭面板。复用 .layout-popover-* 主题样式。
 */
const mobileNavOpen = ref(false)
const mobileNavLabel = computed(() => {
  const id = currentName.value
  const matched = navItems.find((it) => it.id === id)
  return matched ? t(`nav.${matched.id}`) : t('brand')
})
const mobileNavAriaLabel = computed(() => t('nav.menu'))

function pickRoute(item: NavItem) {
  router.push(item.to)
  mobileNavOpen.value = false
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
        <div class="gf-header-end">
          <nav class="gf-nav gf-nav--desktop">
            <a
              v-for="item in navItems"
              :key="item.id"
              href="#"
              :class="{ active: isActive(item.id) }"
              @click.prevent="pickRoute(item)"
            >
              {{ t(`nav.${item.id}`) }}
            </a>
          </nav>
          <div class="gf-nav-mobile">
            <PopoverRoot v-model:open="mobileNavOpen">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="layout-popover-trigger layout-popover-trigger--nav"
                  :aria-label="mobileNavAriaLabel"
                >
                  <span class="layout-popover-trigger-text">{{ mobileNavLabel }}</span>
                  <ChevronDown class="layout-popover-trigger-chevron" :size="14" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverPortal>
                <PopoverContent
                  class="layout-popover-content layout-popover-content--nav"
                  :side-offset="6"
                  align="end"
                  :avoid-collisions="true"
                  :collision-padding="12"
                >
                  <ul class="layout-popover-list">
                    <li v-for="item in navItems" :key="item.id">
                      <button
                        type="button"
                        class="layout-popover-option layout-popover-option--nav"
                        :class="{ 'is-active': isActive(item.id) }"
                        @click="pickRoute(item)"
                      >
                        <span class="layout-popover-option-text">
                          <span class="layout-popover-option-name">{{ t(`nav.${item.id}`) }}</span>
                        </span>
                      </button>
                    </li>
                  </ul>
                </PopoverContent>
              </PopoverPortal>
            </PopoverRoot>
          </div>
          <div class="gf-toolbar">
            <LangSwitch />
            <ThemeSwitch />
          </div>
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
          :aria-label="t('brand')"
          @click.prevent="router.push({ name: 'home' })"
        >
          <span class="mn-logo-mark">{{ t('brandMark') }}</span>
        </a>
        <div class="mn-header-end">
          <nav class="mn-nav mn-nav--desktop">
            <a
              v-for="item in navItems"
              :key="item.id"
              href="#"
              :class="{ active: isActive(item.id) }"
              @click.prevent="pickRoute(item)"
            >
              {{ t(`nav.${item.id}`) }}
            </a>
          </nav>
          <div class="mn-nav-mobile">
            <PopoverRoot v-model:open="mobileNavOpen">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="layout-popover-trigger layout-popover-trigger--nav"
                  :aria-label="mobileNavAriaLabel"
                >
                  <span class="layout-popover-trigger-text">{{ mobileNavLabel }}</span>
                  <ChevronDown class="layout-popover-trigger-chevron" :size="14" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverPortal>
                <PopoverContent
                  class="layout-popover-content layout-popover-content--nav"
                  :side-offset="6"
                  align="end"
                  :avoid-collisions="true"
                  :collision-padding="12"
                >
                  <ul class="layout-popover-list">
                    <li v-for="item in navItems" :key="item.id">
                      <button
                        type="button"
                        class="layout-popover-option layout-popover-option--nav"
                        :class="{ 'is-active': isActive(item.id) }"
                        @click="pickRoute(item)"
                      >
                        <span class="layout-popover-option-text">
                          <span class="layout-popover-option-name">{{ t(`nav.${item.id}`) }}</span>
                        </span>
                      </button>
                    </li>
                  </ul>
                </PopoverContent>
              </PopoverPortal>
            </PopoverRoot>
          </div>
          <div class="mn-toolbar">
            <LangSwitch />
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  </template>
</template>
