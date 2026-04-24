<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import type { ThemeId } from '@/themes'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * 主题切换 · 下拉版（shadcn-vue Select）。
 *
 * 取代原来 2 按钮并列（国风 / 简约），改为下拉后：
 *   - Header 右侧 toolbar 视觉更干净（2 按钮 → 1 触发器）
 *   - 后续新增主题（比如 2026 Q3 可能加的 "typography"）时无需再排版
 *   - 与 LangSwitch 视觉风格对齐
 *
 * 触发器显示当前主题的 displayName（随 locale 自动切换）。
 * 打开下拉选项内展示 displayName + description（来自 `themeRegistry[id].description`），
 * 让用户在切换前就能预判差异。
 */

const { t, locale } = useI18n()
const theme = useThemeStore()

const ariaLabel = computed(() => t('common.theme'))

function getDisplayName(id: ThemeId): string {
  return (
    theme.registry[id].displayName[locale.value as keyof typeof theme.registry[typeof id]['displayName']] ??
    theme.registry[id].displayName['zh-CN']
  )
}

function getDescription(id: ThemeId): string {
  return (
    theme.registry[id].description[locale.value as keyof typeof theme.registry[typeof id]['description']] ??
    theme.registry[id].description['zh-CN']
  )
}

const model = computed<ThemeId>({
  get: () => theme.id as ThemeId,
  set: (v: ThemeId) => theme.set(v),
})
</script>

<template>
  <Select v-model="model">
    <SelectTrigger class="layout-switch-trigger" :aria-label="ariaLabel">
      <SelectValue>
        <span class="layout-switch-label">{{ getDisplayName(model) }}</span>
      </SelectValue>
    </SelectTrigger>
    <SelectContent class="layout-switch-content" align="end">
      <SelectItem v-for="id in theme.list" :key="id" :value="id">
        <span class="layout-switch-option">
          <span class="layout-switch-label">{{ getDisplayName(id) }}</span>
          <span class="layout-switch-desc">{{ getDescription(id) }}</span>
        </span>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
