<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { ThemeId } from '@/themes'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'
import { Palette } from 'lucide-vue-next'

/**
 * 主题切换 · Icon 触发 + 弹出面板版（reka-ui PopoverRoot）。
 *
 * 设计目标：
 *   - 与 LangSwitch 视觉对齐，trigger 是 32px icon button，含 Palette 图标 + 当前主题首字
 *   - 弹出面板里逐项展示 displayName + description，方便预判（"国风：朱砂金墨"）
 *   - 选中项用 .is-active 高亮（描边或底色），由两套主题 CSS 精修
 */

const { t, locale } = useI18n()
const theme = useThemeStore()
const open = ref(false)

const ariaLabel = computed(() => t('common.theme'))

function getDisplayName(id: ThemeId): string {
  const dn = theme.registry[id].displayName
  return dn[locale.value as keyof typeof dn] ?? dn['zh-CN']
}

function getDescription(id: ThemeId): string {
  const dc = theme.registry[id].description
  return dc[locale.value as keyof typeof dc] ?? dc['zh-CN']
}

const currentMark = computed(() => getDisplayName(theme.id as ThemeId).slice(0, 1))

function pick(id: ThemeId) {
  theme.set(id)
  open.value = false
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="layout-popover-trigger layout-popover-trigger--theme"
        :aria-label="ariaLabel"
        :data-active-id="theme.id"
      >
        <Palette class="layout-popover-trigger-icon" :size="16" aria-hidden="true" />
        <span class="layout-popover-trigger-text">{{ currentMark }}</span>
      </button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        class="layout-popover-content layout-popover-content--theme"
        :side-offset="6"
        align="end"
        :collision-padding="8"
      >
        <ul class="layout-popover-list">
          <li v-for="id in theme.list" :key="id">
            <button
              type="button"
              class="layout-popover-option layout-popover-option--theme"
              :class="{ 'is-active': id === theme.id }"
              @click="pick(id)"
            >
              <span class="layout-popover-option-text">
                <span class="layout-popover-option-name">{{ getDisplayName(id) }}</span>
                <span class="layout-popover-option-desc">{{ getDescription(id) }}</span>
              </span>
            </button>
          </li>
        </ul>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
