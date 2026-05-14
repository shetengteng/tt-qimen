<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { ConfigProvider } from 'reka-ui'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useUrlSync } from '@/composables/useUrlSync'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppRouterView from '@/components/layout/AppRouterView.vue'
import AppErrorBoundary from '@/components/common/AppErrorBoundary.vue'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useAiSidebarStore } from '@/stores/aiSidebar'

/**
 * P6-10：AI 侧栏链路（含 openai SDK ~340KB）懒加载，避免首屏 chunk 拖大。
 * 用户首次点 header AI 按钮时才下载 feat-ai + vendor-openai + vendor-markstream。
 */
const AiSidebarPanel = defineAsyncComponent(() =>
  import('@/components/ai/AiSidebarPanel.vue'),
)

useUrlSync()

const aiSidebar = useAiSidebarStore()

const aiOpen = computed(() => aiSidebar.open)

/**
 * P6-01：移动端断点 (Tailwind 默认 md = 768px)。
 *
 * - 桌面 (≥ md)：双栏可拖拽 ResizablePanelGroup（现有行为）
 * - 移动 (< md)：AI 侧栏切换为右滑全屏 Sheet（reka-ui Dialog primitive，自带焦点陷阱 + Esc + 背景点击关闭）
 *   主区不再被压缩；Sheet 与主区 z-index 隔离，避免双栏挤崩。
 */
const isMobile = useMediaQuery('(max-width: 767.98px)')

/** Sheet 的 v-model:open —— 双向同步到 store */
const aiSheetOpen = computed({
  get: () => aiSidebar.open,
  set: (v: boolean) => {
    if (v) aiSidebar.open = true
    else aiSidebar.hide()
  },
})

/**
 * Esc 关闭 AI 侧栏（P6-11）。
 *
 * - 仅在 AI 侧栏 open 状态下响应，避免吞掉其他可能的 Esc 用户（弹窗/dropdown 等）；
 *   注意 reka-ui 的 Sheet/Dialog 自带 Esc 拦截并 stopPropagation，所以即使 AI 处于打开
 *   状态，被 modal 截获的 Esc 也不会冒泡到这里 —— 不会误关。
 * - 若 chat 在流式中，先调 chat.stop() 再 hide()？
 *   决策：直接 hide，让侧栏被销毁时由 useAiChat 的 onScopeDispose 自动 abort
 *   （和 P6-12 路由切换 abort 逻辑保持一致），不在 App 层重复关心 chat 状态。
 */
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  if (!aiSidebar.open) return
  e.preventDefault()
  aiSidebar.hide()
})

/**
 * 用户拖拽 handle 时 ResizablePanel 会触发 @resize；我们把比例写回 store。
 *
 * 注意：reka-ui 自身有 auto-save-id 在 localStorage 持久化，我们这里也写一份
 * 是为了让 useAiSidebarStore 是面板尺寸的"单一可信源"，
 * 后续如果换 ResizableHandle 或加"恢复默认宽度"功能可以集中处理。
 */
function onAiPanelResize(size: number) {
  if (typeof size !== 'number' || Number.isNaN(size)) return
  aiSidebar.panelSize = size
}
</script>

<template>
  <!--
    scrollBody=false：关闭 reka-ui 默认的"打开 popper 时给 body 追加 padding-right"行为。
    我们已通过 html { scrollbar-gutter: stable } 永久预留滚动条通道，reka-ui 的补偿会叠加
    成负向偏移导致整页抖动，这里显式关闭。
  -->
  <ConfigProvider :scroll-body="false">
    <AppErrorBoundary>
      <!--
        移动端：主区始终垂直布局，AI 走 Sheet 全屏覆盖（不挤压主区）。
        桌面端：始终使用 ResizablePanelGroup 包裹主区 panel，无论 AI 开关。
        AI 侧栏的 ResizableHandle + Panel 用 v-if 在 SplitterGroup 内条件渲染。

        为什么始终保留 SplitterGroup（即使 AI 关闭）：
          - v-if/v-else 在外层切换会导致 AppRouterView 销毁重建 → 当前 page 实例
            重新挂载 → result/skeleton 等局部 state 丢失（典型表现：小六壬 immediate
            模式下 onAskAi 后排盘结果消失，需重新起卦）。
          - 始终保留 SplitterGroup 让主 panel 实例稳定，AI 开关只增减右侧节点，
            page 实例不重建，所有模块的局部 state 都能保留。
          - reka-ui SplitterGroup 在 panel 设置了 `order` 属性时支持 conditional
            rendering，registerPanel/unregisterPanel 会自动重算 layout，单 panel 占 100%。
      -->
      <template v-if="isMobile">
        <AppHeader />
        <AppRouterView />
        <AppFooter />
        <Sheet v-model:open="aiSheetOpen">
          <SheetContent
            side="right"
            :show-close-button="false"
            class="app-ai-sheet data-[side=right]:!w-screen data-[side=right]:!max-w-none !z-[200] p-0"
          >
            <AiSidebarPanel v-if="aiOpen" />
          </SheetContent>
        </Sheet>
      </template>
      <div v-else class="app-resizable-wrap">
        <ResizablePanelGroup
          direction="horizontal"
          class="app-resizable"
          auto-save-id="tt-qimen.ai-sidebar"
        >
          <ResizablePanel
            :default-size="aiOpen ? 100 - aiSidebar.panelSize : 100"
            :min-size="aiOpen ? 40 : 0"
            :order="1"
            class="app-main-panel"
          >
            <!--
              内层 div 才是滚动容器：reka-ui SplitterPanel 在外层强制 inline
              `overflow: hidden`（不可覆盖），所以必须嵌一层 100% × 100% 的 wrapper
              来承接业务内容并提供 overflow:auto 的滚动条。
            -->
            <div class="app-main-scroll">
              <AppHeader />
              <AppRouterView />
              <AppFooter />
            </div>
          </ResizablePanel>
          <ResizableHandle v-if="aiOpen" with-handle />
          <ResizablePanel
            v-if="aiOpen"
            :default-size="aiSidebar.panelSize"
            :min-size="aiSidebar.MIN_PANEL_SIZE"
            :max-size="aiSidebar.MAX_PANEL_SIZE"
            :order="2"
            @resize="onAiPanelResize"
          >
            <AiSidebarPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppErrorBoundary>
  </ConfigProvider>
</template>

<style scoped>
.app-resizable-wrap {
  /*
    桌面端常态布局：始终用 ResizablePanelGroup 承载主区，AI 关闭时主 panel 占 100%，
    AI 打开时增加 handle + AI panel。

    - wrap 占据整个 viewport（100dvh），sticky top:0
    - 主区面板（app-main-panel）独立滚动，内含 AppHeader + RouterView + AppFooter，所以
      header 跟随主区一起卷（页面级 header sticky 改为容器级，视觉效果一致）
    - AI 侧栏面板内消息区独立 overflow-y:auto；AI 侧栏没有 footer，自带"AI 解读"header
    左主右 AI（如开启），两个滚动条互不影响，从屏幕顶到底完全分隔。
  */
  position: sticky;
  top: 0;
  height: 100dvh;
  z-index: 30;
  overflow: hidden;
  width: 100%;
}

/*
  reka-ui SplitterPanel 在 .app-main-panel 上强制 inline `overflow: hidden`，
  所以滚动责任下移到内嵌的 .app-main-scroll：100% × 100% 撑满 panel，自己承接
  overflow:auto。AppHeader / RouterView / AppFooter 都在这个滚动容器内。
*/
.app-main-scroll {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/*
  P6-01：移动端 AI Sheet 适配。
  - max-width: none 覆盖 reka-ui Sheet 默认 sm:max-w-sm 限制
  - 高度直接 100dvh，避免 iOS Safari 的 100vh 偏差（含浏览器工具栏）
  - safe-area-inset 兼容刘海屏 / 底部 home indicator
  - 键盘弹起时 100dvh 自动缩短，AI 输入区始终可见（dvh 替代 vh 解决 P6-01 键盘问题）
  - 主区 sticky header 是 z:100，所以 Sheet overlay 也要 z:200 以上才能盖住
*/
</style>

<style>
:where([data-slot='sheet-overlay']) {
  z-index: 199;
}
.app-ai-sheet {
  inset: 0;
  height: 100dvh;
  border-left: 0;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
