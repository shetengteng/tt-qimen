/**
 * 地支关系扫描（六冲 / 六合 / 自刑 / 三刑）
 *
 * 公认规则集（命理常用）：
 *  - 六冲：子午 · 丑未 · 寅申 · 卯酉 · 辰戌 · 巳亥
 *  - 六合：子丑 · 寅亥 · 卯戌 · 辰酉 · 巳申 · 午未
 *  - 三合：申子辰（水局）· 亥卯未（木局）· 寅午戌（火局）· 巳酉丑（金局）
 *  - 自刑：辰辰 · 午午 · 酉酉 · 亥亥
 *  - 三刑：
 *      · 寅巳申（无恩之刑）
 *      · 丑戌未（恃势之刑）
 *      · 子卯（无礼之刑）
 *
 * UI 约束：FourPillarsTable 的 SVG 弧线和 CSS 配色仅支持 3 种 type：
 *  - 'chong' (红色弧线，向上)
 *  - 'zixing' (橙色弧线，向下) —— 自刑 + 三刑都归此类
 *  - 'anhe'  (蓝色弧线，向下) —— 六合 + 三合（半合）都归此类
 *
 * 复杂度控制：每对柱子最多产出 1 条弧线（按 优先级 冲>合>刑），
 * 同型关系不去重（如 "子午冲" + "午午刑" 各占一条），
 * 上限 6 条避免视觉拥挤（实际命局 4 柱产出 ≤ 6 对，足够）。
 */

import type { PillarInfo } from '../types'
import type { BaziArc } from '../composables/useBaziDrawings'

/** 柱位代号 → 中文名（用于 desc 文案） */
const POS_LABELS: Record<number, string> = {
  0: '年支',
  1: '月支',
  2: '日支',
  3: '时支',
}

/** 六冲关系（双向） */
const SIX_CHONG = new Set([
  '子午', '午子',
  '丑未', '未丑',
  '寅申', '申寅',
  '卯酉', '酉卯',
  '辰戌', '戌辰',
  '巳亥', '亥巳',
])

/** 六合关系（双向） */
const SIX_HE = new Set([
  '子丑', '丑子',
  '寅亥', '亥寅',
  '卯戌', '戌卯',
  '辰酉', '酉辰',
  '巳申', '申巳',
  '午未', '未午',
])

/** 三合局（每局 3 个支） */
const SAN_HE_GROUPS: string[][] = [
  ['申', '子', '辰'],
  ['亥', '卯', '未'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
]

/** 自刑：4 个支 */
const ZI_XING = new Set(['辰', '午', '酉', '亥'])

/** 三刑配对（双向，从某对中任意两支命中即视为刑） */
const SAN_XING_PAIRS = new Set([
  '寅巳', '巳寅',
  '寅申', '申寅', // 寅巳申 互刑（注意寅申也是冲，按优先级冲胜出）
  '巳申', '申巳', // 同上（巳申也是六合，合胜出）
  '丑戌', '戌丑',
  '丑未', '未丑', // 丑戌未 互刑（丑未也是冲，冲胜出）
  '戌未', '未戌',
  '子卯', '卯子',
])

interface PairKey {
  i: number // 较小柱位
  j: number // 较大柱位
  key: string
}

/** 生成 4 柱所有 pair（共 6 对） */
function allPairs(): PairKey[] {
  const list: PairKey[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      list.push({ i, j, key: `${i}-${j}` })
    }
  }
  return list
}

/** 单对地支关系判断；优先级：冲 > 合 > 刑（自/三）*/
function judgePair(a: string, b: string): {
  type: BaziArc['type']
  label: string
} | null {
  const concat = `${a}${b}`

  if (SIX_CHONG.has(concat)) {
    return { type: 'chong', label: `${a}${b}相冲` }
  }
  if (SIX_HE.has(concat)) {
    return { type: 'anhe', label: `${a}${b}六合` }
  }
  if (a === b && ZI_XING.has(a)) {
    return { type: 'zixing', label: `${a}${b}自刑` }
  }
  if (SAN_XING_PAIRS.has(concat)) {
    return { type: 'zixing', label: `${a}${b}相刑` }
  }
  return null
}

/**
 * 三合局检测：4 柱中必须**齐凑该局的 3 个不同地支**才算三合（不能是 3 个同一支）。
 * 命中后，挑出该局对应的 3 个柱位，from = 最小柱位, to = 最大柱位，单独追加一条 anhe 弧。
 */
function detectSanHe(zhis: string[]): {
  type: 'anhe'
  from: number
  to: number
  label: string
}[] {
  const out: { type: 'anhe'; from: number; to: number; label: string }[] = []
  for (const group of SAN_HE_GROUPS) {
    // 检查 group 中每个支是否在 zhis 中出现过
    const distinctSeen = group.filter(g => zhis.includes(g))
    if (distinctSeen.length < 3) continue

    // 命中三合 → 收集这 3 个支首次出现的柱位
    const positions: number[] = []
    for (const g of group) {
      const idx = zhis.indexOf(g)
      if (idx !== -1) positions.push(idx)
    }
    const sorted = positions.slice().sort((a, b) => a - b)
    out.push({
      type: 'anhe',
      from: sorted[0],
      to: sorted[sorted.length - 1],
      label: `${group.join('')}三合`,
    })
  }
  return out
}

/**
 * 主入口：根据 4 柱地支生成 BaziArc 列表
 *
 * @param year/month/day/hour 4 柱 PillarInfo
 * @param maxArcs 限制最多 N 条弧线（默认 6，超限时按优先级裁剪）
 */
export function detectZhiRelations(
  year: PillarInfo,
  month: PillarInfo,
  day: PillarInfo,
  hour: PillarInfo,
  maxArcs = 6,
): BaziArc[] {
  const zhis = [year.zhi, month.zhi, day.zhi, hour.zhi]
  const result: BaziArc[] = []

  // 1. 两两扫描
  for (const pair of allPairs()) {
    const r = judgePair(zhis[pair.i], zhis[pair.j])
    if (!r) continue
    result.push({
      type: r.type,
      from: pair.i,
      to: pair.j,
      label: r.label,
      desc: `${POS_LABELS[pair.i]} ↔ ${POS_LABELS[pair.j]}${descSuffix(r.type)}`,
      // 弧线方向：chong 朝上、其余朝下，避免堆叠遮挡
      dir: r.type === 'chong' ? 'up' : 'down',
    })
  }

  // 2. 三合检测（独立追加；和 pair 中可能重叠的"半合"已被合 pair 捕获，三合再补一条整局）
  const sanhe = detectSanHe(zhis)
  for (const s of sanhe) {
    result.push({
      type: 'anhe',
      from: s.from,
      to: s.to,
      label: s.label,
      desc: `${POS_LABELS[s.from]} ↔ ${POS_LABELS[s.to]}，主整局聚气`,
      dir: 'down',
    })
  }

  // 3. 优先级排序 + 截断
  const order: Record<BaziArc['type'], number> = { chong: 0, anhe: 1, zixing: 2 }
  result.sort((a, b) => order[a.type] - order[b.type])
  return result.slice(0, maxArcs)
}

/** 关系类型 → 含义后缀 */
function descSuffix(type: BaziArc['type']): string {
  switch (type) {
    case 'chong': return '，主动荡'
    case 'zixing': return '，主自耗'
    case 'anhe': return '，主暗助'
  }
}
