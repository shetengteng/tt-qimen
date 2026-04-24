<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import type { Locale } from '@/locales'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui'

/**
 * 语言切换 · Icon 触发 + 弹出面板版（reka-ui PopoverRoot）。
 *
 * 设计目标：
 *   - 取代 shadcn-vue Select 那套 SelectValue 抓不到自定义 itemText 导致 trigger 空白的方案
 *   - Trigger 是一个 32px 圆形/方形 icon button，里面只放当前语言的 1-2 字短标（简/繁/EN），
 *     视觉对齐 toolbar 中其它 icon 控件，比 60px 宽下拉条干净
 *   - 弹出面板自研结构（不走 SelectItem），可自由排版：左短标徽章 + 右全名
 *   - 主题样式由 .layout-popover-trigger / .layout-popover-content 类承载，
 *     由两套主题 CSS 各自精修；Popover content portal 到 body，全局样式在
 *     `_shared/base.css` 按 `[data-theme]` 区分
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
        <span class="layout-popover-trigger-text">{{ currentShort }}</span>
      </button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        class="layout-popover-content layout-popover-content--lang"
        :side-offset="6"
        align="start"
        :collision-padding="8"
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
