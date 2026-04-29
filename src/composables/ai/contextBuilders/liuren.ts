/**
 * 小六壬模块的 AI 上下文构造器
 *
 * 小六壬的"命盘"是一次性的占问结果（PalaceReading），与生辰无关；
 * fingerprint 入参取起卦时的农历月/日/时（精确到分秒），
 * 让"同一时辰同一问"复用会话、不同时间点重新起卦切到新会话。
 */

import type { LiurenResult } from '@/modules/liuren/types'
import type { ContextBuilder, AiContext } from './types'
import { buildFingerprintSync } from '../fingerprint'

const LIUREN_PRESET_KEYS = [
  'liuren.ai.preset.thisQuestion',
  'liuren.ai.preset.palaceMeaning',
  'liuren.ai.preset.timing',
  'liuren.ai.preset.outcome',
] as const

export const liurenContextBuilder: ContextBuilder<LiurenResult> = {
  build({ chart, locale }) {
    const r = chart
    const displayLabel = `${r.palace.name} · ${r.lunarDateLabel} ${r.hourBranchLabel}`
    const fingerprint = buildFingerprintSync('liuren', {
      year: new Date().getFullYear(),
      month: r.steps.month,
      day: r.steps.day,
      hour: r.steps.hour,
      minute: 0,
      second: 0,
    })

    const narrative = locale === 'en'
      ? buildEnglishNarrative(r)
      : buildChineseNarrative(r)

    return {
      fingerprint,
      moduleId: 'liuren',
      displayLabel,
      narrative,
      structured: {
        palaceName: r.palace.name,
        jiXiong: r.palace.jiXiong,
        element: r.palace.element,
        tag: r.palace.tag,
        readings: r.palace.readings,
        suitable: r.palace.suitable,
        avoid: r.palace.avoid,
        path: r.path,
        steps: r.steps,
        aspect: r.aspect,
        question: r.question ?? null,
        lunarDateLabel: r.lunarDateLabel,
        hourBranchLabel: r.hourBranchLabel,
      },
      presetPromptKeys: [...LIUREN_PRESET_KEYS],
    } satisfies AiContext
  },
}

function buildChineseNarrative(r: LiurenResult): string {
  const aspectLabel: Record<typeof r.aspect, string> = {
    overall: '综合',
    career: '事业',
    love: '感情',
    wealth: '财运',
    health: '健康',
    travel: '出行',
  }

  const readingLines = (Object.entries(r.palace.readings) as Array<[keyof typeof r.palace.readings, string]>)
    .map(([k, v]) => `- ${aspectLabel[k]}：${v}`)
    .join('\n')

  return `
## 占问信息
- 起卦时辰：${r.lunarDateLabel} · ${r.hourBranchLabel}
- 三步累加：月 ${r.steps.month} → 日 ${r.steps.day} → 时 ${r.steps.hour}
- 三步途经：${r.path.join(' → ')}
- 占问方向：${aspectLabel[r.aspect]}
${r.question ? `- 心中所问：${r.question}` : ''}

## 落宫断卦
- 宫位：**${r.palace.name}**（${r.palace.symbol}）
- 五行：${r.palace.element}
- 一字定性：${r.palace.tag}（${r.palace.jiXiong === 'ji' ? '吉' : r.palace.jiXiong === 'xiong' ? '凶' : '平'}）

## 六维解读
${readingLines}

## 宜 / 忌
- 宜：${r.palace.suitable.join('、')}
- 忌：${r.palace.avoid.join('、')}
`.trim()
}

function buildEnglishNarrative(r: LiurenResult): string {
  const aspectLabel: Record<typeof r.aspect, string> = {
    overall: 'Overall',
    career: 'Career',
    love: 'Love',
    wealth: 'Wealth',
    health: 'Health',
    travel: 'Travel',
  }
  const readingLines = (Object.entries(r.palace.readings) as Array<[keyof typeof r.palace.readings, string]>)
    .map(([k, v]) => `- ${aspectLabel[k]}: ${v}`)
    .join('\n')

  return `
## Question
- Cast at: ${r.lunarDateLabel} · ${r.hourBranchLabel}
- Steps: month ${r.steps.month} → day ${r.steps.day} → hour ${r.steps.hour}
- Path: ${r.path.join(' → ')}
- Aspect: ${aspectLabel[r.aspect]}
${r.question ? `- Inquiry: ${r.question}` : ''}

## Resolved Palace
- Palace: **${r.palace.name}** (${r.palace.symbol})
- Element: ${r.palace.element}
- Verdict: ${r.palace.tag} (${r.palace.jiXiong})

## Six-Aspect Reading
${readingLines}

## Suitable / Avoid
- Suitable: ${r.palace.suitable.join(', ')}
- Avoid: ${r.palace.avoid.join(', ')}
`.trim()
}
