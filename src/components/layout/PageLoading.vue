<script setup lang="ts">
/**
 * 路由 chunk 加载期间的全屏 loading fallback。
 *
 * 用法：在 `<RouterView v-slot="{ Component }">` 内的 `<Suspense>` `#fallback` 槽位渲染本组件。
 * 配合 `defineAsyncComponent` 让路由 navigation 立刻 finalize（route.name 立即更新），
 * fallback 显示在主区，AppHeader / AppFooter 仍可正常渲染（它们在 Suspense 之外）。
 *
 * 设计：
 *   - 双主题适配：guofeng 用 brand red + Kaiti 字体；minimal 用 muted + sans
 *   - 不全屏覆盖：仅占据 RouterView 应渲染的主区，AppHeader 不被遮挡
 *   - min-height 保证页面有"内容感"避免 loading 闪烁过快显得突兀
 *   - 居中 spinner + 文案 + 三个跳动小点辅助"在加载中"的视觉反馈
 *   - 不依赖第三方 spinner 库；纯 CSS keyframes
 */
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="page-loading" role="status" aria-live="polite">
    <div class="page-loading-spinner" aria-hidden="true">
      <span class="page-loading-ring" />
      <span class="page-loading-ring page-loading-ring--lg" />
    </div>
    <p class="page-loading-text">
      {{ t('common.pageLoading') }}<span class="page-loading-dots" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    </p>
  </div>
</template>

<style scoped>
/*
  容器：撑满主区 + 居中。min-height 防 chunk 极快加载时高度坍缩。
*/
.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  width: 100%;
  gap: 1.25rem;
  padding: 4rem 1.5rem;
}

/*
  双环 spinner：外环更大 + 不同方向旋转 + 错位 phase；guofeng/minimal 颜色由 token 接管。
  不用 lucide 图标因为图标只能单色 + 单方向，效果不够"高级感"。
*/
.page-loading-spinner {
  position: relative;
  width: 64px;
  height: 64px;
}

.page-loading-ring {
  position: absolute;
  inset: 12px;
  border-radius: 999px;
  border: 2.5px solid transparent;
  border-top-color: var(--gf-color-accent, var(--mn-color-accent, hsl(var(--primary))));
  border-right-color: var(--gf-color-accent, var(--mn-color-accent, hsl(var(--primary))));
  opacity: 0.9;
  animation: page-loading-spin 0.9s linear infinite;
}

.page-loading-ring--lg {
  inset: 0;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: var(--gf-color-accent, var(--mn-color-accent, hsl(var(--primary))));
  border-left-color: var(--gf-color-accent, var(--mn-color-accent, hsl(var(--primary))));
  opacity: 0.45;
  animation: page-loading-spin 1.4s linear reverse infinite;
}

@keyframes page-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.page-loading-text {
  font-family: var(--font-display, inherit);
  font-size: 1rem;
  letter-spacing: 0.02em;
  color: hsl(var(--muted-foreground));
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 0.125rem;
}

/*
  跳动三个小点：与文案同色但更淡，错相位营造"等待中"的有节奏感；
  避免与 spinner 同步导致页面 lint 视觉太密。
*/
.page-loading-dots {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  margin-left: 1px;
}

.page-loading-dots > span {
  display: inline-block;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.4;
  animation: page-loading-blink 1.2s ease-in-out infinite;
}
.page-loading-dots > span:nth-child(2) { animation-delay: 0.18s; }
.page-loading-dots > span:nth-child(3) { animation-delay: 0.36s; }

@keyframes page-loading-blink {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40%           { opacity: 1;    transform: translateY(-2px); }
}

/* 减少动效偏好：保留语义，撤动画 */
@media (prefers-reduced-motion: reduce) {
  .page-loading-ring,
  .page-loading-ring--lg,
  .page-loading-dots > span {
    animation: none;
  }
}
</style>
