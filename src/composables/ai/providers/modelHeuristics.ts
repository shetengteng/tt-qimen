/**
 * 模型 id 启发式工具集
 *
 * 用途：
 *   - listModels 拿到厂商返回的"裸 id 列表"后，给每条推断 tags（fast/thinking/coding 等）
 *   - 同时识别非 chat 模型（embedding / TTS / image），让 provider 实现把它们过滤掉
 *
 * 设计权衡：
 *   - 关键字基于 2026-04 各家公开模型命名习惯（OpenAI gpt/o-series、Anthropic
 *     haiku/opus/sonnet、Google gemini-flash/pro、DeepSeek reasoner、Qwen coder/turbo
 *     ...）。命名学是观察值，新模型出现时 fallback 到无 tag 而非误标
 *   - 全部基于 id 字符串做 case-insensitive 子串/正则匹配，0 网络成本
 *   - 不直接 import ModelTag 类型，避免环依赖（registry.ts → modelHeuristics.ts ← types.ts）
 *     而是用 string 数组返回
 */

import type { ModelTag } from './registry'

/**
 * 已知的非聊天模型关键字（命中即视为非 chat）。
 *
 * 设计：用反白名单而非全白名单，避免漏掉新模型。命中以下任意子串视为
 * embedding / image / audio，由 provider 实现过滤掉。
 */
const NON_CHAT_PATTERNS: readonly RegExp[] = [
  /(^|[-_])embed(ding)?($|[-_])/i,
  /(^|[-_])text-embed/i,
  /(^|[-_])text-similarity/i,
  /(^|[-_])text-search/i,
  /(^|[-_])dall-?e/i,
  /(^|[-_])tts(-|$)/i,
  /(^|[-_])text-to-speech/i,
  /(^|[-_])whisper(-|$)/i,
  /(^|[-_])speech-to-text/i,
  /(^|[-_])moderation(-|$)/i,
  /(^|[-_])imagen(-|$)/i,
  /(^|[-_])aqa(-|$)/i,
]

/** 是否为 chat / 文本生成模型（粗判） */
export function isChatLikeModelId(id: string): boolean {
  return !NON_CHAT_PATTERNS.some((re) => re.test(id))
}

interface TagRule {
  readonly tag: ModelTag
  readonly pattern: RegExp
}

/**
 * 关键字 → tag 映射规则。
 *
 * 注意：
 *   - 一个 id 可命中多个规则（最终去重）；如 `claude-haiku-4.5` → fast + cheap
 *   - 命名 collision 优先：long-context 由数字 token 决定（128k / 1m），不冲突；
 *     thinking 与 fast 可能同时命中（如 `gpt-5.4-mini-thinking`），按真实属性输出
 */
const TAG_RULES: readonly TagRule[] = [
  { tag: 'fast',         pattern: /(flash|mini|nano|haiku|lite|turbo|fast|swift)/i },
  { tag: 'thinking',     pattern: /(thinking|reasoner|reasoning|opus|max|pro(?!view)|^o[1-9]|^gpt-?5\.5|^o-mini|deepthink)/i },
  { tag: 'coding',       pattern: /(coder|code(?!x-)|copilot|programming)/i },
  { tag: 'multimodal',   pattern: /(vision|multimodal|omni|sonnet|gpt-?4o|gemini|gpt-?5\.4(?!-nano)|claude-(?!haiku-3))/i },
  { tag: 'long-context', pattern: /(long(-?context)?|128k|256k|512k|1m|2m|long)/i },
  { tag: 'cheap',        pattern: /(haiku|nano|mini|lite|tiny|cheap|kimi-k2(?!\.))/i },
]

/**
 * 给 model id 启发式推断 tags。
 *
 * @param id  模型 id（任意大小写）
 * @returns   去重后的 tags 列表（顺序：rule 声明顺序 → 稳定）
 */
export function inferModelTags(id: string): readonly ModelTag[] {
  const result = new Set<ModelTag>()
  for (const { tag, pattern } of TAG_RULES) {
    if (pattern.test(id)) result.add(tag)
  }
  return Array.from(result)
}

/**
 * 把厂商返回的 model id 转成 fallbackLabel：
 *   - 去掉 `models/` 前缀（Gemini 常见）
 *   - 其它原样保留（厂商命名本身已是用户可读形式）
 */
export function deriveModelLabel(id: string): string {
  return id.replace(/^models\//, '')
}
