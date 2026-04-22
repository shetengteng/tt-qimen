/**
 * 解梦 · 8 大分类元数据
 *
 * 对齐 design/prototypes/{minimal,guofeng}/jiemeng.html 原型的显示顺序与图标。
 * 文案不落在这里，统一走 i18n `jiemeng.category.{key}`。
 */

import type { DreamCategory, DreamCategoryKey } from '../types'

export const DREAM_CATEGORIES: readonly DreamCategory[] = Object.freeze([
  { key: 'animal',   icon: '◉' },
  { key: 'people',   icon: '∞' },
  { key: 'nature',   icon: '☷' },
  { key: 'body',     icon: '☯' },
  { key: 'life',     icon: '▤' },
  { key: 'ghost',    icon: '✦' },
  { key: 'building', icon: '▦' },
  { key: 'other',    icon: '♠' },
])

export const CATEGORY_KEYS: readonly DreamCategoryKey[] = DREAM_CATEGORIES.map((c) => c.key)
