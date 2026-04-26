/**
 * 五行（Wu Xing）通用工具
 *
 * 术数共用原语：天干→五行、五行相生相克、阴阳判定。
 * 此文件本身**不被任何模块引用**（按"extract-only 不动 bazi"约定），
 * 是后续重构 / 新模块的可选基础设施。重构 bazi 时可逐处替换以收敛重复定义。
 *
 * 与 bazi 现状的对照（以下散落定义可在重构期收敛到本文件）：
 *   - bazi/types/index.ts        : `ElementName`
 *   - bazi/core/pattern.ts       : `STEM_ELEMENT` / `isYang` / `relation` / `stemTenGod`
 *   - bazi/core/bazi.ts          : `ELEMENT_NAMES` / `ELEMENT_SCORE_KEY`
 *   - bazi/components/ElementsRadar.vue : `ELEMENT_KEY`（中文 → 拼音 key）
 *
 * 术语来源：《滴天髓》《子平真诠》《三命通会》等公开经典中的天干五行 / 阴阳 / 生克关系。
 */

/** 五行中文名（与 tyme4ts Element.getName() 对齐） */
export type ElementName = '木' | '火' | '土' | '金' | '水'

/** 阴阳 */
export type YinYang = '阴' | '阳'

/** 五行 → 拼音 key，用于跨语言（en）渲染 / icon / class 选择 */
export type ElementPinyinKey = 'mu' | 'huo' | 'tu' | 'jin' | 'shui'

/** 五行 → 英文 score key，常用于权重对象字段 */
export type ElementScoreKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

/** 五行相生相克 5 种关系（站在 src 立场看 dst） */
export type ElementRelation =
  | 'same'         // src === dst
  | 'src_gen_dst'  // src 生 dst（如 木→火）
  | 'dst_gen_src'  // dst 生 src（如 水→木 时 src=木）
  | 'src_ke_dst'   // src 克 dst（如 木→土）
  | 'dst_ke_src'   // dst 克 src（如 金→木 时 src=木）

/** 五行固定顺序：木→火→土→金→水（用于相生循环） */
export const ELEMENT_NAMES: readonly ElementName[] = ['木', '火', '土', '金', '水'] as const

/** 中文 → 拼音 key（UI / class name 用） */
export const ELEMENT_PINYIN: Readonly<Record<ElementName, ElementPinyinKey>> = {
  木: 'mu',
  火: 'huo',
  土: 'tu',
  金: 'jin',
  水: 'shui',
} as const

/** 中文 → 英文 score key（数据对象字段用） */
export const ELEMENT_SCORE_KEY: Readonly<Record<ElementName, ElementScoreKey>> = {
  木: 'wood',
  火: 'fire',
  土: 'earth',
  金: 'metal',
  水: 'water',
} as const

/** 天干 → 五行 */
export const STEM_TO_ELEMENT: Readonly<Record<string, ElementName>> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
} as const

/** 阳干集合 */
const YANG_STEMS = new Set<string>(['甲', '丙', '戊', '庚', '壬'])

/**
 * 判断天干阴阳。
 * 输入未识别（不在十天干集合）时统一返回 false（视为阴），不抛异常 —— 调用方在术数语境
 * 中通常已保证输入合法；但为防御未来上游解析失败，保留宽容回退。
 */
export function isYangStem(stem: string): boolean {
  return YANG_STEMS.has(stem)
}

/**
 * 五行相生相克关系（站在 src 角度看 dst）。
 *
 * 实现以"木火土金水"5 元素环为基础：
 *   - i+1 → 相生（src 生 dst）
 *   - i-1 → 反生（dst 生 src）
 *   - i+2 → 相克（src 克 dst）
 *   - i+3 → 反克（dst 克 src）
 *   - i+0 → same
 *
 * 与 bazi/core/pattern.ts 中 `relation()` 的实现完全一致，仅做了类型与命名收敛。
 */
export function elementRelation(src: ElementName, dst: ElementName): ElementRelation {
  if (src === dst) return 'same'
  const i = ELEMENT_NAMES.indexOf(src)
  const j = ELEMENT_NAMES.indexOf(dst)
  const next = (i + 1) % 5
  const prev = (i + 4) % 5
  if (j === next) return 'src_gen_dst'
  if (j === prev) return 'dst_gen_src'
  const ke = (i + 2) % 5
  if (j === ke) return 'src_ke_dst'
  return 'dst_ke_src'
}

/** 由天干直接拿五行（封装 STEM_TO_ELEMENT 的 lookup，对 ts 严格模式更友好） */
export function stemElement(stem: string): ElementName | null {
  return STEM_TO_ELEMENT[stem] ?? null
}
