<script setup lang="ts">
/**
 * 分享卡 · 预览弹窗
 *
 * 设计目标：
 *   1. 收到 PNG dataURL 后展示缩略图，让用户在分享 / 保存前先看一眼成品；
 *   2. 三个操作：关闭 · 保存到本地 · 系统分享（按钮顺序与移动端原生 share sheet 习惯一致）；
 *   3. 复用 jm-dialog 骨架（base.css 中已是站点通用 dialog skeleton）；
 *   4. 不重复二维码逻辑：二维码已在卡片内，缩略图直接体现，Dialog 内不再单独渲染。
 *
 * 用法：
 *   <SharePreviewDialog
 *     v-model:open="previewOpen"
 *     :image="previewImage"
 *     :share-options="shareOpts"
 *     @save="onSave"
 *     @share="onShare"
 *   />
 *
 * 父组件负责：
 *   - 在打开 Dialog 之前用 useShareCard.previewCard() 生成 dataURL；
 *   - 在 @save / @share 回调里走 saveCard / shareCard 完成最终落盘 / 调起 Web Share。
 */
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

interface Props {
  open: boolean
  /** 缩略图 dataURL（PNG） */
  image: string
  /** 是否禁用（生成中、空 image 时） */
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), { disabled: false })

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save'): void
  (e: 'share'): void
}>()

const { t } = useI18n()

function setOpen(value: boolean) {
  emit('update:open', value)
}
function onSaveClick() {
  if (props.disabled) return
  emit('save')
}
function onShareClick() {
  if (props.disabled) return
  emit('share')
}
</script>

<template>
  <DialogRoot :open="open" @update:open="setOpen">
    <DialogPortal>
      <DialogOverlay class="jm-dialog-overlay" />
      <DialogContent
        class="jm-dialog-content share-preview-dialog"
        :aria-describedby="undefined"
      >
        <header class="jm-dialog-head">
          <DialogTitle class="jm-dialog-title">
            {{ t('common.share.preview.title') }}
          </DialogTitle>
          <DialogClose
            class="jm-dialog-close"
            :aria-label="t('common.share.preview.closeAria')"
          >
            <X :size="18" aria-hidden="true" />
          </DialogClose>
        </header>

        <div class="jm-dialog-body share-preview-body">
          <div class="share-preview-image-wrap" v-if="image">
            <img
              :src="image"
              class="share-preview-image"
              :alt="t('common.share.preview.imageAlt')"
            />
          </div>
          <div class="share-preview-placeholder" v-else>
            {{ t('common.share.preview.generating') }}
          </div>
          <p class="share-preview-hint">
            {{ t('common.share.preview.hint') }}
          </p>
        </div>

        <footer class="jm-dialog-foot share-preview-foot">
          <button
            type="button"
            class="share-preview-btn share-preview-btn--ghost"
            @click="setOpen(false)"
          >
            {{ t('common.share.preview.close') }}
          </button>
          <button
            type="button"
            class="share-preview-btn share-preview-btn--primary"
            :disabled="disabled"
            @click="onSaveClick"
          >
            {{ t('common.share.preview.save') }}
          </button>
          <button
            type="button"
            class="share-preview-btn share-preview-btn--accent"
            :disabled="disabled"
            @click="onShareClick"
          >
            {{ t('common.share.preview.share') }}
          </button>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.share-preview-dialog {
  width: min(560px, 92vw);
  max-height: 88vh;
}

.share-preview-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
}

.share-preview-image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-soft, rgba(0, 0, 0, 0.03));
  border-radius: 8px;
  padding: 12px;
  min-height: 160px;
}

.share-preview-image {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.share-preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: var(--text-muted, #6b6b6b);
  font-size: 13px;
}

.share-preview-hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted, #6b6b6b);
}

.share-preview-foot {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
}

.share-preview-btn {
  appearance: none;
  border: 1px solid transparent;
  padding: 8px 16px;
  font-size: 14px;
  line-height: 1.4;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
}

.share-preview-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.share-preview-btn--ghost {
  background: transparent;
  border-color: var(--border-soft, rgba(0, 0, 0, 0.12));
  color: var(--text, #333);
}
.share-preview-btn--ghost:hover:not(:disabled) {
  background: var(--surface-soft, rgba(0, 0, 0, 0.04));
}

.share-preview-btn--primary {
  background: var(--surface-soft, rgba(0, 0, 0, 0.06));
  color: var(--text, #333);
}
.share-preview-btn--primary:hover:not(:disabled) {
  background: var(--surface, rgba(0, 0, 0, 0.1));
}

.share-preview-btn--accent {
  background: var(--accent, #1f7a47);
  color: #fff;
}
.share-preview-btn--accent:hover:not(:disabled) {
  background: var(--accent-strong, #18613a);
}

@media (max-width: 600px) {
  .share-preview-foot {
    flex-direction: column-reverse;
  }
  .share-preview-btn {
    width: 100%;
  }
}
</style>
