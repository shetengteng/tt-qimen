/**
 * 紫微斗数 · 四化常量与天干 mapping（独立于 sihuaReading 大数据矩阵）
 *
 * 设计动机：
 *  - sihuaReading.ts 含有 ~16KB 的 SIHUA_READING_ZH_CN 矩阵，走 lazy chunk
 *  - 但其中的 ZH_STEM_TO_KEY / STEM_SIHUA_TABLE 是几十字节的纯静态映射，且
 *    UI（如 SihuaReadingView）需要在派生 stemKey 时同步使用
 *  - 抽到独立文件，data/index.ts 同步 import 时不会牵连大矩阵进入主 bundle
 */

import type { SihuaKey } from '../types'

/** 10 天干 stable key（与 iztro 中文天干名一一对应） */
export type HeavenlyStemKey =
  | 'jia'   // 甲
  | 'yi'    // 乙
  | 'bing'  // 丙
  | 'ding'  // 丁
  | 'wu'    // 戊
  | 'ji'    // 己
  | 'geng'  // 庚
  | 'xin'   // 辛
  | 'ren'   // 壬
  | 'gui'   // 癸

/** iztro 中文天干 → 项目 key */
export const ZH_STEM_TO_KEY: Record<string, HeavenlyStemKey> = {
  甲: 'jia',
  乙: 'yi',
  丙: 'bing',
  丁: 'ding',
  戊: 'wu',
  己: 'ji',
  庚: 'geng',
  辛: 'xin',
  壬: 'ren',
  癸: 'gui',
} as const

/**
 * 十天干四化口诀（紫微斗数标准对应表）
 *
 * 古训："甲廉破武阳，乙机梁紫阴，丙同机昌廉，丁阴同机巨，戊贪阴右机，
 *        己武贪梁曲，庚阳武府同，辛巨阳曲昌，壬梁紫府武，癸破巨阴贪。"
 *
 * 每行依次为该天干 → 化禄 / 化权 / 化科 / 化忌 所附的星。
 *
 * 此表是"四化论命"的 40 段数据自然 key，UI 在用户命/大限/流年天干被解析后
 * 可一键查到该天干的"禄/权/科/忌四星" + 对应论断。
 */
export const STEM_SIHUA_TABLE: Record<HeavenlyStemKey, Record<SihuaKey, string>> = {
  jia:  { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' },
  yi:   { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' },
  bing: { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' },
  ding: { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' },
  wu:   { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' },
  ji:   { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' },
  geng: { lu: '太阳', quan: '武曲', ke: '天府', ji: '天同' },
  xin:  { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' },
  ren:  { lu: '天梁', quan: '紫微', ke: '天府', ji: '武曲' },
  gui:  { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' },
}
