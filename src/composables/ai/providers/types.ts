/**
 * LLM Provider 抽象接口
 *
 * 设计目标：
 *   - 上层 useAiChat 只面向 `LlmProvider` 接口编程，不感知具体 SDK；
 *   - MVP 仅有 DeepSeek 实现；未来加 OpenAI / Claude 时只需新增 provider 文件，
 *     上层 0 改动。
 */

import type { AiConfig, ChatMessage } from '../types'

export interface StreamOptions {
  /** 由调用方持有 AbortController；用户点 [停止生成] / 关闭 Drawer / 切路由时 abort */
  signal?: AbortSignal
}

export interface PingResult {
  ok: boolean
  /** 失败时的简短 message（已映射过的 i18n key 或英文） */
  message?: string
}

/**
 * 远程模型条目（listModels 返回单元）。
 *
 * 对齐设计：
 *   - 不带本地化 labelKey（API 返回的内容本身是 SDK 直出的英文 / 厂商命名，
 *     UI 用 fallbackLabel 直接渲染；i18n 仅作用于 registry hardcoded 列表）
 *   - tags 在 provider 实现里用启发式推断（modelId pattern → fast/thinking/...）
 *   - created 让 SettingsPage 可以"按新→旧"排序，凸显厂商最新模型
 */
export interface RemoteModel {
  readonly id: string
  /** 兜底展示名；多数 SDK 只返回 id，此时 fallbackLabel === id */
  readonly fallbackLabel: string
  /** 厂商分类：chat / embedding / image / audio / unknown（用于过滤掉非聊天模型） */
  readonly kind?: 'chat' | 'embedding' | 'image' | 'audio' | 'unknown'
  /** Unix 秒级时间戳；可选；用于 SettingsPage 按发布时间倒序 */
  readonly created?: number
  /** 由 provider 实现按 id 启发推断的能力 tag */
  readonly tags?: readonly string[]
}

export interface ListModelsResult {
  /** 拉取到的模型清单（已去重，按 provider 习惯排序） */
  readonly models: readonly RemoteModel[]
}

export interface LlmProvider {
  /** 'deepseek' | 'openai' | ... */
  readonly id: string

  /**
   * 流式聊天。
   *
   * 实现方应：
   *   1. 内部调用具体 SDK / fetch；解析 SSE 增量
   *   2. 每个 token 增量 yield 出去，让上层直接拼接到 message.content
   *   3. 透传 options.signal，确保 abort 立即生效
   *   4. 任何错误统一抛 LlmError（用 toLlmError 映射）
   */
  streamChat(
    messages: ChatMessage[],
    config: AiConfig,
    options?: StreamOptions,
  ): AsyncIterable<string>

  /**
   * 探活：用于设置页 [测试连接] 按钮。
   * 实现方应发起最小成本请求（如 max_tokens=1），返回 ok 与可选 message。
   */
  ping(config: AiConfig): Promise<PingResult>

  /**
   * （可选）拉取该 Provider 当前账号可用的模型清单。
   *
   * 设计契约：
   *   - 抛任何 LlmError 时，调用方负责回退到 registry 的 hardcoded models
   *   - 实现方应：
   *     1. 仅返回 chat / 文本生成可用模型，过滤 embedding / image / audio
   *     2. 给每条结果尽量补 tags（通过 inferModelTags 启发式）
   *     3. 不引入额外的 retry / 缓存（这些由调用层 store 处理）
   *
   * 不实现此方法的 provider（如：本地 mock、未支持的厂商）保持字段缺失，
   * 调用方用 `'listModels' in provider` 判定能力。
   */
  listModels?(config: AiConfig): Promise<ListModelsResult>
}
