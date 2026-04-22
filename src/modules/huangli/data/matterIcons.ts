/**
 * 9 事由的图标符号（公版 Unicode 符号，不引 icon 库）。
 * 与 design/prototypes/{guofeng,minimal}/huangli.html 保持一致。
 */
import type { HuangliMatterKey } from '../types'

export const MATTER_ICONS: Readonly<Record<HuangliMatterKey, string>> = {
  jisi: '⛩',
  qifu: '☯',
  jiaqu: '♥',
  chuxing: '✈',
  qianyue: '✎',
  kaishi: '▤',
  dongtu: '⚒',
  ruzhai: '⌂',
  potu: '▣',
}

/**
 * 事由顺序（设计文档 §1 规范顺序），决定 MatterGrid 渲染顺序。
 */
export const MATTER_ORDER: readonly HuangliMatterKey[] = [
  'jisi',
  'jiaqu',
  'chuxing',
  'dongtu',
  'kaishi',
  'qianyue',
  'ruzhai',
  'qifu',
  'potu',
]
