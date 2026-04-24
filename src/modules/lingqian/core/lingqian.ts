/**
 * 观音灵签 · 核心算法
 *
 * 设计文档 §3：
 *   - 纯随机 Math.random() 抽 1..N
 *   - 高级：filter 掉上一次签号，避免连续抽到同一签
 *
 * 数据源：
 *   - 100 签 guanyin[.zh-TW].json 按 locale 懒加载（~360 KB 源，gzip ~40 KB/份）
 *   - 加载完成前 / 加载失败 → fallback 到 data/items.ts 的 6 签精选样本
 *   - fallback 同样按 locale 做一次字符级简→繁（chinese-conv.tifyJson），避免维护两份 ts
 *
 * 注意：本模块刻意把"上次签号记忆"留给 store/UI 层（useStorage）注入，
 *       core 只做无副作用的纯函数（抽签）+ 幂等的加载缓存。
 */

import type { LingqianItem } from '../types'
import { LINGQIAN_ITEMS } from '../data/items'
import { FortuneError } from '@/lib/errors'

/** 支持的签文文案语言（与 src/locales/index.ts SUPPORT_LOCALES 子集保持一致）。 */
export type LingqianLocale = 'zh-CN' | 'zh-TW' | 'en'
const DEFAULT_LOCALE: LingqianLocale = 'zh-CN'

export interface DrawOptions {
  /** 上次抽中的签号，若提供则在数据里 filter 掉 */
  lastId?: number
  /** 自定义随机源（测试可注入），返回 [0, 1) */
  random?: () => number
  /** 自定义数据源；默认为当前 locale 已加载的 100 签缓存，缺则回退 fallback */
  data?: readonly LingqianItem[]
  /** 抽签的 locale 上下文，默认 'zh-CN'（仅当 data 未显式传入时生效） */
  locale?: LingqianLocale
}

/** 抽签：返回随机一签；未传 data 时优先使用 locale 对应缓存，否则回退 6 签样本（也按 locale 转繁） */
export function drawLingqian(opts: DrawOptions = {}): LingqianItem {
  const locale = opts.locale ?? DEFAULT_LOCALE
  const data = opts.data ?? guanyinCaches[locale] ?? getFallback(locale)
  if (data.length === 0) {
    throw new FortuneError({
      module: 'lingqian',
      code: 'empty-dataset',
      userMessage: '灵签数据为空，暂时无法求签',
      details: { locale, sourceUsed: opts.data ? 'explicit' : guanyinCaches[locale] ? 'cache' : 'fallback' },
    })
  }

  const random = opts.random ?? Math.random
  const filtered = opts.lastId != null && data.length > 1
    ? data.filter((x) => x.id !== opts.lastId)
    : data

  const pool = filtered.length > 0 ? filtered : data
  const idx = Math.floor(random() * pool.length)
  return pool[idx]
}

/** 6 大分类 key 顺序（设计文档 §2 的字段顺序） */
export const TOPIC_KEYS = [
  'family',
  'marriage',
  'career',
  'wealth',
  'travel',
  'health',
] as const

export type TopicKey = typeof TOPIC_KEYS[number]

/**
 * 懒加载 100 签数据（gzip 后 ~40 KB/locale）。
 *
 * 幂等：多次调用复用同一 Promise；失败回退到 6 签 fallback 以保证功能不崩。
 * 多 locale 场景：每种 locale 独立缓存；切换语言时按需加载另一份。
 */
const guanyinCaches: Record<LingqianLocale, readonly LingqianItem[] | null> = {
  'zh-CN': null,
  'zh-TW': null,
  en: null,
}
const guanyinInflight: Record<LingqianLocale, Promise<readonly LingqianItem[]> | null> = {
  'zh-CN': null,
  'zh-TW': null,
  en: null,
}
let fallbackTwCache: readonly LingqianItem[] | null = null

/**
 * 取 fallback 6 签；zh-TW 下返回异步预热后的繁体版（未预热则返回简体，由 loadGuanyinData
 * 提前 warm 保证大多数场景下已就绪）。en 暂与 zh-CN 共用简体 fallback。
 */
function getFallback(locale: LingqianLocale): readonly LingqianItem[] {
  if (locale === 'zh-TW' && fallbackTwCache) return fallbackTwCache
  return LINGQIAN_ITEMS
}

let fallbackTwWarming: Promise<void> | null = null
/** 预热 zh-TW fallback（首次切到 zh-TW 时自动调用），通过 chinese-conv.tifyJson 同步转换。 */
function warmFallbackTw(): Promise<void> {
  if (fallbackTwCache) return Promise.resolve()
  if (fallbackTwWarming) return fallbackTwWarming
  fallbackTwWarming = import('chinese-conv')
    .then(({ tifyJson }) => {
      fallbackTwCache = Object.freeze(tifyJson(LINGQIAN_ITEMS as unknown as LingqianItem[]))
    })
    .catch((err) => {
      console.warn('[lingqian] chinese-conv 预热失败，zh-TW fallback 退化为简体：', err)
    })
  return fallbackTwWarming
}

export function getLoadedGuanyinData(locale: LingqianLocale = DEFAULT_LOCALE): readonly LingqianItem[] | null {
  return guanyinCaches[locale]
}

/**
 * 按签号在当前 locale 缓存中查找 item。
 *
 * 查找优先级：locale 缓存 → fallback 6 签样本。命中即返回；没命中返回 null（由调用方决定重抽 or 提示）。
 * 专为"刷新页面后恢复上一签"场景准备，调用前请确保已 `await loadGuanyinData(locale)`。
 */
export function getLingqianItemById(id: number, locale: LingqianLocale = DEFAULT_LOCALE): LingqianItem | null {
  const cache = guanyinCaches[locale]
  const source = cache ?? getFallback(locale)
  return source.find((item) => item.id === id) ?? null
}

export function loadGuanyinData(locale: LingqianLocale = DEFAULT_LOCALE): Promise<readonly LingqianItem[]> {
  const cached = guanyinCaches[locale]
  if (cached) return Promise.resolve(cached)
  const inflight = guanyinInflight[locale]
  if (inflight) return inflight

  if (locale === 'zh-TW') void warmFallbackTw()

  const importer = LOCALE_IMPORTERS[locale]
  const p = importer()
    .then((mod) => {
      const maybeDefault = (mod as { default?: unknown })?.default
      const raw = maybeDefault ?? mod
      if (!Array.isArray(raw) || raw.length === 0) {
        throw new FortuneError({
          module: 'lingqian',
          code: 'empty-dataset',
          message: `guanyin.${locale}.json is empty or not array`,
          details: { locale },
        })
      }
      const frozen = Object.freeze(raw as LingqianItem[])
      guanyinCaches[locale] = frozen
      return frozen
    })
    .catch((err) => {
      console.warn(`[lingqian] guanyin.${locale}.json 加载失败，回退 fallback：`, err)
      const fb = getFallback(locale)
      guanyinCaches[locale] = fb
      return fb
    })
    .finally(() => {
      guanyinInflight[locale] = null
    })

  guanyinInflight[locale] = p
  return p
}

/** 按 locale 懒加载对应 JSON；新增语言只需在这里登记一条。 */
const LOCALE_IMPORTERS: Record<LingqianLocale, () => Promise<unknown>> = {
  'zh-CN': () => import('../data/guanyin.json'),
  'zh-TW': () => import('../data/guanyin.zh-TW.json'),
  // en: 骨架版（level + poem 已就绪，jieyue/xianji/topics/diangu 暂为中文占位带 __todo_en 标记）
  // 正文英文翻译由后续批次逐签填入 scripts/build-lingqian-en.mjs 的翻译表，完成后重跑脚本即可
  en: () => import('../data/guanyin.en.json'),
}
