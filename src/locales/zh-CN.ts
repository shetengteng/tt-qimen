export default {
  brand: 'tt-qimen',
  brandFull: '启门问卜',
  brandMark: '启',
  tagline: '占卜八面 · 知命归心',
  disclaimer: '✦ 本站内容仅供文化体验与娱乐参考 · 不构成专业建议 ✦',

  common: {
    theme: '主题',
    language: '语言',
    placeholder: {
      year: '请输入年份',
      month: '请输入月份',
      day: '请输入日期',
      hour: '请输入时辰',
    },
    button: {
      compute: '排盘',
      reset: '重置',
      back: '返回',
    },
    age: '{n} 岁',
    nodata: '暂无数据',
    loading: '推算中…',
    underConstruction: '此模块正在建设中，敬请期待。',
  },

  nav: {
    home: '首页',
    bazi: '八字',
    ziwei: '紫微',
    chenggu: '称骨',
    liuren: '小六壬',
    lingqian: '灵签',
    xingming: '姓名',
    huangli: '黄历',
    jiemeng: '解梦',
  },

  home: {
    title: '首页',
    subtitle: '八门玄机 · 一念归一',
    intro: '选择下方任一门法，输入生辰即可查看推演。所有数据仅在你的浏览器内运算，绝无上传。',
    enter: '进入',
    hero: {
      ornament: '◈ ◈ ◈',
      titleMain: '启门',
      titleAccent: '问卜',
      subtitle1: '承袭古法，演今人运命之趣',
      subtitle2: '七种中华传统占卜方术 · 一站体验',
      ctaPrimary: '测我八字',
      ctaSecondary: '浏览七法',
      ctaPrimaryIcon: '◉',
      ctaSecondaryIcon: '◐',
      sealRight: '启门问卜',
      sealLeft: '丙午',
      eyebrow: 'MVP v1.0 · 七模块全面上线',
      titleMnLine1: '一站式',
      titleMnLine2A: '传统命理',
      titleMnLine2B: '体验',
      subtitleMn1: '基于开源算法库与公版古籍，离线运行、尊重隐私。',
      subtitleMn2: '在浏览器中体验七种中国传统占卜方术。',
      ctaMnPrimary: '立即排盘',
      ctaMnSecondary: '浏览模块',
    },
    stats: {
      methods: '占卜方法',
      methodsValue: '7',
      jiemengEntries: '解梦词条',
      jiemengEntriesValue: '2380',
      lingqian: '观音灵签',
      lingqianValue: '100',
      offline: '完全离线',
      offlineValue: '∞',
    },
    huangli: {
      day: '18',
      monthLunar: '农历戊戌',
      lunarDay: '三月初二',
      monthMnLine1: '四月 · 周六',
      monthMnLine2: '农历三月初二',
      ganzhiLabel: '干支：',
      ganzhi: '丙午年 壬辰月 辛卯日',
      yi: '宜',
      yiValue: '祭祀 · 祈福 · 出行 · 会友 · 签约',
      ji: '忌',
      jiValue: '动土 · 嫁娶 · 开业',
      detailLink: '查看详情 →',
      detailLinkMn: '查看完整黄历',
      todayLabel: '今日干支',
    },
    sectionDivider: '✦ 七法问卜 ✦',
    sectionTitle: '择其一法，问心而行',
    sectionSubtitle: '每一种占卜，皆是文化的传承与内心的对话',
    sectionTitleMn: '七大模块',
    sectionSubMn: '点击任一卡片，开始你的占卜之旅',
    featuresDivider: '◆ 启门之道 ◆',
    featuresTitleMn: '为什么选择 tt-qimen',
    featuresSubMn: '专注可靠、尊重隐私、尊重文化',
  },

  modules: {
    bazi:    { name: '八字', short: '八', title: '八字命盘', desc: '四柱推演 · 五行强弱 · 十神格局 · 大运流年一览', descMn: '四柱推演、五行强弱、十神格局、大运流年全览。', tags: ['专业推荐', '含大运', '含流年'], tagsMn: ['专业', '含大运', '含流年'], badge: '核心', sub: '四柱推命 · 五行相生' },
    ziwei:   { name: '紫微', short: '紫', title: '紫微斗数', desc: '十二宫推演 · 主星副星 · 四化飞星 · 大限小限', descMn: '十二宫推演、主星副星、四化飞星、大限小限全覆盖。', tags: ['专业推荐', '12 宫', '四化'], tagsMn: ['专业', '12 宫', '四化'], badge: '核心', sub: '十二宫垣 · 三方四正' },
    chenggu: { name: '称骨', short: '称', title: '称骨算命', desc: '袁天罡古歌诀 · 五十一段骨重定命格', descMn: '袁天罡古歌诀，通过生辰骨重查询 51 段命格歌诀。', tags: ['入门友好', '古风歌诀'], tagsMn: ['入门', '古风'], sub: '袁天罡之诀 · 一斤一两' },
    liuren:  { name: '小六壬', short: '壬', title: '小六壬', desc: '大安留连速喜 · 赤口小吉空亡 · 随时问卜', descMn: '大安、留连、速喜、赤口、小吉、空亡，日常速问。', tags: ['日常速问'], tagsMn: ['快速'], sub: '掐指一算 · 应事即时' },
    lingqian:{ name: '灵签', short: '签', title: '观音灵签', desc: '心诚则灵 · 摇签百支 · 问事指迷', descMn: '摇签百支、配古人典故与五事指引，仪式感占卜。', tags: ['仪式感'], tagsMn: ['100 签'], sub: '虔诚一念 · 神明指引' },
    xingming:{ name: '姓名', short: '名', title: '姓名学五格', desc: '康熙笔画 · 天人地外总五格 · 八十一数理', descMn: '康熙笔画计算天人地外总格，结合 81 数理分析。', tags: ['实用工具'], tagsMn: ['实用'], sub: '五格剖象 · 三才配置' },
    huangli: { name: '黄历', short: '历', title: '黄历择日', desc: '每日宜忌 · 吉神凶煞 · 九类事由速查', descMn: '每日宜忌、吉凶神煞、九类事由点选速查。', tags: ['高频可用'], tagsMn: ['高频'], sub: '宜忌吉时 · 节气物候' },
    jiemeng: { name: '解梦', short: '梦', title: '周公解梦', desc: '两千词条古籍 · 模糊查询 · 现代建议', descMn: '两千词条古籍 + 现代心理学解读，关键词模糊查询。', tags: ['随时查阅'], tagsMn: ['2380 条'], sub: '梦境寻踪 · 心象索解' },
  },

  features: {
    items: [
      { icon: '卍', title: '古籍考据', desc: '歌诀签文皆取自公版古籍，保留原貌，以白话辅注' },
      { icon: '☷', title: '静态无忧', desc: '生辰信息仅存于本机，无上传、无追踪、无广告打扰' },
      { icon: '☯', title: '文化为本', desc: '以传承为首，娱乐为辅；不作吉凶绝对之言' },
      { icon: '卐', title: '可存可分享', desc: '一键生成分享卡，典雅印章风，朋友圈文艺范' },
    ],
    itemsMn: [
      { icon: '✓', title: '公版古籍 + 开源算法', desc: '核心依赖 tyme4ts、chinese-character-strokes 等开源库；签文歌诀均取自公版古籍。' },
      { icon: '⌂', title: '纯静态 · 完全离线', desc: '生辰信息仅存于本机 LocalStorage，不上传、不追踪、无广告。' },
      { icon: '◐', title: '文化为本 · 娱乐为辅', desc: '不作吉凶绝对之言，保留传统表达，辅以现代化解读。' },
      { icon: '◇', title: '分享友好', desc: '一键生成结果卡片，支持保存到相册或分享到社交平台。' },
    ],
  },

  footer: {
    branding: '启门问卜 · tt-qimen · 古今同道',
    brandingMn: 'tt-qimen · 启门问卜 · 版本 v1.0',
    about: '关于',
    disclaimerLink: '免责声明',
    dataSource: '数据来源',
    privacy: '隐私',
    privacyMn: '隐私政策',
    copyright: '© 2026 tt-qimen · 仅供文化体验，不构成专业建议',
    copyrightMn: '© 2026 tt-qimen. 仅供文化体验，不构成专业建议。',
  },

  bazi: {
    title: '八字',
    subtitle: '四柱推命 · 五行相生',
    pageTitle: '八字命盘',
    pageSubtitle: '四柱推演 · 五行强弱 · 十神格局 · 大运流年',
    breadcrumbHome: '首页',
    breadcrumbCurrent: '八字命盘',

    inputCardTitle: '录入生辰',
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
      collapseLabel: '收起',
      expandLabel: '展开',
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
  },
  ziwei: {
    title: '紫微斗数',
    subtitle: '十二宫垣 · 三方四正',
    pageTitle: '紫 微 斗 數',
    pageSubtitle: '十二宫推演 · 主星副星 · 四化飞星 · 大限小限',
    breadcrumbHome: '首页',
    breadcrumbCurrent: '紫微斗数',

    inputCardTitle: '录入生辰',
    btn: {
      paipan: '排紫微命盘',
      paipanIcon: '◉',
      repaipan: '重新排盘',
      repaipanIcon: '◑',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '保存到本地',
      saveIcon: '◐',
    },

    resultBanner: {
      title: '紫微命盘',
      subtitle: '十二宫 · 三方四正 · 四化 · 大限小限',
    },

    skeleton: {
      title: '排盘中',
      subtitle: '安星、起命宫、定四化',
    },

    chartMeta: {
      solarLabel: '阳历',
      lunarLabel: '农历',
      fiveElementsLabel: '五行局',
      mingShenLabel: '命主 / 身主',
      qiyunFmt: '{n} 岁起运',
    },

    palaceNames: {
      ming: '命宫',
      xiongdi: '兄弟宫',
      fuqi: '夫妻宫',
      zinv: '子女宫',
      caibo: '财帛宫',
      jie: '疾厄宫',
      qianyi: '迁移宫',
      jiaoyou: '交友宫',
      guanlu: '事业宫',
      tianzhai: '田宅宫',
      fude: '福德宫',
      fumu: '父母宫',
    },
    palaceNamesShort: {
      ming: '命宫',
      xiongdi: '兄弟',
      fuqi: '夫妻',
      zinv: '子女',
      caibo: '财帛',
      jie: '疾厄',
      qianyi: '迁移',
      jiaoyou: '交友',
      guanlu: '事业',
      tianzhai: '田宅',
      fude: '福德',
      fumu: '父母',
    },
    shenSuffix: '· 身',
    daxianPrefix: '大限',

    sihuaLegend: {
      lu: '化禄',
      quan: '化权',
      ke: '化科',
      ji: '化忌',
      brightness: '庙/旺/得/平/陷 = 星曜亮度',
    },
    sihuaShort: { lu: '禄', quan: '权', ke: '科', ji: '忌' },

    sanfang: {
      hint: '命盘已显示「命宫 三方四正」 ——',
      toggleOn: '◐ 命宫 · 三方四正',
      toggleOnMn: '命宫 · 三方四正',
      toggleOff: '× 关闭连线',
      toggleOffMn: '关闭连线',
      reopen: '◐ 显示三方四正',
      reopenMn: '显示三方四正',
    },

    centerPalace: {
      title: '命 盤',
      titleMn: '命盘',
      ownerLabel: '姓名',
      ownerFmt: '{name} · {gender}',
      solarLabel: '阳历',
      fiveLabel: '五行局',
      fiveFmt: '{name} · 起运 {age} 岁',
      mingShenLabel: '命 / 身',
      mingShenFmt: '{ming} · {shen}',
      doujunLabel: '子年斗君',
      hint: '※ 点击外圈任一宫位，可查看详细解读',
    },

    interpret: {
      cards: {
        mingPalace: {
          title: '命宫解读',
          text: '紫微贪狼同坐于辰宫庙地，贪狼化禄加持，兼具贵气与灵气。此格局利于文艺创作、社交公关与经营决策，一生多贵人提携；但需节制桃花与应酬，避免浮华分散心力。',
        },
        sihua: {
          title: '四化飞星',
          text: '贪狼化禄坐命宫 · 才气与机遇并显；武曲化权落福德宫 · 理财有主见；太阴化科入父母宫 · 利文名声誉；天梁化忌入子女宫 · 子女缘较弱，需加倍经营代际关系。',
        },
        minorStars: {
          title: '六吉六煞',
          text: '左辅右弼分坐父母、田宅，贵人扶持绵长；文昌文曲交会于命财，利考学与文字事业。擎羊落田宅、陀罗居迁移、火铃分于子财，皆为行运注意点，动中易生波折，宜「大事静守、小事灵动」。',
        },
        shenZhu: {
          title: '身主 · 事业取向',
          text: '身在疾厄，巨门守身，利口舌为业 —— 讲师、媒体、律师、咨询皆宜。事业宫破军坐申，主变革与开创，宜于成熟行业中另辟新局，避免盲目换行。',
        },
      },
    },

    daxian: {
      title: '大限 · 十年一运',
      titleMn: '大限时间轴',
      currentFmt: '当前 {age} 岁 · 大限 {range}（{palace}）',
      genderBadgeMale: '男命 · 大限按性别展开',
      genderBadgeFemale: '女命 · 大限按性别展开',
      genderBadgeHint: '紫微大限按「阳男阴女顺行、阴男阳女逆行」分流（十二宫与四化不变）',
    },
    xiaoxian: {
      title: '小限 · 一岁一更',
      titleMn: '小限',
      currentFmt: '当前 {year} {ganzhi} · 小限在{palace}',
    },

    mobile: {
      keyPalacesTitle: '主要 4 宫',
      moreTitle: '其余 8 宫',
      expand: '展开 ▼',
      collapse: '收起 ▲',
    },

    collapse: {
      sectionMeta: '◎ 元信息',
      sectionChart: '◎ 十二宫',
      sectionInterpret: '◎ 命盘解读',
      sectionDaxian: '◎ 大限 · 小限',
      sectionMetaMn: '元信息',
      sectionChartMn: '十二宫',
      sectionInterpretMn: '命盘解读',
      sectionDaxianMn: '大限 · 小限',
    },

    share: {
      title: '我的紫微命盘 · TT 占卜',
      text: '十二宫 · 三方四正 · 四化飞星 · 大限小限。来自 TT 占卜的命盘解读。',
    },
  },
  liuren: {
    title: '小六壬',
    subtitle: '掐指一算 · 应事即时',
    pageTitle: '小六壬',
    pageSubtitle: '大安 · 留连 · 速喜 · 赤口 · 小吉 · 空亡',
    breadcrumbHome: '首页',
    breadcrumbCurrent: '小六壬',

    timeBar: {
      lunar: '当前农历',
      monthStep: '月起',
      dayStep: '日数',
      hourStep: '时辰',
    },

    input: {
      title: '起 · 卦',
      modeImmediate: '即时起卦',
      modeCustom: '自定时间',
      questionLabel: '心中一问（选填）',
      questionPlaceholder: '如：今年运势、此事是否成功…',
      aspectLabel: '问事方向',
      hourLabel: '时辰',
      hourSuffix: '时',
      hourNowFmt: '当前（{name}）',
      monthLabel: '农历月',
      dayLabel: '农历日',
    },

    aspect: {
      overall: '综合',
      career: '事业',
      love: '感情',
      wealth: '财运',
      health: '健康',
      travel: '出行',
    },

    btn: {
      paipan: '即刻起卦',
      paipanIcon: '◉',
      reset: '重新起卦',
      resetIcon: '◐',
      repaipan: '再起一卦',
      repaipanIcon: '◑',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '保存到本地',
      saveIcon: '◐',
    },

    resultBanner: {
      title: '卦象既成',
      subtitle: '月起 · 日数 · 时辰 · 三步入宫',
    },

    skeleton: {
      title: '掐指推算',
      subtitle: '取月、加日、入时辰，三步定宫',
    },

    wheel: {
      centerLabel: '当 前 卦',
    },

    verdict: {
      idle: '—',
      ji: '吉 · 顺势可成',
      ping: '平 · 进退有度',
      xiong: '凶 · 宜守不宜进',
    },

    reading: {
      suitable: '宜',
      avoid: '忌',
    },

    placeholder: {
      title: '尚未起卦',
      reading: '请先「即刻起卦」或「自定时间」起一卦，此处将显示对应宫位的解读。',
    },

    computeError: {
      title: '起卦未成',
      hint: '输入数据有误，请检查月/日/时辰后重试。',
      retry: '重新起卦',
    },

    share: {
      title: '我的小六壬 · TT 占卜',
      text: '掐指一算 · 应事即时 · 来自 TT 占卜的小六壬结果。',
    },
  },
  chenggu: {
    title: '称骨论命',
    subtitle: '袁天罡之诀 · 一斤一两',
    pageTitle: '称骨算命',
    pageSubtitle: '袁天罡古法 · 年月日时骨重 · 五十一段歌诀',
    breadcrumbHome: '首页',
    breadcrumbCurrent: '称骨算命',

    inputCardTitle: '录入生辰',
    btn: {
      paipan: '开始称骨',
      paipanIcon: '◈',
      repaipan: '重新称骨',
      repaipanIcon: '◑',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '保存到本地',
      saveIcon: '◐',
    },

    resultBanner: {
      title: '四骨称重',
      subtitle: '年月日时 · 骨重相加 · 歌诀以推终身',
    },

    skeleton: {
      title: '称骨中',
      subtitle: '查年柱、取月日、定时辰、加骨重',
    },

    section: {
      breakdown: '四骨分解',
      poem: '歌诀',
    },

    computeError: {
      title: '称骨未成',
      hint: '生辰数据有误或超出 1900-2100 年支持范围，请检查后重试。',
      retry: '重新录入',
    },

    balance: {
      label: '骨 · 重',
      labelMn: '骨 · 重',
      unit: '两',
      breakdown: {
        year: '年',
        month: '月',
        day: '日',
        hour: '时',
      },
    },

    placeholder: {
      displayWeight: '五两一钱',
    },

    table: {
      year: '年 骨',
      month: '月 骨',
      day: '日 骨',
      hour: '时 骨',
      totalLabel: '四 骨 相 加',
    },

    level: {
      top: '极 · 贵极',
      high: '上 · 贵显',
      middle: '中 · 平顺',
      low: '下 · 辛劳',
      bottom: '贫 · 清苦',
    },

    poem: {
      seal: '启门',
      eyebrow: '袁 天 罡 歌 诀',
      meta: '古法歌诀 · 公版整理',
    },

    interpret: {
      title: '◉ 歌诀释义',
      titleMn: '◆ 歌诀释义',
      note: '注：白话解读由编辑团队在公版古籍基础上整理，仅供文化参考。',
    },

    share: {
      title: '我的称骨算命 · TT 占卜',
      text: '年月日时 · 骨重相加 · 袁天罡古法。来自 TT 占卜的称骨结果。',
    },
  },
  lingqian: {
    title: '灵签问卜',
    subtitle: '虔诚一念 · 神明指引',
    pageTitle: '观音灵签',
    pageSubtitle: '心诚则灵 · 摇签百支 · 问事指迷',
    breadcrumbHome: '首页',
    breadcrumbCurrent: '观音灵签',

    tubeLabel: '观音灵签',

    input: {
      title: '所 求 何 事',
      questionLabel: '心中所问（选填）',
      questionPlaceholder: '如：今年学业、姻缘、事业、求财…',
      topicLabel: '占问领域',
      hintBefore: '心中默念所求之事 ·',
      hintEmphasis: '三次深呼吸',
      hintAfter: '后轻按启签',
    },

    topic: {
      overall: '综合',
      family: '家宅',
      marriage: '婚姻',
      career: '事业',
      wealth: '财富',
      travel: '出行',
      health: '健康',
    },

    btn: {
      paipan: '启签',
      paipanIcon: '◈',
      reset: '再摇',
      resetIcon: '◐',
      repaipan: '重新求签',
      repaipanIcon: '◑',
      share: '生成分享卡片',
      shareIcon: '◈',
      save: '保存到本地',
      saveIcon: '◐',
    },

    resultBanner: {
      title: '签文既启',
      subtitle: '观音慈悲 · 灵签指迷',
    },

    skeleton: {
      title: '摇签百支',
      subtitle: '心诚则灵 · 神明开示',
    },

    qianTitle: {
      qianLabel: '第  签',
      qianPrefix: '第',
      qianSuffix: '签',
    },

    poem: {
      label: '◉ 签 诗 ◉',
      taleLabel: '典故',
      taleLabelMn: '◆ 典故',
      taleIntro: '典出《{title}》。签意详见解曰/仙机与 6 大分类。',
      seal: '观音',
    },

    jieyue: {
      label: '解 曰',
    },

    xianji: {
      label: '仙 机',
    },

    topics: {
      title: '◉ 分事而问 · 六事开示',
    },

    placeholder: {
      title: '尚未求签',
      jieyue: '请先「启签」抽取一签，此处将显示白话解曰。',
      xianji: '签文未出 · 仙机未启',
      topic: '抽签后将按「家宅 / 婚姻 / 事业 / 财富 / 出行 / 健康」逐项开示。',
    },

    divider: {
      qianTitle: '第 {num} 签 · {level}',
    },

    computeError: {
      title: '未能求签',
      hint: '样本数据为空或加载失败，请刷新重试。',
      retry: '重新求签',
    },

    share: {
      title: '我的观音灵签 · TT 占卜',
      text: '虔诚一念 · 神明指引 · 来自 TT 占卜的观音灵签。',
    },
  },
  xingming: {
    title: '姓名学',
    subtitle: '五格剖象 · 三才配置',
  },
  huangli: {
    title: '老黄历',
    subtitle: '宜忌吉时 · 节气物候',
  },
  jiemeng: {
    title: '周公解梦',
    subtitle: '梦境寻踪 · 心象索解',
  },
}
