/**
 * 小六壬 6 宫多语言访问层
 *
 * 设计：
 *  - zh-CN：直接返回 PALACES[name]（默认）
 *  - zh-TW：用 chinese-conv.tify 运行时把简体 readings/suitable/avoid 转繁体；按 PalaceName 缓存
 *  - en  ：从 palaces.en.ts 取人工翻译版本
 *
 * 短字段（name / element / symbol / jiXiong）：
 *  - 这些是占卜模型本体（如"大安/木/🍀/ji"），不需要翻译
 *  - UI 层若需要本地化展示宫名/标签，统一通过 i18n keys（liuren.palace.<name>）
 *
 * 类型稳定：返回的 PalaceReading 形状与原 PALACES[name] 完全一致，调用方（AspectReading.vue）无需感知 locale。
 */

import { tify } from 'chinese-conv'
import type { PalaceName, PalaceReading } from '../types'
import { PALACES } from './palaces'
import { PALACES_EN } from './palaces.en'

export type LiurenLocale = 'zh-CN' | 'zh-TW' | 'en'

const TW_CACHE = new Map<PalaceName, PalaceReading>()

function buildZhTw(name: PalaceName): PalaceReading {
  const src = PALACES[name]
  const readings = Object.fromEntries(
    Object.entries(src.readings).map(([k, v]) => [k, tify(v)]),
  ) as PalaceReading['readings']
  return {
    ...src,
    tag: tify(src.tag),
    readings,
    suitable: src.suitable.map((s) => tify(s)),
    avoid: src.avoid.map((s) => tify(s)),
  }
}

function buildEn(name: PalaceName): PalaceReading {
  const src = PALACES[name]
  const en = PALACES_EN[name]
  return {
    ...src,
    tag: en.tag,
    readings: en.readings,
    suitable: [...en.suitable],
    avoid: [...en.avoid],
  }
}

/**
 * 取本地化的 palace。zh-TW 结果按宫名缓存，避免每次切 aspect 都重转。
 * 默认 fallback 到 zh-CN（即未传 locale 或不在枚举内）。
 */
export function getLocalizedPalace(name: PalaceName, locale: LiurenLocale = 'zh-CN'): PalaceReading {
  if (locale === 'en') return buildEn(name)
  if (locale === 'zh-TW') {
    const cached = TW_CACHE.get(name)
    if (cached) return cached
    const built = buildZhTw(name)
    TW_CACHE.set(name, built)
    return built
  }
  return PALACES[name]
}

/** 测试/调试用 —— 清空 zh-TW 缓存 */
export function _clearLiurenLocaleCache(): void {
  TW_CACHE.clear()
}
