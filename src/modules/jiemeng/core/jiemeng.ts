/**
 * 周公解梦 · 核心算法
 *
 * 设计文档 §3：
 *   - fuse.js 模糊搜索，多字段（keywords / title / summary）加权
 *   - getDreamsByCategory(category) 分类过滤
 *
 * 为避免 Fuse 在首屏阻塞主线程，采用懒初始化：
 * 第一次调用 searchDream 时才构建 Fuse 索引，
 * 后续复用已构建好的实例。
 */

import Fuse from 'fuse.js'
import type { IFuseOptions } from 'fuse.js'
import type {
  DreamCategoryKey,
  DreamCategoryResult,
  DreamEntry,
  DreamSearchResult,
} from '../types'
import { DREAM_ENTRIES_GENERATED as DREAM_ENTRIES } from '../data/dreams.generated'
import { SENSITIVE_WORDS } from '../data/sensitiveWords'

const FUSE_OPTIONS: IFuseOptions<DreamEntry> = {
  keys: [
    { name: 'keywords', weight: 0.55 },
    { name: 'title', weight: 0.3 },
    { name: 'summary', weight: 0.15 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: false,
  minMatchCharLength: 1,
  shouldSort: true,
}

let cachedFuse: Fuse<DreamEntry> | null = null

function getFuse(): Fuse<DreamEntry> {
  if (!cachedFuse) {
    cachedFuse = new Fuse(DREAM_ENTRIES as DreamEntry[], FUSE_OPTIONS)
  }
  return cachedFuse
}

/** 全量词条（供分类网格统计使用） */
export function getAllDreams(): readonly DreamEntry[] {
  return DREAM_ENTRIES
}

/** 分类词条统计：返回 key → count 的映射 */
export function getCategoryCounts(): Record<DreamCategoryKey, number> {
  const initial = {
    animal: 0,
    people: 0,
    nature: 0,
    body: 0,
    life: 0,
    ghost: 0,
    building: 0,
    other: 0,
  } as Record<DreamCategoryKey, number>
  for (const entry of DREAM_ENTRIES) {
    initial[entry.category] += 1
  }
  return initial
}

/** 按分类返回词条，保持 DREAM_ENTRIES 原始顺序 */
export function getDreamsByCategory(category: DreamCategoryKey): DreamCategoryResult {
  const items = DREAM_ENTRIES.filter((x) => x.category === category)
  return { category, items, total: items.length }
}

export interface SearchOptions {
  /** 仅在此分类内搜索；不传则全局 */
  category?: DreamCategoryKey
  /** 最大返回条数，默认 10 */
  limit?: number
}

/** 搜索：query 去空白后若为空，返回空结果；否则走 fuse */
export function searchDream(rawQuery: string, opts: SearchOptions = {}): DreamSearchResult {
  const query = (rawQuery ?? '').trim()
  if (!query) return { query: '', items: [], total: 0 }

  const limit = opts.limit ?? 10
  const fuse = getFuse()
  const matches = fuse.search(query, { limit: opts.category ? undefined : limit })
  let items = matches.map((m) => m.item)

  if (opts.category) {
    items = items.filter((x) => x.category === opts.category).slice(0, limit)
  }

  return { query, items, total: items.length }
}

/** 根据 id 直接取词条（供最近搜索 chip 快速回显详情） */
export function getDreamById(id: string): DreamEntry | null {
  return DREAM_ENTRIES.find((x) => x.id === id) ?? null
}

/**
 * 判断词条是否命中敏感词（用于详情卡追加"文化象征"柔性提示）。
 *
 * 命中策略：title / classical / keywords 任一字段包含任一敏感词。
 * 不命中 modern / advice —— 那里已是现代化语言，命中率过高反而稀释提示意义。
 */
export function hasSensitiveContent(entry: DreamEntry | null | undefined): boolean {
  if (!entry) return false
  const haystack =
    entry.title +
    '|' +
    entry.classical +
    '|' +
    entry.keywords.join(',')
  for (const w of SENSITIVE_WORDS) {
    if (haystack.includes(w)) return true
  }
  return false
}
