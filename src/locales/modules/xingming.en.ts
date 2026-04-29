export default {
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
    sancai: 'Three Talents',
    overall: 'Overall Score',
  },

  sancai: {
    sectionTitle: 'Three Talents (Sancai)',
    sectionSubtitle: 'Heaven · Man · Earth — five-element triad · 5-tier verdict',
    slotLabel: {
      tian: 'Heaven',
      ren: 'Man',
      di: 'Earth',
    },
    level: {
      great: 'Auspicious',
      good: 'Favorable',
      mid: 'Mild',
      bad: 'Unfavorable',
      worst: 'Inauspicious',
    },
    relation: {
      sheng: 'Generates',
      ke: 'Conquers',
      tongHe: 'Same',
      xie: 'Drained',
      hao: 'Subdued',
    },
    relationFull: {
      sheng: 'Generating',
      ke: 'Conquering',
      tongHe: 'Harmonizing',
      xie: 'Being Drained',
      hao: 'Being Subdued',
    },
    summary: {
      great: 'Three Talents in mutual generation — a stable foundation.',
      good: 'Strong support and forward momentum.',
      mid: 'Neither clashing nor opposing — steady but neutral.',
      bad: 'One conflict point — handle with awareness.',
      worst: 'Layered conflicts — guard against setbacks.',
    },
    hint: 'The Three Talents take their five-elements from the Heaven, Man, and Earth grids. The Generating (sheng), Conquering (ke), and Harmonizing (tongHe) relations decide a 5-tier verdict, independent from the overall score.',
    diagramAria: 'Three Talents: {tian} {tianToRen} {ren} {renToDi} {di}, level {level}',
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
    gaugeAria: 'Overall score gauge, score {score} out of 100, rating: {badge}',
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

  ai: {
    preset: {
      nameMeaning: 'Name meaning · characters, sound & cultural context',
      nameStrength: 'Five-grid strength · San-Cai (Three-Talents) review',
      improvement: 'Improvement · whether to add a character or rename',
      compatibility: 'Name vs person · fit with personality / industry',
    },
  },
}
