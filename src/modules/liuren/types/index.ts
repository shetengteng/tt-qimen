/**
 * 小六壬（掐指一算）类型定义
 *
 * 数据结构严格对齐 design/modules/12-小六壬模块.md §2。
 * 六个分面扩展为 6 维（overall/career/love/wealth/health/travel），
 * 与 design/prototypes/{theme}/liuren.html 的 6 个 tab 保持一致。
 */

/** 六宫名 */
export type PalaceName = '大安' | '留连' | '速喜' | '赤口' | '小吉' | '空亡'

/** 六宫吉凶：ji=吉 / xiong=凶 / neutral=平/中 */
export type JiXiong = 'ji' | 'xiong' | 'neutral'

/** 五行标签（简体用字） */
export type ElementCN = '木' | '火' | '土' | '金' | '水'

/** 解读分面 */
export type Aspect = 'overall' | 'career' | 'love' | 'wealth' | 'health' | 'travel'

/** 单宫的完整知识条目 */
export interface PalaceReading {
  /** 宫名（中文汉字，对应汉典名相） */
  name: PalaceName
  /** 吉凶定性 */
  jiXiong: JiXiong
  /** 一字吉凶标签（如「喜」「静」「空」），用于 badge */
  tag: string
  /** 五行 */
  element: ElementCN
  /** 符号 emoji（UI 首屏用） */
  symbol: string
  /** 6 维解读，每维 1~2 段文案 */
  readings: Record<Aspect, string>
  /** 宜（字符串数组，UI 展示时可点列） */
  suitable: string[]
  /** 忌 */
  avoid: string[]
}

/** 主结果 */
export interface LiurenResult {
  /** 最终宫位完整内容 */
  palace: PalaceReading
  /** 三步累加用到的数值 */
  steps: {
    /** 农历月（1-12） */
    month: number
    /** 农历日（1-30） */
    day: number
    /** 时辰序号（1=子, 12=亥） */
    hour: number
  }
  /** 三步途经宫位（长度=3：月、日、时） */
  path: PalaceName[]
  /** 问事方向（用户选择的 aspect） */
  aspect: Aspect
  /** 问事心念（可选） */
  question?: string
  /** 起卦时的展示日期（农历汉字，UI 顶部"当前农历"） */
  lunarDateLabel: string
  /** 起卦时的展示时辰（子时/午时等） */
  hourBranchLabel: string
}
