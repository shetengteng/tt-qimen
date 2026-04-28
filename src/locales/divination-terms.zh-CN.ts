/**
 * 占卜术语词典 · 简体中文。
 *
 * 三语对照规约（与 divination-terms.zh-TW / divination-terms.en 严格 key 对齐）：
 *
 * ┌──────────────────────── 共用术语层 ────────────────────────┐
 *   - shishen      十神（11 项 = 10 神 + 日主）；key 用 qisha 而非 pianguan，
 *                  与 codebase（lib/tenGod.ts、bazi/core/bazi.ts）一致
 *   - wuxing       五行 5 色
 *   - tiangan      天干 10 位 / dizhi 地支 12 位（数组保持顺序）
 *   - relation     地支六关系（冲 / 合 / 刑 / 暗合 / 自刑）
 *   - pillar       四柱
 *   - layer        命盘层级（天干 / 地支 / 藏干 / 纳音）
 *   - level        通用吉凶 6 档（上上 / 上吉 / 中吉 / 中平 / 中凶 / 下下），
 *                  另含 5 档（dajiji / ji / zhongji / zhongping / xiong / daxiong）
 *                  与 3 档（ji / zhong / xiong）的子集 key
 * ┌──────────────────────── 模块专属层 ────────────────────────┐
 *   - ziwei.palace      12 宫名
 *   - ziwei.sihua       4 化
 *   - ziwei.brightness  5 亮度
 *   - ziwei.fanggroup   三方四正概念
 *   - ziwei.master      命主 / 身主
 *   - ziwei.span        大限 / 小限
 *   - xingming.grid     5 格（天人地外总）
 *   - xingming.sancai   三才（天/人/地）+ 五行 5 关系（生/克/比和/泄/耗）
 *   - chenggu.unit      骨重单位
 *   - chenggu.pillar    四骨
 *   - jiemeng.category  8 类梦境分类
 *   - lingqian.topic    7 项占问领域
 *   - liuren.outcome    3 档吉凶
 * ┌──────────────────────── 别名层 ────────────────────────┐
 *   - alias.pianguan    偏官 = 七杀（命理传统两名同一神，词典层兼容查询）
 *
 * 改动需同步本目录另两份 .zh-TW.ts / .en.ts，CI 会做 keys diff 校验。
 */
export default {
  shishen: {
    zhengcai: '正财',
    piancai: '偏财',
    zhengguan: '正官',
    qisha: '七杀',
    zhengyin: '正印',
    pianyin: '偏印',
    shishen: '食神',
    shanguan: '伤官',
    bijian: '比肩',
    jiecai: '劫财',
    rizhu: '日主',
  },
  wuxing: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
  tiangan: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  dizhi:   ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  relation: {
    chong: '相冲',
    he: '相合',
    xing: '相刑',
    anhe: '暗合',
    zixing: '自刑',
  },
  pillar: {
    year: '年柱',
    month: '月柱',
    day: '日柱',
    hour: '时柱',
  },
  layer: {
    tiangan: '天干',
    dizhi: '地支',
    canggan: '藏干',
    nayin: '纳音',
  },
  /**
   * 通用吉凶等级。各模块按自己档数选择对应子集消费：
   *   - 6 档：灵签（shangshang/shangji/zhongji/zhongping/zhongxiong/xiaxia）
   *   - 5 档（强弱型）：姓名学（dajiji/ji/zhongji/zhongping/xiong/daxiong）
   *   - 5 档（位置型）：称骨（top/high/middle/low/bottom）
   *   - 3 档：小六壬（ji/zhong/xiong）
   */
  level: {
    shangshang: '上上',
    shangji: '上吉',
    zhongji: '中吉',
    zhongping: '中平',
    zhongxiong: '中凶',
    xiaxia: '下下',
    dajiji: '大吉',
    ji: '吉',
    xiong: '凶',
    daxiong: '大凶',
    zhong: '平',
    top: '顶',
    high: '高',
    middle: '中',
    low: '低',
    bottom: '底',
  },
  ziwei: {
    /** 紫微 12 宫 · 全称 + 简称 */
    palace: {
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
    /** 紫微四化 · 化禄 / 化权 / 化科 / 化忌 */
    sihua: {
      lu: '化禄',
      quan: '化权',
      ke: '化科',
      ji: '化忌',
    },
    /** 紫微星曜亮度 · 5 等（庙最旺、陷最弱） */
    brightness: {
      miao: '庙',
      wang: '旺',
      de: '得',
      ping: '平',
      xian: '陷',
    },
    /** 三方四正 · 命宫的本宫 + 财帛 + 事业 + 迁移 */
    fanggroup: {
      sanfang: '三方',
      sizheng: '四正',
      sanfangSizheng: '三方四正',
    },
    /** 命主 / 身主 */
    master: {
      ming: '命主',
      shen: '身主',
    },
    /** 大限 / 小限 */
    span: {
      daxian: '大限',
      xiaoxian: '小限',
      doujun: '斗君',
    },
  },
  xingming: {
    /** 姓名学五格 */
    grid: {
      tian: '天格',
      ren: '人格',
      di: '地格',
      wai: '外格',
      zong: '总格',
    },
    /** 三才 · 天人地三格的姓名学五行 */
    sancai: {
      tian: '天才',
      ren: '人才',
      di: '地才',
    },
    /** 三才五行间的关系 */
    sancaiRelation: {
      sheng: '相生',
      ke: '相克',
      bihe: '比和',
      xie: '泄气',
      hao: '受克',
    },
  },
  chenggu: {
    /** 骨重单位（两 / 钱） */
    unit: {
      liang: '两',
      qian: '钱',
    },
    /** 四骨：年/月/日/时（与 pillar 区别：pillar 为命理"柱"，此处为称骨"骨"） */
    pillar: {
      year: '年骨',
      month: '月骨',
      day: '日骨',
      hour: '时骨',
    },
  },
  jiemeng: {
    /** 8 类梦境分类（《周公解梦》传统分法） */
    category: {
      animal: '动物',
      people: '人物',
      nature: '自然',
      body: '身体',
      life: '生活',
      ghost: '神怪',
      building: '建筑',
      other: '其他',
    },
  },
  lingqian: {
    /** 灵签占问领域 */
    topic: {
      overall: '综合',
      family: '家宅',
      marriage: '婚姻',
      career: '事业',
      wealth: '财富',
      travel: '出行',
      health: '健康',
    },
  },
  liuren: {
    /** 小六壬 3 档结果 */
    outcome: {
      ji: '吉',
      zhong: '平',
      xiong: '凶',
    },
  },
  /**
   * 别名映射：偏官 = 七杀（命理传统两名同一神）。
   * 部分古籍 / 入门教材用「偏官」，bazi codebase 主流写法是「七杀」。
   * 词典层提供别名 key，让消费侧（如批注、提示文）按需 fallback。
   */
  alias: {
    pianguan: '偏官（七杀）',
  },
}
