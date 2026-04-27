/**
 * 紫微斗数 · 资产库统一出口
 *
 * 当前包含：
 *  - SoulPalace（命宫主星论命 14 段 × 三语）
 *  - PalaceMajor（各宫主星简析 168 段 × 三语）
 *  - MinorStars（六吉六煞入宫 144 段 × 三语）
 *
 * 后续将按设计文档 §3.3 顺序补齐：
 *  - SihuaReading（四化论命 40 段）
 *  - DaxianReview（大限总评 60 段）
 *  - LiunianReview（流年总评 60 段）
 *  - SoulMaster（命主/身主 14 段）
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

export type { MajorStarKey, SoulPalaceEntry }
export type { PalaceKey12, PalaceMajorEntry, PalaceMajorMatrix, Verdict }
export type { MinorStarKey, MinorStarEntry, MinorStarMatrix }
export {
  ZH_STAR_TO_KEY,
  ZH_MINOR_STAR_TO_KEY,
  LUCKY_MINOR_STARS,
  MALEFIC_MINOR_STARS,
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
