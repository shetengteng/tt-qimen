/**
 * 占卜术语词典 · 简体中文。
 *
 * 三语对照规约（与 divination-terms.zh-TW / divination-terms.en 严格 key 对齐）：
 *   - shishen      十神（11 项 = 10 神 + 日主）；key 用 qisha 而非 pianguan，
 *                  与 codebase（lib/tenGod.ts、bazi/core/bazi.ts）一致
 *   - wuxing       五行 5 色
 *   - tiangan      天干 10 位 / dizhi 地支 12 位（数组保持顺序）
 *   - relation     地支六关系（冲 / 合 / 刑 / 暗合 / 自刑）
 *   - pillar       四柱
 *   - layer        命盘层级（天干 / 地支 / 藏干 / 纳音）
 *   - patternAlias 紫微 / 八字 / 通用别名映射（双 key 任一可写入产物）
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
   * 别名映射：偏官 = 七杀（命理传统两名同一神）。
   * 部分古籍 / 入门教材用「偏官」，bazi codebase 主流写法是「七杀」。
   * 词典层提供别名 key，让消费侧（如批注、提示文）按需 fallback。
   */
  alias: {
    pianguan: '偏官（七杀）',
  },
}
