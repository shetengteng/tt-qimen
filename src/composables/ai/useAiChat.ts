/**
 * useAiChat — 流式对话核心 composable
 *
 * 职责：
 *   1. 维护当前会话的 reactive messages 数组
 *   2. send(input) 触发流式调用，token 逐一拼到最后一条 assistant message.content
 *   3. stop() 立即 abort（保留已生成片段）
 *   4. reset() 清空对话
 *   5. 错误统一映射为 LlmError，写到 error ref
 *
 * 注意：
 *   - 不直接访问 store；上层（AiInterpretDrawer）负责把 messages 持久化到 aiHistory
 *   - 流式中再次 send 会被忽略（避免并发）
 *   - send 接受额外的 contextMessages（首条 system + narrative）便于上下文注入
 */

import { onScopeDispose, ref, type Ref } from 'vue'
import type { ChatMessage, AiConfig } from './types'
import type { LlmProvider } from './providers/types'
import { LlmError, toLlmError } from './errors'

export interface UseAiChatOptions {
  provider: Ref<LlmProvider>
  config: Ref<AiConfig>
  /**
   * 上下文消息提供器（含 system prompt + 首次解读的 narrative）。
   * 每次 send 都会调用一次，把返回的 messages **prepend** 到本次请求中。
   * 已发送过的消息（messages.value）会**追加在 contextMessages 之后**送给 LLM。
   */
  buildContextMessages: () => ChatMessage[]
}

export function useAiChat(opts: UseAiChatOptions) {
  /** 当前会话的可视消息（不含 system，system 由 contextMessages 即时注入） */
  const messages: Ref<ChatMessage[]> = ref([])
  const streaming = ref(false)
  const error = ref<LlmError | null>(null)

  let abortController: AbortController | null = null

  /**
   * 发送一条用户消息并触发流式回复。
   *
   * 实现要点：
   *   - 先 push user 消息 + 占位 assistant 消息（content 为空）
   *   - 流式 chunk 累加到占位 assistant 上
   *   - 任何错误 / abort 都保留已生成内容，让用户看到"中断点"
   */
  async function send(input: string) {
    if (streaming.value) return  // 防并发
    if (!input.trim()) return

    error.value = null
    const userMsg: ChatMessage = { role: 'user', content: input }
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
    messages.value.push(userMsg, assistantMsg)

    streaming.value = true
    abortController = new AbortController()

    try {
      const ctxMessages = opts.buildContextMessages()
      /** 不带占位 assistant 消息，所以 slice(0, -1) */
      const sendable = [...ctxMessages, ...messages.value.slice(0, -1)]
      const stream = opts.provider.value.streamChat(
        sendable,
        opts.config.value,
        { signal: abortController.signal },
      )
      for await (const chunk of stream) {
        const last = messages.value[messages.value.length - 1]
        if (last && last.role === 'assistant') {
          last.content += chunk
        }
      }
    } catch (e) {
      const err = toLlmError(e)
      if (err.code === 'aborted') {
        // 用户主动停止，已生成片段保留；不算错误
      } else {
        error.value = err
      }
    } finally {
      streaming.value = false
      abortController = null
    }
  }

  /**
   * 立即中止流式生成；已生成片段保留。
   */
  function stop() {
    abortController?.abort()
  }

  /**
   * 清空消息（不影响 store 持久化层；store 由调用方决定何时同步）。
   */
  function reset() {
    stop()
    messages.value = []
    error.value = null
  }

  /**
   * 直接设置 messages（用于从 store 恢复历史会话）。
   */
  function setMessages(next: ChatMessage[]) {
    stop()
    messages.value = [...next]
    error.value = null
  }

  /**
   * P6-12：组件销毁（如关闭 AI 侧栏 / 路由切换 / Esc 关闭）时
   * 自动 abort 进行中的流式请求，避免残留 fetch 流量。
   */
  onScopeDispose(() => {
    abortController?.abort()
    abortController = null
  })

  return {
    messages,
    streaming,
    error,
    send,
    stop,
    reset,
    setMessages,
  }
}
