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

/**
 * 古文原文备份（与白话主字段并存）。
 * - UI 默认展示主字段（白话）；提供「查看古文原文」开关时读取 raw.*
 * - 旧签（未做白话重写）允许 raw 缺失，UI 应判空兜底
 */
export interface LingqianRaw {
  jieyue: string
  xianji: string
  topics: LingqianTopics
  diangu?: string
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
  /** 解曰：现代白话总论（60-100 字） */
  jieyue: string
  /** 仙机：现代白话分类引言（80-150 字） */
  xianji: string
  /** 6 大分类指引（每条现代白话 25-50 字，含「现状判断 + 行动建议」） */
  topics: LingqianTopics
  /**
   * 典故释义：title 背后的历史典故白话简介（如「钟离成道」= 汉钟离悟道修仙典故）。
   * 部分签可能为空字符串（公版未载典故段）；UI 应判空降级。
   */
  diangu?: string
  /**
   * 古文原文备份（公版未经白话化的字段值）。
   * - 仅"已做白话重写"的签会带 raw（迁移期内非全量必填）
   * - 用于 UI「查看古文原文」开关与学者用户对照原典
   */
  raw?: LingqianRaw
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
