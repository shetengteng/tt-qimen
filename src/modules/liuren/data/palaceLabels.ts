/**
 * 6 宫名的多语言显示映射
 *
 * 设计：
 *  - zh-CN：直接用 PalaceName 字面量
 *  - zh-TW：手工映射繁体（留連 ≠ 留连，需要显式繁体）
 *  - en：拼音连字符形式（Da-An / Liu-Lian），保留中文术语辨识度
 *  - 与 palaces.en.ts 的 tag 字段配合：宫名给"是什么"，tag 给"什么含义"
 */

import type { PalaceName } from '../types'
import type { LiurenLocale } from './palacesLocale'

const ZH_TW_NAMES: Readonly<Record<PalaceName, string>> = Object.freeze({
  大安: '大安',
  留连: '留連',
  速喜: '速喜',
  赤口: '赤口',
  小吉: '小吉',
  空亡: '空亡',
})

const EN_NAMES: Readonly<Record<PalaceName, string>> = Object.freeze({
  大安: 'Da-An',
  留连: 'Liu-Lian',
  速喜: 'Su-Xi',
  赤口: 'Chi-Kou',
  小吉: 'Xiao-Ji',
  空亡: 'Kong-Wang',
})

export function getPalaceDisplayName(name: PalaceName, locale: LiurenLocale = 'zh-CN'): string {
  if (locale === 'en') return EN_NAMES[name]
  if (locale === 'zh-TW') return ZH_TW_NAMES[name]
  return name
}
