<script setup lang="ts">
/**
 * AI 单条消息气泡 · user / assistant 两种角色
 *
 * 用户气泡：
 *   - 右侧对齐
 *   - 主色背景（primary）+ primary-foreground 文字
 *   - 纯文本（不渲染 Markdown），用 white-space: pre-wrap 保留换行
 *
 * 助手气泡：
 *   - 左侧对齐
 *   - card 背景 + 边框
 *   - 用 markstream-vue 的 MarkdownRender 渲染（支持流式增量）
 *   - streaming === true（且本条是末尾）时 final = false，否则 final = true
 *   - content 为空 + streaming → 渲染一个"…正在思考"占位
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MarkdownRender } from 'markstream-vue'
import 'markstream-vue/index.css'
import type { ChatMessage } from '@/composables/ai/types'

const props = withDefaults(defineProps<{
  message: ChatMessage
  /** 当前消息是否处于"流式生成中"（仅对最后一条 assistant 有意义） */
  streaming?: boolean
  /** 用作 markstream-vue 的稳定 key（消息在数组中的索引） */
  messageIndex?: number
}>(), {
  streaming: false,
  messageIndex: 0,
})

const { t } = useI18n()

const isUser = computed(() => props.message.role === 'user')

const showPlaceholder = computed(
  () => !isUser.value && props.streaming && !props.message.content,
)

/** 末条 assistant 流式失败/abort 后留下空 content；UI 不渲染空气泡 */
const isEmptyAssistant = computed(
  () => !isUser.value && !props.streaming && !props.message.content,
)

const markdownFinal = computed(() => !props.streaming)
</script>

<template>
  <!-- 用户气泡 -->
  <div v-if="isUser" class="flex w-full justify-end">
    <div
      class="ai-bubble-user inline-block max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground"
    >{{ message.content }}</div>
  </div>

  <!-- 助手气泡（空 content 失败态不渲染） -->
  <div v-else-if="!isEmptyAssistant" class="flex w-full justify-start">
    <div
      class="ai-bubble-assistant inline-block max-w-[95%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground"
    >
      <span
        v-if="showPlaceholder"
        class="ai-typing"
        :aria-label="t('ai.drawer.generating')"
        role="status"
      >
        <span class="ai-typing-dot" />
        <span class="ai-typing-dot" />
        <span class="ai-typing-dot" />
      </span>
      <!--
        P7-04：显式锁死 markstream 虚拟窗口上限。
        - max-live-nodes：DOM 中常驻的最大 node 数（block-level），超出后旧节点会被回收
        - live-node-buffer：回收时围绕焦点保留的前后节点数
        默认是 320 / 60；AC19 要求 5000 字单条消息 DOM 节点 < 200。
        这里设为 160 / 40 给单条 5000 字消息留 ~25% 缓冲。
      -->
      <MarkdownRender
        v-else
        :content="message.content"
        :final="markdownFinal"
        :index-key="messageIndex"
        :show-tooltips="false"
        :typewriter="false"
        :max-live-nodes="160"
        :live-node-buffer="40"
        class="ai-markdown"
      />
    </div>
  </div>
</template>

<style scoped>
.ai-bubble-assistant :deep(.ai-markdown) {
  font-size: 0.875rem;
  line-height: 1.6;
}
.ai-bubble-assistant :deep(h1),
.ai-bubble-assistant :deep(h2),
.ai-bubble-assistant :deep(h3),
.ai-bubble-assistant :deep(h4) {
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}
.ai-bubble-assistant :deep(h2) { font-size: 1rem; }
.ai-bubble-assistant :deep(h3) { font-size: 0.9375rem; }
.ai-bubble-assistant :deep(p)  { margin: 0.5rem 0; }
.ai-bubble-assistant :deep(ul),
.ai-bubble-assistant :deep(ol) { margin: 0.5rem 0; padding-left: 1.25rem; }
.ai-bubble-assistant :deep(li) { margin: 0.25rem 0; }
.ai-bubble-assistant :deep(blockquote) {
  margin: 0.5rem 0;
  padding-left: 0.75rem;
  border-left: 3px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}
.ai-bubble-assistant :deep(strong) { font-weight: 600; }
.ai-bubble-assistant :deep(code) {
  padding: 0.125rem 0.25rem;
  background: hsl(var(--muted));
  border-radius: 0.25rem;
  font-size: 0.85em;
}
.ai-bubble-assistant :deep(pre) {
  margin: 0.5rem 0;
  padding: 0.75rem;
  background: hsl(var(--muted));
  border-radius: 0.5rem;
  overflow-x: auto;
}
.ai-bubble-assistant :deep(pre code) { padding: 0; background: transparent; }
.ai-bubble-assistant :deep(table) {
  width: 100%;
  margin: 0.5rem 0;
  border-collapse: collapse;
  font-size: 0.85em;
}
.ai-bubble-assistant :deep(th),
.ai-bubble-assistant :deep(td) {
  padding: 0.375rem 0.5rem;
  border: 1px solid hsl(var(--border));
  text-align: left;
}
.ai-bubble-assistant :deep(th) { background: hsl(var(--muted)); font-weight: 600; }
.ai-bubble-assistant :deep(hr) { margin: 0.75rem 0; border: 0; border-top: 1px solid hsl(var(--border)); }

.ai-typing {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 1.25rem;
}
.ai-typing-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: hsl(var(--muted-foreground));
  opacity: 0.4;
  animation: ai-typing-bounce 1.2s ease-in-out infinite;
}
.ai-typing-dot:nth-child(2) { animation-delay: 0.15s; }
.ai-typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes ai-typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  30% {
    transform: translateY(-3px);
    opacity: 0.9;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ai-typing-dot {
    animation: none;
    opacity: 0.7;
  }
}
</style>
