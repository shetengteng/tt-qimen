import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, shallowRef } from 'vue'
import type { ModuleId } from '@/router'

const STORAGE_KEY = 'tt-qimen:ai-sidebar'

interface AiSidebarPersist {
  /** 上次拖拽后的面板比例（0-100，默认 38%） */
  panelSize: number
}

const DEFAULTS: AiSidebarPersist = {
  panelSize: 38,
}

const MIN_PANEL_SIZE = 20
const MAX_PANEL_SIZE = 60

/**
 * AI 侧栏全局状态。
 *
 * 不再用 Sheet/Modal，改为 ResizablePanel 双栏布局：
 *   - open: 是否展示右侧面板（false → 主区占满，AskAiButton 触发后切 true）
 *   - moduleId / chart / userContext: 由当前点击的页面 push 进来
 *   - panelSize: 用户拖拽后的比例，持久化到 localStorage
 *
 * chart 是异构对象（八字/紫微/小六壬等结构都不同），用 shallowRef 避免深响应。
 * 改命盘换页面 → 上层 Page 自己调 set(...) 覆盖；这里不耦合具体类型。
 */
export const useAiSidebarStore = defineStore('aiSidebar', () => {
  const open = shallowRef(false)
  const moduleId = shallowRef<ModuleId | null>(null)
  const chart = shallowRef<unknown>(null)
  const userContext = shallowRef<{ name?: string; gender?: 'male' | 'female' } | undefined>(undefined)
  /** 自由对话模式：用户没有命盘但要问 AI（header AI button 触发） */
  const freeChat = shallowRef(false)

  const persist = useStorage<AiSidebarPersist>(
    STORAGE_KEY,
    { ...DEFAULTS },
    undefined,
    { mergeDefaults: true },
  )

  const panelSize = computed({
    get: () => clampPanel(persist.value.panelSize),
    set: (v: number) => {
      persist.value = { ...persist.value, panelSize: clampPanel(v) }
    },
  })

  function show(payload: {
    moduleId: ModuleId
    chart: unknown
    userContext?: { name?: string; gender?: 'male' | 'female' }
  }) {
    moduleId.value = payload.moduleId
    chart.value = payload.chart
    userContext.value = payload.userContext
    freeChat.value = false
    open.value = true
  }

  /**
   * 进入「自由对话」模式：清掉所有命盘上下文，由 AiSidebarPanel
   * 检测 freeChat=true 时使用通用 system prompt + 不写历史。
   */
  function openFreeChat() {
    moduleId.value = null
    chart.value = null
    userContext.value = undefined
    freeChat.value = true
    open.value = true
  }

  function hide() {
    open.value = false
    // 关闭时如果是自由对话模式，下次开启重新进入欢迎态（不保留临时记录）
    if (freeChat.value) freeChat.value = false
  }

  function toggle() {
    open.value ? hide() : (open.value = true)
  }

  function reset() {
    open.value = false
    moduleId.value = null
    chart.value = null
    userContext.value = undefined
    freeChat.value = false
  }

  return {
    open,
    moduleId,
    chart,
    userContext,
    freeChat,
    panelSize,
    show,
    openFreeChat,
    hide,
    toggle,
    reset,
    MIN_PANEL_SIZE,
    MAX_PANEL_SIZE,
  }
})

function clampPanel(v: number): number {
  if (Number.isNaN(v)) return DEFAULTS.panelSize
  return Math.max(MIN_PANEL_SIZE, Math.min(MAX_PANEL_SIZE, v))
}
