/**
 * 黄历择日模块的 AI 上下文构造器
 *
 * fingerprint 入参 = year / month / day（按当日聚合，同一天复用会话）。
 * 由于 huangli 的"命盘"是 HuangliDay（单日全集），narrative 选取关键字段，
 * 完整 day 对象进 structured.day 让 LLM 按需引用。
 */

import type { HuangliDay } from '@/modules/huangli/types'
import type { ContextBuilder, AiContext } from './types'
import { buildFingerprintSync } from '../fingerprint'

const HUANGLI_PRESET_KEYS = [
  'huangli.ai.preset.suitability',
  'huangli.ai.preset.avoidance',
  'huangli.ai.preset.detailedHours',
  'huangli.ai.preset.matterAdvice',
] as const

export const huangliContextBuilder: ContextBuilder<HuangliDay> = {
  build({ chart, locale }) {
    const d = chart
    const displayLabel = `${d.dateIso} · ${d.weekday} · ${d.lunarMonthDay}`
    const fingerprint = buildFingerprintSync('huangli', {
      year: d.year,
      month: d.month,
      day: d.day,
    })

    const narrative = locale === 'en'
      ? buildEnglishNarrative(d)
      : buildChineseNarrative(d)

    return {
      fingerprint,
      moduleId: 'huangli',
      displayLabel,
      narrative,
      structured: { day: d },
      presetPromptKeys: [...HUANGLI_PRESET_KEYS],
    } satisfies AiContext
  },
}

function buildChineseNarrative(d: HuangliDay): string {
  const luckyHourLines = d.luckyHours.length
    ? d.luckyHours.map((h) => `- ${h.name}（${h.ganzhi}）· ${h.star} · ${h.ecliptic}`).join('\n')
    : '- （当日无黄道吉时）'

  return `
## 公历
- 日期：${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}（星期${d.weekday}）
${d.solarFestival ? `- 节日：${d.solarFestival}` : ''}

## 农历
- ${d.lunarYearGanzhi}（生肖${d.zodiac}）${d.lunarMonthDay}
- 节气：${d.term}${d.lunarFestival ? ` · 节日：${d.lunarFestival}` : ''}
- 干支：${d.pillarYear}年 / ${d.pillarMonth}月 / ${d.pillarDay}日
- 12 建星：${d.duty} · 12 神：${d.twelveStar}（${d.ecliptic}）

## 宜
${d.recommends.length ? d.recommends.map((x) => `- ${x}`).join('\n') : '- （无明确宜事）'}

## 忌
${d.avoids.length ? d.avoids.map((x) => `- ${x}`).join('\n') : '- （无明确忌事）'}

## 吉神 / 凶神
- 吉神：${d.gods.length ? d.gods.join('、') : '（无）'}
- 凶神：${d.fiends.length ? d.fiends.join('、') : '（无）'}

## 冲煞 / 方位
- 冲：${d.chong.zodiac}（${d.chong.ganzhi}）· 煞方：${d.shaDirection}
- 喜神：${d.joyDirection} · 财神：${d.wealthDirection} · 福神：${d.fuDirection}
- 阳贵：${d.yangGuiDirection} · 阴贵：${d.yinGuiDirection}
- 胎神：${d.fetus}
- 彭祖百忌：${d.pengzuGan}（干）· ${d.pengzuZhi}（支）
- 西方星座：${d.constellation}

## 黄道吉时
${luckyHourLines}
`.trim()
}

function buildEnglishNarrative(d: HuangliDay): string {
  const luckyHourLines = d.luckyHours.length
    ? d.luckyHours.map((h) => `- ${h.name} (${h.ganzhi}) · ${h.star} · ${h.ecliptic}`).join('\n')
    : '- (no auspicious hours today)'

  return `
## Solar Date
- ${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')} (Day ${d.weekday})
${d.solarFestival ? `- Festival: ${d.solarFestival}` : ''}

## Lunar Date
- ${d.lunarYearGanzhi} (zodiac ${d.zodiac}) ${d.lunarMonthDay}
- Solar term: ${d.term}${d.lunarFestival ? ` · Lunar festival: ${d.lunarFestival}` : ''}
- Pillars: ${d.pillarYear} / ${d.pillarMonth} / ${d.pillarDay}
- Twelve Duties: ${d.duty} · Twelve Stars: ${d.twelveStar} (${d.ecliptic})

## Suitable
${d.recommends.length ? d.recommends.map((x) => `- ${x}`).join('\n') : '- (none)'}

## Avoid
${d.avoids.length ? d.avoids.map((x) => `- ${x}`).join('\n') : '- (none)'}

## Spirits
- Auspicious: ${d.gods.length ? d.gods.join(', ') : '(none)'}
- Inauspicious: ${d.fiends.length ? d.fiends.join(', ') : '(none)'}

## Clashes & Directions
- Clash: ${d.chong.zodiac} (${d.chong.ganzhi}) · Sha direction: ${d.shaDirection}
- Joy: ${d.joyDirection} · Wealth: ${d.wealthDirection} · Fortune: ${d.fuDirection}
- Yang noble: ${d.yangGuiDirection} · Yin noble: ${d.yinGuiDirection}
- Fetus: ${d.fetus}
- Pengzu taboo: ${d.pengzuGan} (stem) · ${d.pengzuZhi} (branch)
- Constellation: ${d.constellation}

## Auspicious Hours
${luckyHourLines}
`.trim()
}
