export default {
  title: 'Ziwei Dou Shu',
  subtitle: 'Twelve Palaces · Triple harmony & opposition',
  pageTitle: 'Z I W E I   D O U   S H U',
  pageSubtitle: 'Twelve palaces · Major & minor stars · Four transformations · Major / minor limits',
  breadcrumbHome: 'Home',
  breadcrumbCurrent: 'Ziwei Dou Shu',

  inputCardTitle: 'Birth Information',
  btn: {
    paipan: 'Cast Ziwei Chart',
    paipanIcon: '◉',
    repaipan: 'Cast Again',
    repaipanIcon: '◑',
    share: 'Share Card',
    shareIcon: '◈',
    save: 'Save Locally',
    saveIcon: '◐',
  },

  resultBanner: {
    title: 'Your Ziwei Chart',
    subtitle: 'Twelve palaces · Triple harmony & opposition · Four transformations · Major / minor limits',
  },

  skeleton: {
    title: 'Casting chart…',
    subtitle: 'Placing stars · finding the Life Palace · resolving four transformations',
  },

  chartMeta: {
    solarLabel: 'Solar',
    lunarLabel: 'Lunar',
    fiveElementsLabel: 'Five-Elements School',
    mingShenLabel: 'Life-Star / Body-Star',
    qiyunFmt: 'Cycle starts at age {n}',
  },

  palaceNames: {
    ming: 'Life Palace',
    xiongdi: 'Siblings Palace',
    fuqi: 'Spouse Palace',
    zinv: 'Children Palace',
    caibo: 'Wealth Palace',
    jie: 'Health Palace',
    qianyi: 'Travel Palace',
    jiaoyou: 'Friends Palace',
    guanlu: 'Career Palace',
    tianzhai: 'Property Palace',
    fude: 'Spiritual Palace',
    fumu: 'Parents Palace',
  },
  palaceNamesShort: {
    ming: 'Life',
    xiongdi: 'Siblings',
    fuqi: 'Spouse',
    zinv: 'Children',
    caibo: 'Wealth',
    jie: 'Health',
    qianyi: 'Travel',
    jiaoyou: 'Friends',
    guanlu: 'Career',
    tianzhai: 'Property',
    fude: 'Spiritual',
    fumu: 'Parents',
  },
  shenSuffix: '· Body',
  daxianPrefix: 'Limit',

  sihuaLegend: {
    lu: 'Hua-Lu (Prosperity)',
    quan: 'Hua-Quan (Authority)',
    ke: 'Hua-Ke (Recognition)',
    ji: 'Hua-Ji (Adversity)',
    brightness: 'Temple / Vigorous / Established / Flat / Trapped = star brightness tier',
  },
  sihuaShort: { lu: 'Lu', quan: 'Quan', ke: 'Ke', ji: 'Ji' },
  sihuaMarkFmt: 'Hua-{label}',

  sanfang: {
    hint: 'The chart is showing «Life Palace · Triple harmony & opposition» ——',
    toggleOn: '◐ Life · Triple harmony & opposition',
    toggleOnMn: 'Life · Triple harmony & opposition',
    toggleOff: '× Hide connections',
    toggleOffMn: 'Hide connections',
    reopen: '◐ Show triple harmony & opposition',
    reopenMn: 'Show triple harmony & opposition',
  },

  centerPalace: {
    title: 'C H A R T',
    titleMn: 'Chart',
    ownerLabel: 'Name',
    ownerFmt: '{name} · {gender}',
    solarLabel: 'Solar',
    fiveLabel: 'Five-Elements',
    fiveFmt: '{name} · cycle starts at age {age}',
    mingShenLabel: 'Life / Body',
    mingShenFmt: '{ming} · {shen}',
    doujunLabel: 'Doujun (Zi-year)',
    hint: '※ Tap any outer palace for its detailed reading',
  },

  soulPalace: {
    title: 'Life Palace Major Star Reading',
    subtitleFmt: '{star} · Life Palace',
    subtitleBorrowedFmt: 'Borrowed {star} · Life Palace',
    keywordsLabel: 'Key motifs',
    borrowedHint: 'No Major Star sits in the Life Palace; borrowed from the Travel Palace and read with reduced weight, alongside the Three-Square-Four-Correct.',
    sihuaFmt: ' · Hua-{label}',
    brightnessFmt: ' · {label}',
    empty: 'Neither the Life Palace nor the Travel Palace holds a Major Star; rely on the Three-Square-Four-Correct and minor stars together.',
  },

  palaceMajor: {
    title: 'Twelve Palaces · Major Star Briefs',
    summaryFmt: '{total} entries (incl. {borrowed} borrowed)',
    borrowedPrefix: 'Borrowed ',
    verdict: { ji: 'Auspicious', zhong: 'Mixed', xiong: 'Inauspicious' },
    entryMissing: 'No brief for this combination yet — read alongside the Three-Square-Four-Correct.',
    empty: 'No Major Star is present across the twelve palaces; rely on minor stars and four transformations together.',
    enPendingBanner: 'English long-form readings are still under professional translation; only chip-level summaries are shown for now.',
    placeholderLineEn: 'Long-form translation pending — please refer to the chip summary above (palace · star · brightness · transformation · verdict).',
  },

  minorStars: {
    title: 'Six Lucky & Six Malefic · Palace Readings',
    summaryFmt: 'This chart: {lucky} lucky stars · {malefic} malefic stars',
    luckyGroup: 'Six Lucky Stars · Noble Support',
    maleficGroup: 'Six Malefic Stars · Sharp Edges',
    entryMissing: 'No copy for this minor-star × palace combination yet — read alongside the Major Stars and the Three-Square-Four-Correct.',
    empty: 'No Six Lucky / Six Malefic stars fall into the twelve palaces; lean on Major Stars and the four transformations.',
    enPendingBanner: 'English long-form readings are still under professional translation; only chip-level summaries are shown for now.',
    placeholderLineEn: 'Long-form translation pending — please refer to the chip summary above (palace · star · group).',
  },

  sihuaReading: {
    title: 'Four Transformations · Life Palace Stem',
    subtitleFmt: '{stem}-Stem Four Transformations · one star each for Lu / Quan / Ke / Ji',
    stemMissing: 'Cannot identify the heavenly stem from the Life Palace ganzhi; this section is hidden.',
    sihuaLabel: { lu: 'Hua-Lu', quan: 'Hua-Quan', ke: 'Hua-Ke', ji: 'Hua-Ji' },
    entryMissing: 'No reading for this Stem × Transformation yet — read alongside the Three-Square-Four-Correct.',
  },

  soulMaster: {
    title: 'Life-Master / Body-Master',
    mingLabel: 'Life-Master',
    shenLabel: 'Body-Master',
    keywordsLabel: 'Key Imagery',
    entryMissing: 'No primary reading available (this star may belong to an alternate tradition).',
    bothMissing: 'This chart lacks data for both Life-Master and Body-Master; please verify your inputs.',
  },

  decadalReview: {
    title: '◆ Decade Review',
    titleMn: 'Decade Review',
    subtitleFmt: '{ganzhi} Decade · ten-year arc',
    entryMissing: 'No decade review available for this 60-Jiazi cycle yet — read alongside the decade four transformations and the natal triad.',
  },

  yearlyReview: {
    title: 'Year Review',
    titleMn: 'Year Review',
    entryMissing: 'No year review available for this 60-Jiazi cycle yet — read alongside the year four transformations and the natal triad.',
  },

  interpret: {
    cards: {
      mingPalace: { title: 'Life Palace Reading' },
      sihua: { title: 'Four Transformations' },
      minorStars: { title: 'Six Auspicious & Six Inauspicious' },
      shenZhu: { title: 'Body Palace · Career Inclination' },
    },
  },

  daxian: {
    title: 'Major Limits · One Decade Each',
    titleMn: 'Major-Limit Timeline',
    currentFmt: 'Currently age {age} · Limit {range} ({palace})',
    genderBadgeMale: 'Male chart · limits unfold by gender',
    genderBadgeFemale: 'Female chart · limits unfold by gender',
    genderBadgeHint: 'Major limits flow forward for Yang-Male / Yin-Female and backward for Yin-Male / Yang-Female (palaces and four transformations are unaffected)',
  },
  xiaoxian: {
    title: 'Minor Limits · One Year Each',
    titleMn: 'Minor Limits',
    currentFmt: 'Currently {year} {ganzhi} · minor limit at {palace}',
  },

  decadalDetail: {
    title: '◆ Current Major-Limit Detail',
    titleMn: 'Current Major-Limit Detail',
    subtitleFmt: 'Age {age} · falls into {palace} ({ganzhi})',
    mainStarsLabel: 'Major-Star Configuration',
    mutagensLabel: 'Decade Four Transformations',
    empty: 'Empty palace',
  },

  flowYear: {
    title: '◆ Flow-Year',
    titleMn: 'Flow-Year',
    expandFmt: 'Show next {count} years ▼',
    collapse: 'Collapse ▲',
  },

  collapse: {
    sectionMeta: '◎ Metadata',
    sectionChart: '◎ Twelve Palaces',
    sectionSoulPalace: '◎ Life Palace Major Star',
    sectionPalaceMajor: '◎ Twelve Palaces · Major Star Briefs',
    sectionMinorStars: '◎ Six Lucky & Six Malefic',
    sectionSihuaReading: '◎ Four Transformations · Life Palace Stem',
    sectionSoulMaster: '◎ Life-Master / Body-Master',
    sectionInterpret: '◎ Chart Reading',
    sectionDaxian: '◎ Major / Minor Limits',
    sectionDecadalDetail: '◎ Current Major-Limit',
    sectionFlowYear: '◎ Flow-Year',
    sectionMetaMn: 'Metadata',
    sectionChartMn: 'Twelve Palaces',
    sectionSoulPalaceMn: 'Life Palace Major Star',
    sectionPalaceMajorMn: 'Major Star Briefs',
    sectionMinorStarsMn: 'Six Lucky & Six Malefic',
    sectionSihuaReadingMn: 'Sihua · Life Palace Stem',
    sectionSoulMasterMn: 'Life-Master / Body-Master',
    sectionInterpretMn: 'Chart Reading',
    sectionDaxianMn: 'Major / Minor Limits',
    sectionDecadalDetailMn: 'Current Major-Limit',
    sectionFlowYearMn: 'Flow-Year',
  },

  share: {
    title: 'My Ziwei Chart · TT Divination',
    text: 'Twelve palaces · triple harmony & opposition · four transformations · major / minor limits. A Ziwei Dou Shu reading from TT Divination.',
  },

  computeError: {
    title: 'Chart not generated',
    hint: 'The current birth input cannot produce a Ziwei chart. Please review your birth details and cast again.',
    retry: 'Cast again',
  },

  ai: {
    preset: {
      mingPalace: 'Self palace stars · personality core & life axis',
      palaces: 'Twelve-palace overview · which are strongest / weakest',
      lifeMaster: 'Soul master / Body master / Doujun · combined reading',
      decadalLuck: 'Current decadal cycle · key palaces & flying mutagens',
      sihua: 'Native four mutagens · meaning of Lu / Quan / Ke / Ji',
      friends: 'Parents / siblings / children / friends · relationships',
    },
  },
}
