<script setup lang="ts">
/**
 * 通用 toast（仅供 useShareCard 触发的提示场景使用，避免引入完整 toast 体系）
 *
 * 设计：
 *   - fixed 定位在页面底部居中，不阻塞操作
 *   - tone 决定颜色（info/success/warning/error）
 *   - 接收 useShareCard 返回的 toastState ref，单向只读绑定
 *   - 不内置 dismiss 计时器（已由 useShareCard 内部管理）
 *
 * 用法：
 *   <ShareToast :state="toastState.value" />
 */
import type { ShareToastState } from '@/composables/useShareCard'

interface Props {
  state: ShareToastState
}
defineProps<Props>()
</script>

<template>
  <Transition name="share-toast">
    <div
      v-if="state.visible"
      class="share-toast"
      :class="['tone-' + state.tone]"
      role="status"
      aria-live="polite"
    >
      {{ state.message }}
    </div>
  </Transition>
</template>

<style scoped>
.share-toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 10px 18px;
  border-radius: 8px;
  background-color: rgba(20, 20, 20, 0.92);
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
  max-width: min(86vw, 420px);
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  pointer-events: none;
}

.share-toast.tone-success {
  background-color: rgba(31, 122, 71, 0.94);
}
.share-toast.tone-warning {
  background-color: rgba(176, 116, 28, 0.94);
}
.share-toast.tone-error {
  background-color: rgba(170, 50, 50, 0.94);
}
.share-toast.tone-info {
  background-color: rgba(20, 20, 20, 0.92);
}

.share-toast-enter-from,
.share-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
.share-toast-enter-active,
.share-toast-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
</style>
