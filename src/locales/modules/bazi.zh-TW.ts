export default {
  title: '八字',
  subtitle: '四柱推命 · 五行相生',
  pageTitle: '八字命盤',
  pageSubtitle: '四柱推演 · 五行強弱 · 十神格局 · 大運流年',
  breadcrumbHome: '首頁',
  breadcrumbCurrent: '八字命盤',

  inputCardTitle: '錄入生辰',
  calendar: { solar: '公曆', lunar: '農曆' },
  field: {
    year: '出生年',
    month: '月',
    day: '日',
    hour: '時辰',
    gender: '性別',
  },
  gender: { male: '男', female: '女', maleTitle: '乾造', femaleTitle: '坤造' },
  hours: [
    '子時 (23-1)', '丑時 (1-3)', '寅時 (3-5)', '卯時 (5-7)',
    '辰時 (7-9)', '巳時 (9-11)', '午時 (11-13)', '未時 (13-15)',
    '申時 (15-17)', '酉時 (17-19)', '戌時 (19-21)', '亥時 (21-23)',
  ],
  btn: {
    paipan: '開始排盤',
    paipanIcon: '◉',
    repaipan: '重新排盤',
    repaipanIcon: '◑',
    share: '生成分享卡片',
    shareIcon: '◈',
    save: '保存到本地',
    saveIcon: '◐',
    moreYears: '查看更多年份 →',
    shishenDetail: '查看詳細十神解讀 ▾',
    shishenDetailCollapse: '收起詳細十神解讀 ▴',
  },

  resultBanner: { title: '排盤結果', subtitle: '四柱 · 五行 · 十神 · 大運 · 流年' },
  resultZoneHint: '請在上方輸入生辰 · 點擊「開始排盤」以觀命盤',

  skeleton: {
    title: '推演中',
    subtitle: '取用神、配大運、繫流年',
  },

  computeError: {
    title: '排盤未完成',
    hint: '當前生辰無法生成命盤，請檢查生辰輸入後重新排盤。',
    retry: '重新排盤',
  },

  chartTitle: '排盤 · 乾造',
  chartTitlePrefix: '排盤',
  chartMeta: { solarLabel: '公曆', lunarLabel: '農曆' },

  pillars: { year: '年柱', month: '月柱', day: '日柱 · 我', hour: '時柱' },
  rowLabel: { gan: '天 干', zhi: '地 支', canggan: '藏 干', shishen: '十 神', nayin: '納 音' },
  rizhuTag: '日 主',
  canggangHint: '本氣',

  relations: {
    chong: '子午相沖',
    zixing: '午午自刑',
    anhe: '巳午暗合',
    chongDescMn: '年支 ↔ 日支，主動盪',
    zixingDescMn: '年支 ↔ 時支，主自耗',
    anheDescMn: '月支 ↔ 時支，主暗助',
  },

  shishen: {
    sectionTitle: '十神結構',
    sectionTag: '官印 · 財官格',
    moreShown: '查看詳細十神解讀',
    detailPanelLabel: '十神詳細解讀',
    longField: {
      trait: '性格特質',
      suit: '適宜方向',
      caution: '行運警示',
      relation: '與日主關係',
    },
    items: [
      {
        pillar: '年干',
        gan: '庚',
        shishen: '偏財',
        desc: '代表父親、意外之財、外在機遇。年干偏財透，早年得長輩提攜，可因外出或多元收入起家。',
        descMn: '代表父親、外在財富與機遇。主動求財而得，對外出、投資敏感。',
      },
      {
        pillar: '月干',
        gan: '辛',
        shishen: '正財',
        desc: '代表固定資產、妻宮、穩定回報。月干正財與年干偏財雙透，宜防「財多身弱」，合作重於獨幹。',
        descMn: '代表正職薪資、配偶。財星雙透需防「浮財」與勞碌，宜穩中求進。',
      },
      {
        pillar: '時干',
        gan: '甲',
        shishen: '偏印',
        desc: '代表才藝、繼母、靈感、宗教傾向。時干偏印透出，文思敏捷，晚年得才藝傍身，亦主子女聰明。',
        descMn: '代表才藝、學術、子女。文思敏捷，有靈感，適合創作與規劃。',
      },
      {
        pillar: '日主',
        gan: '丙',
        shishen: '日主',
        desc: '本命之主，為陽火丙。性格開朗、熱情、領導力強；取用神水木以潤澤，忌火土再旺。',
        descMn: '日主丙火，性格開朗、熱情、領導力強；用神水木以潤澤。',
      },
    ],
  },

  radar: {
    title: '五行強弱',
    desc: '火氣當令三勢，金兩透有根，木、水、土各有一勢。日主丙火坐子水、甲木生扶，身強能任財官，唯木弱、水淺，宜以水潤、木疏為上策。',
    descMn: '火氣當令三勢，金兩透有根，木、水、土各佔一勢。日主丙火坐子水、甲木生扶，身強能任財官；木弱水淺為短板，宜水潤、木疏為上策。',
    labels: { mu: '木', huo: '火', tu: '土', jin: '金', shui: '水' },
  },

  fiveElementsLabel: { strong: '偏旺', weak: '偏弱', balanced: '平' },

  interpret: {
    title: '命盤簡析',
    p1: '日主丙火生於巳月火旺之時，火氣當令，身強有力。天干庚辛金透出為財星，地支子水為官，有財有官而有用。唯獨木氣偏弱，年支午火過旺，宜以水潤之、以木疏之。',
    p2: '格局上偏印（甲）配日主，文思敏捷；財星雙透（庚辛），事業上宜與貴人合作。子水為官星，利於求職、升遷之事。',
    tags: ['身 · 強', '格 · 財官相濟', '用神 · 水木', '忌神 · 火土'],
    tagsMn: ['身強', '財官相濟', '用神 · 水木', '忌神 · 火土'],
    tagAnnots: [
      {
        focus: 'tag-shen',
        short: '身強：日主氣足，能擔財官。',
        long: '日主丙火生在巳月火旺之地，又得年時火土相助，氣勢充盈。身強者宜行財、官、食傷之運以洩秀，最忌再補印比助身。',
      },
      {
        focus: 'tag-pattern',
        short: '財官相濟：庚辛金為財、子水為官，財生官旺。',
        long: '天干庚辛金透出為財星，地支子水暗藏為官星，財能生官、官能護財，是事業宮位的穩定結構。利於在組織中擔任帶資源的中層角色，亦適合與貴人合作經商。',
      },
      {
        focus: 'tag-yongshen',
        short: '用神 · 水木：以水潤火、以木疏土。',
        long: '本盤火土偏旺，需以水克之、以木耗之。歲運若引動壬癸亥子（水）、甲乙寅卯（木）則身心順遂；流年遇水木相生之地，事業、感情、健康三方面同步上行。',
      },
      {
        focus: 'tag-jishen',
        short: '忌神 · 火土：火土再旺則身重難調。',
        long: '本盤已是火土偏旺，再遇丙丁巳午（火）或戊己辰戌丑未（土）的歲運，則身勢過亢，易表現為脾氣急躁、判斷激進、人際摩擦增加；行運至此宜以水木的事務、環境、人事來調和。',
      },
    ],
    patternExpand: {
      open: '查看{name}完整解讀',
      close: '收起{name}完整解讀',
    },
  },

  shensha: {
    title: '神煞',
    pillarAbbr: { year: '年', month: '月', day: '日', hour: '時' },
    category: {
      auspicious:   { title: '吉神', sub: '貴氣扶助' },
      neutral:      { title: '中性', sub: '助力與課題並存' },
      inauspicious: { title: '凶煞', sub: '宜留意' },
    },
    footerTip: '神煞僅作性格與趨勢參考，不代表絕對吉凶',
    empty: '本命四柱未命中常見神煞',
  },

  fortune: {
    title: '大運 · 十年一變',
    titleMn: '大運時間軸',
    subtitle: '起運 5 歲 · 一生十運 · 蛇形鋪陳',
    subtitleMn1: '起運 5 歲 · 十年一運',
    subtitleMn2: '一生十運 · 蛇形鋪陳',
    genderBadgeMale: '乾造 · 順行',
    genderBadgeFemale: '坤造 · 逆行',
    genderBadgeHint: '此模組按性別展開（四柱五行十神不受性別影響）',
    currentDetailTitle: '當前大運 · {age} 歲',
    currentDetailTitleMn: '當前大運 · {tenGod}',
    currentDetailSubtitleMn: '{ganzhi} · {tenGod} · {verdict}',
    yi: '宜',
    ji: '忌',
    /** @deprecated 舊示例文案（1990-05-20 男樣本），改為按 chart 動態拼裝；保留 key 僅為向後兼容，不再被任何路徑渲染 */
    currentDetailSubtitle: '天干乙木為正印，地支酉金為正財 · 印財相生 · 吉',
    /** @deprecated 同上，已由 chart.decades[*].hint 動態填充 */
    currentDetailHint: '此十年走正印配正財之運，印主學識、正氣與名聲；財主財富、務實與收獲。印星有利於進修、轉型、獲得資格認證；財星則提示在本行業深耕能得實利。總體是「長期投入 · 穩健回報」的階段。',
    /** @deprecated 同上，無可信源動態生成 yi/ji 行為列表，已刪除展示 */
    yiContent: '學習進修、拿證書、跟隨師長、處理文書、適度投資房產或長線資產',
    /** @deprecated 同上 */
    jiContent: '頻繁跳槽、投機冒險、與女性長輩衝突、過度消費',
    /** @deprecated 同上，吉/中/凶 badge 已由 chart.decades[*].tendency 動態生成 */
    currentBadge: '吉運',
    verdictJi: '吉',
    verdictZhong: '中',
    verdictXiong: '凶',
  },

  flow: {
    title: '流年 · 一歲一更',
    titleMn: '流年運勢',
    subtitle: '當年運勢與大運共振，取其要領而觀之',
    subtitleMn: '一歲一更 · 與大運共振',
    currentSuffix: '今年',
  },

  collapse: {
    sectionChart: '◎ 命盤',
    sectionInterpret: '◎ 命盤簡析',
    sectionShensha: '◎ 神煞',
    sectionFortune: '◎ 大運時間軸',
    sectionFlow: '◎ 流年',
    sectionChartMn: '命盤',
    sectionInterpretMn: '命盤簡析',
    sectionShenshaMn: '神煞',
    sectionFortuneMn: '大運時間軸',
    sectionFlowMn: '流年運勢',
    annotExpand: '展開註釋',
    annotCollapse: '收起註釋',
    annotLabel: {
      nayin: '納音註釋',
      pattern: '格局註釋',
      shensha: '神煞註釋',
    },
  },

  share: {
    title: '我的八字命盤 · TT 占卜',
    text: '四柱 · 五行 · 十神 · 大運 · 流年。來自 TT 占卜的命盤解讀。',
  },

  source: {
    prefix: '出處：',
    classicalLabel: '古籍原文',
    pending: '待審校',
  },
}
