/**
 * 十神（Ten Gods）通用工具
 *
 * 子平命理核心概念：以日主为参照系，根据"五行生克 + 阴阳同异"判定 10 种关系：
 *   - 比劫：同我者（比肩 / 劫财）
 *   - 食伤：我生者（食神 / 伤官）
 *   - 财：  我克者（偏财 / 正财）
 *   - 官杀：克我者（七杀 / 正官）
 *   - 印枭：生我者（偏印 / 正印）
 *   阴阳同 → 偏类（比肩 / 食神 / 偏财 / 七杀 / 偏印）
 *   阴阳异 → 正类（劫财 / 伤官 / 正财 / 正官 / 正印）
 * 日柱本身固定为「日主」。
 *
 * 此文件本身**不被任何模块引用**（按"extract-only 不动 bazi"约定），
 * 是后续重构 / 新模块（紫微亦可借类十神语义）的可选基础设施。
 *
 * 与 bazi 现状的对照：
 *   - bazi/types/index.ts        : `TenGodType`（11 项 = 10 + 日主）
 *   - bazi/core/pattern.ts       : `stemTenGod()` 是本文件 `calcTenGod()` 的源实现
 *
 * 术语来源：《子平真诠》《三命通会》卷五 / 卷六中关于十神类化的标准定义。
 */

import { type ElementName, elementRelation, isYangStem, stemElement } from './element'

/** 十神类型（10 + 日主自身） */
export type TenGodType =
  | '比肩' | '劫财'
  | '食神' | '伤官'
  | '正财' | '偏财'
  | '正官' | '七杀'
  | '正印' | '偏印'
  | '日主'

/** 十神 5 大类（聚类用，UI 上常按这 5 类着色） */
export type TenGodCategory = 'self' | 'output' | 'wealth' | 'power' | 'resource'

/** 十神 → 5 大类映射 */
export const TEN_GOD_CATEGORY: Readonly<Record<Exclude<TenGodType, '日主'>, TenGodCategory>> = {
  比肩: 'self',     劫财: 'self',
  食神: 'output',   伤官: 'output',
  正财: 'wealth',   偏财: 'wealth',
  正官: 'power',    七杀: 'power',
  正印: 'resource', 偏印: 'resource',
} as const

/**
 * 计算给定天干（stem）相对日主（dayMaster）的十神。
 *
 * 输入约束：两个参数都应是十天干之一（甲乙丙丁戊己庚辛壬癸）。
 * 如果某一方不在天干集合（理论上由上游解析保证不会发生），返回 null —— 调用方
 * 应优雅降级而非展示异常字段。
 *
 * 规则与 bazi/core/pattern.ts 的 `stemTenGod()` 完全一致；本函数为可复用版本，
 * 把"日柱 stem === dayMaster 时返回 比肩"的判定也保留下来（这是现状行为；如需
 * 把日柱标记为「日主」由调用方在外层处理）。
 */
export function calcTenGod(stem: string, dayMaster: string): TenGodType | null {
  if (stem === dayMaster) return '比肩'
  const sEle = stemElement(stem)
  const dEle = stemElement(dayMaster)
  if (!sEle || !dEle) return null

  const sameYY = isYangStem(stem) === isYangStem(dayMaster)
  return classifyTenGod(dEle, sEle, sameYY)
}

/**
 * 直接由「日主五行 / 目标五行 / 是否同阴阳」三元组算十神。
 *
 * 这是 calcTenGod 的内部分类函数，公开它是因为某些场景上游已经知道五行（不必再
 * 经过天干→五行的 lookup），可直接调用。
 */
export function classifyTenGod(
  dayMasterElement: ElementName,
  targetElement: ElementName,
  sameYinYang: boolean,
): TenGodType {
  const r = elementRelation(dayMasterElement, targetElement)
  switch (r) {
    case 'same':
      return sameYinYang ? '比肩' : '劫财'
    case 'src_gen_dst':
      return sameYinYang ? '食神' : '伤官'
    case 'src_ke_dst':
      return sameYinYang ? '偏财' : '正财'
    case 'dst_ke_src':
      return sameYinYang ? '七杀' : '正官'
    case 'dst_gen_src':
      return sameYinYang ? '偏印' : '正印'
  }
}
