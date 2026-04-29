export default {
  title: 'Bazi (Eight Characters)',
  subtitle: 'Four Pillars · Five Phases',
  pageTitle: 'Bazi Chart',
  pageSubtitle: 'Four Pillars · Phase strengths · Ten Gods · Major & Annual fortunes',
  breadcrumbHome: 'Home',
  breadcrumbCurrent: 'Bazi Chart',

  inputCardTitle: 'Enter birth time',
  calendar: { solar: 'Solar', lunar: 'Lunar' },
  field: {
    year: 'Birth year',
    month: 'Month',
    day: 'Day',
    hour: 'Hour',
    gender: 'Gender',
  },
  gender: { male: 'Male', female: 'Female', maleTitle: 'Male nativity', femaleTitle: 'Female nativity' },
  hours: [
    'Zi (23–1)', 'Chou (1–3)', 'Yin (3–5)', 'Mao (5–7)',
    'Chen (7–9)', 'Si (9–11)', 'Wu (11–13)', 'Wei (13–15)',
    'Shen (15–17)', 'You (17–19)', 'Xu (19–21)', 'Hai (21–23)',
  ],
  btn: {
    paipan: 'Compute chart',
    paipanIcon: '◉',
    repaipan: 'Recompute',
    repaipanIcon: '◑',
    share: 'Share card',
    shareIcon: '◈',
    save: 'Save locally',
    saveIcon: '◐',
    moreYears: 'More years →',
    shishenDetail: 'Detailed Ten Gods reading ▾',
    shishenDetailCollapse: 'Collapse detailed reading ▴',
  },

  resultBanner: {
    title: 'Your Bazi reading',
    subtitle: 'Pillars · Phases · Ten Gods · Major fortune · Annual fortune',
  },
  resultZoneHint: 'Enter birth time above and tap "Compute chart" to view',

  skeleton: {
    title: 'Calculating',
    subtitle: 'Selecting useful god, mapping major fortunes, threading annual fortunes',
  },

  computeError: {
    title: 'Chart unavailable',
    hint: 'We could not compute a chart from this birth time. Please review the inputs and try again.',
    retry: 'Recompute',
  },

  chartTitle: 'Chart · Male nativity',
  chartTitlePrefix: 'Chart',
  chartMeta: { solarLabel: 'Solar', lunarLabel: 'Lunar' },

  pillars: { year: 'Year', month: 'Month', day: 'Day · Self', hour: 'Hour' },
  rowLabel: { gan: 'Gan', zhi: 'Zhi', canggan: 'Hidden', shishen: 'Ten Gods', nayin: 'Nayin' },
  rizhuTag: 'Day Master',
  canggangHint: 'Primary',

  relations: {
    chong: 'Zi-Wu Clash',
    zixing: 'Wu-Wu Self-punishment',
    anhe: 'Si-Wu Hidden Union',
    chongDescMn: 'Year-branch ↔ Day-branch — instability',
    zixingDescMn: 'Year-branch ↔ Hour-branch — self-drain',
    anheDescMn: 'Month-branch ↔ Hour-branch — hidden support',
  },

  shishen: {
    sectionTitle: 'Ten Gods Structure',
    sectionTag: 'Officer-Seal · Wealth-Officer pattern',
    moreShown: 'View detailed Ten Gods reading',
    detailPanelLabel: 'Ten Gods Detailed Reading',
    longField: {
      trait: 'Personality',
      suit: 'Best suited for',
      caution: 'Watch out for',
      relation: 'Relation to Day Master',
    },
    items: [
      {
        pillar: 'Year stem',
        gan: 'Geng',
        shishen: 'Indirect Wealth',
        desc: 'Represents father, unexpected gains, external opportunities. Year-stem Indirect Wealth indicates early support from elders; income from travel or diversified streams.',
        descMn: 'Father, external wealth and opportunity. Active wealth-seeking; sensitive to travel and investment.',
      },
      {
        pillar: 'Month stem',
        gan: 'Xin',
        shishen: 'Direct Wealth',
        desc: 'Represents fixed assets, spouse palace, stable returns. With Indirect Wealth on the year, beware "wealth heavy, body weak"; collaboration over solo work.',
        descMn: 'Fixed salary, spouse. Double wealth stems require steady steps over showy moves.',
      },
      {
        pillar: 'Hour stem',
        gan: 'Jia',
        shishen: 'Indirect Resource',
        desc: 'Represents talent, stepmother, inspiration, spirituality. Hour-stem Indirect Resource indicates quick wits, late-life talents, and bright children.',
        descMn: 'Talent, scholarship, children. Quick wits, suited to creation and planning.',
      },
      {
        pillar: 'Day master',
        gan: 'Bing',
        shishen: 'Day Master',
        desc: 'The self of the chart — Yang Fire Bing. Outgoing, passionate, leading; uses Water and Wood to moderate; avoid more Fire or Earth.',
        descMn: 'Day master Bing Fire — outgoing, passionate, leading; uses Water and Wood.',
      },
    ],
  },

  radar: {
    title: 'Five-Phase Strength',
    desc: 'Fire dominates with three counts. Metal has two with roots. Wood, Water and Earth have one each. Day master Bing Fire sits over Zi water with Jia wood support — strong enough to take on Wealth and Officer; only Wood is weak and Water shallow, so use Water-moisture and Wood-spread as the optimal strategy.',
    descMn: 'Fire dominates (3); Metal (2) rooted; Wood, Water, Earth one each. Day master Bing Fire over Zi water with Jia wood support — strong enough; Wood-weak and Water-shallow are the gaps, treat with Water and Wood.',
    labels: { mu: 'Wood', huo: 'Fire', tu: 'Earth', jin: 'Metal', shui: 'Water' },
  },

  fiveElementsLabel: { strong: 'Strong', weak: 'Weak', balanced: 'Balanced' },

  interpret: {
    title: 'Chart synopsis',
    p1: 'Day master Bing Fire is born in Si month at the height of Fire — strong and capable. Geng and Xin Metal stems are Wealth, while Zi Water in the day branch is the Officer; both Wealth and Officer are present and useful. Only Wood is weak and Year-branch Wu Fire is excessive — moisten with Water and dredge with Wood.',
    p2: 'Pattern-wise, Indirect Resource (Jia) supports the Day Master, lending quick wit; double Wealth stems (Geng, Xin) suggest career thrives with allies. Zi Water as the Officer favors job-hunting and promotions.',
    tags: ['Body · Strong', 'Pattern · Wealth-Officer', 'Useful · Water + Wood', 'Avoid · Fire + Earth'],
    tagsMn: ['Strong body', 'Wealth-Officer', 'Useful · Water + Wood', 'Avoid · Fire + Earth'],
    tagAnnots: [
      {
        focus: 'tag-shen',
        short: 'Strong body: the day master is well-rooted and can carry Wealth and Officer.',
        long: 'Bing Fire is born in the Si month at the height of Fire and is further supported by Fire and Earth in the year and hour. A strong body benefits from Wealth, Officer, and Output cycles to release surplus, and avoids more Resource or Companion supports.',
      },
      {
        focus: 'tag-pattern',
        short: 'Wealth–Officer: Geng/Xin Metal as Wealth and Zi Water as Officer reinforce each other.',
        long: 'Geng and Xin Metal stems serve as Wealth, while Zi Water in the day branch is the Officer. Wealth nourishes the Officer and the Officer protects Wealth — a stable career structure that suits resourceful mid-management roles or partnerships with senior allies.',
      },
      {
        focus: 'tag-yongshen',
        short: 'Useful · Water + Wood: water moistens fire, wood drains earth.',
        long: 'Fire and Earth are excessive in this chart, so Water (control) and Wood (consumption) are wanted. When the major or annual cycles bring Ren/Gui or Hai/Zi (Water), or Jia/Yi or Yin/Mao (Wood), affairs flow more easily across career, relationships, and health.',
      },
      {
        focus: 'tag-jishen',
        short: 'Avoid · Fire + Earth: more fire/earth makes the body too heavy to balance.',
        long: 'The chart is already Fire/Earth heavy. More Bing/Ding or Si/Wu (Fire), or Wu/Ji or Chen/Xu/Chou/Wei (Earth) cycles can make energy spike — visible as quick temper, aggressive judgment, and interpersonal friction. During those years, lean toward Water/Wood themed work, environments, and people.',
      },
    ],
    patternExpand: {
      open: 'Show full {name} interpretation',
      close: 'Hide full {name} interpretation',
    },
  },

  shensha: {
    title: 'Spiritual Stars',
    pillarAbbr: { year: 'Y', month: 'M', day: 'D', hour: 'H' },
    category: {
      auspicious:   { title: 'Auspicious', sub: 'noble support' },
      neutral:      { title: 'Neutral',    sub: 'help & challenge coexist' },
      inauspicious: { title: 'Inauspicious', sub: 'stay mindful' },
    },
    footerTip: 'Spiritual stars reflect tendencies, not absolute fate.',
    empty: 'No common spiritual stars detected in the four pillars.',
  },

  fortune: {
    title: 'Major fortunes · Decade by decade',
    titleMn: 'Major fortune timeline',
    subtitle: 'Starts at age 5 · Ten decades over a lifetime · Snake layout',
    subtitleMn1: 'Starts at age 5 · One decade per fortune',
    subtitleMn2: 'Ten fortunes total · Snake layout',
    genderBadgeMale: 'Male nativity · Forward',
    genderBadgeFemale: 'Female nativity · Reverse',
    genderBadgeHint: 'This section is gender-aware (the four pillars / five elements / ten gods are not)',
    currentDetailTitle: 'Current major fortune · Ages {age}',
    currentDetailTitleMn: 'Current fortune · {tenGod}',
    currentDetailSubtitleMn: '{ganzhi} · {tenGod} · {verdict}',
    yi: 'Do',
    ji: 'Avoid',
    /** @deprecated Sample copy from the 1990-05-20 male prototype; now generated dynamically from chart. Key kept for backward compatibility, no longer rendered. */
    currentDetailSubtitle: 'Yi Wood as Direct Resource, You Metal as Direct Wealth · Resource–Wealth synergy · Auspicious',
    /** @deprecated Same as above; superseded by chart.decades[*].hint. */
    currentDetailHint: 'This decade walks Direct Resource paired with Direct Wealth — Resource brings learning, integrity and reputation; Wealth brings income, pragmatism and harvest. Resource favors further study, role transition and certification; Wealth signals deep cultivation in your field. Overall, this is a phase of "long-term investment, steady returns".',
    /** @deprecated Same as above; no trustworthy source to dynamically generate yi/ji behavior list, removed from UI. */
    yiContent: 'Study, certify, follow mentors, handle documents, moderate property or long-term investments',
    /** @deprecated Same as above. */
    jiContent: 'Frequent job-hopping, speculation, conflict with female elders, overspending',
    /** @deprecated Same as above; verdict badge now derived from chart.decades[*].tendency. */
    currentBadge: 'Auspicious',
    verdictJi: 'Lucky',
    verdictZhong: 'Mid',
    verdictXiong: 'Adverse',
  },

  flow: {
    title: 'Annual fortunes · Year by year',
    titleMn: 'Annual fortune',
    subtitle: 'The year resonates with the major fortune — pick the essentials',
    subtitleMn: 'One change per year · Resonates with major fortune',
    currentSuffix: 'This year',
  },

  collapse: {
    sectionChart: '◎ Chart',
    sectionInterpret: '◎ Interpretation',
    sectionShensha: '◎ Spiritual Stars',
    sectionFortune: '◎ Major Fortune',
    sectionFlow: '◎ Annual Fortune',
    sectionChartMn: 'Chart',
    sectionInterpretMn: 'Interpretation',
    sectionShenshaMn: 'Spiritual Stars',
    sectionFortuneMn: 'Major Fortune',
    sectionFlowMn: 'Annual Fortune',
    annotExpand: 'Expand notes',
    annotCollapse: 'Collapse notes',
    annotLabel: {
      nayin: 'Nayin notes',
      pattern: 'Pattern notes',
      shensha: 'Spiritual-star notes',
    },
  },

  share: {
    title: 'My Bazi Chart · TT Divination',
    text: 'Four pillars · Five elements · Ten gods · Fortune cycles. Brought to you by TT Divination.',
  },

  source: {
    prefix: 'Source: ',
    classicalLabel: 'Classical source',
    pending: 'Under review',
  },

  ai: {
    preset: {
      career: 'Career direction · suitable industries & decisions',
      marriage: 'Marriage & relationships · spouse palace insights',
      wealth: 'Wealth pattern · how & when money is likely to come',
      health: 'Health & rhythm · five-element imbalances',
      thisYear: 'This year — key opportunities and pitfalls',
      lifeStage: 'Current life stage · the focus of this decadal cycle',
    },
  },
}
