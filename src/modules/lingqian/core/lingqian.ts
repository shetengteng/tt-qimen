/**
 * 观音灵签 · 核心算法
 *
 * 设计文档 §3：
 *   - 纯随机 Math.random() 抽 1..N
 *   - 高级：filter 掉上一次签号，避免连续抽到同一签
 *
 * 数据源：
 *   - 100 签 guanyin.json 懒加载（~85KB 源，gzip ~25KB）
 *   - 加载完成前 / 加载失败 → fallback 到 data/items.ts 的 6 签精选样本
 *
 * 注意：本模块刻意把"上次签号记忆"留给 store/UI 层（useStorage）注入，
 *       core 只做无副作用的纯函数（抽签）+ 幂等的加载缓存。
 */

import type { LingqianItem } from '../types'
import { LINGQIAN_ITEMS } from '../data/items'

export interface DrawOptions {
  /** 上次抽中的签号，若提供则在数据里 filter 掉 */
  lastId?: number
  /** 自定义随机源（测试可注入），返回 [0, 1) */
  random?: () => number
  /** 自定义数据源；默认为内置 LINGQIAN_ITEMS */
  data?: readonly LingqianItem[]
}

/** 抽签：返回随机一签；未传 data 时优先使用已加载的 100 签缓存，否则回退 6 签样本 */
export function drawLingqian(opts: DrawOptions = {}): LingqianItem {
  const data = opts.data ?? guanyinCache ?? LINGQIAN_ITEMS
  if (data.length === 0) {
    throw new Error('[lingqian] 数据为空，无法抽签')
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
 * 懒加载 100 签数据（gzip 后 ~25KB）。
 *
 * 幂等：多次调用复用同一 Promise；失败回退到 6 签 fallback 以保证功能不崩。
 */
let guanyinCache: readonly LingqianItem[] | null = null
let guanyinInflight: Promise<readonly LingqianItem[]> | null = null

export function getLoadedGuanyinData(): readonly LingqianItem[] | null {
  return guanyinCache
}

export function loadGuanyinData(): Promise<readonly LingqianItem[]> {
  if (guanyinCache) return Promise.resolve(guanyinCache)
  if (guanyinInflight) return guanyinInflight

  guanyinInflight = import('../data/guanyin.json')
    .then((mod) => {
      const raw = (mod.default ?? mod) as unknown
      if (!Array.isArray(raw) || raw.length === 0) {
        throw new Error('guanyin.json empty')
      }
      guanyinCache = Object.freeze(raw as LingqianItem[])
      return guanyinCache
    })
    .catch((err) => {
      console.warn('[lingqian] guanyin.json load failed, fallback to items.ts sample:', err)
      guanyinCache = LINGQIAN_ITEMS
      return guanyinCache
    })
    .finally(() => {
      guanyinInflight = null
    })

  return guanyinInflight
}
