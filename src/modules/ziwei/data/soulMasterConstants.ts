/**
 * 紫微斗数 · 命主/身主常量与中文星名 mapping（独立于 soulMaster 大数据矩阵）
 *
 * 设计动机：与 sihuaConstants.ts 同理，把数百字节的 ZH_MING_SHEN_TO_KEY
 * 从 soulMaster.ts（含 ~9KB 大矩阵）抽出，让 data/index.ts 同步 import 时
 * 不会牵连大矩阵进入主 bundle。
 */

/**
 * 命主 / 身主可能的星名 stable key（与 iztro 中文输出对齐）
 *
 * 本表覆盖命主 7 + 身主 6 = 13 颗 union（部分星同时是命主和身主候选，如文昌）。
 * 不在 union 内的星名（如"七杀"作另说身主）会回退到 fallback。
 */
export type MingShenStarKey =
  // 命主候选 7 颗（以命宫地支起）
  | 'tanlang'    // 贪狼 (子)
  | 'jumen'      // 巨门 (丑/亥)
  | 'lucun'      // 禄存 (寅/戌)
  | 'wenqu'      // 文曲 (卯/酉)
  | 'lianzhen'   // 廉贞 (辰/申)
  | 'wuqu'       // 武曲 (巳/未)
  | 'pojun'      // 破军 (午)
  // 身主候选 6 颗（以生年地支起）
  | 'huoxing'    // 火星 (子/午)
  | 'tianxiang'  // 天相 (丑/未)
  | 'tianliang'  // 天梁 (寅/申)
  | 'tiantong'   // 天同 (卯/酉)
  | 'wenchang'   // 文昌 (辰/戌)
  | 'tianji'     // 天机 (巳/亥)

/** iztro 中文星名 → 项目 key */
export const ZH_MING_SHEN_TO_KEY: Record<string, MingShenStarKey> = {
  贪狼: 'tanlang',
  巨门: 'jumen',
  禄存: 'lucun',
  文曲: 'wenqu',
  廉贞: 'lianzhen',
  武曲: 'wuqu',
  破军: 'pojun',
  火星: 'huoxing',
  天相: 'tianxiang',
  天梁: 'tianliang',
  天同: 'tiantong',
  文昌: 'wenchang',
  天机: 'tianji',
} as const

export type MingShenRole = 'ming' | 'shen'
