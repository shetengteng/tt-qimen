/**
 * 周公解梦（Jiemeng）类型定义
 *
 * 数据结构对齐 design/modules/16-周公解梦模块.md §2 与
 * design/prototypes/{minimal,guofeng}/jiemeng.html 原型。
 * 词条数量在 MVP 阶段先用约 40 条精选样本；接口保持稳定，
 * 后续替换为懒加载 JSON 即可（参考附录 A 的获取步骤）。
 */

/** 8 大传统分类（对齐原型图表 §4.8 实际显示顺序） */
export type DreamCategoryKey =
  | 'animal'
  | 'people'
  | 'nature'
  | 'body'
  | 'life'
  | 'ghost'
  | 'building'
  | 'other'

export interface DreamCategory {
  key: DreamCategoryKey
  /** 装饰符号（原型保留了几何符号风格） */
  icon: string
}

/** 语气标签，用于结果列表显示（原型用 badge 呈现） */
export type DreamTag = 'auspicious' | 'cautious' | 'ambiguous' | 'neutral'

export interface DreamEntry {
  /** 词条 id，稳定自增不可重复 */
  id: string
  /** 主标题，搜索与结果列表展示 */
  title: string
  /** 所属分类 */
  category: DreamCategoryKey
  /** 搜索关键词（包含同义词 / 衍生词，用于 fuse 模糊匹配） */
  keywords: readonly string[]
  /** 结果列表的一句话预览（古籍 + 现代合并简述） */
  summary: string
  /** 古籍原文（保留古汉语，不翻译） */
  classical: string
  /** 古籍出处（默认"《周公解梦》公版古籍"） */
  classicalSource?: string
  /** 现代心理学解读段落（可多段） */
  modern: readonly string[]
  /** 现代建议（可空；置顶高亮显示） */
  advice?: string
  /** 标签，用于结果列表下方的 badge（最多 3 个） */
  tags?: readonly DreamTag[]
}

/** 搜索一次的结果快照 */
export interface DreamSearchResult {
  /** 原始 query（去空白后） */
  query: string
  /** fuse 返回的词条（已按相关度排序） */
  items: readonly DreamEntry[]
  /** 为 query 匹配到的结果总数（与 items.length 一致，保留语义） */
  total: number
}

/** 分类筛选快照 */
export interface DreamCategoryResult {
  category: DreamCategoryKey
  items: readonly DreamEntry[]
  total: number
}
