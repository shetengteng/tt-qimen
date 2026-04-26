<script setup lang="ts">
/**
 * 分享卡 · 预览弹窗
 *
 * 设计目标：
 *   1. 收到 PNG dataURL 后展示缩略图，让用户在分享 / 保存前先看一眼成品；
 *   2. 三个操作：关闭 · 保存到本地 · 系统分享（按钮顺序与移动端原生 share sheet 习惯一致）；
 *   3. 复用 jm-dialog 骨架（base.css 中已是站点通用 dialog skeleton）；
 *   4. 二维码不进截图：share-card 截图本身不再嵌二维码（保持卡片"干净"），
 *      而是把"含本次入参"的二维码作为弹框 UI 的一部分渲染在缩略图下方——
 *      用户在弹框里能扫，扫后跳到 shareUrl 复现本次排盘；
 *      但保存 / 分享出去的 PNG 不含二维码，避免二维码喧宾夺主。
 *
 * 用法：
 *   <SharePreviewDialog
 *     v-model:open="previewOpen"
 *     :image="previewImage"
 *     :share-url="shareUrl"
 *     @save="onSave"
 *     @share="onShare"
 *   />
 *
 * 父组件负责：
 *   - 在打开 Dialog 之前用 useShareCard.previewCard() 生成 dataURL；
 *   - 在 @save / @share 回调里走 saveCard / shareCard 完成最终落盘 / 调起 Web Share。
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
import ShareQrcode from '@/components/common/ShareQrcode.vue'

interface Props {
  open: boolean
  /** 缩略图 dataURL（PNG） */
  image: string
  /**
   * 完整可扫描的 shareUrl（含模块入参，由父组件 buildShareUrl 生成）。
   * 用于在弹框底部渲染"复现本次排盘"二维码；
   * 不参与 share-card 截图，保存 / 分享出去的 PNG 不含二维码。
   */
  shareUrl?: string
  /** 是否禁用（生成中、空 image 时） */
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), { disabled: false, shareUrl: '' })

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save'): void
  (e: 'share'): void
}>()

const { t } = useI18n()
const themeStore = useThemeStore()
// 选用 .jm-dialog-content--gf / --mn 主题修饰符，让 SharePreviewDialog 拿到背景色与边框；
// 如果只挂 .jm-dialog-content（base.css 中仅是定位骨架），整张弹框会透明，看到下面的 share-card。
const isGuofeng = computed(() => themeStore.id === 'guofeng')

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
        :class="isGuofeng ? 'jm-dialog-content--gf' : 'jm-dialog-content--mn'"
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
          <div v-if="shareUrl" class="share-preview-qrcode-wrap">
            <ShareQrcode :url="shareUrl" :size="64" compact />
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

.share-preview-qrcode-wrap {
  display: flex;
  justify-content: center;
}

.share-preview-hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted, #6b6b6b);
  text-align: center;
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
