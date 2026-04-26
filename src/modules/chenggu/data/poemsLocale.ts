/**
 * 称骨算命 51 首歌诀多语言访问层（仅简↔繁，en 沿用 zh-CN 原文）
 *
 * 设计：
 *  - zh-CN：直接返回 POEMS_INDEX[weight]（默认）
 *  - zh-TW：用 chinese-conv.tify 把诗句 / 白话解读 / weight 字符串运行时转繁体；按 weightNumber 缓存
 *  - en  ：古文不翻译，与 zh-CN 同步保留原文（用户口径：歌诀文化属性强，禁止意译）
 *
 * 短字段：
 *  - level / weightNumber：模型本体，无需 i18n
 *  - weight 字符串："二两一钱" / "二兩一錢" 这种数字单位组合，需要简繁转换
 *
 * 类型稳定：返回的 ChengguPoem 形状不变，调用方（PoemDisplay / InterpretBlock / WeightTable）无需感知 locale。
 */

import { tify } from 'chinese-conv'
import type { ChengguPoem } from '../types'
import { POEMS } from './poems'

export type ChengguLocale = 'zh-CN' | 'zh-TW' | 'en'

const POEMS_INDEX: ReadonlyMap<number, ChengguPoem> = new Map(
  POEMS.map((p) => [p.weightNumber, p]),
)

const TW_CACHE = new Map<number, ChengguPoem>()

function buildZhTw(src: ChengguPoem): ChengguPoem {
  return {
    weight: tify(src.weight),
    weightNumber: src.weightNumber,
    poem: src.poem.map((line) => tify(line)),
    level: src.level,
    description: tify(src.description),
  }
}

/**
 * 取本地化的歌诀。zh-TW 结果按 weightNumber 缓存。
 * 找不到对应 weight 时返回 null（与 findPoem 语义一致）。
 */
export function getLocalizedPoem(
  weightNumber: number,
  locale: ChengguLocale = 'zh-CN',
): ChengguPoem | null {
  const src = POEMS_INDEX.get(weightNumber)
  if (!src) return null
  if (locale === 'zh-TW') {
    const cached = TW_CACHE.get(weightNumber)
    if (cached) return cached
    const built = buildZhTw(src)
    TW_CACHE.set(weightNumber, built)
    return built
  }
  return src
}

/** 测试/调试用 —— 清空 zh-TW 缓存 */
export function _clearChengguPoemCache(): void {
  TW_CACHE.clear()
}
