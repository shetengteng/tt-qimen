/**
 * 神煞简短释义表
 *
 * key 使用英文拼音（与 @lunisolar/plugin-char8ex 的 C8God.key 大致一一对应，
 * 若后续发现 key 名不同，请在 core/shensha.ts 里做 normalize 映射，
 * 而不是污染本表）。
 *
 * short: 20 字内的一句话释义，用于 chip 下方直接显示
 * long:  80 字内的长释义（预留字段，暂未渲染）
 *
 * 覆盖 lunisolar plugin-char8ex 里会产出的常见四柱神煞。
 */

export interface ShenshaMeaning {
  /** 一句话短释义（20 字以内，chip 下方显示） */
  short: string
  /** 长释义（80 字以内，预留给未来 Modal / 详情页） */
  long?: string
  /** 默认吉凶分类（fallback — 实际 category 以 lunisolar 返回的 luckLevel 为准） */
  defaultCategory?: 'auspicious' | 'neutral' | 'inauspicious'
}

/**
 * 以繁体中文神煞名作为 key（与 plugin-char8ex 的 name/key 策略对齐）。
 * 注意：C8God.key 已经是繁体神煞名字符串，不是英文常量，故此处直接用繁体 key。
 */
export const SHENSHA_MEANING: Record<string, ShenshaMeaning> = {
  // ---------- 吉神 ----------
  天乙貴人: {
    short: '贵人扶持 · 逢凶化吉',
    long: '天乙贵人为吉神之首，主得长辈、上司、权贵之助，逢凶化吉、遇难呈祥。',
    defaultCategory: 'auspicious',
  },
  文昌貴人: {
    short: '聪慧文秀 · 利学业',
    long: '文昌贵人主聪明好学、文思敏捷，利于考试、学业、文书事务。',
    defaultCategory: 'auspicious',
  },
  太極貴人: {
    short: '好玄好研究',
    long: '太极贵人主人好探究、善钻研，利于学术、宗教、哲理研究。',
    defaultCategory: 'auspicious',
  },
  天德貴人: {
    short: '积善修德 · 消灾解难',
    long: '天德贵人主善德深厚，遇凶煞能化解，一生平安少灾。',
    defaultCategory: 'auspicious',
  },
  月德貴人: {
    short: '温和厚道 · 化险为夷',
    long: '月德贵人与天德相配，主心性温和、多得助力，凶险自解。',
    defaultCategory: 'auspicious',
  },
  福星貴人: {
    short: '福禄双全 · 富贵之星',
    long: '福星贵人主一生衣禄无缺、常得幸运之助，事业感情易逢良机。',
    defaultCategory: 'auspicious',
  },
  天廚貴人: {
    short: '食禄不缺 · 衣食丰足',
    long: '天厨贵人主食禄丰足，一生少愁吃穿，饮食行业尤佳。',
    defaultCategory: 'auspicious',
  },
  國印貴人: {
    short: '掌印之象 · 利官途',
    long: '国印贵人主有权柄、印信之助，利于公职、文书、官运。',
    defaultCategory: 'auspicious',
  },
  學堂: {
    short: '学业有成 · 利文名',
    long: '学堂主文思聪敏、学业可成，若逢贵人相助更易成名。',
    defaultCategory: 'auspicious',
  },
  詞館: {
    short: '文采斐然 · 利写作',
    long: '词馆主擅长辞章、口才文笔俱佳，利于写作、演说、传媒。',
    defaultCategory: 'auspicious',
  },
  金輿: {
    short: '华车富贵 · 主荣禄',
    long: '金舆主家世显赫或配偶条件优越，一生多享富贵荣禄。',
    defaultCategory: 'auspicious',
  },
  天醫: {
    short: '善医术 · 利健康',
    long: '天医主医术、药理有缘，亦主身体调养能力强，利于医护行业。',
    defaultCategory: 'auspicious',
  },
  天赦: {
    short: '化解灾祸 · 逢凶成吉',
    long: '天赦日主天赦之恩，能化解百般灾厄，遇事多转机。',
    defaultCategory: 'auspicious',
  },
  三奇: {
    short: '英华秀气 · 非凡之命',
    long: '三奇（天干甲戊庚、乙丙丁、壬癸辛相连）主才华出众，命格较贵。',
    defaultCategory: 'auspicious',
  },
  紅鸞: {
    short: '喜庆婚缘',
    long: '红鸾主婚姻喜庆、感情顺遂，运限逢之多有姻缘、喜事。',
    defaultCategory: 'auspicious',
  },
  天喜: {
    short: '喜庆将至 · 感情活跃',
    long: '天喜与红鸾相配，主喜庆之事，感情、添丁、搬迁等良机。',
    defaultCategory: 'auspicious',
  },

  // ---------- 中性 ----------
  將星: {
    short: '权威之象 · 宜掌印',
    long: '将星主领导力、权威感，能统御众人，利于管理、军警、竞技。',
    defaultCategory: 'neutral',
  },
  華蓋: {
    short: '孤高艺术 · 宜玄学',
    long: '华盖主人有艺术、宗教、玄学倾向，性偏孤高，利独立研究。',
    defaultCategory: 'neutral',
  },
  驛馬: {
    short: '变动迁移 · 利远行',
    long: '驿马主奔波、变动、外出，利于旅行、贸易、迁居、留学。',
    defaultCategory: 'neutral',
  },
  桃花: {
    short: '人缘桃花 · 异性缘浓',
    long: '桃花又名咸池，主人缘好、异性缘浓，宜留意感情界限。',
    defaultCategory: 'neutral',
  },
  咸池: {
    short: '多情善媚 · 情海浮沉',
    long: '咸池即桃花，主情感丰富，宜注意感情纠葛与界限。',
    defaultCategory: 'neutral',
  },
  紅艷: {
    short: '感情缘浓 · 留意界限',
    long: '红艳煞主多情多欲、感情热烈，宜守分寸避免纠纷。',
    defaultCategory: 'neutral',
  },
  祿神: {
    short: '食禄充裕 · 利事业',
    long: '禄神主俸禄、食禄之位，利于安身立命，事业稳定。',
    defaultCategory: 'neutral',
  },
  羊刃: {
    short: '刚烈果决 · 双刃之剑',
    long: '羊刃主刚烈、决断，能成大事亦能伤己，宜修身自制。',
    defaultCategory: 'neutral',
  },
  陽刃: {
    short: '刚烈果决 · 双刃之剑',
    long: '阳刃即羊刃，主刚烈决断，能成大业亦需防自伤。',
    defaultCategory: 'neutral',
  },
  天羅: {
    short: '纠缠之象 · 宜守静',
    long: '天罗主事务纠缠、牵绊较多，逢之宜守静勿妄动。',
    defaultCategory: 'neutral',
  },
  地網: {
    short: '拘束之象 · 宜谨慎',
    long: '地网与天罗相配，主人受束缚、阻滞，逢之宜忍耐谨慎。',
    defaultCategory: 'neutral',
  },
  孤辰: {
    short: '孤独之象 · 少人缘',
    long: '孤辰主性情清冷、独处多，感情、家人关系宜多经营。',
    defaultCategory: 'neutral',
  },
  寡宿: {
    short: '孤寡之气 · 宜多交际',
    long: '寡宿与孤辰类似，主独处、孤僻，宜多社交化解。',
    defaultCategory: 'neutral',
  },

  // ---------- 凶煞 ----------
  劫煞: {
    short: '破财损耗 · 防意外',
    long: '劫煞主突发破财、失窃、意外伤损，逢之宜防守谨慎。',
    defaultCategory: 'inauspicious',
  },
  災煞: {
    short: '灾厄之气 · 宜化解',
    long: '灾煞主有病厄、损耗之事，宜积德行善以化解。',
    defaultCategory: 'inauspicious',
  },
  亡神: {
    short: '暗耗之煞 · 防官非',
    long: '亡神主暗中损耗、官非口舌，宜低调处事避免招惹。',
    defaultCategory: 'inauspicious',
  },
  血刃: {
    short: '见血之灾 · 防意外伤',
    long: '血刃主意外受伤、手术开刀，逢之应小心安全。',
    defaultCategory: 'inauspicious',
  },
  白虎: {
    short: '凶险之气 · 防意外',
    long: '白虎主意外伤害、血光之灾，宜避免险境、注意安全。',
    defaultCategory: 'inauspicious',
  },
  吊客: {
    short: '悲事之煞 · 宜积福',
    long: '吊客主丧事、悲伤之事，心情易低落，宜积福化解。',
    defaultCategory: 'inauspicious',
  },
  喪門: {
    short: '丧事之气',
    long: '丧门主丧事或家中老人健康事宜，宜关怀长辈、行善积德。',
    defaultCategory: 'inauspicious',
  },
  陰差陽錯: {
    short: '错位纠缠 · 感情多波',
    long: '阴差阳错主感情、婚姻易有错位、波折，需多沟通包容。',
    defaultCategory: 'inauspicious',
  },
  元辰: {
    short: '浮沉起伏 · 宜稳住',
    long: '元辰主心绪浮躁、事业反复，逢之宜稳守本分。',
    defaultCategory: 'inauspicious',
  },
  勾絞: {
    short: '口舌是非',
    long: '勾绞主口舌、纠纷、争执，逢之宜避是非、谨言慎行。',
    defaultCategory: 'inauspicious',
  },
}

/**
 * 查询神煞短释义，若未配置则返回空字符串 short（UI 层可做空态处理）。
 */
export function getShenshaMeaning(key: string): ShenshaMeaning {
  return SHENSHA_MEANING[key] ?? { short: '' }
}
