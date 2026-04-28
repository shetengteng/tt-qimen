export default {
  title: '紫微斗數',
  subtitle: '十二宮垣 · 三方四正',
  pageTitle: '紫 微 斗 數',
  pageSubtitle: '十二宮推演 · 主星副星 · 四化飛星 · 大限小限',
  breadcrumbHome: '首頁',
  breadcrumbCurrent: '紫微斗數',

  inputCardTitle: '錄入生辰',
  btn: {
    paipan: '排紫微命盤',
    paipanIcon: '◉',
    repaipan: '重新排盤',
    repaipanIcon: '◑',
    share: '生成分享卡片',
    shareIcon: '◈',
    save: '儲存到本機',
    saveIcon: '◐',
  },

  resultBanner: {
    title: '紫微命盤',
    subtitle: '十二宮 · 三方四正 · 四化 · 大限小限',
  },

  skeleton: {
    title: '排盤中',
    subtitle: '安星、起命宮、定四化',
  },

  chartMeta: {
    solarLabel: '陽曆',
    lunarLabel: '農曆',
    fiveElementsLabel: '五行局',
    mingShenLabel: '命主 / 身主',
    qiyunFmt: '{n} 歲起運',
  },

  palaceNames: {
    ming: '命宮',
    xiongdi: '兄弟宮',
    fuqi: '夫妻宮',
    zinv: '子女宮',
    caibo: '財帛宮',
    jie: '疾厄宮',
    qianyi: '遷移宮',
    jiaoyou: '交友宮',
    guanlu: '事業宮',
    tianzhai: '田宅宮',
    fude: '福德宮',
    fumu: '父母宮',
  },
  palaceNamesShort: {
    ming: '命宮',
    xiongdi: '兄弟',
    fuqi: '夫妻',
    zinv: '子女',
    caibo: '財帛',
    jie: '疾厄',
    qianyi: '遷移',
    jiaoyou: '交友',
    guanlu: '事業',
    tianzhai: '田宅',
    fude: '福德',
    fumu: '父母',
  },
  shenSuffix: '· 身',
  daxianPrefix: '大限',

  sihuaLegend: {
    lu: '化祿',
    quan: '化權',
    ke: '化科',
    ji: '化忌',
    brightness: '廟/旺/得/平/陷 = 星曜亮度',
  },
  sihuaShort: { lu: '祿', quan: '權', ke: '科', ji: '忌' },
  sihuaMarkFmt: '化{label}',

  sanfang: {
    hint: '命盤已顯示「命宮 三方四正」 ——',
    toggleOn: '◐ 命宮 · 三方四正',
    toggleOnMn: '命宮 · 三方四正',
    toggleOff: '× 關閉連線',
    toggleOffMn: '關閉連線',
    reopen: '◐ 顯示三方四正',
    reopenMn: '顯示三方四正',
  },

  centerPalace: {
    title: '命 盤',
    titleMn: '命盤',
    ownerLabel: '姓名',
    ownerFmt: '{name} · {gender}',
    solarLabel: '陽曆',
    fiveLabel: '五行局',
    fiveFmt: '{name} · 起運 {age} 歲',
    mingShenLabel: '命 / 身',
    mingShenFmt: '{ming} · {shen}',
    doujunLabel: '子年斗君',
    hint: '※ 點擊外圈任一宮位，可查看詳細解讀',
  },

  soulPalace: {
    title: '命宮主星論命',
    subtitleFmt: '{star}·命宮',
    subtitleBorrowedFmt: '借{star}·命宮',
    keywordsLabel: '關鍵意象',
    borrowedHint: '命宮無主星，借遷移宮主星論之；解讀時減半參考，配合三方四正綜合判斷。',
    sihuaFmt: '· 化{label}',
    brightnessFmt: '· {label}',
    empty: '本格命宮與遷移宮均無主星，需結合三方四正與副星綜合判斷。',
  },

  palaceMajor: {
    title: '十二宮·主星簡析',
    summaryFmt: '共 {total} 段（含借宮 {borrowed} 段）',
    borrowedPrefix: '借',
    verdict: { ji: '吉', zhong: '中', xiong: '兇' },
    entryMissing: '該宮位主星組合暫無簡析，可結合三方四正綜合判斷。',
    empty: '本盤 12 宮主星均缺，建議結合副星與四化綜合判斷。',
    enPendingBanner: '英文長篇正文尚在專業審譯，本類先僅顯示 chip 摘要層。',
    placeholderLineEn: '長篇翻譯尚在審譯 —— 請參考上方 chip 摘要（宮位 · 主星 · 亮度 · 化祿/權/科/忌 · 吉中兇）。',
  },

  minorStars: {
    title: '六吉六煞·入宮論斷',
    summaryFmt: '本盤吉星 {lucky} 顆 · 煞星 {malefic} 顆',
    luckyGroup: '六吉星·輔佐貴氣',
    maleficGroup: '六煞星·形衝煞剋',
    entryMissing: '該副星 × 宮位組合暫無文案，可結合主星與三方四正綜合判斷。',
    empty: '本盤暫無六吉六煞落入十二宮，建議以主星與四化為主軸。',
    enPendingBanner: '英文長篇正文尚在專業審譯，本類先僅顯示 chip 摘要層。',
    placeholderLineEn: '長篇翻譯尚在審譯 —— 請參考上方 chip 摘要（宮位 · 副星 · 吉/煞分組）。',
  },

  sihuaReading: {
    title: '四化論命·命宮天干飛化',
    subtitleFmt: '{stem}干四化 · 飛祿/權/科/忌 各一星',
    stemMissing: '未能從命宮干支識別天干，本段暫不展示。',
    sihuaLabel: { lu: '化祿', quan: '化權', ke: '化科', ji: '化忌' },
    entryMissing: '該天干 × 四化組合暫無論斷，可結合三方四正綜合判斷。',
  },

  soulMaster: {
    title: '命主 / 身主',
    mingLabel: '命 主',
    shenLabel: '身 主',
    keywordsLabel: '關鍵意象',
    entryMissing: '該星暫無主輔論斷（可能為另說之星）。',
    bothMissing: '本盤命主、身主均缺資料，請檢查排盤輸入。',
  },

  decadalReview: {
    title: '◆ 大限總評',
    titleMn: '大限總評',
    subtitleFmt: '{ganzhi}大限 · 十年總軸',
    entryMissing: '該 60 甲子組合暫無大限總評，可結合大限四化與本命三方綜合判斷。',
  },

  yearlyReview: {
    title: '流年總評',
    titleMn: '流年總評',
    entryMissing: '該 60 甲子組合暫無流年總評，可結合流年四化與本命三方綜合判斷。',
  },

  interpret: {
    cards: {
      mingPalace: { title: '命宮解讀' },
      sihua: { title: '四化飛星' },
      minorStars: { title: '六吉六煞' },
      shenZhu: { title: '身主 · 事業取向' },
    },
  },

  daxian: {
    title: '大限 · 十年一運',
    titleMn: '大限時間軸',
    currentFmt: '當前 {age} 歲 · 大限 {range}（{palace}）',
    genderBadgeMale: '男命 · 大限按性別展開',
    genderBadgeFemale: '女命 · 大限按性別展開',
    genderBadgeHint: '紫微大限按「陽男陰女順行、陰男陽女逆行」分流（十二宮與四化不變）',
  },
  xiaoxian: {
    title: '小限 · 一歲一更',
    titleMn: '小限',
    currentFmt: '當前 {year} {ganzhi} · 小限在{palace}',
  },

  decadalDetail: {
    title: '◆ 當前大限詳情',
    titleMn: '當前大限詳情',
    subtitleFmt: '{age} 歲 · 落{palace}（{ganzhi}）',
    mainStarsLabel: '主星配合',
    mutagensLabel: '大限四化',
    empty: '空宮',
  },

  flowYear: {
    title: '◆ 流年',
    titleMn: '流年',
    expandFmt: '展開後 {count} 年 ▼',
    collapse: '收起 ▲',
  },

  collapse: {
    sectionMeta: '◎ 元資訊',
    sectionChart: '◎ 十二宮',
    sectionSoulPalace: '◎ 命宮主星論命',
    sectionPalaceMajor: '◎ 十二宮·主星簡析',
    sectionMinorStars: '◎ 六吉六煞·入宮論斷',
    sectionSihuaReading: '◎ 四化論命·命宮天干飛化',
    sectionSoulMaster: '◎ 命主 · 身主',
    sectionInterpret: '◎ 命盤解讀',
    sectionDaxian: '◎ 大限 · 小限',
    sectionDecadalDetail: '◎ 當前大限',
    sectionFlowYear: '◎ 流年',
    sectionMetaMn: '元資訊',
    sectionChartMn: '十二宮',
    sectionSoulPalaceMn: '命宮主星論命',
    sectionPalaceMajorMn: '十二宮主星簡析',
    sectionMinorStarsMn: '六吉六煞入宮',
    sectionSihuaReadingMn: '四化論命·命宮天干',
    sectionSoulMasterMn: '命主 · 身主',
    sectionInterpretMn: '命盤解讀',
    sectionDaxianMn: '大限 · 小限',
    sectionDecadalDetailMn: '當前大限',
    sectionFlowYearMn: '流年',
  },

  share: {
    title: '我的紫微命盤 · TT 占卜',
    text: '十二宮 · 三方四正 · 四化飛星 · 大限小限。來自 TT 占卜的命盤解讀。',
  },

  computeError: {
    title: '排盤未完成',
    hint: '目前生辰無法生成紫微命盤，請檢查生辰輸入後重新排盤。',
    retry: '重新排盤',
  },
}
