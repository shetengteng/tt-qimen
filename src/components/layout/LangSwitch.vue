<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import type { Locale } from '@/locales'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * 语言切换 · 下拉版（shadcn-vue Select）。
 *
 * 替代原来 3 按钮并列（简/繁/EN），在 header 宽度紧张的 guofeng / minimal 双主题下都能收起成一个触发器，
 * 避免挤占 nav 空间。
 *
 * 触发器显示当前语言的短标签（"简 · 简体中文" / "繁 · 繁體" / "EN · English"），
 * 打开后三选一；选中即立即通过 `useLocaleStore.set` 切换并持久化。
 * 仍保留 aria-label / role="combobox" 让屏幕阅读器识别。
 */

const { t } = useI18n()
const locale = useLocaleStore()

const ariaLabel = computed(() => t('common.language'))

const LABELS: Record<Locale, { short: string; full: string }> = {
  'zh-CN': { short: '简', full: '简体中文' },
  'zh-TW': { short: '繁', full: '繁體中文' },
  en: { short: 'EN', full: 'English' },
}

const model = computed<Locale>({
  get: () => locale.id as Locale,
  set: (v: Locale) => locale.set(v),
})
</script>

<template>
  <Select v-model="model">
    <SelectTrigger class="layout-switch-trigger" :aria-label="ariaLabel">
      <SelectValue>
        <span class="layout-switch-label">{{ LABELS[model].short }}</span>
      </SelectValue>
    </SelectTrigger>
    <SelectContent class="layout-switch-content" align="end">
      <SelectItem v-for="l in locale.list" :key="l" :value="l">
        <span class="layout-switch-option">
          <span class="layout-switch-mark">{{ LABELS[l].short }}</span>
          <span class="layout-switch-full">{{ LABELS[l].full }}</span>
        </span>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
