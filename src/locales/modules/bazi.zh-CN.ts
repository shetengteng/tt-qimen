export default {
  title: '八字',
  subtitle: '四柱推命 · 五行相生',
  pageTitle: '八字命盘',
  pageSubtitle: '四柱推演 · 五行强弱 · 十神格局 · 大运流年',
  breadcrumbHome: '首页',
  breadcrumbCurrent: '八字命盘',

  inputCardTitle: '录入生辰',
  /**
   * @deprecated 已迁移至 common.birthInput.calendar/field/hours/btn.paipan(Icon)
   * 仅保留为兼容别名（暂无消费方）；FourPillarsTable.vue 仍通过
   * bazi.gender.maleTitle/femaleTitle 使用本对象，故不能整体删除。
   */
  calendar: { solar: '公历', lunar: '农历' },
  field: {
    year: '出生年',
    month: '月',
    day: '日',
    hour: '时辰',
    gender: '性别',
  },
  gender: { male: '男', female: '女', maleTitle: '乾造', femaleTitle: '坤造' },
  hours: [
    '子时 (23-1)', '丑时 (1-3)', '寅时 (3-5)', '卯时 (5-7)',
    '辰时 (7-9)', '巳时 (9-11)', '午时 (11-13)', '未时 (13-15)',
    '申时 (15-17)', '酉时 (17-19)', '戌时 (19-21)', '亥时 (21-23)',
  ],
  btn: {
    paipan: '开始排盘',
    paipanIcon: '◉',
    repaipan: '重新排盘',
    repaipanIcon: '◑',
    share: '生成分享卡片',
    shareIcon: '◈',
    save: '保存到本地',
    saveIcon: '◐',
    moreYears: '查看更多年份 →',
    shishenDetail: '查看详细十神解读 ▾',
    shishenDetailCollapse: '收起详细十神解读 ▴',
  },

  resultBanner: { title: '排盘结果', subtitle: '四柱 · 五行 · 十神 · 大运 · 流年' },
  resultZoneHint: '请在上方输入生辰 · 点击「开始排盘」以观命盘',

  skeleton: {
    title: '推演中',
    subtitle: '取用神、配大运、系流年',
  },

  computeError: {
    title: '排盘未完成',
    hint: '当前生辰无法生成命盘，请检查生辰输入后重新排盘。',
    retry: '重新排盘',
  },

  chartTitle: '排盘 · 乾造',
  chartTitlePrefix: '排盘',
  chartMeta: { solarLabel: '公历', lunarLabel: '农历' },

  pillars: { year: '年柱', month: '月柱', day: '日柱 · 我', hour: '时柱' },
  rowLabel: { gan: '天 干', zhi: '地 支', canggan: '藏 干', shishen: '十 神', nayin: '纳 音' },
  rizhuTag: '日 主',
  canggangHint: '本气',

  relations: {
    chong: '子午相冲',
    zixing: '午午自刑',
    anhe: '巳午暗合',
    chongDescMn: '年支 ↔ 日支，主动荡',
    zixingDescMn: '年支 ↔ 时支，主自耗',
    anheDescMn: '月支 ↔ 时支，主暗助',
  },

  shishen: {
    sectionTitle: '十神结构',
    sectionTag: '官印 · 财官格',
    moreShown: '查看详细十神解读',
    detailPanelLabel: '十神详细解读',
    longField: {
      trait: '性格特质',
      suit: '适宜方向',
      caution: '行运警示',
      relation: '与日主关系',
    },
    items: [
      {
        pillar: '年干',
        gan: '庚',
        shishen: '偏财',
        desc: '代表父亲、意外之财、外在机遇。年干偏财透，早年得长辈提携，可因外出或多元收入起家。',
        descMn: '代表父亲、外在财富与机遇。主动求财而得，对外出、投资敏感。',
      },
      {
        pillar: '月干',
        gan: '辛',
        shishen: '正财',
        desc: '代表固定资产、妻宫、稳定回报。月干正财与年干偏财双透，宜防"财多身弱"，合作重于独干。',
        descMn: '代表正职薪资、配偶。财星双透需防"浮财"与劳碌，宜稳中求进。',
      },
      {
        pillar: '时干',
        gan: '甲',
        shishen: '偏印',
        desc: '代表才艺、继母、灵感、宗教倾向。时干偏印透出，文思敏捷，晚年得才艺傍身，也主子女聪明。',
        descMn: '代表才艺、学术、子女。文思敏捷，有灵感，适合创作与规划。',
      },
      {
        pillar: '日主',
        gan: '丙',
        shishen: '日主',
        desc: '本命之主，为阳火丙。性格开朗、热情、领导力强；取用神水木以润泽，忌火土再旺。',
        descMn: '日主丙火，性格开朗、热情、领导力强；用神水木以润泽。',
      },
    ],
  },

  radar: {
    title: '五行强弱',
    desc: '火气当令三势，金两透有根，木、水、土各有一势。日主丙火坐子水、甲木生扶，身强能任财官，唯木弱、水浅，宜以水润、木疏为上策。',
    descMn: '火气当令三势，金两透有根，木、水、土各占一势。日主丙火坐子水、甲木生扶，身强能任财官；木弱水浅为短板，宜水润、木疏为上策。',
    labels: { mu: '木', huo: '火', tu: '土', jin: '金', shui: '水' },
  },

  fiveElementsLabel: { strong: '偏旺', weak: '偏弱', balanced: '平' },

  interpret: {
    title: '命盘简析',
    p1: '日主丙火生于巳月火旺之时，火气当令，身强有力。天干庚辛金透出为财星，地支子水为官，有财有官而有用。唯独木气偏弱，年支午火过旺，宜以水润之、以木疏之。',
    p2: '格局上偏印（甲）配日主，文思敏捷；财星双透（庚辛），事业上宜与贵人合作。子水为官星，利于求职、升迁之事。',
    tags: ['身 · 强', '格 · 财官相济', '用神 · 水木', '忌神 · 火土'],
    tagsMn: ['身强', '财官相济', '用神 · 水木', '忌神 · 火土'],
    /**
     * v3.1.1 注释交互：4 条格局 tag 的展开释义。
     * focus key 必须稳定，与 InterpretBlock.vue 内 annotItems 按下标对齐。
     * 设计文档：design/bazi/2026-04-21-03-注释交互设计方案.md §11
     */
    tagAnnots: [
      {
        focus: 'tag-shen',
        short: '身强：日主气足，能担财官。',
        long: '日主丙火生在巳月火旺之地，又得年时火土相助，气势充盈。身强者宜行财、官、食伤之运以泄秀，最忌再补印比助身。',
      },
      {
        focus: 'tag-pattern',
        short: '财官相济：庚辛金为财、子水为官，财生官旺。',
        long: '天干庚辛金透出为财星，地支子水暗藏为官星，财能生官、官能护财，是事业宫位的稳定结构。利于在组织中担任带资源的中层角色，亦适合与贵人合作经商。',
      },
      {
        focus: 'tag-yongshen',
        short: '用神 · 水木：以水润火、以木疏土。',
        long: '本盘火土偏旺，需以水克之、以木耗之。岁运若引动壬癸亥子（水）、甲乙寅卯（木）则身心顺遂；流年遇水木相生之地，事业、感情、健康三方面同步上行。',
      },
      {
        focus: 'tag-jishen',
        short: '忌神 · 火土：火土再旺则身重难调。',
        long: '本盘已是火土偏旺，再遇丙丁巳午（火）或戊己辰戌丑未（土）的岁运，则身势过亢，易表现为脾气急躁、判断激进、人际摩擦增加；行运至此宜以水木的事务、环境、人事来调和。',
      },
    ],
    patternExpand: {
      open: '查看{name}完整解读',
      close: '收起{name}完整解读',
    },
  },

  shensha: {
    title: '神煞',
    pillarAbbr: { year: '年', month: '月', day: '日', hour: '时' },
    category: {
      auspicious:   { title: '吉神', sub: '贵气扶助' },
      neutral:      { title: '中性', sub: '助力与课题并存' },
      inauspicious: { title: '凶煞', sub: '宜留意' },
    },
    footerTip: '神煞仅作性格与趋势参考，不代表绝对吉凶',
    empty: '本命四柱未命中常见神煞',
  },

  fortune: {
    title: '大运 · 十年一变',
    titleMn: '大运时间轴',
    subtitle: '起运 5 岁 · 一生十运 · 蛇形铺陈',
    subtitleMn1: '起运 5 岁 · 十年一运',
    subtitleMn2: '一生十运 · 蛇形铺陈',
    genderBadgeMale: '乾造 · 顺行',
    genderBadgeFemale: '坤造 · 逆行',
    genderBadgeHint: '此模块按性别展开（四柱五行十神不受性别影响）',
    currentDetailTitle: '当前大运 · {age} 岁',
    currentDetailTitleMn: '当前大运 · {tenGod}',
    currentDetailSubtitleMn: '{ganzhi} · {tenGod} · {verdict}',
    yi: '宜',
    ji: '忌',
    /** @deprecated 旧示例文案（1990-05-20 男样本），改为按 chart 动态拼装；保留 key 仅为向后兼容，不再被任何路径渲染 */
    currentDetailSubtitle: '天干乙木为正印，地支酉金为正财 · 印财相生 · 吉',
    /** @deprecated 同上，已由 chart.decades[*].hint 动态填充 */
    currentDetailHint: '此十年走正印配正财之运，印主学识、正气与名声；财主财富、务实与收获。印星有利于进修、转型、获得资格认证；财星则提示在本行业深耕能得实利。总体是"长期投入 · 稳健回报"的阶段。',
    /** @deprecated 同上，无可信源动态生成 yi/ji 行为列表，已删除展示 */
    yiContent: '学习进修、拿证书、跟随师长、处理文书、适度投资房产或长线资产',
    /** @deprecated 同上 */
    jiContent: '频繁跳槽、投机冒险、与女性长辈冲突、过度消费',
    /** @deprecated 同上，吉/中/凶 badge 已由 chart.decades[*].tendency 动态生成 */
    currentBadge: '吉运',
    verdictJi: '吉',
    verdictZhong: '中',
    verdictXiong: '凶',
  },

  flow: {
    title: '流年 · 一岁一更',
    titleMn: '流年运势',
    subtitle: '当年运势与大运共振，取其要领而观之',
    subtitleMn: '一岁一更 · 与大运共振',
    currentSuffix: '今年',
  },

  collapse: {
    sectionChart: '◎ 命盘',
    sectionInterpret: '◎ 命盘简析',
    sectionShensha: '◎ 神煞',
    sectionFortune: '◎ 大运时间轴',
    sectionFlow: '◎ 流年',
    sectionChartMn: '命盘',
    sectionInterpretMn: '命盘简析',
    sectionShenshaMn: '神煞',
    sectionFortuneMn: '大运时间轴',
    sectionFlowMn: '流年运势',
    annotExpand: '展开注释',
    annotCollapse: '收起注释',
    annotLabel: {
      nayin: '纳音注释',
      pattern: '格局注释',
      shensha: '神煞注释',
    },
  },

  share: {
    title: '我的八字命盘 · TT 占卜',
    text: '四柱 · 五行 · 十神 · 大运 · 流年。来自 TT 占卜的命盘解读。',
  },

  source: {
    prefix: '出处：',
    classicalLabel: '古籍原文',
    pending: '待审校',
  },
}
