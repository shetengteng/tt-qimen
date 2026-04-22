/**
 * 观音灵签 · 核心算法
 *
 * 设计文档 §3：
 *   - 纯随机 Math.random() 抽 1..N
 *   - 高级：filter 掉上一次签号，避免连续抽到同一签
 *
 * 注意：本模块刻意把"上次签号记忆"留给 store/UI 层（useStorage）注入，
 *       core 只做无副作用的纯函数。
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

/** 抽签：返回随机一签 */
export function drawLingqian(opts: DrawOptions = {}): LingqianItem {
  const data = opts.data ?? LINGQIAN_ITEMS
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
