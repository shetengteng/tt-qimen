/**
 * Ziwei mock data — fixed sample for `1990-05-20 午时 · 男`.
 *
 * Mirrors the layout in `design/prototypes/{guofeng,minimal}/ziwei.html`.
 * 仅作为"未排盘 / 排盘失败"时的视觉占位与开发样本；
 * 运行时数据由 src/modules/ziwei/core/ziwei.ts 通过 iztro 真实计算产出。
 *
 * 12 个宫位按视觉位置（4×4 顺时针外圈）排列：
 *   index 0-3   : 巳午未申  （行 1）
 *   index 4     : 辰        （行 2 左）
 *   index 5     : 酉        （行 2 右）
 *   index 6     : 卯        （行 3 左）
 *   index 7     : 戌        （行 3 右）
 *   index 8-11  : 寅丑子亥  （行 4，从左到右）
 *
 * 中宫（grid 第 2-4 列、第 2-4 行）独立渲染，不进 palace 数组。
 *
 * `slot` 为 grid 位置 1..16（行优先），辰宫在 slot 5、酉宫在 slot 8、
 * 卯宫在 slot 9、戌宫在 slot 12，其余 slot 留给中宫占位。
 */

import type {
  DaxianCell,
  InterpretCard,
  Palace,
  PalaceKey,
  SihuaKey,
  SihuaPalaceMap,
  Star,
  XiaoxianCell,
} from '../types'

export type {
  DaxianCell,
  InterpretCard,
  Palace,
  PalaceKey,
  SihuaKey,
  SihuaPalaceMap,
  Star,
  XiaoxianCell,
}

/** 排盘元信息 */
export const meta = {
  solar: '1990-05-20 午时',
  lunar: '庚午年 四月廿七',
  fiveElementsClass: '木三局',
  qiyunAge: 3,
  mingZhu: '破军',
  shenZhu: '七杀',
  doujun: '正月 子时',
  ownerName: '某某',
  gender: '男',
  currentAge: 36,
  currentYear: 2026,
  currentYearGz: '丙午',
} as const

/** 12 宫位 — 顺序：与原型 HTML 的渲染顺序一致 */
export const palaces: Palace[] = [
  // 行 1（slot 1-4）
  {
    key: 'fumu', slot: 1, ganzhi: '辛巳',
    changsheng12: '博士', daxianRange: '46-55',
    stars: [
      { name: '天同', kind: 'main', brightness: '平' },
      { name: '太阴', kind: 'main', brightness: '陷', sihua: 'ke' },
      { name: '文昌', kind: 'aux' },
      { name: '左辅', kind: 'aux' },
    ],
  },
  {
    key: 'fude', slot: 2, ganzhi: '壬午',
    changsheng12: '力士', daxianRange: '56-65',
    stars: [
      { name: '武曲', kind: 'main', brightness: '庙', sihua: 'quan' },
      { name: '天府', kind: 'main', brightness: '旺' },
      { name: '天魁', kind: 'aux' },
    ],
  },
  {
    key: 'tianzhai', slot: 3, ganzhi: '癸未',
    changsheng12: '青龙', daxianRange: '66-75',
    stars: [
      { name: '太阳', kind: 'main', brightness: '庙' },
      { name: '右弼', kind: 'aux' },
      { name: '擎羊', kind: 'malefic' },
    ],
  },
  {
    key: 'guanlu', slot: 4, ganzhi: '甲申',
    changsheng12: '小耗', daxianRange: '76-85',
    stars: [
      { name: '破军', kind: 'main', brightness: '得' },
      { name: '文曲', kind: 'aux' },
      { name: '地劫', kind: 'malefic' },
    ],
  },

  // 行 2（slot 5、8）
  {
    key: 'ming', slot: 5, isMing: true, ganzhi: '庚辰',
    changsheng12: '将军', daxianRange: '36-45',
    stars: [
      { name: '紫微', kind: 'main', brightness: '庙' },
      { name: '贪狼', kind: 'main', brightness: '平', sihua: 'lu' },
      { name: '天钺', kind: 'aux' },
      { name: '禄存', kind: 'aux' },
    ],
  },
  {
    key: 'jiaoyou', slot: 8, ganzhi: '乙酉',
    changsheng12: '奏书', daxianRange: '86-95',
    stars: [
      { name: '天机', kind: 'main', brightness: '旺' },
      { name: '天马', kind: 'aux' },
    ],
  },

  // 行 3（slot 9、12）
  {
    key: 'xiongdi', slot: 9, ganzhi: '己卯',
    changsheng12: '飞廉', daxianRange: '26-35',
    stars: [
      { name: '天机', kind: 'main', brightness: '庙' },
      { name: '天姚', kind: 'aux' },
    ],
  },
  {
    key: 'qianyi', slot: 12, ganzhi: '丙戌',
    changsheng12: '喜神', daxianRange: '96-105',
    stars: [
      { name: '天相', kind: 'main', brightness: '得' },
      { name: '陀罗', kind: 'malefic' },
    ],
  },

  // 行 4（slot 13-16）
  {
    key: 'fuqi', slot: 13, ganzhi: '戊寅',
    changsheng12: '病符', daxianRange: '16-25',
    stars: [
      { name: '七杀', kind: 'main', brightness: '庙' },
      { name: '地空', kind: 'aux' },
    ],
  },
  {
    key: 'zinv', slot: 14, ganzhi: '己丑',
    changsheng12: '大耗', daxianRange: '—',
    stars: [
      { name: '天梁', kind: 'main', brightness: '庙', sihua: 'ji' },
      { name: '火星', kind: 'malefic' },
    ],
  },
  {
    key: 'caibo', slot: 15, ganzhi: '戊子',
    changsheng12: '伏兵', daxianRange: '—',
    stars: [
      { name: '廉贞', kind: 'main', brightness: '平' },
      { name: '铃星', kind: 'malefic' },
    ],
  },
  {
    key: 'jie', slot: 16, isShen: true, ganzhi: '丁亥',
    changsheng12: '官府', daxianRange: '—',
    stars: [
      { name: '巨门', kind: 'main', brightness: '得' },
      { name: '天巫', kind: 'aux' },
    ],
  },
]

/** 本命四化所落宫位 — 用于解读卡 + 图例 */
export const sihuaMap: SihuaPalaceMap = {
  lu:   { star: '贪狼', palaceKey: 'ming' },
  quan: { star: '武曲', palaceKey: 'fude' },
  ke:   { star: '太阴', palaceKey: 'fumu' },
  ji:   { star: '天梁', palaceKey: 'zinv' },
}

/** 大限 · 10 段 */
export const daxianCells: DaxianCell[] = [
  { age: '6-15',   palaceKey: 'fumu',     ganzhi: '辛巳' },
  { age: '16-25',  palaceKey: 'fuqi',     ganzhi: '戊寅' },
  { age: '26-35',  palaceKey: 'xiongdi',  ganzhi: '己卯' },
  { age: '36-45',  palaceKey: 'ming',     ganzhi: '庚辰', current: true },
  { age: '46-55',  palaceKey: 'fumu',     ganzhi: '辛巳' },
  { age: '56-65',  palaceKey: 'fude',     ganzhi: '壬午' },
  { age: '66-75',  palaceKey: 'tianzhai', ganzhi: '癸未' },
  { age: '76-85',  palaceKey: 'guanlu',   ganzhi: '甲申' },
  { age: '86-95',  palaceKey: 'jiaoyou',  ganzhi: '乙酉' },
  { age: '96+',    palaceKey: 'qianyi',   ganzhi: '丙戌' },
]

/** 小限 · 6 段（当前 ±2） */
export const xiaoxianCells: XiaoxianCell[] = [
  { year: 2024, palaceKey: 'fumu',     ganzhi: '甲辰' },
  { year: 2025, palaceKey: 'ming',     ganzhi: '乙巳' },
  { year: 2026, palaceKey: 'fude',     ganzhi: '丙午', current: true },
  { year: 2027, palaceKey: 'tianzhai', ganzhi: '丁未' },
  { year: 2028, palaceKey: 'guanlu',   ganzhi: '戊申' },
  { year: 2029, palaceKey: 'jiaoyou',  ganzhi: '己酉' },
]

/** 解读卡 tags（文案在 i18n） */
export const interpretCards: InterpretCard[] = [
  {
    key: 'mingPalace',
    tags: [
      { label: '贪狼化禄', tone: 'accent' },
      { label: '紫微庙', tone: 'gold' },
      { label: '禄存 · 聚财', tone: 'jade' },
    ],
  },
  {
    key: 'sihua',
    tags: [
      { label: '禄入命', tone: 'jade' },
      { label: '权入福', tone: 'gold' },
      { label: '科入父', tone: 'plain' },
      { label: '忌入子', tone: 'danger' },
    ],
  },
  {
    key: 'minorStars',
    tags: [
      { label: '昌曲交会', tone: 'accent' },
      { label: '羊陀煞曜', tone: 'danger' },
      { label: '火铃散作', tone: 'plain' },
    ],
  },
  {
    key: 'shenZhu',
    tags: [
      { label: '口舌事业', tone: 'accent' },
      { label: '破军 · 变革', tone: 'plain' },
      { label: '创新路线', tone: 'success' },
    ],
  },
]

/** 三方四正 — MVP 写死命宫的三方四正定义 */
export const sanfangSiZheng = {
  benming: 'ming' as PalaceKey,
  triad: ['ming', 'caibo', 'guanlu'] as PalaceKey[],
  duigong: 'qianyi' as PalaceKey,
} as const
