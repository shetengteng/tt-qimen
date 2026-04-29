/**
 * 周公解梦模块的 AI 上下文构造器
 *
 * 解梦的"命盘"是一次"搜索 + 选定词条"的快照（DreamEntry）。
 * fingerprint 入参 = dreamId（词条 id），同一梦境主题复用会话。
 *
 * 注：DreamSearchResult 是搜索结果列表；本 builder 期望接收单条 DreamEntry，
 * 由 JiemengPage 在用户点开某条后传入。
 */

import type { DreamEntry } from '@/modules/jiemeng/types'
import type { ContextBuilder, AiContext } from './types'
import { buildFingerprintSync } from '../fingerprint'

const JIEMENG_PRESET_KEYS = [
  'jiemeng.ai.preset.symbolism',
  'jiemeng.ai.preset.emotion',
  'jiemeng.ai.preset.advice',
  'jiemeng.ai.preset.lifeRelevance',
] as const

const CATEGORY_LABEL_CN = {
  animal: '动物',
  people: '人物',
  nature: '自然',
  body: '身体',
  life: '生活',
  ghost: '鬼神',
  building: '建筑',
  other: '其他',
}
const CATEGORY_LABEL_EN = {
  animal: 'Animals',
  people: 'People',
  nature: 'Nature',
  body: 'Body',
  life: 'Life',
  ghost: 'Spirits',
  building: 'Buildings',
  other: 'Other',
}

export const jiemengContextBuilder: ContextBuilder<DreamEntry> = {
  build({ chart, locale }) {
    const e = chart
    const displayLabel = `${e.title} · ${CATEGORY_LABEL_CN[e.category]}`
    const fingerprint = buildFingerprintSync('jiemeng', {
      dreamId: e.id,
    })

    const narrative = locale === 'en'
      ? buildEnglishNarrative(e)
      : buildChineseNarrative(e)

    return {
      fingerprint,
      moduleId: 'jiemeng',
      displayLabel,
      narrative,
      structured: {
        id: e.id,
        title: e.title,
        category: e.category,
        keywords: e.keywords,
        summary: e.summary,
        classical: e.classical,
        modern: e.modern,
        advice: e.advice ?? null,
        tags: e.tags ?? [],
      },
      presetPromptKeys: [...JIEMENG_PRESET_KEYS],
    } satisfies AiContext
  },
}

function buildChineseNarrative(e: DreamEntry): string {
  return `
## 梦境主题
- 标题：**${e.title}**
- 分类：${CATEGORY_LABEL_CN[e.category]}
- 关键词：${e.keywords.join('、')}
${e.tags?.length ? `- 语气标签：${e.tags.join('、')}` : ''}

## 古籍原文
> ${e.classical}
${e.classicalSource ? `\n出处：${e.classicalSource}` : ''}

## 一句话简述
${e.summary}

## 现代心理学解读
${e.modern.map((p) => `- ${p}`).join('\n')}

${e.advice ? `## 现代建议\n${e.advice}` : ''}
`.trim()
}

function buildEnglishNarrative(e: DreamEntry): string {
  return `
## Dream Subject
- Title: **${e.title}**
- Category: ${CATEGORY_LABEL_EN[e.category]}
- Keywords: ${e.keywords.join(', ')}
${e.tags?.length ? `- Tags: ${e.tags.join(', ')}` : ''}

## Classical Source
> ${e.classical}
${e.classicalSource ? `\nSource: ${e.classicalSource}` : ''}

## Summary
${e.summary}

## Modern Psychological Reading
${e.modern.map((p) => `- ${p}`).join('\n')}

${e.advice ? `## Modern Advice\n${e.advice}` : ''}
`.trim()
}
