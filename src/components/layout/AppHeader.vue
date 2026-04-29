<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAiSidebarStore } from '@/stores/aiSidebar'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'
import { ChevronDown, Settings, Sparkles } from 'lucide-vue-next'
import DisclaimerBanner from '@/components/common/DisclaimerBanner.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const aiSidebar = useAiSidebarStore()

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

const settingsAria = computed(() => t('settings.title'))
const isSettingsActive = computed(() => currentName.value === 'settings')

function goSettings() {
  router.push({ name: 'settings' })
  mobileNavOpen.value = false
}

/**
 * Header 上的 AI 开关按钮：
 * - 已开启 → 点击 hide()
 * - 未开启 + store 里已有上次 chart（同会话内用户在模块页 askAi 过）→ 重新 open()
 * - 未开启 + 无 chart → 按钮 disabled（用户必须先去模块页排盘）
 *
 * 这里复用 store.show 的入参契约：moduleId/chart/userContext 都已经在 store
 * 里持久化（shallowRef 会保留上次值），open 只需把 open=true。
 */
const aiButtonActive = computed(() => aiSidebar.open)
const aiButtonAria = computed(() =>
  aiSidebar.open ? t('ai.header.toggleClose') : t('ai.header.toggleOpen'),
)

/**
 * 点 header AI 按钮：
 *   - 已打开 → 关闭
 *   - 未打开 + 有 chart → 直接展示原模块的对话
 *   - 未打开 + 无 chart → 进入「自由对话」模式
 */
function toggleAi() {
  if (aiSidebar.open) {
    aiSidebar.hide()
    return
  }
  mobileNavOpen.value = false
  if (aiSidebar.chart) {
    aiSidebar.open = true
    return
  }
  aiSidebar.openFreeChat()
}
</script>

<template>
  <template v-if="isGuofeng">
    <DisclaimerBanner />
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
            <button
              type="button"
              class="layout-popover-trigger layout-popover-trigger--settings"
              :aria-label="aiButtonAria"
              :title="aiButtonAria"
              :class="{ 'is-active': aiButtonActive }"
              @click="toggleAi"
            >
              <Sparkles class="layout-popover-trigger-icon" :size="16" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="layout-popover-trigger layout-popover-trigger--settings"
              :aria-label="settingsAria"
              :class="{ 'is-active': isSettingsActive }"
              @click="goSettings"
            >
              <Settings class="layout-popover-trigger-icon" :size="16" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  </template>

  <template v-else>
    <DisclaimerBanner />
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
            <button
              type="button"
              class="layout-popover-trigger layout-popover-trigger--settings"
              :aria-label="aiButtonAria"
              :title="aiButtonAria"
              :class="{ 'is-active': aiButtonActive }"
              @click="toggleAi"
            >
              <Sparkles class="layout-popover-trigger-icon" :size="16" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="layout-popover-trigger layout-popover-trigger--settings"
              :aria-label="settingsAria"
              :class="{ 'is-active': isSettingsActive }"
              @click="goSettings"
            >
              <Settings class="layout-popover-trigger-icon" :size="16" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  </template>
</template>
