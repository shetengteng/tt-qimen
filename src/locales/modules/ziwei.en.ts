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
  },

  minorStars: {
    title: 'Six Lucky & Six Malefic · Palace Readings',
    summaryFmt: 'This chart: {lucky} lucky stars · {malefic} malefic stars',
    luckyGroup: 'Six Lucky Stars · Noble Support',
    maleficGroup: 'Six Malefic Stars · Sharp Edges',
    entryMissing: 'No copy for this minor-star × palace combination yet — read alongside the Major Stars and the Three-Square-Four-Correct.',
    empty: 'No Six Lucky / Six Malefic stars fall into the twelve palaces; lean on Major Stars and the four transformations.',
  },

  interpret: {
    cards: {
      mingPalace: {
        title: 'Life Palace Reading',
        text: 'Zi-Wei and Tan-Lang share the Life Palace at Chen, in the Temple-Brilliant tier; with Tan-Lang carrying Hua-Lu, the chart blends nobility and charisma. The configuration favours arts, public-relations and decision-making roles, with steady support from benefactors throughout life — but romance and socialising must be moderated lest glamour scatter the focus.',
      },
      sihua: {
        title: 'Four Transformations',
        text: 'Tan-Lang Hua-Lu sits in the Life Palace · talent and opportunity rise together; Wu-Qu Hua-Quan falls into the Spiritual Palace · clear judgement in money matters; Tai-Yin Hua-Ke enters the Parents Palace · favourable for reputation and recognition; Tian-Liang Hua-Ji enters the Children Palace · the bond with children is thinner and warrants extra investment in inter-generational care.',
      },
      minorStars: {
        title: 'Six Auspicious & Six Inauspicious',
        text: 'Zuo-Fu and You-Bi sit in Parents and Property — long-running benefactor support; Wen-Chang and Wen-Qu meet across Life and Wealth — favourable for academia and writing-based careers. Qing-Yang in Property, Tuo-Luo in Travel, Huo-Xing and Ling-Xing across Children and Wealth all flag turbulence in motion: the rule of thumb is "stay still on big matters, stay agile on small ones."',
      },
      shenZhu: {
        title: 'Body Palace · Career Inclination',
        text: 'The Body sits in the Health Palace with Ju-Men guarding it — work that depends on the spoken or written word fits well: lecturing, media, law, consulting. The Career Palace holds Po-Jun at Shen, signalling reform and pioneering — open new ground inside an established industry rather than chasing unrelated pivots.',
      },
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
    sectionInterpret: '◎ Chart Reading',
    sectionDaxian: '◎ Major / Minor Limits',
    sectionDecadalDetail: '◎ Current Major-Limit',
    sectionFlowYear: '◎ Flow-Year',
    sectionMetaMn: 'Metadata',
    sectionChartMn: 'Twelve Palaces',
    sectionSoulPalaceMn: 'Life Palace Major Star',
    sectionPalaceMajorMn: 'Major Star Briefs',
    sectionMinorStarsMn: 'Six Lucky & Six Malefic',
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
}
