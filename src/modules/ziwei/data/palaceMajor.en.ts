/**
 * Ziwei Doushu — Major star × palace brief interpretations (168 entries, English skeleton)
 *
 * STATUS: SKELETON — placeholder English text. Real text needs a professional
 *         translator with both Ziwei Doushu and English copywriting backgrounds.
 *
 * Verdicts ('ji'/'zhong'/'xiong') are kept identical to zh-CN; only the `text`
 * field needs human translation/rewrite.
 */

import type { MajorStarKey } from './soulPalace'
import type { PalaceMajorMatrix } from './palaceMajor'

const placeholder = (star: string, palace: string): string =>
  `[EN draft] ${star} in ${palace} palace — interpretation pending professional translation.`

const buildSkeleton = (
  star: string,
  rows: Array<[string, 'ji' | 'zhong' | 'xiong']>,
): Record<string, { text: string; verdict: 'ji' | 'zhong' | 'xiong' }> => {
  const result: Record<string, { text: string; verdict: 'ji' | 'zhong' | 'xiong' }> = {}
  for (const [palace, verdict] of rows) {
    result[palace] = { text: placeholder(star, palace), verdict }
  }
  return result
}

/* eslint-disable max-len */
export const PALACE_MAJOR_EN: PalaceMajorMatrix = {
  ziwei: buildSkeleton('Ziwei', [
    ['ming', 'ji'], ['xiongdi', 'zhong'], ['fuqi', 'zhong'], ['zinv', 'zhong'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'zhong'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['ziwei'],
  tianji: buildSkeleton('Tianji', [
    ['ming', 'zhong'], ['xiongdi', 'zhong'], ['fuqi', 'zhong'], ['zinv', 'zhong'],
    ['caibo', 'zhong'], ['jie', 'zhong'], ['qianyi', 'zhong'], ['jiaoyou', 'zhong'],
    ['guanlu', 'ji'], ['tianzhai', 'zhong'], ['fude', 'zhong'], ['fumu', 'ji'],
  ]) as PalaceMajorMatrix['tianji'],
  taiyang: buildSkeleton('Taiyang', [
    ['ming', 'ji'], ['xiongdi', 'zhong'], ['fuqi', 'zhong'], ['zinv', 'zhong'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'zhong'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['taiyang'],
  wuqu: buildSkeleton('Wuqu', [
    ['ming', 'zhong'], ['xiongdi', 'zhong'], ['fuqi', 'xiong'], ['zinv', 'zhong'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'zhong'], ['jiaoyou', 'zhong'],
    ['guanlu', 'ji'], ['tianzhai', 'zhong'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['wuqu'],
  tiantong: buildSkeleton('Tiantong', [
    ['ming', 'zhong'], ['xiongdi', 'ji'], ['fuqi', 'ji'], ['zinv', 'ji'],
    ['caibo', 'zhong'], ['jie', 'zhong'], ['qianyi', 'zhong'], ['jiaoyou', 'zhong'],
    ['guanlu', 'zhong'], ['tianzhai', 'ji'], ['fude', 'ji'], ['fumu', 'ji'],
  ]) as PalaceMajorMatrix['tiantong'],
  lianzhen: buildSkeleton('Lianzhen', [
    ['ming', 'zhong'], ['xiongdi', 'zhong'], ['fuqi', 'zhong'], ['zinv', 'zhong'],
    ['caibo', 'zhong'], ['jie', 'xiong'], ['qianyi', 'zhong'], ['jiaoyou', 'zhong'],
    ['guanlu', 'zhong'], ['tianzhai', 'zhong'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['lianzhen'],
  tianfu: buildSkeleton('Tianfu', [
    ['ming', 'ji'], ['xiongdi', 'ji'], ['fuqi', 'ji'], ['zinv', 'ji'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'ji'], ['fumu', 'ji'],
  ]) as PalaceMajorMatrix['tianfu'],
  taiyin: buildSkeleton('Taiyin', [
    ['ming', 'zhong'], ['xiongdi', 'zhong'], ['fuqi', 'ji'], ['zinv', 'ji'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['taiyin'],
  tanlang: buildSkeleton('Tanlang', [
    ['ming', 'zhong'], ['xiongdi', 'zhong'], ['fuqi', 'zhong'], ['zinv', 'zhong'],
    ['caibo', 'zhong'], ['jie', 'zhong'], ['qianyi', 'zhong'], ['jiaoyou', 'zhong'],
    ['guanlu', 'ji'], ['tianzhai', 'zhong'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['tanlang'],
  jumen: buildSkeleton('Jumen', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'zhong'],
    ['caibo', 'zhong'], ['jie', 'zhong'], ['qianyi', 'zhong'], ['jiaoyou', 'xiong'],
    ['guanlu', 'ji'], ['tianzhai', 'zhong'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['jumen'],
  tianxiang: buildSkeleton('Tianxiang', [
    ['ming', 'ji'], ['xiongdi', 'ji'], ['fuqi', 'ji'], ['zinv', 'ji'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'ji'], ['fumu', 'ji'],
  ]) as PalaceMajorMatrix['tianxiang'],
  tianliang: buildSkeleton('Tianliang', [
    ['ming', 'ji'], ['xiongdi', 'ji'], ['fuqi', 'zhong'], ['zinv', 'ji'],
    ['caibo', 'zhong'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'zhong'], ['fumu', 'ji'],
  ]) as PalaceMajorMatrix['tianliang'],
  qisha: buildSkeleton('Qisha', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'xiong'],
    ['caibo', 'zhong'], ['jie', 'xiong'], ['qianyi', 'zhong'], ['jiaoyou', 'zhong'],
    ['guanlu', 'ji'], ['tianzhai', 'zhong'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['qisha'],
  pojun: buildSkeleton('Pojun', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'zhong'],
    ['caibo', 'zhong'], ['jie', 'xiong'], ['qianyi', 'zhong'], ['jiaoyou', 'zhong'],
    ['guanlu', 'ji'], ['tianzhai', 'zhong'], ['fude', 'zhong'], ['fumu', 'zhong'],
  ]) as PalaceMajorMatrix['pojun'],
}
/* eslint-enable max-len */
