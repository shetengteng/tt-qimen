/**
 * 紫微斗数模块的 AI 上下文构造器
 *
 * narrative 段：
 *   1. 命主信息（性别 / 公历 / 农历 / 五行局 / 起运 / 命主 / 身主 / 斗君）
 *   2. 命宫主星论命卡（borrowed / brightness / sihua）
 *   3. 12 宫概况（每宫主星 + 大限范围）
 *   4. 本命四化落宫（禄/权/科/忌 → 哪颗星 → 哪个宫）
 *   5. 三方四正（命宫 + 三合 + 对宫）
 *   6. 当前大限详情（落宫 + 主星 + 大限四化飞星）
 *   7. 当前流年（干支 + 落宫 + 流年四化）
 *
 * fingerprint 入参：见 fingerprint.ts FINGERPRINT_FIELDS.ziwei
 *   = calendar / year / month / day / hour / gender
 *
 * 注：紫微的 chart.meta 没有 calendar 字段（默认按公历），fingerprint 用 meta.solar 解析。
 */

import type { ZiweiChart, PalaceKey, SihuaKey } from '@/modules/ziwei/types'
import type { ContextBuilder, AiContext } from './types'
import { buildFingerprintSync } from '../fingerprint'

const ZIWEI_PRESET_KEYS = [
  'ziwei.ai.preset.mingPalace',
  'ziwei.ai.preset.palaces',
  'ziwei.ai.preset.lifeMaster',
  'ziwei.ai.preset.decadalLuck',
  'ziwei.ai.preset.sihua',
  'ziwei.ai.preset.friends',
] as const

const PALACE_LABEL_CN: Record<PalaceKey, string> = {
  ming: '命宫',
  xiongdi: '兄弟',
  fuqi: '夫妻',
  zinv: '子女',
  caibo: '财帛',
  jie: '疾厄',
  qianyi: '迁移',
  jiaoyou: '交友',
  guanlu: '官禄',
  tianzhai: '田宅',
  fude: '福德',
  fumu: '父母',
}

const PALACE_LABEL_EN: Record<PalaceKey, string> = {
  ming: 'Self',
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

const SIHUA_LABEL_CN: Record<SihuaKey, string> = {
  lu: '禄',
  quan: '权',
  ke: '科',
  ji: '忌',
}

export const ziweiContextBuilder: ContextBuilder<ZiweiChart> = {
  build({ chart, locale }) {
    const m = chart.meta
    const displayLabel = `${m.solar} · ${m.gender} · ${m.fiveElementsClass}`
    const fingerprint = buildFingerprintSync('ziwei', parseFingerprintParams(chart))
    const narrative = locale === 'en'
      ? buildEnglishNarrative(chart)
      : buildChineseNarrative(chart)

    return {
      fingerprint,
      moduleId: 'ziwei',
      displayLabel,
      narrative,
      structured: {
        meta: chart.meta,
        palaces: chart.palaces.map((p) => ({
          key: p.key,
          isMing: p.isMing,
          isShen: p.isShen,
          ganzhi: p.ganzhi,
          daxianRange: p.daxianRange,
          stars: p.stars,
        })),
        sihuaMap: chart.sihuaMap,
        sanfangSiZheng: chart.sanfangSiZheng,
        soulPalaceCard: chart.soulPalaceCard,
        currentDecadal: chart.currentDecadal,
        flowYearCurrent: chart.flowYears.find((f) => f.current) ?? null,
      },
      presetPromptKeys: [...ZIWEI_PRESET_KEYS],
    } satisfies AiContext
  },
}

function parseFingerprintParams(chart: ZiweiChart): Record<string, unknown> {
  return {
    calendar: 'solar',
    solar: chart.meta.solar,
    gender: chart.meta.gender === '男' ? 'male' : 'female',
    fiveElementsClass: chart.meta.fiveElementsClass,
    mingZhu: chart.meta.mingZhu,
    shenZhu: chart.meta.shenZhu,
  }
}

function buildChineseNarrative(chart: ZiweiChart): string {
  const m = chart.meta
  const cur = chart.currentDecadal
  const curYear = chart.flowYears.find((f) => f.current) ?? null

  const palaceLines = chart.palaces
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((p) => {
      const tags: string[] = []
      if (p.isMing) tags.push('命宫')
      if (p.isShen) tags.push('身宫')
      const tagStr = tags.length ? `（${tags.join('、')}）` : ''
      const stars = p.stars.length
        ? p.stars.map((s) => {
          const sihua = s.sihua ? `化${SIHUA_LABEL_CN[s.sihua]}` : ''
          const bright = s.brightness ? `·${s.brightness}` : ''
          return `${s.name}${bright}${sihua}`
        }).join('、')
        : '（无主星）'
      return `- ${PALACE_LABEL_CN[p.key]}${tagStr}：${p.ganzhi} · 大限 ${p.daxianRange} · ${stars}`
    })
    .join('\n')

  const sihuaLines = (Object.keys(chart.sihuaMap) as SihuaKey[])
    .map((k) => {
      const cell = chart.sihuaMap[k]
      return `- 化${SIHUA_LABEL_CN[k]}：${cell.star} → ${PALACE_LABEL_CN[cell.palaceKey]}`
    })
    .join('\n')

  const sf = chart.sanfangSiZheng
  const sfLine = `- 命宫：${PALACE_LABEL_CN[sf.benming]}\n- 三方：${sf.triad.map((k) => PALACE_LABEL_CN[k]).join('、')}\n- 对宫：${PALACE_LABEL_CN[sf.duigong]}`

  const soul = chart.soulPalaceCard
  const soulLine = soul
    ? `- 命宫主星：${soul.starName}${soul.brightness ? `（${soul.brightness}）` : ''}${soul.borrowed ? '（借宫）' : ''}${soul.sihua ? ` · 化${SIHUA_LABEL_CN[soul.sihua]}` : ''}`
    : '- 命宫主星：（命宫与对宫均无主星）'

  const decadalLine = cur
    ? `- 区间：${cur.age}\n- 干支：${cur.ganzhi}\n- 落宫：${PALACE_LABEL_CN[cur.palaceKey]}\n- 主星：${cur.mainStars.map((s) => `${s.name}${s.brightness ? `(${s.brightness})` : ''}`).join('、') || '（无）'}\n- 大限四化：${cur.mutagens.map((mt) => `${mt.name}化${SIHUA_LABEL_CN[mt.sihua]}${mt.palaceKey ? ` → ${PALACE_LABEL_CN[mt.palaceKey]}` : ''}`).join('；') || '（无）'}`
    : '- （未在大限表中）'

  const flowLine = curYear
    ? `- ${curYear.year}年 ${curYear.ganzhi} · 落宫 ${PALACE_LABEL_CN[curYear.palaceKey]}\n- 流年四化：${curYear.mutagens.map((mt) => `${mt.name}化${SIHUA_LABEL_CN[mt.sihua]}${mt.palaceKey ? ` → ${PALACE_LABEL_CN[mt.palaceKey]}` : ''}`).join('；') || '（无）'}`
    : '- （流年表为空）'

  return `
## 命主信息
- 性别：${m.gender}
- 公历：${m.solar}
- 农历：${m.lunar}
- 五行局：${m.fiveElementsClass}（起运 ${m.qiyunAge} 岁）
- 命主：${m.mingZhu} · 身主：${m.shenZhu} · 斗君：${m.doujun}
- 当前虚岁：${m.currentAge} · 当前年份：${m.currentYear}（${m.currentYearGz}）

## 命宫主星
${soulLine}

## 12 宫位（按 4×4 slot 排序）
${palaceLines}

## 本命四化落宫
${sihuaLines}

## 三方四正
${sfLine}

## 当前大限
${decadalLine}

## 当前流年
${flowLine}
`.trim()
}

function buildEnglishNarrative(chart: ZiweiChart): string {
  const m = chart.meta
  const cur = chart.currentDecadal
  const curYear = chart.flowYears.find((f) => f.current) ?? null
  const genderEn = m.gender === '男' ? 'male' : 'female'

  const palaceLines = chart.palaces
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((p) => {
      const tags: string[] = []
      if (p.isMing) tags.push('Self')
      if (p.isShen) tags.push('Body')
      const tagStr = tags.length ? `(${tags.join(', ')})` : ''
      const stars = p.stars.length
        ? p.stars.map((s) => {
          const sihua = s.sihua ? ` · ${s.sihua}` : ''
          const bright = s.brightness ? ` (${s.brightness})` : ''
          return `${s.name}${bright}${sihua}`
        }).join(', ')
        : '(no main star)'
      return `- ${PALACE_LABEL_EN[p.key]}${tagStr}: ${p.ganzhi} · decadal ${p.daxianRange} · ${stars}`
    })
    .join('\n')

  const sihuaLines = (Object.keys(chart.sihuaMap) as SihuaKey[])
    .map((k) => {
      const cell = chart.sihuaMap[k]
      return `- ${k}: ${cell.star} → ${PALACE_LABEL_EN[cell.palaceKey]}`
    })
    .join('\n')

  const sf = chart.sanfangSiZheng
  const sfLine = `- Self: ${PALACE_LABEL_EN[sf.benming]}\n- Triad: ${sf.triad.map((k) => PALACE_LABEL_EN[k]).join(', ')}\n- Opposite: ${PALACE_LABEL_EN[sf.duigong]}`

  return `
## Subject
- Gender: ${genderEn}
- Solar date: ${m.solar}
- Lunar date: ${m.lunar}
- Five-element class: ${m.fiveElementsClass} (decadal start: age ${m.qiyunAge})
- Soul master: ${m.mingZhu} · Body master: ${m.shenZhu} · Doujun: ${m.doujun}
- Current age: ${m.currentAge} · Current year: ${m.currentYear} (${m.currentYearGz})

## Twelve Palaces
${palaceLines}

## Mutagens (Four Transformations)
${sihuaLines}

## San-Fang Si-Zheng (Triad & Opposite)
${sfLine}

## Current Decadal
${cur ? `- Range: ${cur.age}\n- Ganzhi: ${cur.ganzhi}\n- Palace: ${PALACE_LABEL_EN[cur.palaceKey]}\n- Main stars: ${cur.mainStars.map((s) => s.name).join(', ') || '(none)'}` : '- (none)'}

## Current Year
${curYear ? `- ${curYear.year} (${curYear.ganzhi}), palace ${PALACE_LABEL_EN[curYear.palaceKey]}` : '- (none)'}
`.trim()
}
