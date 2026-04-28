/**
 * 八字模块类型定义
 *
 * 对齐设计文档 design/modules/10-八字模块.md §3.1 / §3.2，
 * 字段命名做了两处微调以贴合实现：
 *  - decades / flowYears 列表元素都明确包含 ganzhi 字符串，方便 UI 直接绑定
 *  - currentFlowYear 不复制对象，使用索引 idx 引用 flowYears 中的当前一年
 *
 * G-5 收敛点（2026-04-28）：ElementName 与 TenGodType 已**单一来源化**：
 *   - ElementName re-export 自 src/lib/element.ts
 *   - TenGodType  re-export 自 src/lib/tenGod.ts
 *   旧的内联 `'木' | '火' | ...` literal 定义全部被消灭，避免双源 drift；
 *   外部模块继续 `import type { ElementName, TenGodType } from '../types'`
 *   即可，不感知重构。
 */

import type { ElementName as LibElementName } from '@/lib/element'
import type { TenGodType as LibTenGodType } from '@/lib/tenGod'

/** 五行（中文名，与 tyme4ts Element.getName() 直接对齐） */
export type ElementName = LibElementName

/** 十神种类（10 + 日主自身） */
export type TenGodType = LibTenGodType

/** 旺衰 5 档 */
export type StrengthLevel = '极旺' | '偏旺' | '中和' | '偏弱' | '极弱'

/** 大运 / 流年的吉/中/凶 */
export type Tendency = 'favorable' | 'neutral' | 'unfavorable'

/** 单柱 */
export interface PillarInfo {
  /** 天干（甲乙...） */
  gan: string
  /** 地支（子丑...） */
  zhi: string
  /** 干支组合（庚午） */
  ganzhi: string
  /** 干的五行（金木水火土） */
  ganElement: ElementName
  /** 支的五行 */
  zhiElement: ElementName
  /** 干的阴阳（"阳"/"阴"） */
  ganYinYang: '阴' | '阳'
  /** 支的阴阳 */
  zhiYinYang: '阴' | '阳'
  /** 纳音（路旁土、白蜡金…） */
  nayin: string
  /** 此柱天干相对日主的十神（年/月/时柱），日柱固定为 '日主' */
  tenGod: TenGodType
  /**
   * 地支藏干（按本气 → 中气 → 余气 顺序），cangganSingle=true 时仅一个本气。
   * 用于 UI 显示与五行权重计算。
   */
  hideStems: HideStem[]
  /** 仅 1 个藏干（即子/午/卯/酉等只藏本气的支） */
  hideStemSingle: boolean
}

/** 藏干一项 */
export interface HideStem {
  /** 干名 */
  gan: string
  /** 五行 */
  element: ElementName
  /** 在五行权重计算中的占比（0.7 / 0.2 / 0.1） */
  weight: 0.7 | 0.2 | 0.1
  /** 标志位：本气 / 中气 / 余气 */
  type: 'main' | 'middle' | 'residual'
}

/** 五行权重总分（小数） */
export interface ElementsScore {
  /** 木 */ wood: number
  /** 火 */ fire: number
  /** 土 */ earth: number
  /** 金 */ metal: number
  /** 水 */ water: number
}

/** 五行单元素的统计（用于雷达 / 柱状） */
export interface ElementCell {
  /** 五行名 */
  name: ElementName
  /** 加权得分 */
  score: number
  /** 占比 0..1 */
  percent: number
  /** 状态分类 */
  status: 'strong' | 'balanced' | 'weak'
}

/** 大运 */
export interface DecadeFortune {
  /** 干（用于显示） */
  gan: string
  /** 支 */
  zhi: string
  /** 干支字符串 */
  ganzhi: string
  /** 大运天干的五行（用于 tendency 判断） */
  element: ElementName
  /** 起始年龄（虚岁） */
  startAge: number
  /** 结束年龄 */
  endAge: number
  /** 起始公历年 */
  startYear: number
  /** 结束公历年 */
  endYear: number
  /** 大运天干 + 地支天干合并的十神描述（如 "正印 · 正财"） */
  tenGod: string
  /** 大运天干的十神（核心 key，用于查模板） */
  tenGodGan: TenGodType
  /** 吉/中/凶 */
  tendency: Tendency
  /** 一句话模板 */
  hint: string
  /** 是否为当前所处的大运 */
  current: boolean
}

/** 流年 */
export interface FlowYear {
  /** 公历年 */
  year: number
  /** 干支 */
  ganzhi: string
  /** 干 */
  gan: string
  /** 支 */
  zhi: string
  /** 干的五行 */
  element: ElementName
  /** 干的十神 */
  tenGod: TenGodType
  /** 吉/中/凶 */
  tendency: Tendency
  /** 一句话模板 */
  hint: string
  /** 标签（"合作"、"防合伙纠纷"...） */
  tags: string[]
  /** 是否当年 */
  current: boolean
}

/** 命盘简析（150 字 + 标签） */
export interface InterpretSummary {
  /** 第一段：日主 / 月令 / 用神 */
  paragraph1: string
  /** 第二段：格局 / 财官 / 喜用 */
  paragraph2: string
  /** 标签 chip 列表（"身 · 强"、"格 · 财官相济"、"用神 · 水木"、"忌神 · 火土"） */
  tags: string[]
}

/** 命局格局名（10 个：8 大正格 + 建禄/月刃 + 杂气） */
export type PatternName =
  | '正官格'
  | '七杀格'
  | '正财格'
  | '偏财格'
  | '正印格'
  | '偏印格'
  | '食神格'
  | '伤官格'
  | '建禄格'
  | '月刃格'
  | '杂气格'

/** 格局识别结果 */
export interface PatternInfo {
  /** 格局名 */
  name: PatternName
  /** 月支本气十神（基础判别依据） */
  monthMainTenGod: TenGodType
  /** 透干情况（哪一柱透出该十神，没有则为 null） */
  through: 'year' | 'month' | 'hour' | null
  /** 一句话格局点评 */
  comment: string
}

/** 神煞吉凶分类（吉/中/凶） */
export type ShenshaCategory = 'auspicious' | 'neutral' | 'inauspicious'

/** 神煞命中项 */
export interface ShenshaHit {
  /** 神煞名（已做繁→简转换） */
  name: string
  /** 神煞 key（英文，与 data/shenshaMeaning.ts 对齐，用于查短/长说明） */
  key: string
  /** 命中的柱位 */
  pillar: 'year' | 'month' | 'day' | 'hour'
  /** 吉凶分类 */
  category: ShenshaCategory
  /** 一句话短说明（20 字内，用于 chip 下方显示） */
  short: string
}

/** 排盘元信息（用于卡片头部） */
export interface ChartMeta {
  /** 公历日期字符串（"1990-05-20 午时"） */
  solar: string
  /** 公历英文 */
  solarEn: string
  /** 农历 */
  lunar: string
  /** 农历英文 */
  lunarEn: string
  /** 性别（"乾造" / "坤造"，国风用） */
  genderTitle: '乾造' | '坤造'
}

/**
 * UI 层四柱单元格（FourPillarsTable 使用）。
 *
 * 与内部计算类型 `PillarInfo` 的区别：
 *   - PillarInfo 描述完整单柱（用于核心计算）
 *   - PillarCell 是 UI 展示用的扁平结构，把多语言化后的属性字符串直接塞到字段里
 * BaziPage 负责把 PillarInfo 转成 PillarCell。
 */
export interface PillarCell {
  gan: string
  zhi: string
  /** 类似 "阳金" / "阳火 · 日主" */
  ganAttr: string
  /** 类似 "阳火" */
  zhiAttr: string
  /** 十神（日柱为 '日主'） */
  shishen: string
  /** 纳音名 */
  nayin: string
  /** 藏干 */
  canggang: string[]
  /** 仅有本气（子/午/卯/酉 等） */
  cangganSingle?: boolean
}

/** 完整命盘 */
export interface BaziChart {
  /** 元信息 */
  meta: ChartMeta
  /** 四柱 */
  pillars: {
    year: PillarInfo
    month: PillarInfo
    day: PillarInfo
    hour: PillarInfo
  }
  /** 日主天干 */
  dayMaster: string
  /** 日主五行 */
  dayMasterElement: ElementName
  /** 日主阴阳（"阳火 · 日主" 中的"阳"） */
  dayMasterYinYang: '阴' | '阳'
  /** 五行权重明细 */
  elements: ElementsScore
  /** 五行雷达 5 元素列表（按 木火土金水 顺序） */
  elementCells: ElementCell[]
  /** 旺衰判断 */
  strength: StrengthLevel
  /** 喜用神（1-2 个） */
  favorableElements: ElementName[]
  /** 忌神（推导） */
  unfavorableElements: ElementName[]
  /** 命盘简析（模板） */
  interpret: InterpretSummary
  /** 命局格局信息 */
  pattern: PatternInfo
  /** 四柱神煞命中列表（按吉→中→凶排序，同柱同煞会去重） */
  shensha: ShenshaHit[]
  /** 起运信息 */
  startAge: { year: number; months: number }
  /** 大运（10 段） */
  decades: DecadeFortune[]
  /** 流年（默认当年 + 后续 9 年，共 10 年） */
  flowYears: FlowYear[]
  /** 当前所处大运在 decades 中的索引（找不到时为 -1） */
  currentDecadeIdx: number
  /** 当年在 flowYears 中的索引（找不到时为 -1） */
  currentFlowYearIdx: number
}
