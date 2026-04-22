/**
 * 观音灵签（Lingqian）类型定义
 *
 * 数据结构严格对齐 design/modules/13-观音灵签模块.md §2。
 * 100 签数据延迟落库，当前内置 6-12 签精选样本（覆盖六等级）；
 * 接口结构稳定，未来直接替换 data/items.ts / 加载远程 JSON 即可。
 */

/** 六等级（按设计文档枚举顺序） */
export type LingqianLevel = '上上' | '上吉' | '中吉' | '中平' | '中凶' | '下下'

/** 6 大分类指引（设计文档 §2 + §4 表 6 项 tab） */
export interface LingqianTopics {
  family: string
  marriage: string
  career: string
  wealth: string
  travel: string
  health: string
}

/** 单签完整条目 */
export interface LingqianItem {
  /** 1-100 */
  id: number
  /** 等级 */
  level: LingqianLevel
  /** 典故名（如「钟离成道」） */
  title: string
  /** 4 句签诗（古文，不翻译） */
  poem: [string, string, string, string]
  /** 解曰：白话解读 */
  jieyue: string
  /** 仙机：分类总引言 */
  xianji: string
  /** 6 大分类指引 */
  topics: LingqianTopics
}

/** 用户在输入区选择的占问领域（影响 UI 默认 tab，不影响算法） */
export type LingqianTopicKey = keyof LingqianTopics | 'overall'

export interface LingqianResult {
  /** 抽到的签 */
  item: LingqianItem
  /** 抽签时间戳（用于分享卡水印） */
  drawnAt: number
  /** 用户心中所问（可选） */
  question?: string
  /** 用户填写的占问领域（用于结果优先 tab） */
  topic: LingqianTopicKey
}
