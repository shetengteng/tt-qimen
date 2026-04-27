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
    share: {
      preview: {
        title: 'Share Preview',
        closeAria: 'Close preview',
        imageAlt: 'Share card preview',
        generating: 'Generating preview…',
        hint: 'The QR code below carries the same inputs — scan it on another device to recreate this reading.',
        close: 'Close',
        save: 'Save image',
        share: 'Share',
      },
      qrcode: {
        alt: 'QR code to reproduce this reading',
        hint: 'Scan to recreate this reading on another device.',
      },
    },
    birthInput: {
      inputCardTitle: 'Birth details',
      calendar: { solar: 'Solar', lunar: 'Lunar' },
      field: {
        year: 'Birth year',
        month: 'Month',
        day: 'Day',
        hour: 'Hour',
        gender: 'Gender',
      },
      gender: { male: 'Male', female: 'Female' },
      hours: [
        'Zi (23–1)', 'Chou (1–3)', 'Yin (3–5)', 'Mao (5–7)',
        'Chen (7–9)', 'Si (9–11)', 'Wu (11–13)', 'Wei (13–15)',
        'Shen (15–17)', 'You (17–19)', 'Xu (19–21)', 'Hai (21–23)',
      ],
      btn: {
        paipan: 'Compute chart',
        paipanIcon: '◉',
      },
      advancedToggle: 'Advanced · True Solar Time',
      advancedToggleClose: 'Hide advanced options',
      trueSolarLabel: 'Use true solar time',
      trueSolarHint: 'Adjust the hour pillar by birthplace longitude — closer to traditional practice.',
      birthplaceLabel: 'Birthplace',
      birthplacePlaceholder: 'Select a city (optional)',
      birthplaceCustom: 'Other · enter longitude manually',
      longitudeLabel: 'Longitude',
      longitudePlaceholder: 'e.g. 121.47 (positive °E, negative °W)',
      longitudeHint: 'Range -180 to 180. Beijing time standard meridian = 120°E.',
      offsetPreview: 'Offset: {sign}{minutes} min',
      offsetPreviewNoChange: 'Offset: ±0 min (same as clock time)',
      cities: {
        beijing: 'Beijing', shanghai: 'Shanghai', tianjin: 'Tianjin', chongqing: 'Chongqing',
        shijiazhuang: 'Shijiazhuang', taiyuan: 'Taiyuan', hohhot: 'Hohhot', shenyang: 'Shenyang',
        changchun: 'Changchun', harbin: 'Harbin',
        nanjing: 'Nanjing', hangzhou: 'Hangzhou', hefei: 'Hefei', fuzhou: 'Fuzhou',
        nanchang: 'Nanchang', jinan: 'Jinan', taipei: 'Taipei',
        zhengzhou: 'Zhengzhou', wuhan: 'Wuhan', changsha: 'Changsha', guangzhou: 'Guangzhou',
        nanning: 'Nanning', haikou: 'Haikou',
        chengdu: 'Chengdu', guiyang: 'Guiyang', kunming: 'Kunming', lhasa: 'Lhasa',
        xian: "Xi'an", lanzhou: 'Lanzhou', xining: 'Xining', yinchuan: 'Yinchuan',
        urumqi: 'Urumqi',
        hongkong: 'Hong Kong', macau: 'Macau',
      },
    },
    collapse: {
      collapseLabel: 'Collapse',
      expandLabel: 'Expand',
    },
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

  about: {
    title: 'About',
    lastUpdated: 'Last updated: April 2026',
    sections: [
      {
        heading: '1. What this site is',
        paragraphs: [
          'tt-qimen ("Open the Gate") is an open-source web application that gathers eight classical Chinese metaphysical tools — Bazi (Four Pillars), Zi Wei Dou Shu, Xiao Liu Ren, Cheng Gu (bone-weighing), Guan Yin oracle slips, naming numerology (Wu Ge), the lunar almanac (Huang Li) and dream interpretation — for cultural enthusiasts, researchers and the curious.',
          'It is not a fortune-telling service or a religious establishment. All calculations and interpretations run locally in your browser, based on publicly available classical texts and well-known algorithms. The output is a cultural-experience artefact, nothing more.',
        ],
      },
      {
        heading: '2. Design principles',
        paragraphs: [
          'We treat traditional Chinese metaphysics as a meaningful piece of cultural heritage that records how ancient observers thought about time, the cosmos and the human condition. Our goal is to present this heritage in a modern, restrained and readable way, free of mystification, absolutism or commercial hype.',
        ],
        list: [
          'Cultural integrity: we keep the terminology and structure of the classics, without dressing them up or distorting them.',
          'Entertainment, not prophecy: every output is framed as "for reference", "descriptive", "indicative" — never as a definitive verdict on good or bad fortune.',
          'Friendly tooling: responsive, login-free, ad-free, tracker-free, runnable offline.',
          'Open and transparent: the core algorithms are auditable in our public GitHub repository.',
        ],
      },
      {
        heading: '3. Technology and data',
        paragraphs: [
          'tt-qimen is built on Vue 3, TypeScript and Vite. Calculations rely on open-source libraries such as tyme4ts (perpetual calendar and Four Pillars) and iztro (Zi Wei Dou Shu), together with our own datasets for Cheng Gu, the Guan Yin oracle and naming numerology. See the Data sources page for a full breakdown.',
          'All user input — birth time, names, dream keywords, etc. — is processed only in your browser memory and localStorage. Nothing is ever uploaded to any server. See the Privacy policy for details.',
        ],
      },
      {
        heading: '4. Versioning and feedback',
        paragraphs: [
          'The current release is v1.0 and is still being polished. If you spot a terminology error, an inaccurate citation, or you know of a better classical source for a given interpretation, please open a GitHub issue. We will assess feedback carefully and roll any changes into the public release notes.',
        ],
      },
    ],
  },

  disclaimerPage: {
    title: 'Disclaimer',
    lastUpdated: 'Last updated: April 2026',
    sections: [
      {
        heading: '1. Nature of the content',
        paragraphs: [
          'All output produced by this site — including but not limited to Bazi charts, Zi Wei Dou Shu charts, Xiao Liu Ren palaces, Cheng Gu bone-weights, oracle slips, naming scores, almanac auspicious-or-not entries, and dream readings — is a "cultural-experience artefact" derived from classical metaphysical texts. It does not constitute professional advice, prediction, guarantee or commitment of any kind.',
        ],
      },
      {
        heading: '2. Not professional advice',
        paragraphs: [
          'Output from this site is explicitly not medical, psychological, legal, financial, marital, educational, naming, feng shui or religious advice. Any decision you make based on this site\'s output is entirely your own responsibility, including all consequences.',
        ],
        list: [
          'Health: if you experience physical or mental discomfort, consult a licensed clinician or therapist first; do not use this site for diagnosis or treatment.',
          'Legal matters: for marriage, contracts or litigation, consult a qualified lawyer.',
          'Finance: investing involves risk; decisions should rest on market analysis and licensed financial advisers, not on this site.',
          'Major life choices: for education, career, marriage or relocation, weigh your real circumstances and professional advice; traditional metaphysics is at most one cultural input.',
        ],
      },
      {
        heading: '3. Limits of traditional metaphysics',
        paragraphs: [
          'Chinese traditional metaphysics emerged in an agrarian society whose philosophical and social context differs significantly from the modern world. The same chart can yield very different conclusions depending on the school, era and reader; that is a feature of the discipline itself, not a defect of this site.',
          'We follow mainstream public sources for our algorithms and readings, but they are not "the only correct" interpretation. Please remain open-minded and critical.',
        ],
      },
      {
        heading: '4. No absolute predictions',
        paragraphs: [
          'We preserve traditional vocabulary in the UI (such as "noble helper", "malign star", "auspicious day", "inauspicious day"), but every accompanying interpretation is framed as "for reference", "probabilistic", or "descriptive". You will not see verdicts phrased as "must", "will definitely" or "absolutely".',
          'If using this site causes anxiety, fear, dependence or passivity, please stop immediately and seek qualified psychological support.',
        ],
      },
      {
        heading: '5. Limitation of liability',
        paragraphs: [
          'tt-qimen is an open-source, free, ad-free, non-profit cultural tool. To the maximum extent permitted by applicable law, the authors and contributors disclaim all liability for any direct, indirect, incidental, special, consequential or punitive damages arising from the use, misuse or reliance on the content of this site.',
          'By using this site you acknowledge that you have read, understood and agreed to this disclaimer in full.',
        ],
      },
    ],
  },

  dataSourcePage: {
    title: 'Data sources',
    lastUpdated: 'Last updated: April 2026',
    sections: [
      {
        heading: '1. Overview',
        paragraphs: [
          'Every algorithm, body of text and interpretation template on this site is based on publicly available classical works, mainstream school commentaries, and open-source datasets. No private or "secret-lineage" material is used. The breakdown below is by module.',
        ],
      },
      {
        heading: '2. Bazi (Four Pillars)',
        paragraphs: [
          'Calendrical computation relies on the open-source npm package tyme4ts (author: 6tail), which covers solar/lunar calendars, solar terms, stems-and-branches and shensha.',
        ],
        list: [
          'Di Tian Sui, Zi Ping Zhen Quan, San Ming Tong Hui: terminology and reasoning frame for useful gods, formats and the Ten Gods.',
          'Qiong Tong Bao Jian: reference for "tempering useful gods" (cold/warm/dry/wet).',
          'Yuan Hai Zi Ping: foundational Four-Pillars charting principles.',
          'Shensha tables: synthesised from the Xie Ji Bian Fang Shu and mainstream school compilations.',
        ],
      },
      {
        heading: '3. Zi Wei Dou Shu',
        paragraphs: [
          'Charting relies on the open-source npm package iztro (MIT licence).',
        ],
        list: [
          'Zi Wei Dou Shu Quan Shu: foundational layout and meaning of palaces, stars and the Four Transformations.',
          'Shi Ba Fei Xing Ce Tian Zi Wei Dou Shu: supplementary auxiliary and malign stars.',
          'Modern Taiwan / Hong Kong school commentaries: reference readings for transformation flights and the "three sides and four corners" structure.',
        ],
      },
      {
        heading: '4. Xiao Liu Ren',
        paragraphs: [
          'Based on the simplified time-board variant of "Xiao Liu Ren" described in the Liu Ren Shi Ke and Da Liu Ren Zhi Nan, with palaces (Da An, Liu Lian, Su Xi, Chi Kou, Xiao Ji, Kong Wang) derived from the three-step month/day/hour count.',
        ],
      },
      {
        heading: '5. Cheng Gu (bone-weighing)',
        paragraphs: [
          'Compiled from the popular Yuan Tian-gang Bone-Weighing Verses. Bone-weight-to-verse mappings come from publicly circulated print editions; we have gently reconciled differences between versions in the interpretive text.',
        ],
      },
      {
        heading: '6. Guan Yin oracle slips',
        paragraphs: [
          'We use the most widely circulated "100 Guan Yin slips" system. The verses, glosses and commentaries are drawn from public temple print editions and open-source compilations. The site takes no religious stance.',
        ],
      },
      {
        heading: '7. Naming numerology (Wu Ge)',
        paragraphs: [
          'We follow the "Five Grids" (Wu Ge) method developed by Kumasaki Kenou and later popularised in Greater China.',
        ],
        list: [
          'Stroke counts: based on the Kangxi Dictionary radical-and-stroke system.',
          '81 numerology fortunes: from the standard annotated edition of "Naming Studies" (Kumasaki Kenou).',
          'Naming scores and grid fortunes are shown for cultural display only; we do not recommend renaming on this basis. Naming should weigh family heritage, personal meaning and modern aesthetics together.',
        ],
      },
      {
        heading: '8. Almanac (Huang Li)',
        paragraphs: [
          'Built on tyme4ts data for solar terms, stems-and-branches, the Twelve Officers, the 28 Lunar Mansions, the Peng Zu taboos and shensha. The "auspicious / inauspicious" matrix and lucky hours follow mainstream printed almanacs.',
        ],
      },
      {
        heading: '9. Dream interpretation',
        paragraphs: [
          'Dream entries are compiled from publicly circulated editions of the Duke of Zhou\'s Dream Interpretation, with mild modernisation in tone to remove overly mystical or fatalistic phrasing.',
        ],
      },
      {
        heading: '10. Acknowledgements',
        paragraphs: [
          'We thank the historical authors and annotators of the classics above, and the maintainers of the open-source projects we depend on, including tyme4ts, iztro, qrcode, html2canvas and reka-ui. tt-qimen stands on their shoulders.',
        ],
      },
    ],
  },

  privacyPage: {
    title: 'Privacy policy',
    lastUpdated: 'Last updated: April 2026',
    sections: [
      {
        heading: '1. Core promise',
        paragraphs: [
          'This site does not collect, store or upload any personal data. Every calculation runs locally in your browser.',
        ],
      },
      {
        heading: '2. What is stored locally',
        paragraphs: [
          'For a smoother experience, the following information is kept in your browser\'s localStorage and is readable only by you:',
        ],
        list: [
          'Birth input (year/month/day/hour, gender, solar/lunar) — to keep chart context across pages.',
          'Theme and language preference (Guofeng / Minimal, Simplified / Traditional / English).',
          'Module-specific transient state (such as the current Huang Li date, or recent dream-keyword searches).',
        ],
      },
      {
        heading: '3. What is NOT collected',
        paragraphs: [
          'This site does not collect any of the following:',
        ],
        list: [
          'Real names, ID numbers, phone numbers, email addresses, postal addresses or any other identifying information.',
          'Device fingerprints, IP addresses, browser profiles or advertising identifiers.',
          'Behavioural logs, click heatmaps or dwell-time tracking.',
          'Third-party cookies or cross-site tracking.',
        ],
      },
      {
        heading: '4. Third-party resources',
        paragraphs: [
          'All static assets (HTML/JS/CSS/fonts/icons) are either self-hosted or served from version-pinned open-source CDNs. We do not embed any third-party analytics, advertising or social trackers (Google Analytics, Facebook Pixel, Baidu Tongji, etc.).',
          'If you use the browser\'s system-level Web Share API to share a result card to a social platform, that sharing action is governed by the destination platform\'s own privacy policy, which we cannot influence.',
        ],
      },
      {
        heading: '5. QR codes and sharing',
        paragraphs: [
          'The QR codes in the footer and share dialog are generated locally by the qrcode library. They encode only the current page URL and contain no user-identifying information. Scanning them lands the scanner on a public page of this site, where their browser will recompute results locally as well.',
        ],
      },
      {
        heading: '6. Clearing your data',
        paragraphs: [
          'To clear locally saved preferences and birth input, use your browser\'s "Clear site data / Clear localStorage" feature. We hold no copies, so once cleared the data cannot be recovered.',
        ],
      },
      {
        heading: '7. Children\'s privacy',
        paragraphs: [
          'tt-qimen is an open-source non-profit tool and is not directed at children under 13. If a guardian observes a minor using this site for prolonged periods or developing anxiety or dependence, please stop the activity and seek psychological support.',
        ],
      },
      {
        heading: '8. Updates to this policy',
        paragraphs: [
          'For material changes, we will refresh the "Last updated" date at the top of this page and note the change in the GitHub repository\'s release notes. Continued use of the site implies acceptance of the latest version of this policy.',
        ],
      },
    ],
  },

  errorBoundary: {
    title: 'Something went wrong',
    unknown: 'The page hit an unexpected issue while rendering. Your input is preserved — you can retry or go back to the home page.',
    moduleLabel: 'Module',
    codeLabel: 'Code',
    retry: 'Retry',
    goHome: 'Go home',
    fortuneCode: {
      'empty-dataset': 'The dataset for this module is currently empty. The offline bundle may not be ready yet — please try again later.',
      'invalid-input': 'Your input could not be parsed. Please double-check your birth time, name or keywords and retry.',
      'out-of-range': 'Your input is outside the range this module supports. Please adjust and retry.',
      'dep-load-failed': 'A dependent resource failed to load (network may be unstable). Please refresh or try again later.',
      invariant: 'An internal invariant was broken — this run has been aborted. Please report it as a GitHub issue.',
      unknown: 'An uncategorised error occurred during computation. Please retry or go home.',
    },
  },

}
