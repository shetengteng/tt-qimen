export default {
  title: '姓名学',
  subtitle: '五格剖象 · 三才配置',
  pageTitle: '姓名学五格',
  pageSubtitle: '康熙笔画 · 天人地外总 · 八十一数理',
  breadcrumbHome: '首页',
  breadcrumbCurrent: '姓名学五格',
  inputCardTitle: '姓名输入',

  field: {
    surname: '姓氏',
    givenName: '名字',
    gender: '性别',
    birthYear: '出生年',
  },
  placeholder: {
    surname: '如：李',
    givenName: '如：文轩',
    birthYear: '可选 · 选择年份',
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
    recalculate: '更换名字',
    share: '生成分享卡片',
    save: '保存结果',
  },

  resultBanner: {
    title: '五格剖象结果',
    subtitle: '天地人外总 · 81 数理 · 综合评分',
  },

  breakdown: {
    title: '笔画拆解',
    simplified: '简',
    kangxi: '康熙',
    kangxiWord: '康熙笔画',
    hintPrefix: '姓名学以',
    hintSuffix: '为准，部分繁简体笔画不同。',
  },

  grids: {
    tian: '天格',
    ren: '人格',
    di: '地格',
    wai: '外格',
    zong: '总格',
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
    strokesUnit: '画',
  },

  section: {
    fivegrids: '五格推演',
    sancai: '三才配置',
    overall: '综合评分',
  },

  sancai: {
    sectionTitle: '三才配置',
    sectionSubtitle: '天 · 人 · 地 三才五行 · 五等级判定',
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
      ke: '克',
      tongHe: '比和',
      xie: '泄',
      hao: '耗',
    },
    relationFull: {
      sheng: '相生',
      ke: '相克',
      tongHe: '比和',
      xie: '泄气',
      hao: '受克',
    },
    summary: {
      great: '三才相生 · 基业稳固',
      good: '生扶有力 · 顺势可成',
      mid: '不冲不悖 · 守成可安',
      bad: '一处生克 · 须留意应对',
      worst: '层层相克 · 需慎防波折',
    },
    hint: '三才取自天/人/地三格的姓名学五行；五行间生 (顺) 克 (逆) 比和 (同) 三种关系决定吉凶等级，独立于综合评分。',
    diagramAria: '三才配置：{tian} {tianToRen} {ren} {renToDi} {di}，等级 {level}',
  },

  overall: {
    label: '综合评分',
    badge: {
      excellent: '优',
      good: '良',
      fair: '中',
      poor: '差',
    },
    badgeWord: {
      excellent: '格局开阔',
      good: '搭配良好',
      fair: '中规中矩',
      poor: '需多磨砺',
    },
    summary: '"{name}" 整体五格{badgeWord}，人格 {renElement} · {renLevel}，总格 {zongElement} · {zongLevel}；综合评分 {score} / 100。',
    gaugeAria: '综合评分仪表盘，得分 {score} 分，等级：{badge}',
  },

  skeleton: {
    title: '五格推演中 · · ·',
    subtitle: '康熙笔画 · 天人地外总 · 81 数理',
  },

  computeError: {
    title: '推演失败',
    hint: '姓名输入有误，请检查后重试。',
    retry: '重新推演',
    rareChar: '未收录字：{char}（暂不支持生僻字）',
    byCode: {
      invalidInput: '姓名输入不合法，请检查后重试。',
      invariant: '内部计算异常（请把姓名截图反馈给我们以便修复）。',
      depLoadFailed: '笔画字库加载失败，请检查网络后重试。',
      unknown: '未能完成姓名推演，请检查输入后重试。',
      empty: {
        surname: '请填写姓氏。',
        givenName: '请填写名字。',
      },
      nonCjk: {
        surname: '姓氏仅支持中文汉字（不支持英文 / 数字 / 符号）。',
        givenName: '名字仅支持中文汉字（不支持英文 / 数字 / 符号）。',
      },
      length: {
        surname: '仅支持单姓或复姓（1-2 字）。',
        givenName: '仅支持单字或双字名（1-2 字）。',
      },
    },
  },

  share: {
    title: '我的姓名学五格 · TT 占卜',
    text: '康熙笔画 · 天人地外总 · 81 数理 · 来自 TT 占卜的姓名学五格。',
  },

  disclaimer: '81 数理由熊崎健翁 1918 年整理，属文化参考，不等于人格。',

  ai: {
    preset: {
      nameMeaning: '名字寓意 · 字义、音律、文化背景',
      nameStrength: '五格强弱 · 三才配置点评',
      improvement: '改善方向 · 是否需要补字 / 改名',
      compatibility: '名字与人 · 与个性 / 行业的契合度',
    },
  },
}
