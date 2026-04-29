/**
 * 姓名学（五格剖象）模块的 AI 上下文构造器
 *
 * fingerprint 入参 = name / gender / calendar / year / month / day
 * 其中 name = surname + givenName 拼接，calendar 占位 'solar'。
 */

import type { XingmingResult, GridName } from '@/modules/xingming/types'
import type { ContextBuilder, AiContext } from './types'
import { buildFingerprintSync } from '../fingerprint'

const XINGMING_PRESET_KEYS = [
  'xingming.ai.preset.nameMeaning',
  'xingming.ai.preset.nameStrength',
  'xingming.ai.preset.improvement',
  'xingming.ai.preset.compatibility',
] as const

const GRID_LABEL_CN: Record<GridName, string> = {
  tian: '天格',
  ren: '人格',
  di: '地格',
  wai: '外格',
  zong: '总格',
}
const GRID_LABEL_EN: Record<GridName, string> = {
  tian: 'Heaven',
  ren: 'Person',
  di: 'Earth',
  wai: 'Outer',
  zong: 'Total',
}

const GRID_ORDER: GridName[] = ['tian', 'ren', 'di', 'wai', 'zong']

export const xingmingContextBuilder: ContextBuilder<XingmingResult> = {
  build({ chart, locale, userContext }) {
    const r = chart
    const displayLabel = `${r.fullName} · ${r.overallBadge} · ${r.overallScore} 分`
    const fingerprint = buildFingerprintSync('xingming', {
      name: r.fullName,
      gender: userContext?.gender ?? 'male',
      calendar: 'solar',
      year: 0,
      month: 0,
      day: 0,
    })

    const narrative = locale === 'en'
      ? buildEnglishNarrative(r)
      : buildChineseNarrative(r)

    return {
      fingerprint,
      moduleId: 'xingming',
      displayLabel,
      narrative,
      structured: {
        fullName: r.fullName,
        chars: r.chars,
        grids: r.grids,
        sancai: r.sancai,
        overallScore: r.overallScore,
        overallBadge: r.overallBadge,
      },
      presetPromptKeys: [...XINGMING_PRESET_KEYS],
    } satisfies AiContext
  },
}

function buildChineseNarrative(r: XingmingResult): string {
  const charLines = r.chars.map((c) => `- ${c.char}：康熙 ${c.kangxi} 画，五行 ${c.element}`).join('\n')
  const gridLines = GRID_ORDER.map((k) => {
    const g = r.grids[k]
    return `- ${GRID_LABEL_CN[k]}：${g.number}（${g.entry.level}・${g.entry.element}）— ${g.entry.summary}`
  }).join('\n')

  return `
## 姓名信息
- 全名：${r.fullName}
- 综合评分：**${r.overallScore} / 100**（${r.overallBadge}）

## 笔画明细
${charLines}

## 五格数理
${gridLines}

## 三才配置
- 三才（天-人-地）：${r.sancai.combo.join('-')}
- 五行关系：天→人 ${r.sancai.tianToRen}；人→地 ${r.sancai.renToDi}
- 等级：${r.sancai.level}
- 一句话定性：${r.sancai.summary}

## 主格详解（人格）
${r.grids.ren.entry.description}

## 总格详解
${r.grids.zong.entry.description}
`.trim()
}

function buildEnglishNarrative(r: XingmingResult): string {
  const charLines = r.chars.map((c) => `- ${c.char}: ${c.kangxi} strokes (Kangxi), element ${c.element}`).join('\n')
  const gridLines = GRID_ORDER.map((k) => {
    const g = r.grids[k]
    return `- ${GRID_LABEL_EN[k]}: ${g.number} (${g.entry.level}, ${g.entry.element}) — ${g.entry.summary}`
  }).join('\n')

  return `
## Name
- Full name: ${r.fullName}
- Overall score: **${r.overallScore} / 100** (${r.overallBadge})

## Stroke Counts
${charLines}

## Five Grids (numerology)
${gridLines}

## San-Cai (Three-Talents)
- Combo (Heaven-Person-Earth): ${r.sancai.combo.join('-')}
- Relations: Heaven→Person ${r.sancai.tianToRen}; Person→Earth ${r.sancai.renToDi}
- Level: ${r.sancai.level}
- Verdict: ${r.sancai.summary}

## Person Grid (primary)
${r.grids.ren.entry.description}

## Total Grid
${r.grids.zong.entry.description}
`.trim()
}
