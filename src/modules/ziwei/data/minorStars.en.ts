/**
 * Ziwei Doushu — 6 lucky + 6 malefic minor stars × 12 palaces (144 entries, English skeleton)
 *
 * STATUS: SKELETON — placeholder English text. Real text needs a professional
 *         translator with both Ziwei Doushu and English copywriting backgrounds.
 *
 * Verdicts ('ji'/'zhong'/'xiong') are kept identical to zh-CN; only the `text`
 * field needs human translation/rewrite.
 */
import type { MinorStarMatrix, MinorStarKey } from './minorStars'
import type { PalaceKey12 } from './palaceMajor'
import type { Verdict } from './palaceMajor'

const STAR_NAMES: Record<MinorStarKey, string> = {
  zuofu: 'Zuo Fu (left assistant)',
  youbi: 'You Bi (right assistant)',
  wenchang: 'Wen Chang (literary star)',
  wenqu: 'Wen Qu (artistic star)',
  tiankui: 'Tian Kui (yang nobleman)',
  tianyue: 'Tian Yue (yin nobleman)',
  qingyang: 'Qing Yang (sheep blade)',
  tuoluo: 'Tuo Luo (twisting hindrance)',
  huoxing: 'Huo Xing (fire star)',
  lingxing: 'Ling Xing (bell star)',
  dikong: 'Di Kong (earth void)',
  dijie: 'Di Jie (earth robber)',
}

const PALACE_NAMES: Record<PalaceKey12, string> = {
  ming: 'Life',
  xiongdi: 'Siblings',
  fuqi: 'Spouse',
  zinv: 'Children',
  caibo: 'Wealth',
  jie: 'Health',
  qianyi: 'Travel',
  jiaoyou: 'Friends',
  guanlu: 'Career',
  tianzhai: 'Property',
  fude: 'Fortune',
  fumu: 'Parents',
}

const placeholder = (star: string, palace: string): string =>
  `[EN draft] ${star} in ${palace} palace — interpretation pending professional translation.`

const buildSkeleton = (
  starKey: MinorStarKey,
  rows: Array<[PalaceKey12, Verdict]>,
): Record<PalaceKey12, { text: string; verdict: Verdict }> => {
  const result: Record<string, { text: string; verdict: Verdict }> = {}
  const starName = STAR_NAMES[starKey]
  for (const [palace, verdict] of rows) {
    result[palace] = { text: placeholder(starName, PALACE_NAMES[palace]), verdict }
  }
  return result as Record<PalaceKey12, { text: string; verdict: Verdict }>
}

/* eslint-disable max-len */

/**
 * Verdict matrices kept identical to zh-CN; English text awaits translation.
 */
export const MINOR_STARS_EN: MinorStarMatrix = {
  /* 6 Lucky */
  zuofu: buildSkeleton('zuofu', [
    ['ming', 'ji'], ['xiongdi', 'ji'], ['fuqi', 'ji'], ['zinv', 'ji'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'ji'], ['fumu', 'ji'],
  ]),
  youbi: buildSkeleton('youbi', [
    ['ming', 'ji'], ['xiongdi', 'ji'], ['fuqi', 'zhong'], ['zinv', 'ji'],
    ['caibo', 'zhong'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'zhong'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'ji'], ['fumu', 'ji'],
  ]),
  wenchang: buildSkeleton('wenchang', [
    ['ming', 'ji'], ['xiongdi', 'ji'], ['fuqi', 'ji'], ['zinv', 'ji'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'ji'], ['fumu', 'ji'],
  ]),
  wenqu: buildSkeleton('wenqu', [
    ['ming', 'ji'], ['xiongdi', 'zhong'], ['fuqi', 'zhong'], ['zinv', 'ji'],
    ['caibo', 'zhong'], ['jie', 'zhong'], ['qianyi', 'zhong'], ['jiaoyou', 'zhong'],
    ['guanlu', 'ji'], ['tianzhai', 'zhong'], ['fude', 'ji'], ['fumu', 'ji'],
  ]),
  tiankui: buildSkeleton('tiankui', [
    ['ming', 'ji'], ['xiongdi', 'ji'], ['fuqi', 'ji'], ['zinv', 'ji'],
    ['caibo', 'ji'], ['jie', 'ji'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'ji'], ['fumu', 'ji'],
  ]),
  tianyue: buildSkeleton('tianyue', [
    ['ming', 'ji'], ['xiongdi', 'ji'], ['fuqi', 'ji'], ['zinv', 'ji'],
    ['caibo', 'ji'], ['jie', 'zhong'], ['qianyi', 'ji'], ['jiaoyou', 'ji'],
    ['guanlu', 'ji'], ['tianzhai', 'ji'], ['fude', 'ji'], ['fumu', 'ji'],
  ]),
  /* 6 Malefic */
  qingyang: buildSkeleton('qingyang', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'xiong'],
    ['caibo', 'xiong'], ['jie', 'xiong'], ['qianyi', 'zhong'], ['jiaoyou', 'xiong'],
    ['guanlu', 'zhong'], ['tianzhai', 'xiong'], ['fude', 'xiong'], ['fumu', 'xiong'],
  ]),
  tuoluo: buildSkeleton('tuoluo', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'xiong'],
    ['caibo', 'xiong'], ['jie', 'xiong'], ['qianyi', 'xiong'], ['jiaoyou', 'xiong'],
    ['guanlu', 'xiong'], ['tianzhai', 'xiong'], ['fude', 'xiong'], ['fumu', 'xiong'],
  ]),
  huoxing: buildSkeleton('huoxing', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'xiong'],
    ['caibo', 'xiong'], ['jie', 'xiong'], ['qianyi', 'zhong'], ['jiaoyou', 'xiong'],
    ['guanlu', 'zhong'], ['tianzhai', 'xiong'], ['fude', 'xiong'], ['fumu', 'xiong'],
  ]),
  lingxing: buildSkeleton('lingxing', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'xiong'],
    ['caibo', 'xiong'], ['jie', 'xiong'], ['qianyi', 'xiong'], ['jiaoyou', 'xiong'],
    ['guanlu', 'xiong'], ['tianzhai', 'xiong'], ['fude', 'xiong'], ['fumu', 'xiong'],
  ]),
  dikong: buildSkeleton('dikong', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'xiong'],
    ['caibo', 'xiong'], ['jie', 'xiong'], ['qianyi', 'zhong'], ['jiaoyou', 'xiong'],
    ['guanlu', 'zhong'], ['tianzhai', 'xiong'], ['fude', 'ji'], ['fumu', 'xiong'],
  ]),
  dijie: buildSkeleton('dijie', [
    ['ming', 'zhong'], ['xiongdi', 'xiong'], ['fuqi', 'xiong'], ['zinv', 'xiong'],
    ['caibo', 'xiong'], ['jie', 'xiong'], ['qianyi', 'xiong'], ['jiaoyou', 'xiong'],
    ['guanlu', 'xiong'], ['tianzhai', 'xiong'], ['fude', 'xiong'], ['fumu', 'xiong'],
  ]),
}

/* eslint-enable max-len */
