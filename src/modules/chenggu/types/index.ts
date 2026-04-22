/**
 * 称骨算命模块类型定义
 *
 * 对齐设计文档 design/modules/11-称骨算命模块.md §2
 * 依据 tyme4ts 暴露的 LunarYear / LunarDay 接口，年柱六十甲子用立春切换的八字年柱
 *（与 bazi 模块保持一致，不会因跨立春导致两套年柱口径互相矛盾）。
 */

/** 富贵等级：上 / 中上 / 中 / 中下 / 下 */
export type ChengguLevel = 'top' | 'high' | 'middle' | 'low' | 'bottom'

/** 单首歌诀（51 首之一） */
export interface ChengguPoem {
  /** 骨重字符串表示："二两二钱" / "五两一钱" */
  weight: string
  /** 骨重数值（用于查找与校对）："2.2"、"5.1" */
  weightNumber: number
  /** 四句歌诀 */
  poem: string[]
  /** 富贵等级 */
  level: ChengguLevel
  /** 白话解读（单段 80 字左右） */
  description: string
}

/** 骨重来源明细（用于 UI 显示"庚午年 / 四月生 / 二十日 / 午时生"） */
export interface ChengguBreakdownCell {
  /** 来源描述（干支年 / 第 N 月 / 第 N 日 / 第 N 时辰） */
  label: string
  /** 骨重（两） */
  weight: number
}

/** 完整称骨结果 */
export interface ChengguResult {
  /** 总骨重（两），浮点 */
  totalWeight: number
  /** 总骨重显示："四两二钱"、"五两一钱" */
  displayWeight: string
  /** 四项分骨重及其来源说明 */
  breakdown: {
    year: ChengguBreakdownCell
    month: ChengguBreakdownCell
    day: ChengguBreakdownCell
    hour: ChengguBreakdownCell
  }
  /** 匹配到的歌诀 */
  poem: ChengguPoem
}
