export default {
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
  sihuaMarkFmt: '化{label}',

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

  soulPalace: {
    title: '命宫主星论命',
    subtitleFmt: '{star}·命宫',
    subtitleBorrowedFmt: '借{star}·命宫',
    keywordsLabel: '关键意象',
    borrowedHint: '命宫无主星，借迁移宫主星论之；解读时减半参考，配合三方四正综合判断。',
    sihuaFmt: '· 化{label}',
    brightnessFmt: '· {label}',
    empty: '本格命宫与迁移宫均无主星，需结合三方四正与副星综合判断。',
  },

  palaceMajor: {
    title: '十二宫·主星简析',
    summaryFmt: '共 {total} 段（含借宫 {borrowed} 段）',
    borrowedPrefix: '借',
    verdict: { ji: '吉', zhong: '中', xiong: '凶' },
    entryMissing: '该宫位主星组合暂无简析，可结合三方四正综合判断。',
    empty: '本盘 12 宫主星均缺，建议结合副星与四化综合判断。',
    enPendingBanner: '英文长篇正文尚在专业审译，本类先仅显示 chip 摘要层。',
    placeholderLineEn: '长篇翻译尚在审译 —— 请参考上方 chip 摘要（宫位 · 主星 · 亮度 · 化禄/权/科/忌 · 吉中凶）。',
  },

  minorStars: {
    title: '六吉六煞·入宫论断',
    summaryFmt: '本盘吉星 {lucky} 颗 · 煞星 {malefic} 颗',
    luckyGroup: '六吉星·辅佐贵气',
    maleficGroup: '六煞星·形冲煞克',
    entryMissing: '该副星 × 宫位组合暂无文案，可结合主星与三方四正综合判断。',
    empty: '本盘暂无六吉六煞落入十二宫，建议以主星与四化为主轴。',
    enPendingBanner: '英文长篇正文尚在专业审译，本类先仅显示 chip 摘要层。',
    placeholderLineEn: '长篇翻译尚在审译 —— 请参考上方 chip 摘要（宫位 · 副星 · 吉/煞分组）。',
  },

  sihuaReading: {
    title: '四化论命·命宫天干飞化',
    subtitleFmt: '{stem}干四化 · 飞禄/权/科/忌 各一星',
    stemMissing: '未能从命宫干支识别天干，本段暂不展示。',
    sihuaLabel: { lu: '化禄', quan: '化权', ke: '化科', ji: '化忌' },
    entryMissing: '该天干 × 四化组合暂无论断，可结合三方四正综合判断。',
  },

  soulMaster: {
    title: '命主 / 身主',
    mingLabel: '命 主',
    shenLabel: '身 主',
    keywordsLabel: '关键意象',
    entryMissing: '该星暂无主辅论断（可能为另说之星）。',
    bothMissing: '本盘命主、身主均缺数据，请检查排盘输入。',
  },

  decadalReview: {
    title: '◆ 大限总评',
    titleMn: '大限总评',
    subtitleFmt: '{ganzhi}大限 · 十年总轴',
    entryMissing: '该 60 甲子组合暂无大限总评，可结合大限四化与本命三方综合判断。',
  },

  yearlyReview: {
    title: '流年总评',
    titleMn: '流年总评',
    entryMissing: '该 60 甲子组合暂无流年总评，可结合流年四化与本命三方综合判断。',
  },

  interpret: {
    cards: {
      mingPalace: { title: '命宫解读' },
      sihua: { title: '四化飞星' },
      minorStars: { title: '六吉六煞' },
      shenZhu: { title: '身主 · 事业取向' },
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

  decadalDetail: {
    title: '◆ 当前大限详情',
    titleMn: '当前大限详情',
    subtitleFmt: '{age} 岁 · 落{palace}（{ganzhi}）',
    mainStarsLabel: '主星配合',
    mutagensLabel: '大限四化',
    empty: '空宫',
  },

  flowYear: {
    title: '◆ 流年',
    titleMn: '流年',
    expandFmt: '展开后 {count} 年 ▼',
    collapse: '收起 ▲',
  },

  collapse: {
    sectionMeta: '◎ 元信息',
    sectionChart: '◎ 十二宫',
    sectionSoulPalace: '◎ 命宫主星论命',
    sectionPalaceMajor: '◎ 十二宫·主星简析',
    sectionMinorStars: '◎ 六吉六煞·入宫论断',
    sectionSihuaReading: '◎ 四化论命·命宫天干飞化',
    sectionSoulMaster: '◎ 命主 · 身主',
    sectionInterpret: '◎ 命盘解读',
    sectionDaxian: '◎ 大限 · 小限',
    sectionDecadalDetail: '◎ 当前大限',
    sectionFlowYear: '◎ 流年',
    sectionMetaMn: '元信息',
    sectionChartMn: '十二宫',
    sectionSoulPalaceMn: '命宫主星论命',
    sectionPalaceMajorMn: '十二宫主星简析',
    sectionMinorStarsMn: '六吉六煞入宫',
    sectionSihuaReadingMn: '四化论命·命宫天干',
    sectionSoulMasterMn: '命主 · 身主',
    sectionInterpretMn: '命盘解读',
    sectionDaxianMn: '大限 · 小限',
    sectionDecadalDetailMn: '当前大限',
    sectionFlowYearMn: '流年',
  },

  share: {
    title: '我的紫微命盘 · TT 占卜',
    text: '十二宫 · 三方四正 · 四化飞星 · 大限小限。来自 TT 占卜的命盘解读。',
  },

  computeError: {
    title: '排盘未完成',
    hint: '当前生辰无法生成紫微命盘，请检查生辰输入后重新排盘。',
    retry: '重新排盘',
  },
}
