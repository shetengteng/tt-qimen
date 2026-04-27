export default {
  title: '姓名學',
  subtitle: '五格剖象 · 三才配置',
  pageTitle: '姓名學五格',
  pageSubtitle: '康熙筆畫 · 天人地外總 · 八十一數理',
  breadcrumbHome: '首頁',
  breadcrumbCurrent: '姓名學五格',
  inputCardTitle: '姓名輸入',

  field: {
    surname: '姓氏',
    givenName: '名字',
    gender: '性別',
    birthYear: '出生年',
  },
  placeholder: {
    surname: '如：李',
    givenName: '如：文軒',
    birthYear: '可選 · 選擇年份',
  },
  birthYearOption: {
    unspecified: '未指定',
  },
  gender: {
    male: '男',
    female: '女',
  },

  btn: {
    calculate: '五格推演',
    recalculate: '更換名字',
    share: '生成分享卡片',
    save: '保存結果',
  },

  resultBanner: {
    title: '五格剖象結果',
    subtitle: '天地人外總 · 81 數理 · 綜合評分',
  },

  breakdown: {
    title: '筆畫拆解',
    simplified: '簡',
    kangxi: '康熙',
    kangxiWord: '康熙筆畫',
    hintPrefix: '姓名學以',
    hintSuffix: '為準，部分繁簡體筆畫不同。',
  },

  grids: {
    tian: '天格',
    ren: '人格',
    di: '地格',
    wai: '外格',
    zong: '總格',
  },

  levels: {
    '大吉': '大吉',
    '吉': '吉',
    '中吉': '中吉',
    '中平': '中平',
    '凶': '凶',
    '大凶': '大凶',
  },

  detail: {
    strokesUnit: '畫',
  },

  section: {
    fivegrids: '五格推演',
    sancai: '三才配置',
    overall: '綜合評分',
  },

  sancai: {
    sectionTitle: '三才配置',
    sectionSubtitle: '天 · 人 · 地 三才五行 · 五等級判定',
    slotLabel: {
      tian: '天才',
      ren: '人才',
      di: '地才',
    },
    level: {
      great: '大吉',
      good: '吉',
      mid: '中吉',
      bad: '凶',
      worst: '大凶',
    },
    relation: {
      sheng: '生',
      ke: '剋',
      tongHe: '比和',
      xie: '洩',
      hao: '耗',
    },
    relationFull: {
      sheng: '相生',
      ke: '相剋',
      tongHe: '比和',
      xie: '洩氣',
      hao: '受剋',
    },
    summary: {
      great: '三才相生 · 基業穩固',
      good: '生扶有力 · 順勢可成',
      mid: '不衝不悖 · 守成可安',
      bad: '一處生剋 · 須留意應對',
      worst: '層層相剋 · 需慎防波折',
    },
    hint: '三才取自天/人/地三格的姓名學五行；五行間生 (順) 剋 (逆) 比和 (同) 三種關係決定吉凶等級，獨立於綜合評分。',
    diagramAria: '三才配置：{tian} {tianToRen} {ren} {renToDi} {di}，等級 {level}',
  },

  overall: {
    label: '綜合評分',
    badge: {
      excellent: '優',
      good: '良',
      fair: '中',
      poor: '差',
    },
    badgeWord: {
      excellent: '格局開闊',
      good: '搭配良好',
      fair: '中規中矩',
      poor: '需多磨礪',
    },
    summary: '「{name}」整體五格{badgeWord}，人格 {renElement} · {renLevel}，總格 {zongElement} · {zongLevel}；綜合評分 {score} / 100。',
    gaugeAria: '綜合評分儀表盤，得分 {score} 分，等級：{badge}',
  },

  skeleton: {
    title: '五格推演中 · · ·',
    subtitle: '康熙筆畫 · 天人地外總 · 81 數理',
  },

  computeError: {
    title: '推演失敗',
    hint: '姓名輸入有誤，請檢查後重試。',
    retry: '重新推演',
    rareChar: '未收錄字：{char}（暫不支援生僻字）',
    byCode: {
      invalidInput: '姓名輸入不合法，請檢查後重試。',
      invariant: '內部計算異常（請把姓名截圖回饋給我們以便修復）。',
      depLoadFailed: '筆畫字庫載入失敗，請檢查網路後重試。',
      unknown: '未能完成姓名推演，請檢查輸入後重試。',
      empty: {
        surname: '請填寫姓氏。',
        givenName: '請填寫名字。',
      },
      nonCjk: {
        surname: '姓氏僅支援中文漢字（不支援英文 / 數字 / 符號）。',
        givenName: '名字僅支援中文漢字（不支援英文 / 數字 / 符號）。',
      },
      length: {
        surname: '僅支援單姓或複姓（1-2 字）。',
        givenName: '僅支援單字或雙字名（1-2 字）。',
      },
    },
  },

  share: {
    title: '我的姓名學五格 · TT 占卜',
    text: '康熙筆畫 · 天人地外總 · 81 數理 · 來自 TT 占卜的姓名學五格。',
  },

  disclaimer: '81 數理由熊崎健翁 1918 年整理，屬文化參考，不等於人格。',
}
