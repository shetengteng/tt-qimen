<script setup lang="ts">
/**
 * 黄历单日详情 · Dialog 弹框版。
 *
 * 设计：
 *   - 用 reka-ui Dialog 实现，避免点击月历某日后详情卡撑长页面、用户上下找不到的问题
 *   - 顶部 sticky 标题 + 关闭按钮（X / Esc / 点遮罩 都可关）
 *   - 中部可滚动：复用 DayDetailCard 的渲染（保持与原内联展开的视觉一致）
 *   - 不带底部操作栏：黄历的「分享 / 保存 / 回到今日」操作仍属于今日卡区，不属于「某一日详情」
 *   - 主题样式复用 _shared/base.css 中的 .jm-dialog-* 共享骨架
 *     （视为通用 app dialog skeleton；模块色在本文件 + theme css 内补主题修饰类）
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from 'reka-ui'
import { X } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import DayDetailCard from './DayDetailCard.vue'
import type { HuangliDay } from '../types'

const props = defineProps<{
  open: boolean
  day: HuangliDay | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const titleText = computed(() => {
  const base = t('huangli.detail.dialogTitle')
  if (!props.day) return base
  const dateText = t('huangli.detail.dateFmt', {
    date: props.day.dateIso,
    weekday: props.day.weekday,
  })
  return `${base} · ${dateText}`
})

function setOpen(value: boolean) {
  emit('update:open', value)
}
function onClose() {
  emit('close')
}
</script>

<template>
  <DialogRoot :open="open" @update:open="setOpen">
    <DialogPortal>
      <DialogOverlay class="jm-dialog-overlay" />
      <DialogContent
        class="jm-dialog-content hl-dialog-content"
        :class="isGuofeng ? 'hl-dialog-content--gf' : 'hl-dialog-content--mn'"
        :aria-describedby="undefined"
      >
        <header class="jm-dialog-head">
          <DialogTitle class="jm-dialog-title">{{ titleText }}</DialogTitle>
          <DialogClose
            class="jm-dialog-close"
            :aria-label="t('huangli.detail.closeAria')"
            @click="onClose"
          >
            <X :size="18" aria-hidden="true" />
          </DialogClose>
        </header>

        <div class="jm-dialog-body">
          <DayDetailCard v-if="day" :day="day" :embedded="true" @close="onClose" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
