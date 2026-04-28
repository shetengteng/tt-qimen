/**
 * 八字模块的 AI 上下文构造器
 *
 * 把 BaziChart 转换成：
 *   - displayLabel: 用户友好的命盘 chip（如 "1990-05-20 午时 · 男"）
 *   - narrative:    给 LLM 的自然语言陈述（Markdown，~600-1000 字）
 *   - structured:   完整 chart JSON（让 LLM 精准查字段）
 *   - presetPromptKeys: 6 个预设提问
 *
 * narrative 的字段顺序：
 *   1. 命主信息（性别 / 公历 / 农历）
 *   2. 四柱（每柱：干支 / 五行 / 阴阳 / 纳音 / 十神 / 藏干）
 *   3. 五行权重 + 旺衰
 *   4. 格局识别
 *   5. 命盘简析（模板生成的两段）
 *   6. 喜用神 / 忌神
 *   7. 命中神煞（吉 / 中 / 凶 分组）
 *   8. 当前大运 + 流年
 *   9. 起运信息
 *
 * 信息丰富度遵循用户决策"尽可能丰富"，但控制在 1500 字内避免 prompt 过长。
 */

import type { BaziChart } from '@/modules/bazi/types'
import type { ContextBuilder, AiContext } from './types'
import { buildFingerprintSync } from '../fingerprint'

const BAZI_PRESET_KEYS = [
  'bazi.ai.preset.career',
  'bazi.ai.preset.marriage',
  'bazi.ai.preset.wealth',
  'bazi.ai.preset.health',
  'bazi.ai.preset.thisYear',
  'bazi.ai.preset.lifeStage',
] as const

export const baziContextBuilder: ContextBuilder<BaziChart> = {
  build({ chart, locale, userContext }) {
    /** displayLabel 取自 chart.meta.solar，简洁直白 */
    const displayLabel = `${chart.meta.solar} · ${chart.meta.genderTitle}`

    /** fingerprint 入参：从 meta.solar 解析的 birth 字段（与 BirthInput 对齐） */
    const fingerprintParams = parseFingerprintParams(chart, userContext)
    const fingerprint = buildFingerprintSync('bazi', fingerprintParams)

    const narrative = locale === 'en'
      ? buildEnglishNarrative(chart, userContext)
      : buildChineseNarrative(chart, userContext, locale === 'zh-TW')

    return {
      fingerprint,
      moduleId: 'bazi',
      displayLabel,
      narrative,
      structured: {
        meta: chart.meta,
        pillars: chart.pillars,
        dayMaster: chart.dayMaster,
        dayMasterElement: chart.dayMasterElement,
        elements: chart.elements,
        strength: chart.strength,
        favorableElements: chart.favorableElements,
        unfavorableElements: chart.unfavorableElements,
        pattern: chart.pattern,
        shensha: chart.shensha,
        startAge: chart.startAge,
        decades: chart.decades,
        flowYears: chart.flowYears,
        currentDecadeIdx: chart.currentDecadeIdx,
        currentFlowYearIdx: chart.currentFlowYearIdx,
      },
      presetPromptKeys: [...BAZI_PRESET_KEYS],
    } satisfies AiContext
  },
}

/**
 * 从 chart 推导 fingerprint 入参。
 * BaziChart 内没有直接保存 BirthInput；但 meta.solar 字符串带了完整日期 + 时辰，
 * 加上 chart.pillars.day / hour 即可派生指纹（精度足够"换生辰=换会话"语义）。
 */
function parseFingerprintParams(
  chart: BaziChart,
  userContext?: { gender?: 'male' | 'female' },
): Record<string, unknown> {
  const solar = chart.meta.solar
  return {
    solar,
    genderTitle: chart.meta.genderTitle,
    gender: userContext?.gender ?? (chart.meta.genderTitle === '坤造' ? 'female' : 'male'),
    yearGanzhi: chart.pillars.year.ganzhi,
    monthGanzhi: chart.pillars.month.ganzhi,
    dayGanzhi: chart.pillars.day.ganzhi,
    hourGanzhi: chart.pillars.hour.ganzhi,
  }
}

function buildChineseNarrative(
  chart: BaziChart,
  userContext: { name?: string; gender?: 'male' | 'female' } | undefined,
  isTraditional: boolean,
): string {
  const m = chart.meta
  const p = chart.pillars
  const cur = chart.currentDecadeIdx >= 0 ? chart.decades[chart.currentDecadeIdx] : null
  const curYear = chart.currentFlowYearIdx >= 0 ? chart.flowYears[chart.currentFlowYearIdx] : null
  const nameLine = userContext?.name ? `\n- 姓名：${userContext.name}` : ''

  return `
## 命主信息${nameLine}
- 性别：${m.genderTitle}
- 公历：${m.solar}
- 农历：${m.lunar}

## 四柱八字
- 年柱：${p.year.ganzhi}（干 ${p.year.ganElement}/支 ${p.year.zhiElement}，纳音 ${p.year.nayin}，十神 ${p.year.tenGod}，藏干 ${p.year.hideStems.map(h => h.gan).join('、')}）
- 月柱：${p.month.ganzhi}（干 ${p.month.ganElement}/支 ${p.month.zhiElement}，纳音 ${p.month.nayin}，十神 ${p.month.tenGod}，藏干 ${p.month.hideStems.map(h => h.gan).join('、')}）
- 日柱：${p.day.ganzhi}（干 ${p.day.ganElement}/支 ${p.day.zhiElement}，纳音 ${p.day.nayin}，**日主**${chart.dayMaster}${chart.dayMasterElement}，藏干 ${p.day.hideStems.map(h => h.gan).join('、')}）
- 时柱：${p.hour.ganzhi}（干 ${p.hour.ganElement}/支 ${p.hour.zhiElement}，纳音 ${p.hour.nayin}，十神 ${p.hour.tenGod}，藏干 ${p.hour.hideStems.map(h => h.gan).join('、')}）

## 五行权重
- 木 ${chart.elements.wood.toFixed(2)} · 火 ${chart.elements.fire.toFixed(2)} · 土 ${chart.elements.earth.toFixed(2)} · 金 ${chart.elements.metal.toFixed(2)} · 水 ${chart.elements.water.toFixed(2)}

## 旺衰格局
- 日主：${chart.dayMaster}（${chart.dayMasterYinYang}${chart.dayMasterElement}），强度：**${chart.strength}**
- 格局：**${chart.pattern.name}**（月支本气十神 ${chart.pattern.monthMainTenGod}${chart.pattern.through ? `，透干于 ${chart.pattern.through} 柱` : '，未透干'}）
- 格局点评：${chart.pattern.comment}
- 喜用神：${chart.favorableElements.join('、') || '（未明显推导）'}
- 忌神：${chart.unfavorableElements.join('、') || '（未明显推导）'}

## 命盘简析（模板）
${chart.interpret.paragraph1}

${chart.interpret.paragraph2}

标签：${chart.interpret.tags.join(' · ')}

## 命中神煞
${formatShenshaCN(chart)}

## 当前大运
${cur ? `- ${cur.ganzhi}（${cur.startYear}-${cur.endYear}，${cur.startAge}-${cur.endAge}虚岁，十神 ${cur.tenGod}，倾向 ${formatTendencyCN(cur.tendency)}）\n  · ${cur.hint}` : '- （未在大运表中）'}

## 当前流年
${curYear ? `- ${curYear.year}年 ${curYear.ganzhi}（${curYear.element}/${curYear.tenGod}，倾向 ${formatTendencyCN(curYear.tendency)}）\n  · ${curYear.hint}\n  · 标签：${curYear.tags.join(' · ')}` : '- （流年表为空）'}

## 起运信息
- 起运年龄：${chart.startAge.year} 岁 ${chart.startAge.months} 个月

## 大运全景（10 段）
${chart.decades.map((d, i) => `- ${i === chart.currentDecadeIdx ? '👉 ' : ''}${d.startYear}-${d.endYear}（${d.startAge}-${d.endAge}虚岁）${d.ganzhi}：${d.tenGod}，${formatTendencyCN(d.tendency)}`).join('\n')}

## 流年全景（${chart.flowYears.length} 年）
${chart.flowYears.map(f => `- ${f.current ? '👉 ' : ''}${f.year}（${f.ganzhi}）：${f.tenGod}，${formatTendencyCN(f.tendency)}${f.tags.length ? `，标签 ${f.tags.join('/')}` : ''}`).join('\n')}
`.trim().replace(/\n{3,}/g, '\n\n')
    .replace(/[\u4e00-\u9fa5]/g, c => isTraditional ? toTraditional(c) : c)
}

function buildEnglishNarrative(
  chart: BaziChart,
  userContext: { name?: string; gender?: 'male' | 'female' } | undefined,
): string {
  const m = chart.meta
  const p = chart.pillars
  const cur = chart.currentDecadeIdx >= 0 ? chart.decades[chart.currentDecadeIdx] : null
  const curYear = chart.currentFlowYearIdx >= 0 ? chart.flowYears[chart.currentFlowYearIdx] : null
  const nameLine = userContext?.name ? `\n- Name: ${userContext.name}` : ''
  const gender = userContext?.gender ?? (m.genderTitle === '坤造' ? 'female' : 'male')

  return `
## Subject${nameLine}
- Gender: ${gender}
- Solar date: ${m.solarEn || m.solar}
- Lunar date: ${m.lunarEn || m.lunar}

## Four Pillars (Year / Month / Day / Hour)
- Year:  ${p.year.ganzhi}  (stem ${p.year.ganElement} / branch ${p.year.zhiElement}, nayin "${p.year.nayin}", ten-god ${p.year.tenGod})
- Month: ${p.month.ganzhi} (stem ${p.month.ganElement} / branch ${p.month.zhiElement}, nayin "${p.month.nayin}", ten-god ${p.month.tenGod})
- Day:   ${p.day.ganzhi}   (stem ${p.day.ganElement} / branch ${p.day.zhiElement}, nayin "${p.day.nayin}", **Day Master** = ${chart.dayMaster}/${chart.dayMasterElement})
- Hour:  ${p.hour.ganzhi}  (stem ${p.hour.ganElement} / branch ${p.hour.zhiElement}, nayin "${p.hour.nayin}", ten-god ${p.hour.tenGod})

## Five-Element Weights
- Wood ${chart.elements.wood.toFixed(2)} · Fire ${chart.elements.fire.toFixed(2)} · Earth ${chart.elements.earth.toFixed(2)} · Metal ${chart.elements.metal.toFixed(2)} · Water ${chart.elements.water.toFixed(2)}

## Strength & Pattern
- Day master strength: **${chart.strength}**
- Pattern: **${chart.pattern.name}** (month branch ten-god ${chart.pattern.monthMainTenGod}${chart.pattern.through ? `, manifest in ${chart.pattern.through} pillar` : ', not manifested in stem'})
- Pattern note: ${chart.pattern.comment}
- Favorable elements: ${chart.favorableElements.join(', ') || '(none)'}
- Unfavorable elements: ${chart.unfavorableElements.join(', ') || '(none)'}

## Template Interpretation
${chart.interpret.paragraph1}

${chart.interpret.paragraph2}

Tags: ${chart.interpret.tags.join(' · ')}

## Detected Spirits/Deities
${formatShenshaEN(chart)}

## Current Decadal Cycle
${cur ? `- ${cur.ganzhi} (years ${cur.startYear}-${cur.endYear}, ages ${cur.startAge}-${cur.endAge}, ten-god ${cur.tenGod}, tendency ${cur.tendency})\n  · ${cur.hint}` : '- (not in table)'}

## Current Year
${curYear ? `- ${curYear.year} (${curYear.ganzhi}, ${curYear.element}/${curYear.tenGod}, tendency ${curYear.tendency})\n  · ${curYear.hint}\n  · Tags: ${curYear.tags.join(' · ')}` : '- (none)'}

## Decadal Cycles (10 segments)
${chart.decades.map((d, i) => `- ${i === chart.currentDecadeIdx ? '👉 ' : ''}${d.startYear}-${d.endYear} (${d.ganzhi}): ${d.tenGod}, ${d.tendency}`).join('\n')}

## Annual Cycles (${chart.flowYears.length} years)
${chart.flowYears.map(f => `- ${f.current ? '👉 ' : ''}${f.year} (${f.ganzhi}): ${f.tenGod}, ${f.tendency}${f.tags.length ? `, tags ${f.tags.join('/')}` : ''}`).join('\n')}
`.trim().replace(/\n{3,}/g, '\n\n')
}

function formatShenshaCN(chart: BaziChart): string {
  if (!chart.shensha.length) return '- （无显著神煞命中）'
  const groups: Record<string, typeof chart.shensha> = { auspicious: [], neutral: [], inauspicious: [] }
  for (const s of chart.shensha) groups[s.category].push(s)
  const parts: string[] = []
  if (groups.auspicious.length) parts.push(`### 吉神\n${groups.auspicious.map(s => `- ${s.name}（${s.pillar}柱）：${s.short}`).join('\n')}`)
  if (groups.neutral.length) parts.push(`### 中性\n${groups.neutral.map(s => `- ${s.name}（${s.pillar}柱）：${s.short}`).join('\n')}`)
  if (groups.inauspicious.length) parts.push(`### 凶煞\n${groups.inauspicious.map(s => `- ${s.name}（${s.pillar}柱）：${s.short}`).join('\n')}`)
  return parts.join('\n\n')
}

function formatShenshaEN(chart: BaziChart): string {
  if (!chart.shensha.length) return '- (no significant deities/clashes detected)'
  const groups: Record<string, typeof chart.shensha> = { auspicious: [], neutral: [], inauspicious: [] }
  for (const s of chart.shensha) groups[s.category].push(s)
  const parts: string[] = []
  if (groups.auspicious.length) parts.push(`### Auspicious\n${groups.auspicious.map(s => `- ${s.name} (${s.pillar} pillar): ${s.short}`).join('\n')}`)
  if (groups.neutral.length) parts.push(`### Neutral\n${groups.neutral.map(s => `- ${s.name} (${s.pillar} pillar): ${s.short}`).join('\n')}`)
  if (groups.inauspicious.length) parts.push(`### Inauspicious\n${groups.inauspicious.map(s => `- ${s.name} (${s.pillar} pillar): ${s.short}`).join('\n')}`)
  return parts.join('\n\n')
}

function formatTendencyCN(t: 'favorable' | 'neutral' | 'unfavorable'): string {
  return t === 'favorable' ? '吉' : t === 'unfavorable' ? '凶' : '中'
}

/**
 * 简体 → 繁体 fallback 转换。
 * 项目用户可能装了 chinese-conv 这种库，但这里仅做 narrative 内常用 30 个汉字的就地映射，
 * 避免依赖膨胀；不在映射表里的字符原样保留（视觉差异很小）。
 *
 * 真正完整的繁简转换由 vue-i18n 在 caller 端通过切换 locale 解决；
 * 本函数仅当 caller 已是 zh-TW 时进入，仍以简体 chart 数据为输入做轻度转换。
 */
const TRADITIONAL_MAP: Record<string, string> = {
  '阳': '陽', '阴': '陰', '纳': '納', '运': '運', '岁': '歲', '气': '氣',
  '杀': '殺', '势': '勢', '点': '點', '当': '當', '门': '門', '体': '體',
  '业': '業', '数': '數', '历': '曆', '简': '簡', '执': '執',
  '论': '論', '说': '說', '声': '聲', '态': '態', '过': '過', '远': '遠',
  '应': '應', '风': '風', '动': '動', '会': '會', '现': '現',
  '与': '與', '亲': '親', '万': '萬', '从': '從',
}
function toTraditional(c: string): string {
  return TRADITIONAL_MAP[c] ?? c
}
