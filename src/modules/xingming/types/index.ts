/**
 * 姓名学模块类型定义（五格剖象法 · 熊崎健翁流派）
 *
 * 对齐设计文档 design/modules/14-姓名学模块.md §2
 * 原型参考 design/prototypes/{guofeng,minimal}/xingming.html
 *
 * isClassical 约定：81 数理描述为现代化编辑整理（非古籍逐条可溯源），
 * UI 层不额外标注，延续项目"非古籍 UI 隐含"的规范。
 */

/** 五行 */
export type Element = '木' | '火' | '土' | '金' | '水'

/** 吉凶等级（6 档） */
export type Level = '大吉' | '吉' | '中吉' | '中平' | '凶' | '大凶'

/** 五格名 */
export type GridName = 'tian' | 'ren' | 'di' | 'wai' | 'zong'

/** 性别（姓名学部分流派三才配置用；MVP 保留入参但不参与计算） */
export type Gender = 'male' | 'female'

/** 单条 81 数理 */
export interface NumerologyEntry {
  /** 1..81 */
  number: number
  /** 吉凶等级 */
  level: Level
  /** 五行（按数字末位推衍：1/2=木 3/4=火 5/6=土 7/8=金 9/0=水） */
  element: Element
  /** 一句话评价（10-15 字） */
  summary: string
  /** 现代白话解读（70-110 字） */
  description: string
}

/** 字符笔画明细（展示 + 调试用） */
export interface CharStroke {
  /** 字形 */
  char: string
  /** 康熙笔画（姓名学计算口径） */
  kangxi: number
  /** 简化笔画（展示用，多数字与康熙相同） */
  simplified: number
  /** 该字属性五行（按康熙笔画末位） */
  element: Element
}

/** 单格信息（天/人/地/外/总共用） */
export interface GridInfo {
  /** 本格数值 */
  number: number
  /** 对应 81 数理条目（含吉凶 + 五行 + 解读） */
  entry: NumerologyEntry
}

/** 输入参数 */
export interface XingmingInput {
  /** 姓氏（1-2 字） */
  surname: string
  /** 名字（1-2 字） */
  givenName: string
  /** 性别（MVP 保留不使用） */
  gender: Gender
  /** 出生年（MVP 保留不使用，可选） */
  birthYear?: number | null
}

/** 综合评分档位 key（用于 i18n 拼接，避免中文硬编码穿透到 UI） */
export type OverallBadgeKey = 'excellent' | 'good' | 'fair' | 'poor'

/** 完整结果 */
export interface XingmingResult {
  /** 全名（姓 + 名拼接） */
  fullName: string
  /** 姓氏长度（1 单姓 / 2 复姓） */
  surnameLen: 1 | 2
  /** 名字长度（1 单名 / 2 双名） */
  givenLen: 1 | 2
  /** 每字笔画明细 */
  chars: CharStroke[]
  /** 五格 */
  grids: Record<GridName, GridInfo>
  /** 综合评分 0-100 */
  overallScore: number
  /** 综合评分档位（对应 6 档的简化 4 档显示：优/良/中/差） */
  overallBadge: '优' | '良' | '中' | '差'
  /** 综合评分档位 key（i18n 用） */
  overallBadgeKey: OverallBadgeKey
}

/** 加载状态（UI 侧骨架屏用） */
export interface XingmingComputeState {
  loading: boolean
  error: string | null
  result: XingmingResult | null
}
