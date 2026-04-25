<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import type { Locale } from '@/locales'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'
import { Languages } from 'lucide-vue-next'

/**
 * 语言切换 · Icon 触发 + 弹出面板版（reka-ui PopoverRoot）。
 *
 * 设计目标：
 *   - 取代 shadcn-vue Select 那套 SelectValue 抓不到自定义 itemText 导致 trigger 空白的方案
 *   - Trigger 是一个 32px 圆角方形 icon button（与 ThemeSwitch 视觉对齐），
 *     内含 Languages 图标 + 当前语言短标（简/繁/EN）
 *   - 弹出面板自研结构（不走 SelectItem），可自由排版：左短标徽章 + 右全名
 *   - 主题样式由 .layout-popover-trigger / .layout-popover-content 类承载，
 *     由两套主题 CSS 各自精修；Popover content portal 到 body，全局样式在
 *     `_shared/base.css` 按 `[data-theme]` 区分
 *   - PopoverContent 用 `align="end"`：trigger 在 toolbar 最右侧，向左展开
 *     避免弹层超出视口被裁切
 */

const { t } = useI18n()
const locale = useLocaleStore()
const open = ref(false)

const ariaLabel = computed(() => t('common.language'))

/** 显示用映射；short 走 trigger button，full 走面板正文 */
const LABELS: Record<Locale, { short: string; full: string }> = {
  'zh-CN': { short: '简', full: '简体中文' },
  'zh-TW': { short: '繁', full: '繁體中文' },
  en: { short: 'EN', full: 'English' },
}

const currentShort = computed(() => LABELS[locale.id as Locale]?.short ?? '?')

function pick(id: Locale) {
  locale.set(id)
  open.value = false
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="layout-popover-trigger layout-popover-trigger--lang"
        :aria-label="ariaLabel"
        :data-active-id="locale.id"
      >
        <Languages class="layout-popover-trigger-icon" :size="16" aria-hidden="true" />
        <span class="layout-popover-trigger-text">{{ currentShort }}</span>
      </button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        class="layout-popover-content layout-popover-content--lang"
        :side-offset="6"
        align="end"
        :avoid-collisions="true"
        :collision-padding="12"
      >
        <ul class="layout-popover-list">
          <li v-for="id in locale.list" :key="id">
            <button
              type="button"
              class="layout-popover-option"
              :class="{ 'is-active': id === locale.id }"
              @click="pick(id)"
            >
              <span class="layout-popover-option-mark">{{ LABELS[id].short }}</span>
              <span class="layout-popover-option-text">{{ LABELS[id].full }}</span>
            </button>
          </li>
        </ul>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
