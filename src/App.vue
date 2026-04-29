<script setup lang="ts">
import { computed } from 'vue'
import { ConfigProvider } from 'reka-ui'
import { useUrlSync } from '@/composables/useUrlSync'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppErrorBoundary from '@/components/common/AppErrorBoundary.vue'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import AiSidebarPanel from '@/components/ai/AiSidebarPanel.vue'
import { useAiSidebarStore } from '@/stores/aiSidebar'

useUrlSync()

const aiSidebar = useAiSidebarStore()

const aiOpen = computed(() => aiSidebar.open)

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
        AI 关闭：原垂直布局 = AppHeader + RouterView + AppFooter（行为与改造前一致）。
        AI 开启：完整左右双栏布局占满 viewport：
          - 左主区 panel = 自身 overflow:auto，内含 AppHeader + RouterView + AppFooter
          - 中：可拖拽 ResizableHandle
          - 右 AI 侧栏 panel = 内部消息区独立 overflow-y:auto；自带"AI 解读"header
        AppHeader / AppFooter 都属于主区，AI 侧栏独立从屏幕顶部到底部。
        v-if/v-else 完整切换，避免 SplitterGroup 在子节点缺失时触发 reka-ui invariant。
      -->
      <template v-if="!aiOpen">
        <AppHeader />
        <RouterView />
        <AppFooter />
      </template>
      <div v-else class="app-resizable-wrap">
        <ResizablePanelGroup
          direction="horizontal"
          class="app-resizable"
          auto-save-id="tt-qimen.ai-sidebar"
        >
          <ResizablePanel
            :default-size="100 - aiSidebar.panelSize"
            :min-size="40"
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
              <RouterView />
              <AppFooter />
            </div>
          </ResizablePanel>
          <ResizableHandle with-handle />
          <ResizablePanel
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
    打开 AI 侧栏后切换为完整左右双栏布局：
    - wrap 占据整个 viewport（100dvh），sticky top:0
    - 主区面板（app-main-panel）独立滚动，内含 AppHeader + RouterView + AppFooter，所以
      header 跟随主区一起卷（关闭 AI 时 header sticky top:0 的行为在这里失效，但用户已选择
      "header 也属于主区"的方案，刻意接受这点）
    - AI 侧栏面板内消息区独立 overflow-y:auto；AI 侧栏没有 footer，自带"AI 解读"header
    左主右 AI，两个滚动条互不影响，从屏幕顶到底完全分隔。
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
</style>
