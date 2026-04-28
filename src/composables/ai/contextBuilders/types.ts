/**
 * 上下文构造器（ContextBuilder）类型定义
 *
 * 8 个模块各自实现一份 ContextBuilder，把内部 chart 对象（结构化）转成
 * "AI 友好的上下文"（system + 自然语言 narrative + 完整 JSON dump）。
 *
 * 设计哲学（详见设计文档 §7.1）：
 *   - 不抓 DOM 文本（噪声大、token 多）
 *   - 直接从 chart 对象抽取关键字段
 *   - 同时提供 narrative（人类可读 markdown）和 structured（机器可读 JSON）
 *     让 LLM 自己决定引用哪个层面
 */

import type { ModuleId } from '@/router'
import type { Locale } from '@/locales'

export interface AiContext {
  /** 用于会话主键：sha1(moduleId + 关键入参) → 16 hex */
  fingerprint: string

  /** 模块标识（影响 system prompt 选择） */
  moduleId: ModuleId

  /** 用户友好的命盘标识，显示在 Drawer 头部 chip 上（如 "1990-05-20 午 · 男"） */
  displayLabel: string

  /** 给 LLM 的自然语言陈述（Markdown，已含分段；首次解读会拼到 user 第一条 message） */
  narrative: string

  /** 给 LLM 的结构化 JSON（serialize 后附在 narrative 之后，便于 LLM 精准查字段） */
  structured: Record<string, unknown>

  /** 模块定制的 4-6 个预设提问 i18n key（如 'bazi.ai.preset.career'） */
  presetPromptKeys: string[]
}

/**
 * 上下文构造器接口。
 *
 * 调用方负责注入：
 *   - chart：模块自己的命盘对象（八字 BaziChart / 紫微 ZiweiChart / ...）
 *   - locale：当前 i18n 语言（用于决定 narrative 的语言）
 *   - t：vue-i18n 的 t 函数（用于本地化 chart 内的术语）
 *
 * 实现方应保证：
 *   - build 是同步的（不走异步，UI 打开 Drawer 时即时生成）
 *   - 输出 narrative 长度可控（不超过 1500 字，避免 prompt 占太多 token）
 */
export interface ContextBuilderInput<TChart> {
  chart: TChart
  locale: Locale
  /** vue-i18n 的 t 函数；类型用 unknown 避免循环依赖 */
  t: (key: string, ...args: unknown[]) => string
  /** 用户性别 / 姓名等附加上下文（来自 useUserStore） */
  userContext?: {
    name?: string
    gender?: 'male' | 'female'
  }
}

export interface ContextBuilder<TChart> {
  build(input: ContextBuilderInput<TChart>): AiContext
}
