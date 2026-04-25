export default {
  brand: 'tt-qimen',
  brandFull: 'Open the Gate · Ask the Oracle',
  brandMark: 'Q',
  tagline: 'Eight gates of divination · know your fate',
  disclaimer: '✦ Cultural content for entertainment only · not professional advice ✦',

  common: {
    theme: 'Theme',
    language: 'Language',
    placeholder: {
      year: 'Year of birth',
      month: 'Month of birth',
      day: 'Day of birth',
      hour: 'Hour of birth',
    },
    button: {
      compute: 'Compute',
      reset: 'Reset',
      back: 'Back',
    },
    age: '{n} y/o',
    nodata: 'No data',
    loading: 'Computing…',
    underConstruction: 'This module is under construction. Stay tuned.',
  },

  nav: {
    home: 'Home',
    bazi: 'Bazi',
    ziwei: 'Ziwei',
    chenggu: 'ChengGu',
    liuren: 'XiaoLiuRen',
    lingqian: 'LingQian',
    xingming: 'NameNumerology',
    huangli: 'Almanac',
    jiemeng: 'Dreams',
    menu: 'Menu',
  },

  home: {
    title: 'Home',
    subtitle: 'Eight gates of divination · one mind to know',
    intro: 'Pick any school below, enter your birth time, and view the chart. All computation runs in your browser. Nothing is uploaded.',
    enter: 'Enter',
    hero: {
      ornament: '◈ ◈ ◈',
      titleMain: 'Open the',
      titleAccent: 'Gate',
      subtitle1: 'Inheriting the old, divining the modern.',
      subtitle2: 'Seven traditional Chinese divination methods · one place.',
      ctaPrimary: 'Read my Bazi',
      ctaSecondary: 'Browse all methods',
      ctaPrimaryIcon: '◉',
      ctaSecondaryIcon: '◐',
      sealRight: 'tt-qimen',
      sealLeft: 'Bing-Wu',
      eyebrow: 'MVP v1.0 · Seven modules live',
      titleMnLine1: 'One-stop',
      titleMnLine2A: 'Traditional Astrology',
      titleMnLine2B: 'Experience',
      subtitleMn1: 'Built on open-source algorithms and public-domain classics. Runs offline. Respects privacy.',
      subtitleMn2: 'Experience seven Chinese divination methods in your browser.',
      ctaMnPrimary: 'Cast a chart',
      ctaMnSecondary: 'Browse modules',
    },
    stats: {
      methods: 'Methods',
      methodsValue: '7',
      jiemengEntries: 'Dream entries',
      jiemengEntriesValue: '2,380',
      lingqian: 'Sacred lots',
      lingqianValue: '100',
      offline: 'Offline',
      offlineValue: '∞',
    },
    huangli: {
      day: '18',
      monthLunar: 'Wu-Xu (lunar)',
      lunarDay: 'Lunar Mar 2',
      monthMnLine1: 'April · Sat',
      monthMnLine2: 'Lunar Mar 2',
      ganzhiLabel: 'Ganzhi:',
      ganzhi: 'Bing-Wu year · Ren-Chen month · Xin-Mao day',
      yi: 'Auspicious',
      yiValue: 'Worship · Pray · Travel · Meet friends · Sign contracts',
      ji: 'Inauspicious',
      jiValue: 'Break ground · Marry · Open business',
      detailLink: 'View details →',
      detailLinkMn: 'View full almanac',
      todayLabel: "Today's Ganzhi",
    },
    sectionDivider: '✦ Seven divination methods ✦',
    sectionTitle: 'Choose one path, follow your heart',
    sectionSubtitle: 'Every divination is a dialogue with culture and the inner self',
    sectionTitleMn: 'Seven Modules',
    sectionSubMn: 'Click any card to begin your divination journey',
    featuresDivider: '◆ The Way of Qimen ◆',
    featuresTitleMn: 'Why tt-qimen',
    featuresSubMn: 'Reliable · Private · Respectful of culture',
  },

  modules: {
    bazi:    { name: 'Bazi', short: 'B', title: 'Bazi (Eight Characters)', desc: 'Four Pillars · Five Phases · Ten Gods · Major / Annual fortunes', descMn: 'Four Pillars, Five Phases, Ten Gods, Major and Annual fortunes — all-in-one.', tags: ['Pro pick', 'Major fortune', 'Annual fortune'], tagsMn: ['Pro', 'Major', 'Annual'], badge: 'Core', sub: 'Four Pillars · Five Phases' },
    ziwei:   { name: 'Ziwei', short: 'Z', title: 'Ziwei Dou Shu', desc: 'Twelve Palaces · Major & minor stars · Four transformations · Major / minor limits', descMn: 'Twelve palaces, major / minor stars, four transformations, life limits.', tags: ['Pro pick', '12 Palaces', '4 Transformations'], tagsMn: ['Pro', '12 Palaces', '4 Transformations'], badge: 'Core', sub: 'Twelve Palaces · Triple harmony & opposition' },
    chenggu: { name: 'ChengGu', short: 'C', title: 'Cheng Gu (Bone-Weight)', desc: 'Yuan Tiangang verses · 51 fates by bone weight', descMn: 'Yuan Tiangang verses · 51 fates by bone weight.', tags: ['Beginner-friendly', 'Classical verse'], tagsMn: ['Beginner', 'Classical'], sub: 'Yuan Tiangang craft · ounce by ounce' },
    liuren:  { name: 'XiaoLiuRen', short: 'L', title: 'Xiao Liu Ren', desc: 'Da-an, Liu-lian, Su-xi · Chi-kou, Xiao-ji, Kong-wang · instant divination', descMn: 'Da-an, Liu-lian, Su-xi, Chi-kou, Xiao-ji, Kong-wang — daily quick divination.', tags: ['Daily quick'], tagsMn: ['Quick'], sub: 'Snap of fingers · instant answer' },
    lingqian:{ name: 'LingQian', short: 'L', title: 'Guanyin Sacred Lots', desc: 'Sincere intent · 100 lots · guidance', descMn: 'Draw from 100 lots, with classical references and five-fold guidance.', tags: ['Ritual'], tagsMn: ['100 lots'], sub: 'Sincere intent · divine guidance' },
    xingming:{ name: 'NameNumerology', short: 'N', title: 'Name Numerology', desc: 'Kangxi strokes · Five Grids · 81 numerology', descMn: 'Kangxi-stroke based Five-Grid analysis with 81-number numerology.', tags: ['Practical'], tagsMn: ['Useful'], sub: 'Five Grids · Three Talents' },
    huangli: { name: 'Almanac', short: 'A', title: 'Almanac (Huang Li)', desc: 'Daily yi/ji · auspicious / inauspicious · 9 categories', descMn: 'Daily auspicious / inauspicious actions, deities and 9 categories.', tags: ['High-frequency'], tagsMn: ['High-freq'], sub: 'Yi/Ji · solar terms' },
    jiemeng: { name: 'Dreams', short: 'D', title: 'Dream Interpretation', desc: '2000+ classical entries · fuzzy search · modern advice', descMn: '2000+ classical dream entries plus modern psychology, fuzzy search.', tags: ['Anytime'], tagsMn: ['2,380 entries'], sub: 'Trace the dream · decode the symbol' },
  },

  features: {
    items: [
      { icon: '卍', title: 'Classical sources', desc: 'Verses and lots are taken from public-domain classics, with modern annotation.' },
      { icon: '☷', title: 'Static & worry-free', desc: 'Birth data stays only on your device. No upload. No tracking. No ads.' },
      { icon: '☯', title: 'Culture first', desc: 'Heritage over hype, entertainment over absolutes — never claim certain fate.' },
      { icon: '卐', title: 'Save & share', desc: 'One-click share card with elegant seal style, ready for social posts.' },
    ],
    itemsMn: [
      { icon: '✓', title: 'Public-domain texts + open algorithms', desc: 'Core libraries: tyme4ts, chinese-character-strokes; verses and lots from classical sources.' },
      { icon: '⌂', title: 'Pure static · fully offline', desc: 'Birth data stays in browser LocalStorage only. No upload. No tracking. No ads.' },
      { icon: '◐', title: 'Culture first · entertainment second', desc: 'Never declare absolute fortune. Preserve traditional voice with modern reading.' },
      { icon: '◇', title: 'Share-friendly', desc: 'One-click result card; save to album or share on social platforms.' },
    ],
  },

  footer: {
    branding: 'tt-qimen · Open the Gate · A bridge across time',
    brandingMn: 'tt-qimen · Open the Gate · v1.0',
    about: 'About',
    disclaimerLink: 'Disclaimer',
    dataSource: 'Data sources',
    privacy: 'Privacy',
    privacyMn: 'Privacy policy',
    copyright: '© 2026 tt-qimen · Cultural content for entertainment only',
    copyrightMn: '© 2026 tt-qimen. Cultural content for entertainment only.',
  },

  bazi: {
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
      collapseLabel: 'Collapse',
      expandLabel: 'Expand',
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
  },
  ziwei: { title: 'Ziwei Dou Shu', subtitle: 'Twelve Palaces · Triple harmony & opposition' },
  liuren: {
    title: 'Xiao Liu Ren',
    subtitle: 'Snap of fingers · instant answer',
    pageTitle: 'Xiao Liu Ren',
    pageSubtitle: 'Da-An · Liu-Lian · Su-Xi · Chi-Kou · Xiao-Ji · Kong-Wang',
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Xiao Liu Ren',

    timeBar: {
      lunar: 'Lunar Now',
      monthStep: 'Month',
      dayStep: 'Day',
      hourStep: 'Hour',
    },

    input: {
      title: 'Cast a Reading',
      modeImmediate: 'Use Now',
      modeCustom: 'Custom Time',
      questionLabel: 'Your question (optional)',
      questionPlaceholder: 'e.g. fortune of the year, will it succeed…',
      aspectLabel: 'Aspect',
      hourLabel: 'Hour',
      hourSuffix: '',
      hourNowFmt: 'Now ({name})',
      monthLabel: 'Lunar month',
      dayLabel: 'Lunar day',
    },

    aspect: {
      overall: 'Overall',
      career: 'Career',
      love: 'Love',
      wealth: 'Wealth',
      health: 'Health',
      travel: 'Travel',
    },

    btn: {
      paipan: 'Cast',
      paipanIcon: '◉',
      reset: 'Reset',
      resetIcon: '◐',
      repaipan: 'Cast again',
      repaipanIcon: '◑',
      share: 'Share',
      shareIcon: '◈',
      save: 'Save',
      saveIcon: '◐',
    },

    resultBanner: {
      title: 'Reading complete',
      subtitle: 'Three steps · Month · Day · Hour',
    },

    skeleton: {
      title: 'Casting',
      subtitle: 'Month, day, hour — three steps to a palace',
    },

    wheel: {
      centerLabel: 'Current',
    },

    verdict: {
      idle: '—',
      ji: 'Auspicious · move with momentum',
      ping: 'Neutral · keep balance',
      xiong: 'Inauspicious · hold steady',
    },

    reading: {
      suitable: 'Do',
      avoid: 'Avoid',
    },

    placeholder: {
      title: 'No reading yet',
      reading: 'Cast now or pick a custom time to see the reading for the matched palace.',
    },

    computeError: {
      title: 'Reading failed',
      hint: 'Invalid input — please check month, day, and hour and try again.',
      retry: 'Cast again',
    },

    share: {
      title: 'My Xiao Liu Ren reading · TT Divination',
      text: 'Snap of fingers, instant answer. Shared from TT Divination.',
    },
  },
  chenggu: {
    title: 'Cheng Gu',
    subtitle: 'Yuan Tiangang craft · ounce by ounce',
    pageTitle: 'Bone-Weight Reading',
    pageSubtitle: 'Yuan Tiangang method · four-pillar bone weights · 51 fortune verses',
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Bone-Weight Reading',
    inputCardTitle: 'Birth Information',
    btn: {
      paipan: 'Weigh the Bones',
      paipanIcon: '◈',
      repaipan: 'Reset',
      repaipanIcon: '◑',
      share: 'Share Card',
      shareIcon: '◈',
      save: 'Save Image',
      saveIcon: '◐',
    },
    resultBanner: {
      title: 'Four Bone Weights',
      subtitle: 'Year · Month · Day · Hour, summed for a lifelong verse',
    },
    skeleton: {
      title: 'Weighing',
      subtitle: 'Reading year pillar, month, day, and hour…',
    },
    section: {
      breakdown: 'Four-Bone Breakdown',
      poem: 'Verse',
    },
    computeError: {
      title: 'Unable to Weigh',
      hint: 'Birth data is invalid or outside the supported 1900-2100 range. Please recheck.',
      retry: 'Re-enter',
    },
    balance: {
      label: 'Bone · Weight',
      labelMn: 'Bone · Weight',
      unit: 'liang',
      breakdown: { year: 'Year', month: 'Month', day: 'Day', hour: 'Hour' },
    },
    placeholder: { displayWeight: '5.1 liang' },
    table: {
      year: 'Year Bone',
      month: 'Month Bone',
      day: 'Day Bone',
      hour: 'Hour Bone',
      totalLabel: 'Four Bones Summed',
    },
    level: {
      top: 'Supreme · Noble',
      high: 'Upper · Eminent',
      middle: 'Middle · Steady',
      low: 'Lower · Toiling',
      bottom: 'Bottom · Frugal',
    },
    poem: {
      seal: 'TT',
      eyebrow: 'Yuan Tiangang Verse',
      meta: 'Classical verse · public edition',
    },
    interpret: {
      title: '◉ Verse Interpretation',
      titleMn: '◆ Verse Interpretation',
      note: 'Note: plain-language interpretation is prepared from public-domain classical texts, for cultural reference only.',
    },
    share: {
      title: 'My Bone-Weight Reading · TT Divination',
      text: 'Yuan Tiangang bone-weight method · four-pillar sums · lifelong verse. Generated by TT Divination.',
    },
  },
  lingqian: {
    title: 'Guanyin Sacred Lots',
    subtitle: 'Sincere intent · divine guidance',
    pageTitle: 'Guanyin Sacred Lots',
    pageSubtitle: 'Sincere heart · 100 lots · timely guidance',
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Guanyin Sacred Lots',

    tubeLabel: 'Guan Yin',

    /**
     * 6-tier level label dictionary.
     * Data layer keeps Chinese keys ('上上'/'上吉'/...) so LEVEL_TIER lookup keeps working;
     * UI displays English label via t('lingqian.level.{key}').
     */
    level: {
      '上上': 'Excellent',
      '上吉': 'Auspicious',
      '中吉': 'Favorable',
      '中平': 'Neutral',
      '中凶': 'Cautionary',
      '下下': 'Inauspicious',
    },

    input: {
      title: 'What do you seek?',
      questionLabel: 'Your question (optional)',
      questionPlaceholder: 'e.g. career, marriage, wealth, health…',
      topicLabel: 'Topic',
      hintBefore: 'Silently recite your question ·',
      hintEmphasis: 'take three deep breaths',
      hintAfter: 'then gently tap Draw',
      rateLimit: "You've drawn {count} times · Sincerity counts · No need to ask again right away",
    },

    topic: {
      overall: 'Overall',
      family: 'Household',
      marriage: 'Marriage',
      career: 'Career',
      wealth: 'Wealth',
      travel: 'Travel',
      health: 'Health',
    },

    btn: {
      paipan: 'Draw',
      paipanIcon: '◈',
      reset: 'Shake Again',
      resetIcon: '◐',
      repaipan: 'Draw Again',
      repaipanIcon: '◑',
      share: 'Share as Card',
      shareIcon: '◈',
      save: 'Save Image',
      saveIcon: '◐',
    },

    resultBanner: {
      title: 'Your Sacred Lot',
      subtitle: 'Guan Yin’s compassion · a guiding sign',
    },

    skeleton: {
      title: 'Shaking the Lot',
      subtitle: 'Sincere heart · divine unfolding',
    },

    qianTitle: {
      qianLabel: 'Lot No.',
      qianPrefix: 'No.',
      qianSuffix: '',
    },

    poem: {
      label: 'Poem',
      taleLabel: 'Parable',
      taleLabelMn: '◆ Parable',
      taleIntro: 'From the tale of “{title}”. See the interpretation and six-topic guidance below.',
      seal: 'Guan Yin',
    },

    jieyue: {
      label: 'Interpretation',
    },

    xianji: {
      label: 'Divine Hint',
    },

    topics: {
      title: '◆ Six Topics · Detailed Guidance',
    },

    placeholder: {
      title: 'No lot yet',
      jieyue: 'Tap “Draw” to receive a lot; the plain-language interpretation will appear here.',
      xianji: 'Awaiting a lot · divine hint pending',
      topic: 'After drawing, guidance for Household / Marriage / Career / Wealth / Travel / Health will appear here.',
    },

    divider: {
      qianTitle: 'Lot {num} · {level}',
    },

    computeError: {
      title: 'Could not draw a lot',
      hint: 'The lot data failed to load. Please refresh and try again.',
      retry: 'Draw Again',
    },

    centerpiece: {
      ariaLabel: 'Lot #{num} · {level} · {title}',
    },

    share: {
      title: 'My Guanyin Sacred Lot · TT Divination',
      text: 'Sincere intent · divine guidance · a Guanyin Sacred Lot from TT Divination.',
    },
  },
  xingming: {
    title: 'Name Numerology',
    subtitle: 'Five Grids · Three Talents',
    pageTitle: 'Name Numerology · Five Grids',
    pageSubtitle: 'Kangxi strokes · Heaven/Man/Earth/Outer/Total · 81 numbers',
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Five Grids',
    inputCardTitle: 'Name Input',

    field: {
      surname: 'Surname',
      givenName: 'Given name',
      gender: 'Gender',
      birthYear: 'Birth year',
    },
    placeholder: {
      surname: 'e.g. 李',
      givenName: 'e.g. 文轩',
      birthYear: 'Optional · pick a year',
    },
    birthYearOption: {
      unspecified: 'Not specified',
    },
    gender: {
      male: 'Male',
      female: 'Female',
    },

    btn: {
      calculate: 'Compute Five Grids',
      recalculate: 'Try another name',
      share: 'Share result',
      save: 'Save result',
    },

    resultBanner: {
      title: 'Five-Grid Analysis',
      subtitle: 'Heaven · Man · Earth · Outer · Total · 81 numerology · Overall score',
    },

    breakdown: {
      title: 'Stroke Breakdown',
      simplified: 'Simp.',
      kangxi: 'Kangxi',
      kangxiWord: 'Kangxi stroke count',
      hintPrefix: 'Numerology follows ',
      hintSuffix: '; simplified and traditional counts may differ.',
    },

    grids: {
      tian: 'Heaven',
      ren: 'Man',
      di: 'Earth',
      wai: 'Outer',
      zong: 'Total',
    },

    levels: {
      '大吉': 'Great Fortune',
      '吉': 'Fortune',
      '中吉': 'Moderate Fortune',
      '中平': 'Neutral',
      '凶': 'Misfortune',
      '大凶': 'Great Misfortune',
    },

    detail: {
      strokesUnit: 'strokes',
    },

    section: {
      fivegrids: 'Five Grids',
      overall: 'Overall Score',
    },

    overall: {
      label: 'Overall Score',
      badge: {
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Weak',
      },
      badgeWord: {
        excellent: 'a broad and balanced configuration',
        good: 'a well-matched configuration',
        fair: 'a moderate configuration',
        poor: 'a configuration that needs more cultivation',
      },
      summary: '"{name}" shows {badgeWord}: Man-Grid {renElement} · {renLevel}, Total-Grid {zongElement} · {zongLevel}; overall score {score} / 100.',
    },

    skeleton: {
      title: 'Computing five grids...',
      subtitle: 'Kangxi strokes · Heaven/Man/Earth/Outer/Total · 81 numerology',
    },

    computeError: {
      title: 'Computation failed',
      hint: 'Invalid name input. Please check and try again.',
      retry: 'Try again',
      rareChar: 'Character not indexed: {char} (rare character not yet supported)',
      byCode: {
        invalidInput: 'Invalid name input. Please check and try again.',
        invariant: 'Internal computation error (please report with a screenshot of the name).',
        depLoadFailed: 'Failed to load the stroke dictionary. Check your network and try again.',
        unknown: 'Unable to complete the analysis. Please check the input and try again.',
        empty: {
          surname: 'Please enter a surname.',
          givenName: 'Please enter a given name.',
        },
        nonCjk: {
          surname: 'Surname must be Chinese characters only (no Latin letters / digits / symbols).',
          givenName: 'Given name must be Chinese characters only (no Latin letters / digits / symbols).',
        },
        length: {
          surname: 'Surname must be 1-2 Chinese characters.',
          givenName: 'Given name must be 1-2 Chinese characters.',
        },
      },
    },

    share: {
      title: 'My Name Numerology · TT Divination',
      text: 'Kangxi strokes · Five Grids · 81 numerology · from TT Divination.',
    },

    disclaimer: 'The 81-number system was compiled by Kumazaki Kenou in 1918. For cultural reference only and does not equate to personality.',
  },
  huangli: {
    title: 'Almanac (Huang Li)',
    subtitle: 'Yi/Ji · solar terms',
    pageTitle: 'Chinese Almanac',
    pageSubtitle: 'Daily yi / ji · auspicious / inauspicious · 9 matters',
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Almanac',

    resultBanner: {
      title: 'A Day in the Almanac',
      subtitle: 'Yi / Ji · deities · matters · monthly view',
    },

    query: {
      title: 'Pick a Date',
      fieldYear: 'Year',
      fieldMonth: 'Month',
      fieldDay: 'Day',
      fieldMatter: 'Matter (optional)',
      matterAll: 'All',
      btnQuery: 'Query',
      btnQueryIcon: '◈',
      btnToday: 'Today',
      btnTodayIcon: '↻',
    },

    todayCard: {
      weekdayPrefix: '',
      infoGanzhi: 'Ganzhi',
      infoDuty: 'Duty',
      infoFetus: 'Fetal Spirit',
      infoChong: 'Clash',
      infoPengzu: 'PengZu Warn',
      infoTerm: 'Solar Term',
      ecliptic: { yellow: 'Yellow-Path', black: 'Black-Path' },
      dutySuffix: '',
      bigLabel: 'Duty Star',
      chongFmt: 'Clash {zodiac} ({ganzhi}) · Evil toward {direction}',
      noFestival: '—',
    },

    yiji: {
      yiTitle: 'Yi · Recommended',
      yiSubtitle: 'Auspicious activities',
      jiTitle: 'Ji · Avoid',
      jiSubtitle: 'Inauspicious activities',
      empty: 'None',
    },

    shensha: {
      gods: 'Auspicious Gods',
      fiends: 'Inauspicious Gods',
      luckyHours: 'Lucky Hours',
      directions: 'Directions',
      directionsFmt: 'Joy {joy} · Wealth {wealth}',
      empty: '—',
    },

    matters: {
      sectionTitle: 'Nine Matters',
      sectionHint: 'Tap any matter to see today\u2019s verdict',
      all: 'All',
      names: {
        jisi:    'Sacrifice',
        qifu:    'Prayer',
        jiaqu:   'Marriage',
        chuxing: 'Travel',
        qianyue: 'Contract',
        kaishi:  'Open Business',
        dongtu:  'Ground-breaking',
        ruzhai:  'Move In',
        potu:    'Burial Ground',
      },
      verdict: {
        yi: 'Yi',
        ji: 'Ji',
        ping: '—',
      },
    },

    calendar: {
      divider: '◆ Monthly View ◆',
      title: '{year}-{month}',
      prev: 'Prev',
      next: 'Next',
      prevMonthFmt: 'Mo {month}',
      nextMonthFmt: 'Mo {month}',
      prevMonthAria: 'Switch to month {month} (previous)',
      nextMonthAria: 'Switch to month {month} (next)',
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      legendHuangdao: 'Yellow-Path',
      legendHeidao: 'Black-Path',
      legendGood: 'Matches chosen matter',
      matterHintPrefix: 'Filter:',
      clearMatter: 'Clear filter',
      gridAria: '{year}-{month} calendar grid',
      dayAriaFmt: '{year}-{month}-{day} {weekday}',
      todayLabel: 'Today',
      matchLabel: 'Matches chosen matter',
      outOfMonthLabel: 'Other month',
      nextGoodFmt: 'Next ✓ day: {month}/{day}',
      nextGoodAria: 'Jump to {month}/{day} (next day matching chosen matter)',
      openPickerAria: 'Open month/year picker (currently {year}-{month})',
      pickerYearFmt: '{year}',
      pickerMonthFmt: 'Mo {month}',
      pickerYearListAria: 'Year list',
      pickerMonthGridAria: 'Month grid',
      pickerPrevYearAria: 'Switch to {year}',
      pickerNextYearAria: 'Switch to {year}',
    },

    detail: {
      title: 'Selected Day · Detail',
      dialogTitle: 'Almanac Detail',
      closeAria: 'Close detail',
      duty: 'Duty Star',
      dutyIntroFmt: 'Day of {duty}',
      gods: 'Auspicious',
      fiends: 'Inauspicious',
      chongLabel: 'Clash',
      pengzu: 'PengZu Warn',
      fetus: 'Fetal Spirit',
      luckyHours: 'Lucky Hours',
      directions: 'Directions',
      directionsFmt: 'Joy {joy} · Wealth {wealth} · Fortune {fu}',
      dateFmt: '{date} · {weekday}',
      lunarFmt: 'Lunar {lunar} · {ecliptic}',
      yi: 'Yi',
      ji: 'Ji',
      empty: 'None',
    },

    btn: {
      share: 'Share card',
      shareIcon: '◈',
      save: 'Save locally',
      saveIcon: '◐',
      reset: 'Back to today',
      resetIcon: '↻',
    },

    computeError: {
      title: 'Invalid Date',
      hint: 'Please check year / month / day (supported range: 1901\u20132099).',
      retry: 'Back to today',
      byCode: {
        invalidInput: 'Date is not a valid calendar date (e.g. Feb 30 does not exist). Please check year/month/day and try again.',
        outOfRange: 'Year is outside the supported almanac range ({min}\u2013{max}). Please pick a date within range.',
        unknown: 'Almanac computation failed. Please check the date and try again, or go back to today.',
      },
    },

    solarTerm: {
      dialogTitle: 'Solar Term · {name}',
      closeAria: 'Close solar term info',
      viewDayBtn: 'View almanac of this day',
      notFound: 'No description available for this solar term yet.',
      meaningLabel: 'Meaning',
      phenomenaLabel: 'Three pentads (phenology)',
      customsLabel: 'Customs & wellness',
      season: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' },
    },

    luckyHours: {
      dial: {
        ringAria: '12 shichen lucky/unlucky dial',
        cellAria: '{name} ({ganzhi} · {star}), {ecliptic}',
        nowLabel: 'Now',
        summaryLabel: 'Lucky hours',
        hintTapCell: 'Tap a sector for details',
        fallbackSummary: 'Show full list',
      },
    },

    share: {
      title: 'My Almanac Day · TT Divination',
      text: 'Daily yi/ji, deities and 9 matters — from TT Divination.',
    },
  },
  jiemeng: {
    title: 'Dream Interpretation',
    subtitle: 'Trace the dream · decode the symbol',
    pageTitle: 'Dream Interpretation',
    pageSubtitle: 'Classical entries · fuzzy search · modern insight',
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Dream Interpretation',

    input: {
      title: 'Describe the dream',
      keywordLabel: 'Keyword',
      keywordPlaceholder: 'What did you dream of? e.g. 蛇, 掉牙, 飞翔…',
      categoryLabel: 'Category',
      categoryAuto: 'Auto',
      hint: 'Fuzzy search · bundled entries from the public-domain "Zhou Gong Jie Meng" · classical + modern readings',
    },

    btn: {
      search: 'Search',
      searchIcon: '⌕',
      reset: 'Clear',
      resetIcon: '◐',
      share: 'Share card',
      shareIcon: '◈',
      save: 'Save locally',
      saveIcon: '◐',
      another: 'Another dream',
      anotherIcon: '◑',
    },

    category: {
      sectionTitle: 'Browse by category',
      sectionSubtitle: 'Click any card to filter entries within that category',
      countFmt: '{n} entries',
      animal: 'Animals',
      people: 'People',
      nature: 'Nature',
      body: 'Body',
      life: 'Life',
      ghost: 'Spirit',
      building: 'Places',
      other: 'Other',
    },

    recent: {
      label: 'Recent',
      clear: 'Clear',
    },

    result: {
      searchHead: 'Results for "{q}"',
      categoryHead: 'Browsing · {name}',
      allHead: 'All entries',
      countFmt: '{n} entries',
    },

    entry: {
      detailCta: 'View details',
    },

    empty: {
      title: 'No matching entries',
      desc: 'Try a different keyword, or pick a category above to browse.',
    },

    detail: {
      classical: 'Classical source',
      classicalSource: 'Zhou Gong Jie Meng (public domain)',
      modern: 'Modern reading',
      adviceLabel: 'Tip: ',
      sensitiveHint: '※ This entry preserves classical imagery involving death, illness, or spirits as traditional cultural symbols only. Please read them as symbols, not as omens.',
      warning: '⚠ Dream interpretations vary. Entries are cultural references only. If dreams disturb your daily life, please consult a mental-health professional.',
      dialogTitle: 'Entry detail',
      closeAria: 'Close detail',
    },

    tag: {
      auspicious: 'Auspicious',
      cautious: 'Caution',
      ambiguous: 'Ambiguous',
      neutral: 'Neutral',
    },

    share: {
      title: 'My dream entry · TT Divination',
      text: 'Classical source & modern reading — from TT Divination.',
    },
  },
}
