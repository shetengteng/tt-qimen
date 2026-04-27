export default {
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
}
