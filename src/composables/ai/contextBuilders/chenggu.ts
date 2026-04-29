/**
 * 称骨算命模块的 AI 上下文构造器
 *
 * fingerprint 入参 = calendar / year / month / day / hour / gender，
 * chenggu 的 result 自己不带 birth 字段，调用方可在 userContext 里传 birth；
 * 这里走兜底：用 displayWeight + breakdown 内的"庚午年/四月生/二十日/午时生"等
 * label 作为 fingerprint 入参（足以保证"换生辰=换会话"语义）。
 */

import type { ChengguResult } from '@/modules/chenggu/types'
import type { ContextBuilder, AiContext } from './types'
import { buildFingerprintSync } from '../fingerprint'

const CHENGGU_PRESET_KEYS = [
  'chenggu.ai.preset.poemMeaning',
  'chenggu.ai.preset.weight',
  'chenggu.ai.preset.lifeOverview',
  'chenggu.ai.preset.improvement',
] as const

const LEVEL_LABEL_CN = {
  top: '上等',
  high: '中上',
  middle: '中等',
  low: '中下',
  bottom: '下等',
}
const LEVEL_LABEL_EN = {
  top: 'Top',
  high: 'High',
  middle: 'Middle',
  low: 'Low',
  bottom: 'Bottom',
}

export const chengguContextBuilder: ContextBuilder<ChengguResult> = {
  build({ chart, locale, userContext }) {
    const r = chart
    const displayLabel = `${r.displayWeight} · ${LEVEL_LABEL_CN[r.poem.level]}`
    const fingerprint = buildFingerprintSync('chenggu', {
      calendar: 'solar',
      yearLabel: r.breakdown.year.label,
      monthLabel: r.breakdown.month.label,
      dayLabel: r.breakdown.day.label,
      hourLabel: r.breakdown.hour.label,
      gender: userContext?.gender ?? 'male',
    })

    const narrative = locale === 'en'
      ? buildEnglishNarrative(r)
      : buildChineseNarrative(r)

    return {
      fingerprint,
      moduleId: 'chenggu',
      displayLabel,
      narrative,
      structured: {
        totalWeight: r.totalWeight,
        displayWeight: r.displayWeight,
        breakdown: r.breakdown,
        poem: r.poem,
      },
      presetPromptKeys: [...CHENGGU_PRESET_KEYS],
    } satisfies AiContext
  },
}

function buildChineseNarrative(r: ChengguResult): string {
  return `
## 称骨结果
- 总骨重：**${r.displayWeight}**（${r.totalWeight.toFixed(1)} 两）
- 等级：${LEVEL_LABEL_CN[r.poem.level]}

## 四骨明细
- 年柱：${r.breakdown.year.label}（${r.breakdown.year.weight} 两）
- 月柱：${r.breakdown.month.label}（${r.breakdown.month.weight} 两）
- 日柱：${r.breakdown.day.label}（${r.breakdown.day.weight} 两）
- 时柱：${r.breakdown.hour.label}（${r.breakdown.hour.weight} 两）

## 评诗
${r.poem.poem.map((line) => `> ${line}`).join('\n')}

## 白话解读
${r.poem.description}
`.trim()
}

function buildEnglishNarrative(r: ChengguResult): string {
  return `
## Bone-Weighing Result
- Total weight: **${r.displayWeight}** (${r.totalWeight.toFixed(1)} liang)
- Level: ${LEVEL_LABEL_EN[r.poem.level]}

## Per-Pillar Breakdown
- Year: ${r.breakdown.year.label} (${r.breakdown.year.weight} liang)
- Month: ${r.breakdown.month.label} (${r.breakdown.month.weight} liang)
- Day: ${r.breakdown.day.label} (${r.breakdown.day.weight} liang)
- Hour: ${r.breakdown.hour.label} (${r.breakdown.hour.weight} liang)

## Verse
${r.poem.poem.map((line) => `> ${line}`).join('\n')}

## Modern Interpretation
${r.poem.description}
`.trim()
}
