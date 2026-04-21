/**
 * Bazi mock data — fixed sample for `1990-05-20 午时 · 男`.
 *
 * The sprint goal is UI parity with the prototype, not real bazi computation.
 * All textual narrations live in i18n; this module only exposes raw chart
 * symbols (干支, 数量, 区间) that read identically across locales.
 */

export interface PillarCell {
  gan: string
  zhi: string
  ganAttr: string
  zhiAttr: string
  shishen: string
  nayin: string
  canggang: string[]
  cangganSingle?: boolean
}

export interface FiveElementCell {
  key: 'jin' | 'mu' | 'shui' | 'huo' | 'tu'
  count: number
  percent: number
  status: 'strong' | 'weak' | 'balanced'
}

export interface DecadeCell {
  age: string
  ganzhi: string
  shishen: string
  shishenMn: string
  verdict: 'ji' | 'zhong' | 'xiong'
  current?: boolean
}

export interface FlowYearCell {
  year: number
  ganzhi: string
  shishen: string
  hint: string
  hintTw: string
  hintEn: string
  tags: string[]
  tagsTw: string[]
  tagsEn: string[]
  tagsMn?: { label: string; tone?: 'warning' | 'success' | 'danger' }[]
  current?: boolean
}

export const meta = {
  solar: '1990-05-20 午时',
  solarEn: '1990-05-20, Wu hour',
  lunar: '庚午年 四月廿七',
  lunarTw: '庚午年 四月廿七',
  lunarEn: 'Geng-Wu year, 4th month, 27th day (lunar)',
}

/** order: 年柱 → 月柱 → 日柱 → 时柱 */
export const pillars: PillarCell[] = [
  { gan: '庚', zhi: '午', ganAttr: '阳金', zhiAttr: '阳火', shishen: '偏财', nayin: '路旁土', canggang: ['丁', '己'] },
  { gan: '辛', zhi: '巳', ganAttr: '阴金', zhiAttr: '阴火', shishen: '正财', nayin: '白蜡金', canggang: ['丙', '庚', '戊'] },
  { gan: '丙', zhi: '子', ganAttr: '阳火 · 日主', zhiAttr: '阳水', shishen: '日主', nayin: '涧下水', canggang: ['癸'], cangganSingle: true },
  { gan: '甲', zhi: '午', ganAttr: '阳木', zhiAttr: '阳火', shishen: '偏印', nayin: '沙中金', canggang: ['丁', '己'] },
]

/** Pillar attrs for traditional / english variants — UI uses i18n; these only show in cards. */
export const pillarsByLocale = {
  'zh-CN': pillars,
  'zh-TW': pillars.map((p) => ({
    ...p,
    ganAttr: p.ganAttr.replace('日主', '日主'),
  })),
  en: pillars.map((p) => ({
    ...p,
    ganAttr: p.gan === '丙' ? 'Yang Fire · Day Master' : ({
      庚: 'Yang Metal',
      辛: 'Yin Metal',
      甲: 'Yang Wood',
    } as Record<string, string>)[p.gan] ?? p.ganAttr,
    zhiAttr: ({
      午: 'Yang Fire',
      巳: 'Yin Fire',
      子: 'Yang Water',
    } as Record<string, string>)[p.zhi] ?? p.zhiAttr,
    shishen: ({
      偏财: 'Indirect Wealth',
      正财: 'Direct Wealth',
      日主: 'Day Master',
      偏印: 'Indirect Resource',
    } as Record<string, string>)[p.shishen] ?? p.shishen,
    nayin: ({
      路旁土: 'Roadside Earth',
      白蜡金: 'Wax Metal',
      涧下水: 'Stream Water',
      沙中金: 'Sand Metal',
    } as Record<string, string>)[p.nayin] ?? p.nayin,
  })),
}

export const fiveElements: FiveElementCell[] = [
  { key: 'jin', count: 2, percent: 40, status: 'balanced' },
  { key: 'mu', count: 1, percent: 20, status: 'weak' },
  { key: 'shui', count: 1, percent: 20, status: 'weak' },
  { key: 'huo', count: 3, percent: 60, status: 'strong' },
  { key: 'tu', count: 1, percent: 20, status: 'weak' },
]

/** Radar polygon points map. Each axis 0..5 scale, 5 axes (mu/huo/tu/jin/shui).
 * The points encode the *data polygon* directly so SVG can be reused 1:1 from prototype. */
export const radarPolygonPoints = '0,-48  45.65,-14.83  14.11,19.42  -14.11,19.42  -68.48,-22.25'
export const radarDataPoints: ReadonlyArray<readonly [number, number]> = [
  [0, -48],
  [45.65, -14.83],
  [14.11, 19.42],
  [-14.11, 19.42],
  [-68.48, -22.25],
]

export const decades: DecadeCell[] = [
  { age: '5 - 14',   ganzhi: '壬午', shishen: '七杀 · 劫财', shishenMn: '七杀·劫财', verdict: 'ji' },
  { age: '15 - 24',  ganzhi: '癸未', shishen: '正官 · 伤官', shishenMn: '正官·伤官', verdict: 'zhong' },
  { age: '25 - 34',  ganzhi: '甲申', shishen: '偏印 · 偏财', shishenMn: '偏印·偏财', verdict: 'ji' },
  { age: '35 - 44',  ganzhi: '乙酉', shishen: '正印 · 正财', shishenMn: '正印·正财', verdict: 'ji', current: true },
  { age: '45 - 54',  ganzhi: '丙戌', shishen: '比肩 · 食神', shishenMn: '比肩·食神', verdict: 'zhong' },
  { age: '55 - 64',  ganzhi: '丁亥', shishen: '劫财 · 七杀', shishenMn: '劫财·七杀', verdict: 'xiong' },
  { age: '65 - 74',  ganzhi: '戊子', shishen: '食神 · 正官', shishenMn: '食神·正官', verdict: 'ji' },
  { age: '75 - 84',  ganzhi: '己丑', shishen: '伤官 · 伤官', shishenMn: '伤官·伤官', verdict: 'zhong' },
  { age: '85 - 94',  ganzhi: '庚寅', shishen: '偏财 · 偏印', shishenMn: '偏财·偏印', verdict: 'zhong' },
  { age: '95 - 104', ganzhi: '辛卯', shishen: '正财 · 正印', shishenMn: '正财·正印', verdict: 'ji' },
]

export const flowYears: FlowYearCell[] = [
  {
    year: 2026,
    ganzhi: '丙午',
    shishen: '比肩 · 劫财',
    current: true,
    hint: '同我之气过旺，利于合作、成团，但需防与挚友起财务纠纷。工作上团队项目收益较好。',
    hintTw: '同我之氣過旺，利於合作、成團，但需防與摯友起財務糾紛。工作上團隊項目收益較好。',
    hintEn: 'Self-energy peaks — good for partnership and group projects, but watch for financial disputes with close friends.',
    tags: ['合作', '防合伙纠纷'],
    tagsTw: ['合作', '防合夥糾紛'],
    tagsEn: ['Partnership', 'Beware disputes'],
    tagsMn: [
      { label: '合作' },
      { label: '防合伙纠纷', tone: 'warning' },
    ],
  },
  {
    year: 2027,
    ganzhi: '丁未',
    shishen: '劫财 · 伤官',
    hint: '伤官见官，注意职场口舌。上半年宜守，下半年可动。',
    hintTw: '傷官見官，注意職場口舌。上半年宜守，下半年可動。',
    hintEn: 'Hurting Officer meets Officer — mind workplace tensions. Hold steady early; act later.',
    tags: ['谨言慎行'],
    tagsTw: ['謹言慎行'],
    tagsEn: ['Speak with care'],
    tagsMn: [{ label: '谨言慎行' }],
  },
  {
    year: 2028,
    ganzhi: '戊申',
    shishen: '食神 · 偏财',
    hint: '食神生财，创业或副业破局之年，利于新项目启动。',
    hintTw: '食神生財，創業或副業破局之年，利於新項目啟動。',
    hintEn: 'Eating God births Wealth — a year to launch new ventures or side projects.',
    tags: ['创业有利', '副业'],
    tagsTw: ['創業有利', '副業'],
    tagsEn: ['Good for venture', 'Side hustle'],
    tagsMn: [{ label: '创业有利' }, { label: '副业' }],
  },
  {
    year: 2029,
    ganzhi: '己酉',
    shishen: '伤官 · 正财',
    hint: '伤官生正财，文艺/创意/技术收入稳步增长，利于签订长期合约。',
    hintTw: '傷官生正財，文藝/創意/技術收入穩步增長，利於簽訂長期合約。',
    hintEn: 'Hurting Officer feeds Direct Wealth — steady gains in art, design, or tech. Great for long-term contracts.',
    tags: ['文创', '长期合约'],
    tagsTw: ['文創', '長期合約'],
    tagsEn: ['Creative', 'Long-term contract'],
    tagsMn: [{ label: '文创' }, { label: '长期合约' }],
  },
]
