/**
 * 观音灵签模块的 AI 上下文构造器
 *
 * fingerprint 入参 = qianId（签号），完全由签决定会话身份。
 * 同一签号下重复抽签，会话延续；切到不同签号 = 新会话。
 */

import type { LingqianResult, LingqianTopicKey } from '@/modules/lingqian/types'
import type { ContextBuilder, AiContext } from './types'
import { buildFingerprintSync } from '../fingerprint'

const LINGQIAN_PRESET_KEYS = [
  'lingqian.ai.preset.poemReading',
  'lingqian.ai.preset.matter',
  'lingqian.ai.preset.outlook',
  'lingqian.ai.preset.tips',
] as const

const TOPIC_LABEL_CN: Record<LingqianTopicKey, string> = {
  overall: '综合',
  family: '家宅',
  marriage: '婚姻',
  career: '事业',
  wealth: '财运',
  travel: '出行',
  health: '健康',
}

const TOPIC_LABEL_EN: Record<LingqianTopicKey, string> = {
  overall: 'Overall',
  family: 'Family',
  marriage: 'Marriage',
  career: 'Career',
  wealth: 'Wealth',
  travel: 'Travel',
  health: 'Health',
}

export const lingqianContextBuilder: ContextBuilder<LingqianResult> = {
  build({ chart, locale }) {
    const r = chart
    const displayLabel = `第 ${r.item.id} 签 · ${r.item.level} · ${r.item.title}`
    const fingerprint = buildFingerprintSync('lingqian', {
      qianId: r.item.id,
    })

    const narrative = locale === 'en'
      ? buildEnglishNarrative(r)
      : buildChineseNarrative(r)

    return {
      fingerprint,
      moduleId: 'lingqian',
      displayLabel,
      narrative,
      structured: {
        id: r.item.id,
        level: r.item.level,
        title: r.item.title,
        poem: r.item.poem,
        jieyue: r.item.jieyue,
        xianji: r.item.xianji,
        topics: r.item.topics,
        diangu: r.item.diangu ?? null,
        topic: r.topic,
        question: r.question ?? null,
      },
      presetPromptKeys: [...LINGQIAN_PRESET_KEYS],
    } satisfies AiContext
  },
}

function buildChineseNarrative(r: LingqianResult): string {
  const topicLines = (Object.entries(r.item.topics) as Array<[keyof typeof r.item.topics, string]>)
    .map(([k, v]) => `- ${TOPIC_LABEL_CN[k]}：${v}`)
    .join('\n')

  return `
## 签信息
- 签号：第 ${r.item.id} 签
- 等级：**${r.item.level}**
- 典故名：${r.item.title}
- 占问领域：${TOPIC_LABEL_CN[r.topic]}
${r.question ? `- 心中所问：${r.question}` : ''}

## 签诗
${r.item.poem.map((line) => `> ${line}`).join('\n')}

## 解曰
${r.item.jieyue}

## 仙机
${r.item.xianji}

## 6 大分类指引
${topicLines}

${r.item.diangu ? `## 典故释义\n${r.item.diangu}` : ''}
`.trim()
}

function buildEnglishNarrative(r: LingqianResult): string {
  const topicLines = (Object.entries(r.item.topics) as Array<[keyof typeof r.item.topics, string]>)
    .map(([k, v]) => `- ${TOPIC_LABEL_EN[k]}: ${v}`)
    .join('\n')

  return `
## Lottery Slip
- Number: #${r.item.id}
- Level: **${r.item.level}**
- Title (allusion): ${r.item.title}
- Topic: ${TOPIC_LABEL_EN[r.topic]}
${r.question ? `- Inquiry: ${r.question}` : ''}

## Verse (kept in classical Chinese; do not translate)
${r.item.poem.map((line) => `> ${line}`).join('\n')}

## Oracle (jieyue)
${r.item.jieyue}

## Divine Mechanism (xianji)
${r.item.xianji}

## Topical Guidance
${topicLines}

${r.item.diangu ? `## Allusion Background\n${r.item.diangu}` : ''}
`.trim()
}
