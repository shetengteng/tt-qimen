<script setup lang="ts">
/**
 * 解梦词条详情 · Dialog 弹框版。
 *
 * 设计要点：
 *   - 用 reka-ui Dialog 实现，避免 dialog 详情卡撑长页面、用户需上下滚动找返回按钮的问题
 *   - 顶部 sticky：标题 + 关闭（Esc / 点遮罩 / 点 X 都可关）
 *   - 中部可滚动：直接复用 DreamDetail 组件渲染原文 + 解读
 *   - 底部 sticky 操作栏：分享卡 / 保存 / 看下一个（emit 给父 page 处理实际副作用）
 *   - shareCard 容器仍位于 dialog 内部（class="jm-share-card"），通过 defineExpose 把
 *     html 元素 ref 透出给父组件，让 useShareCard.shareCard / saveCard 直接抓取
 *   - 主题样式由 _shared/base.css 与两个 jiemeng.css 共同提供（.jm-dialog-* 命名空间）
 */
import { computed, ref, useTemplateRef } from 'vue'
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
import DreamDetail from './DreamDetail.vue'
import ShareQrcode from '@/components/common/ShareQrcode.vue'
import { Button } from '@/components/ui/button'
import type { DreamEntry } from '../types'

const props = defineProps<{
  open: boolean
  entry: DreamEntry | null
  shareUrl?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'preview'): void
  (e: 'another'): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
const isGuofeng = computed(() => themeStore.id === 'guofeng')

const shareCardRef = useTemplateRef<HTMLElement>('shareCardEl')
defineExpose({ shareCardEl: shareCardRef })

const titleText = computed(() =>
  props.entry?.title ?? t('jiemeng.detail.dialogTitle'),
)

function setOpen(value: boolean) {
  emit('update:open', value)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="setOpen">
    <DialogPortal>
      <DialogOverlay class="jm-dialog-overlay" />
      <DialogContent
        class="jm-dialog-content"
        :class="isGuofeng ? 'jm-dialog-content--gf' : 'jm-dialog-content--mn'"
        :aria-describedby="undefined"
      >
        <header class="jm-dialog-head">
          <DialogTitle class="jm-dialog-title">{{ titleText }}</DialogTitle>
          <DialogClose
            class="jm-dialog-close"
            :aria-label="t('jiemeng.detail.closeAria')"
          >
            <X :size="18" aria-hidden="true" />
          </DialogClose>
        </header>

        <div class="jm-dialog-body">
          <div ref="shareCardEl" class="jm-share-card">
            <DreamDetail :entry="entry" />
            <ShareQrcode v-if="shareUrl" :url="shareUrl" />
          </div>
        </div>

        <footer class="jm-dialog-foot">
          <Button type="button" variant="default" class="jm-action-btn" @click="emit('preview')">
            <template v-if="isGuofeng">{{ t('jiemeng.btn.shareIcon') }} </template>{{ t('jiemeng.btn.share') }}
          </Button>
          <Button
            type="button"
            :variant="isGuofeng ? 'outline' : 'ghost'"
            class="jm-action-btn"
            @click="emit('another')"
          >
            <template v-if="isGuofeng">{{ t('jiemeng.btn.anotherIcon') }} </template>{{ t('jiemeng.btn.another') }}
          </Button>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
