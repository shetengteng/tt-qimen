<script setup lang="ts">
/**
 * AI 侧栏面板（非模态版本）
 *
 * 职责与原 AiDrawer 一致，区别在于：
 *   - 不用 Sheet/Modal，直接渲染在父级 ResizablePanel 内
 *   - props 改从 useAiSidebarStore 拿（moduleId / chart / userContext）
 *   - 关闭按钮 = 调 aiSidebar.hide()，由父级布局控制是否渲染该 Panel
 *   - 自身只关心：拿到 chart → 算 ctx → 接 useAiChat → 渲染对话
 *
 * 设计文档：design/2026-04-28-01-AI解读模块设计.md §4.2（含可拖拽侧栏改造）
 */
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  type Ref,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowDown, ArrowRight, Lock, Sparkles, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAiConfigStore } from '@/stores/aiConfig'
import { useAiHistoryStore } from '@/stores/aiHistory'
import { useAiSidebarStore } from '@/stores/aiSidebar'
import { useAiChat } from '@/composables/ai/useAiChat'
import { deepseekProvider } from '@/composables/ai/providers/deepseek'
import { CONTEXT_BUILDERS } from '@/composables/ai/contextBuilders'
import type { AiContext } from '@/composables/ai/contextBuilders'
import { getFreeChatSystemPrompt, getSystemPrompt } from '@/composables/ai/systemPrompts'
import type { ChatMessage } from '@/composables/ai/types'
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/locales'
import AiMessageBubble from './AiMessageBubble.vue'
import AiPresetChips from './AiPresetChips.vue'
import AiInputBox from './AiInputBox.vue'
import AiErrorState from './AiErrorState.vue'

const { t, locale: i18nLocale } = useI18n()
const router = useRouter()
const aiConfig = useAiConfigStore()
const aiHistory = useAiHistoryStore()
const aiSidebar = useAiSidebarStore()

const currentLocale = computed<Locale>(() =>
  isLocale(i18nLocale.value) ? i18nLocale.value : DEFAULT_LOCALE,
)

const ctx = shallowRef<AiContext | null>(null)

const providerRef = shallowRef(deepseekProvider) as unknown as Ref<typeof deepseekProvider>
const configRef = computed(() => aiConfig.config) as unknown as Ref<typeof aiConfig.config>

const chat = useAiChat({
  provider: providerRef,
  config: configRef,
  buildContextMessages: () => {
    if (aiSidebar.freeChat) {
      return [
        { role: 'system', content: getFreeChatSystemPrompt(currentLocale.value) },
      ] satisfies ChatMessage[]
    }
    const c = ctx.value
    if (!c) return []
    const sysPrompt = getSystemPrompt(c.moduleId, currentLocale.value)
    const userIntro = buildUserIntro(c, currentLocale.value)
    const messages: ChatMessage[] = [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: userIntro },
    ]
    return messages
  },
})

/**
 * P6-09：UI 层渲染上限。
 * 完整持久化（store 200 条上限）继续保留；UI 渲染只展示最近 MAX_UI 条，
 * 上方一行 muted 提示告知用户"已隐藏 N 条历史消息"。
 */
const MAX_UI_MESSAGES = 50
const hiddenCount = computed(() =>
  Math.max(0, chat.messages.value.length - MAX_UI_MESSAGES),
)
const visibleMessages = computed(() => {
  const all = chat.messages.value
  return all.length <= MAX_UI_MESSAGES ? all : all.slice(all.length - MAX_UI_MESSAGES)
})
/** 计算每条 visible message 在原数组中的真实索引，让 streaming 判断仍能命中末条 */
const visibleStartIdx = computed(() =>
  Math.max(0, chat.messages.value.length - MAX_UI_MESSAGES),
)

watch(
  () => chat.messages.value.slice(),
  (next) => {
    if (aiSidebar.freeChat) return
    const fp = ctx.value?.fingerprint
    if (!fp) return
    aiHistory.setMessages(fp, next)
  },
  { deep: true },
)

const scrollEl = ref<HTMLElement | null>(null)
const atBottom = ref(true)

function checkAtBottom() {
  const el = scrollEl.value
  if (!el) return
  const threshold = 32
  atBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
}

function scrollToBottom(force = false) {
  const el = scrollEl.value
  if (!el) return
  if (!force && !atBottom.value) return
  el.scrollTop = el.scrollHeight
}

watch(
  () => chat.messages.value[chat.messages.value.length - 1]?.content ?? '',
  () => {
    void nextTick(() => scrollToBottom(false))
  },
)
watch(
  () => chat.messages.value.length,
  () => {
    void nextTick(() => scrollToBottom(true))
  },
)

/**
 * 监听 sidebar.chart / moduleId / freeChat 变化，重算上下文 + 加载/创建会话。
 * 三种场景：
 *   1. 用户首次点 "询问 AI" → moduleId/chart 同时变化 → 走完整流程
 *   2. 用户在同一模块内重新排盘 → chart 引用变化 → 重算 fingerprint，可能命中新会话
 *   3. 用户从 header 点 AI button 且无命盘 → freeChat=true → 临时 session，不持久化
 */
watch(
  () => [aiSidebar.moduleId, aiSidebar.chart, aiSidebar.freeChat] as const,
  async ([mid, chartObj, isFree]) => {
    if (isFree) {
      ctx.value = null
      chat.reset()
      await nextTick()
      scrollToBottom(true)
      return
    }
    if (!mid || !chartObj) {
      ctx.value = null
      chat.reset()
      return
    }
    if (!aiConfig.hasKey) return

    const builder = CONTEXT_BUILDERS[mid]
    if (!builder) {
      console.warn('[AiSidebarPanel] missing contextBuilder for', mid)
      return
    }

    let context: AiContext
    try {
      context = builder.build({
        chart: chartObj,
        locale: currentLocale.value,
        t: t as unknown as (key: string, ...args: unknown[]) => string,
        userContext: aiSidebar.userContext,
      })
    } catch (err) {
      console.error('[AiSidebarPanel] contextBuilder failed:', err)
      return
    }
    ctx.value = context

    const session = aiHistory.loadOrCreate({
      fingerprint: context.fingerprint,
      moduleId: context.moduleId,
      displayLabel: context.displayLabel,
      initialMessages: [],
    })

    chat.setMessages(session.messages)
    await nextTick()
    scrollToBottom(true)

    if (session.messages.length === 0 && !chat.streaming.value) {
      const firstPrompt = t('ai.drawer.firstResponse')
      void chat.send(firstPrompt)
    }
  },
  { immediate: true },
)

/**
 * 关闭面板时停止流式生成（已生成片段会留在 aiHistory）。
 */
watch(
  () => aiSidebar.open,
  (open) => {
    if (!open) chat.stop()
  },
)

/**
 * P6-12：路由切换时如果有正在流式的请求，立刻 abort。
 *
 * 决策：只 abort 当前 chat.stop()，不主动 hide 侧栏 —— 用户可能希望
 * 边切换页面边看 AI 历史。让用户自己决定是否关闭。
 *
 * 注意：fingerprint 一般不变（chart 没变），所以路由切回原模块时上下文还在；
 * 切到其他模块时由 watch([moduleId, chart, freeChat]) 重新触发拉新会话。
 */
watch(
  () => router.currentRoute.value.fullPath,
  (next, prev) => {
    if (prev && next !== prev && chat.streaming.value) {
      chat.stop()
    }
  },
)

onBeforeUnmount(() => {
  chat.stop()
})

function onSend(text: string) {
  if (!aiConfig.hasKey) return
  if (!aiSidebar.freeChat && !ctx.value) return
  void chat.send(text)
}

function onStop() {
  chat.stop()
}

function onPresetSelect(text: string) {
  if (chat.streaming.value) return
  void chat.send(text)
}

function onRetry() {
  const arr = chat.messages.value
  if (arr.length < 2) return
  const prev = arr[arr.length - 2]
  if (!prev || prev.role !== 'user') return

  const retryText = prev.content
  chat.setMessages(arr.slice(0, -2))
  void chat.send(retryText)
}

function goSettings() {
  aiSidebar.hide()
  router.push({ name: 'settings' })
}

function buildUserIntro(c: AiContext, locale: Locale): string {
  if (locale === 'en') {
    return `Here is my chart from the **${c.moduleId}** module. Reference label: ${c.displayLabel}\n\n${c.narrative}\n\n---\nStructured JSON (for precise field lookups):\n\n\`\`\`json\n${JSON.stringify(c.structured, null, 2)}\n\`\`\``
  }
  if (locale === 'zh-TW') {
    return `以下是我在 **${c.moduleId}** 模組排出的命盤。標識：${c.displayLabel}\n\n${c.narrative}\n\n---\n結構化 JSON（供精確查欄位）：\n\n\`\`\`json\n${JSON.stringify(c.structured, null, 2)}\n\`\`\``
  }
  return `以下是我在 **${c.moduleId}** 模块排出的命盘。标识：${c.displayLabel}\n\n${c.narrative}\n\n---\n结构化 JSON（供精确查字段）：\n\n\`\`\`json\n${JSON.stringify(c.structured, null, 2)}\n\`\`\``
}

const presetKeys = computed<readonly string[]>(() => ctx.value?.presetPromptKeys ?? [])

const showEmptyKey = computed(() => !aiConfig.hasKey)
const showNoChart = computed(
  () => aiConfig.hasKey && !aiSidebar.chart && !aiSidebar.freeChat,
)
const showChat = computed(
  () => aiConfig.hasKey && (!!aiSidebar.chart || aiSidebar.freeChat),
)

/**
 * 顶部 chip：仅在「具体命盘」上下文展示模块/命盘 label；
 * 「自由咨询」模式不展示 chip（用户决策 2026-04-29 简化 header）。
 */
const headerLabel = computed(() => {
  if (aiSidebar.freeChat) return ''
  return ctx.value?.displayLabel ?? ''
})

/** 输入框 placeholder：自由对话有专属文案，否则走原 ai.drawer.input.placeholder */
const inputPlaceholder = computed(() => {
  if (aiSidebar.freeChat) return t('ai.freeChat.inputPlaceholder')
  return undefined
})

const showScrollToBottom = computed(() => !atBottom.value && chat.messages.value.length > 0)
</script>

<template>
  <aside
    class="ai-sidebar-panel flex h-full w-full flex-col border-l border-border bg-card"
    :aria-label="t('ai.drawer.title')"
  >
    <!-- 顶部 -->
    <header class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
      <div class="flex items-center gap-2 text-base font-semibold">
        <Sparkles class="size-4 text-primary" aria-hidden="true" />
        <span>{{ t('ai.drawer.title') }}</span>
        <span
          v-if="headerLabel"
          class="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground"
        >{{ headerLabel }}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="size-7"
        :aria-label="t('ai.drawer.closeAria')"
        @click="aiSidebar.hide()"
      >
        <X class="size-4" aria-hidden="true" />
      </Button>
    </header>

    <!-- Empty Key -->
    <div
      v-if="showEmptyKey"
      class="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center"
    >
      <div class="rounded-full bg-muted p-4">
        <Lock class="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div class="space-y-2">
        <h3 class="text-base font-semibold text-foreground">
          {{ t('ai.drawer.emptyKey.title') }}
        </h3>
        <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
          {{ t('ai.drawer.emptyKey.body') }}
        </p>
      </div>
      <Button variant="default" class="mt-2" @click="goSettings">
        {{ t('ai.drawer.emptyKey.cta') }}
        <ArrowRight class="size-4" aria-hidden="true" />
      </Button>
      <p class="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {{ t('ai.drawer.emptyKey.privacyNote') }}
      </p>
    </div>

    <!-- Chart 未就绪 -->
    <div
      v-else-if="showNoChart"
      class="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center"
    >
      <div class="rounded-full bg-muted p-4">
        <Sparkles class="size-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {{ t('ai.drawer.title') }}
      </p>
    </div>

    <!-- 聊天主区 -->
    <template v-else-if="showChat">
      <div
        ref="scrollEl"
        class="ai-scroll relative flex-1 overflow-y-auto"
        @scroll="checkAtBottom"
      >
        <div class="flex flex-col gap-3 px-4 py-4">
          <!-- 自由对话首次进入：仅展示 body 提示 + 引导排盘（welcomeTitle 已弃用） -->
          <div
            v-if="aiSidebar.freeChat && chat.messages.value.length === 0"
            class="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground"
          >
            <p class="text-sm text-muted-foreground">
              {{ t('ai.freeChat.welcomeBody') }}
            </p>
            <p class="mt-2 text-xs text-muted-foreground">
              {{ t('ai.freeChat.hintGoModule') }}
            </p>
          </div>

          <!-- P6-09: 折叠提示 — 仅在历史超出 UI 上限时展示 -->
          <p
            v-if="hiddenCount > 0"
            class="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground"
          >
            {{ t('ai.history.collapsed', { count: hiddenCount }) }}
          </p>

          <AiMessageBubble
            v-for="(msg, idx) in visibleMessages"
            :key="visibleStartIdx + idx"
            :message="msg"
            :message-index="visibleStartIdx + idx"
            :streaming="
              chat.streaming.value
                && (visibleStartIdx + idx) === chat.messages.value.length - 1
            "
          />

          <AiErrorState
            v-if="chat.error.value"
            :error="chat.error.value"
            @retry="onRetry"
          />
        </div>
      </div>

      <button
        v-if="showScrollToBottom"
        type="button"
        class="ai-scroll-bottom"
        :aria-label="t('ai.drawer.scrollToBottom')"
        @click="scrollToBottom(true)"
      >
        <ArrowDown class="size-4" aria-hidden="true" />
      </button>

      <!-- 自由对话不显示模块预设 chip -->
      <AiPresetChips
        v-if="!aiSidebar.freeChat"
        :keys="presetKeys"
        :disabled="chat.streaming.value"
        @select="onPresetSelect"
      />

      <AiInputBox
        :streaming="chat.streaming.value"
        :disabled="!aiConfig.hasKey"
        :placeholder="inputPlaceholder"
        @send="onSend"
        @stop="onStop"
      />
    </template>
  </aside>
</template>

<style scoped>
.ai-sidebar-panel {
  min-width: 0;
  /* 拖拽时父级会写 inline width，这里允许 0 收缩，防 flex 子元素溢出 */
}

.ai-scroll {
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

.ai-scroll-bottom {
  position: absolute;
  right: 1rem;
  bottom: 8rem;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease, background 0.15s ease;
}

.ai-scroll-bottom:hover {
  background: hsl(var(--accent));
  transform: translateY(-1px);
}
</style>
