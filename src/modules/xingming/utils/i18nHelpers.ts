/**
 * 姓名学模块 i18n helpers
 *
 * 用途：将算法层产出的中文枚举（element/level）映射到全局 i18n key，
 *      以便 UI 在 zh-CN/zh-TW/en 三语下统一展示。
 *
 * - element：复用项目级 `terms.wuxing.{wood|fire|earth|metal|water}`
 * - level：复用模块级 `xingming.levels.{大吉|吉|中吉|中平|凶|大凶}`（仍以中文做 key，三语本身已落项）
 */

import type { Element, Level } from '../types'

const ELEMENT_KEY: Record<Element, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
  木: 'wood',
  火: 'fire',
  土: 'earth',
  金: 'metal',
  水: 'water',
}

/** 五行字符 → 全局 i18n path（`terms.wuxing.*`） */
export function elementI18nPath(el: Element): string {
  return `terms.wuxing.${ELEMENT_KEY[el]}`
}

/** 等级 → 模块 i18n path（`xingming.levels.*`） */
export function levelI18nPath(lv: Level): string {
  return `xingming.levels.${lv}`
}
