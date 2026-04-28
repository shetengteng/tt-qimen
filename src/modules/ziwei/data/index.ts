/**
 * 紫微斗数 · 资产库统一出口
 *
 * 同步包含（首屏强需，单 locale 字节数较小）：
 *  - SoulPalace（命宫主星论命 14 段 × 三语）
 *  - PalaceMajor（各宫主星简析 168 段 × 三语）
 *  - MinorStars（六吉六煞入宫 144 段 × 三语）
 *
 * 异步包含（B/C 类大资产，通过 `data/lazy.ts` 按需 dynamic import）：
 *  - SihuaReading（四化论命 40 段 × 三语）—— B 类
 *  - SoulMaster（命主/身主 13 段 × 三语）—— B 类
 *  - DecadalReview（大限总评 60 段 × 三语）—— C 类
 *  - YearlyReview（流年总评 60 段 × 三语）—— C 类
 *
 * Lazy 设计动机（详见 lazy.ts header）：
 *  - 三语 × 4 类合计约 145KB 原始字节，沿 sync import 会显著拉大主 bundle
 *  - lazy.ts 按 locale 独立 chunk，首次加载只取当前 locale 一份，切语言时按需加载
 *
 * 本文件仅出口：
 *  1. 全部 7 类的 type（用于 lazy.ts 与 UI 的类型契约）
 *  2. 3 类同步资产的 sync 数据 + getter（保持原 UI 调用兼容）
 *  3. 4 类异步资产对应的 stable key 常量与 mapping（如 ZH_STEM_TO_KEY），
 *     这些是几十字节的纯静态常量，无需 lazy
 *
 * 三语策略：
 *  - zh-CN：主资产，由 lib/古籍 整理
 *  - zh-TW：基于 zh-CN 的简繁转换骨架（需专业校对）
 *  - en：placeholder 翻译骨架（需专业 Ziwei 译者审稿）
 */

import type { Locale } from '@/locales'
import type { MajorStarKey, SoulPalaceEntry } from './soulPalace'
import { SOUL_PALACE_ZH_CN, ZH_STAR_TO_KEY } from './soulPalace'
import { SOUL_PALACE_ZH_TW } from './soulPalace.zh-TW'
import { SOUL_PALACE_EN } from './soulPalace.en'
import type {
  PalaceKey12,
  PalaceMajorEntry,
  PalaceMajorMatrix,
  Verdict,
} from './palaceMajor'
import { PALACE_MAJOR_ZH_CN } from './palaceMajor'
import { PALACE_MAJOR_ZH_TW } from './palaceMajor.zh-TW'
import { PALACE_MAJOR_EN } from './palaceMajor.en'
import type {
  MinorStarKey,
  MinorStarEntry,
  MinorStarMatrix,
} from './minorStars'
import {
  MINOR_STARS_ZH_CN,
  ZH_MINOR_STAR_TO_KEY,
  LUCKY_MINOR_STARS,
  MALEFIC_MINOR_STARS,
} from './minorStars'
import { MINOR_STARS_ZH_TW } from './minorStars.zh-TW'
import { MINOR_STARS_EN } from './minorStars.en'
// B/C 类资产仅 import type + 静态常量；矩阵数据走 lazy.ts dynamic import
//
// 关键：常量从 sihuaConstants / soulMasterConstants 导入，而非从大数据文件，
// 这样 vite build 时 sihuaReading.ts / soulMaster.ts 整个大矩阵不会被牵连进主 bundle
import type {
  SihuaReadingEntry,
  SihuaReadingMatrix,
} from './sihuaReading'
import type { HeavenlyStemKey } from './sihuaConstants'
import { ZH_STEM_TO_KEY, STEM_SIHUA_TABLE } from './sihuaConstants'
import type {
  MingShenStarKey,
  MingShenRole,
  SoulMasterEntry,
  SoulMasterMatrix,
} from './soulMaster'
import { ZH_MING_SHEN_TO_KEY } from './soulMasterConstants'
import type {
  GanZhiKey,
  DecadalReviewEntry,
  DecadalReviewMatrix,
} from './decadalReview'
import type { YearlyReviewEntry, YearlyReviewMatrix } from './yearlyReview'

export type { MajorStarKey, SoulPalaceEntry }
export type { PalaceKey12, PalaceMajorEntry, PalaceMajorMatrix, Verdict }
export type { MinorStarKey, MinorStarEntry, MinorStarMatrix }
export type { HeavenlyStemKey, SihuaReadingEntry, SihuaReadingMatrix }
export type {
  MingShenStarKey,
  MingShenRole,
  SoulMasterEntry,
  SoulMasterMatrix,
}
export type {
  GanZhiKey,
  DecadalReviewEntry,
  DecadalReviewMatrix,
  YearlyReviewEntry,
  YearlyReviewMatrix,
}
export {
  ZH_STAR_TO_KEY,
  ZH_MINOR_STAR_TO_KEY,
  LUCKY_MINOR_STARS,
  MALEFIC_MINOR_STARS,
  ZH_STEM_TO_KEY,
  STEM_SIHUA_TABLE,
  ZH_MING_SHEN_TO_KEY,
}

/* ----------------------------- SoulPalace ----------------------------- */

const SOUL_PALACE_BY_LANG: Record<Locale, Record<MajorStarKey, SoulPalaceEntry>> = {
  'zh-CN': SOUL_PALACE_ZH_CN,
  'zh-TW': SOUL_PALACE_ZH_TW,
  en: SOUL_PALACE_EN,
}

/**
 * 获取指定语言下、指定主星的命宫论命；若 key 不存在返回 null。
 */
export function getSoulPalaceEntry(
  starKey: MajorStarKey,
  lang: Locale
): SoulPalaceEntry | null {
  const dict = SOUL_PALACE_BY_LANG[lang] ?? SOUL_PALACE_ZH_CN
  return dict[starKey] ?? null
}

/**
 * 由 iztro 中文主星名 → 对应论命；星名不在 14 主星表中（如左辅右弼等辅佐）返回 null。
 */
export function getSoulPalaceByZhName(
  zhName: string,
  lang: Locale
): SoulPalaceEntry | null {
  const key = ZH_STAR_TO_KEY[zhName]
  if (!key) return null
  return getSoulPalaceEntry(key, lang)
}

/* ----------------------------- PalaceMajor ----------------------------- */

const PALACE_MAJOR_BY_LANG: Record<Locale, PalaceMajorMatrix> = {
  'zh-CN': PALACE_MAJOR_ZH_CN,
  'zh-TW': PALACE_MAJOR_ZH_TW,
  en: PALACE_MAJOR_EN,
}

/**
 * 获取指定语言下、指定主星 × 指定宫位的简析；若任一 key 不存在返回 null。
 */
export function getPalaceMajorEntry(
  starKey: MajorStarKey,
  palaceKey: PalaceKey12,
  lang: Locale
): PalaceMajorEntry | null {
  const dict = PALACE_MAJOR_BY_LANG[lang] ?? PALACE_MAJOR_ZH_CN
  const row = dict[starKey]
  if (!row) return null
  return row[palaceKey] ?? null
}

/**
 * 由 iztro 中文主星名 + 12 宫稳定 key → 简析；非 14 主星返回 null。
 */
export function getPalaceMajorByZhName(
  zhName: string,
  palaceKey: PalaceKey12,
  lang: Locale
): PalaceMajorEntry | null {
  const key = ZH_STAR_TO_KEY[zhName]
  if (!key) return null
  return getPalaceMajorEntry(key, palaceKey, lang)
}

/* ----------------------------- MinorStars ----------------------------- */

const MINOR_STARS_BY_LANG: Record<Locale, MinorStarMatrix> = {
  'zh-CN': MINOR_STARS_ZH_CN,
  'zh-TW': MINOR_STARS_ZH_TW,
  en: MINOR_STARS_EN,
}

/**
 * 获取指定语言下、指定副星 × 指定宫位的入宫论断；若任一 key 不存在返回 null。
 */
export function getMinorStarEntry(
  starKey: MinorStarKey,
  palaceKey: PalaceKey12,
  lang: Locale
): MinorStarEntry | null {
  const dict = MINOR_STARS_BY_LANG[lang] ?? MINOR_STARS_ZH_CN
  const row = dict[starKey]
  if (!row) return null
  return row[palaceKey] ?? null
}

/**
 * 由 iztro 中文副星名 + 12 宫稳定 key → 入宫论断；非 12 副星返回 null。
 *
 * 兼容差异：
 *  - 部分文献写作 "擎羊"，iztro 中以 "擎羊" 为主名；ZH_MINOR_STAR_TO_KEY 兼容 "羊刃"
 *  - 火/铃六煞中，"地空 / 地劫" 两星 iztro 也叫 "地空" / "地劫"
 *  - 若上层将 "天魁" / "天钺" / "文昌" / "文曲" / "左辅" / "右弼" 视为吉，本表全收
 */
export function getMinorStarByZhName(
  zhName: string,
  palaceKey: PalaceKey12,
  lang: Locale
): MinorStarEntry | null {
  const key = ZH_MINOR_STAR_TO_KEY[zhName]
  if (!key) return null
  return getMinorStarEntry(key, palaceKey, lang)
}

/**
 * B/C 类大资产（SihuaReading / SoulMaster / DecadalReview / YearlyReview）的
 * 数据访问已迁移到 `data/lazy.ts`：
 *
 * ```ts
 * import {
 *   loadSihuaReadingForStem,
 *   loadSoulMasterEntry,
 *   loadDecadalReviewEntry,
 *   loadYearlyReviewEntry,
 *   prefetchZiweiData,
 * } from '../data/lazy'
 * ```
 *
 * 这样 vite build 会按 locale 切分出独立 chunk，首屏 ZiweiPage bundle 不再被
 * 这 12 份大数据（4 类 × 3 语 ≈ 145KB 原始字节）拖大。
 */
