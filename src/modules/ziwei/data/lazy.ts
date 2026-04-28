/**
 * 紫微斗数 · 大型 B/C 类资产懒加载封装
 *
 * 背景：B/C 类（sihuaReading 40段 / soulMaster 13段 / decadal 60段 / yearly 60段）
 * 三语合计字节数约 145KB（原始 .ts 源码尺寸），占 ziwei data 资产总量约 50%。
 *
 * 这些资产的 UI 消费时机：
 *  - SihuaReadingView / SoulMasterView 是新增 view 组件（首屏可选）
 *  - DecadalReview / YearlyReview 嵌入在 DecadalDetail / ZiweiYear 内（首屏可见）
 *
 * 设计动机：
 *  1. 首屏只需加载"用户当前 locale" 的资产，避免 zh-CN + zh-TW + en 三份全部进 bundle
 *  2. 切语言时按需加载新 locale chunk，不阻塞首次排盘
 *  3. UI 调用方拿到的是 Promise，UI 用 ref 持有结果，自然走 v-if/v-await 体验
 *
 * 不懒加载的内容：
 *  - 现有 SoulPalace / PalaceMajor / MinorStars 已经在 sync `data/index.ts` 中，沿用
 *    不动（属于"首屏强需"，且单 locale 字节数较小）
 *  - sihuaReading 40 段也偏小（zh-CN ~16KB），但与 soulMaster + decadal + yearly
 *    一并归为"B/C 大资产"，统一懒加载策略，便于 vite 进行 chunk 合并
 *
 * 实现：vite 的 dynamic import 在 build 时会自动产出独立 chunk，根据语言路径切分；
 *      同一语言的多次 import 通过模块缓存命中，无重复成本。
 *
 * 使用方式（示例）：
 * ```ts
 * import { loadSihuaReadingForStem } from '../data/lazy'
 * const entries = await loadSihuaReadingForStem('jia', 'zh-CN')
 * ```
 */
import type { Locale } from '@/locales'
import type { SihuaKey } from '../types'
import type {
  HeavenlyStemKey,
  SihuaReadingEntry,
  SihuaReadingMatrix,
  MingShenStarKey,
  SoulMasterEntry,
  SoulMasterMatrix,
  GanZhiKey,
  DecadalReviewEntry,
  DecadalReviewMatrix,
  YearlyReviewEntry,
  YearlyReviewMatrix,
} from './index'

/* ----------------------------- Sihua Reading ----------------------------- */

const SIHUA_READING_LOADERS: Record<Locale, () => Promise<SihuaReadingMatrix>> = {
  'zh-CN': () => import('./sihuaReading').then((m) => m.SIHUA_READING_ZH_CN),
  'zh-TW': () => import('./sihuaReading.zh-TW').then((m) => m.SIHUA_READING_ZH_TW),
  en: () => import('./sihuaReading.en').then((m) => m.SIHUA_READING_EN),
}

const sihuaReadingCache = new Map<Locale, SihuaReadingMatrix>()

/**
 * 加载指定语言的全量四化论命矩阵（10 天干 × 4 化）。
 *
 * - 同 locale 重复调用走缓存，无网络开销
 * - 切换 locale 触发独立 chunk 加载（vite 自动 code splitting）
 */
export async function loadSihuaReading(lang: Locale): Promise<SihuaReadingMatrix> {
  const cached = sihuaReadingCache.get(lang)
  if (cached) return cached
  const loader = SIHUA_READING_LOADERS[lang] ?? SIHUA_READING_LOADERS['zh-CN']
  const data = await loader()
  sihuaReadingCache.set(lang, data)
  return data
}

/** 单段：天干 × 四化 → 论断 */
export async function loadSihuaReadingEntry(
  stemKey: HeavenlyStemKey,
  sihua: SihuaKey,
  lang: Locale,
): Promise<SihuaReadingEntry | null> {
  const matrix = await loadSihuaReading(lang)
  return matrix[stemKey]?.[sihua] ?? null
}

/** 一次取该天干 4 段（禄/权/科/忌） */
export async function loadSihuaReadingForStem(
  stemKey: HeavenlyStemKey,
  lang: Locale,
): Promise<Record<SihuaKey, SihuaReadingEntry> | null> {
  const matrix = await loadSihuaReading(lang)
  return matrix[stemKey] ?? null
}

/* ----------------------------- Soul Master ----------------------------- */

const SOUL_MASTER_LOADERS: Record<Locale, () => Promise<SoulMasterMatrix>> = {
  'zh-CN': () => import('./soulMaster').then((m) => m.SOUL_MASTER_ZH_CN),
  'zh-TW': () => import('./soulMaster.zh-TW').then((m) => m.SOUL_MASTER_ZH_TW),
  en: () => import('./soulMaster.en').then((m) => m.SOUL_MASTER_EN),
}

const soulMasterCache = new Map<Locale, SoulMasterMatrix>()

export async function loadSoulMaster(lang: Locale): Promise<SoulMasterMatrix> {
  const cached = soulMasterCache.get(lang)
  if (cached) return cached
  const loader = SOUL_MASTER_LOADERS[lang] ?? SOUL_MASTER_LOADERS['zh-CN']
  const data = await loader()
  soulMasterCache.set(lang, data)
  return data
}

/** 单段：星 key → 论断 */
export async function loadSoulMasterEntry(
  starKey: MingShenStarKey,
  lang: Locale,
): Promise<SoulMasterEntry | null> {
  const matrix = await loadSoulMaster(lang)
  return matrix[starKey] ?? null
}

/* ----------------------------- Decadal Review ----------------------------- */

const DECADAL_REVIEW_LOADERS: Record<Locale, () => Promise<DecadalReviewMatrix>> = {
  'zh-CN': () => import('./decadalReview').then((m) => m.DECADAL_REVIEW_ZH_CN),
  'zh-TW': () => import('./decadalReview.zh-TW').then((m) => m.DECADAL_REVIEW_ZH_TW),
  en: () => import('./decadalReview.en').then((m) => m.DECADAL_REVIEW_EN),
}

const decadalReviewCache = new Map<Locale, DecadalReviewMatrix>()

export async function loadDecadalReview(lang: Locale): Promise<DecadalReviewMatrix> {
  const cached = decadalReviewCache.get(lang)
  if (cached) return cached
  const loader = DECADAL_REVIEW_LOADERS[lang] ?? DECADAL_REVIEW_LOADERS['zh-CN']
  const data = await loader()
  decadalReviewCache.set(lang, data)
  return data
}

/** 单段：60 甲子 → 总评 */
export async function loadDecadalReviewEntry(
  ganzhi: GanZhiKey,
  lang: Locale,
): Promise<DecadalReviewEntry | null> {
  const matrix = await loadDecadalReview(lang)
  return matrix[ganzhi] ?? null
}

/* ----------------------------- Yearly Review ----------------------------- */

const YEARLY_REVIEW_LOADERS: Record<Locale, () => Promise<YearlyReviewMatrix>> = {
  'zh-CN': () => import('./yearlyReview').then((m) => m.YEARLY_REVIEW_ZH_CN),
  'zh-TW': () => import('./yearlyReview.zh-TW').then((m) => m.YEARLY_REVIEW_ZH_TW),
  en: () => import('./yearlyReview.en').then((m) => m.YEARLY_REVIEW_EN),
}

const yearlyReviewCache = new Map<Locale, YearlyReviewMatrix>()

export async function loadYearlyReview(lang: Locale): Promise<YearlyReviewMatrix> {
  const cached = yearlyReviewCache.get(lang)
  if (cached) return cached
  const loader = YEARLY_REVIEW_LOADERS[lang] ?? YEARLY_REVIEW_LOADERS['zh-CN']
  const data = await loader()
  yearlyReviewCache.set(lang, data)
  return data
}

/** 单段：60 甲子 → 流年总评 */
export async function loadYearlyReviewEntry(
  ganzhi: GanZhiKey,
  lang: Locale,
): Promise<YearlyReviewEntry | null> {
  const matrix = await loadYearlyReview(lang)
  return matrix[ganzhi] ?? null
}

/* ----------------------------- Prefetch ----------------------------- */

/**
 * 预热：在 ZiweiPage onMounted 闲时调用，让点击"排盘"几乎无网络等待。
 *
 * 仅预热当前 locale 的全部 4 类资产；切语言时由 UI 触发新 locale 的 lazy load。
 *
 * 设计权衡：与 prefetchZiweiEngine（iztro chunk）共用 requestIdleCallback 时机，
 * 让浏览器空闲时一次把"算子 + 资产"两路并行下载，落地前已经 ready。
 */
export function prefetchZiweiData(lang: Locale): void {
  void loadSihuaReading(lang)
  void loadSoulMaster(lang)
  void loadDecadalReview(lang)
  void loadYearlyReview(lang)
}
