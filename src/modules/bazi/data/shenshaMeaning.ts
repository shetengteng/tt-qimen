/**
 * 神煞简短释义表
 *
 * key 严格对齐 `@lunisolar/plugin-char8ex` 的 `C8God.key`（繁体字形）。
 * 当前版本覆盖插件运行时产出的 57 个常用神煞 key（详见下文注释）。
 *
 * short: 20 字内的一句话释义，用于 chip 下方直接显示
 * long:  80 字内的长释义，用于 chip hover tooltip（可选）
 *
 * —— 说明 ——
 * 古籍出处：
 *   - 《三命通会·卷二·论诸神煞》
 *   - 《三命通会·卷三》（论桃花、论羊刃、论元辰、论空亡、论亡神、论六厄等）
 *   - 《五行精纪·卷二十~卷二十九·神煞系列》
 *   - 《星学大成·神煞赋》《星学大成·百煞经》
 *   - 《子平真诠》（格局佐证）
 * 采集日期：2026-04-20
 * 白话改写：基于古籍语义，压缩至 20 字短 / 80 字长以便 UI 展示；
 *         凶神以"宜避忌"结语，吉神以"宜进取"结语，保持用户侧引导性。
 *
 * —— 字形对齐提醒 ——
 * 插件实际输出繁体 key（如「天德」而非「天德貴人」、「陰陽差錯」而非「陰差陽錯」、
 * 「辭館」而非「詞館」、「勾煞」而非「勾絞」），本文件以运行时字形为准。
 * 若查不到 short 说明，chip 下方会留空（不影响渲染）。
 */

export interface ShenshaMeaning {
  /** 一句话短释义（20 字以内，chip 下方显示） */
  short: string
  /** 长释义（80 字以内，hover tooltip / Modal 详情使用，可选） */
  long?: string
  /** 默认吉凶分类（fallback — 实际 category 以 lunisolar 返回的 luckLevel 为准） */
  defaultCategory?: 'auspicious' | 'neutral' | 'inauspicious'
}

/**
 * key 为繁体神煞名，与 `plugin-char8ex` 的 `C8God.key` 一一对应。
 */
export const SHENSHA_MEANING: Record<string, ShenshaMeaning> = {
  // ========== 吉神（luckLevel=1） ==========
  天乙貴人: {
    short: '贵人扶持 · 逢凶化吉',
    long: '天乙贵人为吉神之首，主得长辈、上司、权贵之助，遇险呈祥。柱中见之，一生多逢关键扶持；若被冲克空亡则力减。',
    defaultCategory: 'auspicious',
  },
  天印貴人: {
    short: '印信随身 · 利文职',
    long: '天印贵人主掌印文书之福，与官运、考证、契约、印信事务相应；利于公职、文教、法律、审批类工作。',
    defaultCategory: 'auspicious',
  },
  天官: {
    short: '官星得位 · 利仕途',
    long: '天官贵主官禄有根、名位易得；命遇天官，行事合乎规矩秩序，利于体制内发展及长期积累声望。',
    defaultCategory: 'auspicious',
  },
  天廚貴人: {
    short: '食禄丰足 · 衣食无忧',
    long: '天厨贵人主食禄丰盈，一生少愁温饱；饮食、餐饮、食品、招待类行业尤佳，逢之亦利人际宴饮。',
    defaultCategory: 'auspicious',
  },
  天德: {
    short: '积善修德 · 消灾解难',
    long: '天德主善德根基深厚，凶煞临之能化，一生平安少险。合局则为"天德贵人"，贵格加力；并入月德则吉上加吉。',
    defaultCategory: 'auspicious',
  },
  天德合: {
    short: '天德增力 · 福荫加持',
    long: '天德合为天德之配神，主德泽更厚、贵气更延；与天德同现则福力叠加，凡事得遇关键关照。',
    defaultCategory: 'auspicious',
  },
  天赦: {
    short: '化解灾祸 · 逢凶成吉',
    long: '天赦日主赦宥之恩，能解灾厄、转祸为吉；官非、诉讼、纠纷、疾厄逢之多转机，宜把握时机化解积难。',
    defaultCategory: 'auspicious',
  },
  天醫: {
    short: '善医术 · 利健康',
    long: '天医主医术药理之缘，亦利身体调养；从事医护、康养、心理咨询、健康食品行业尤佳。',
    defaultCategory: 'auspicious',
  },
  太極貴人: {
    short: '好玄学 · 善研究',
    long: '太极贵人主人好探究、善钻研；宗教、哲理、玄学、学术、考古、研究类事业易得成就。',
    defaultCategory: 'auspicious',
  },
  國印貴人: {
    short: '掌印之象 · 利官途',
    long: '国印贵人主有印信权柄之助，利公职、文书、审批、契约事务；行事端正稳重者尤易得显位。',
    defaultCategory: 'auspicious',
  },
  垣城: {
    short: '根基稳固 · 坐贵之象',
    long: '垣城为命垣有靠之象，主根基稳固、自有立身之处；逢之处事从容，不易动摇，常见于持家稳定之命。',
    defaultCategory: 'auspicious',
  },
  天喜: {
    short: '喜庆将至 · 感情活跃',
    long: '天喜主喜庆之事，与红鸾相配；感情、婚姻、添丁、乔迁、晋升之运多遇良机，运限逢之喜气盈门。',
    defaultCategory: 'auspicious',
  },
  學堂: {
    short: '学业有成 · 利文名',
    long: '学堂主文思聪敏、学业可成；若逢贵人相助更易扬名。利于学术、教育、文化、考试之事。',
    defaultCategory: 'auspicious',
  },
  文昌貴人: {
    short: '聪慧文秀 · 利学业',
    long: '文昌贵人主聪明好学、文思敏捷；利考试、学业、文书、写作、演讲事务，命坐文昌者多具文采。',
    defaultCategory: 'auspicious',
  },
  文星貴人: {
    short: '文采出众 · 利传名',
    long: '文星贵人与文昌相配，主文笔与口才兼优；尤利文化、传媒、出版、创作之事，易因才华得名。',
    defaultCategory: 'auspicious',
  },
  日德: {
    short: '日主有德 · 行事端正',
    long: '日德主日主气纯、为人端方正直；性情温和不偏激，凡事以德服人，一生少招怨恨、易得众望。',
    defaultCategory: 'auspicious',
  },
  日貴: {
    short: '日坐贵神 · 自带福气',
    long: '日贵格主日柱坐贵，一生自带福气、多遇良缘；命带此星者贵气自显，行事亦易得人认同。',
    defaultCategory: 'auspicious',
  },
  月德: {
    short: '温和厚道 · 化险为夷',
    long: '月德主心性温和、多得暗助；与天德相配成德，凶险自化。合局则为"月德贵人"，主一生平安。',
    defaultCategory: 'auspicious',
  },
  月德合: {
    short: '月德增力 · 柔中有德',
    long: '月德合为月德之配神，主柔和温厚更甚；与月德同现德泽双全，逢难多得关怀帮助以解。',
    defaultCategory: 'auspicious',
  },
  帝座: {
    short: '尊贵之位 · 主显达',
    long: '帝座主身处尊位、有威严之象；命带此星者举止端凝，易得拥戴；过旺则宜防孤高自持、少人推心。',
    defaultCategory: 'auspicious',
  },
  德: {
    short: '德泽助身 · 行善得报',
    long: '德神为积善之星，主命主心地仁厚、福自内修；德愈深则凶煞愈易化解，宜多行善举以厚其根。',
    defaultCategory: 'auspicious',
  },
  祿神: {
    short: '食禄充裕 · 利事业',
    long: '禄神（即"建禄"）主俸禄、食禄之位，利于安身立命、事业稳定；忌冲克空亡，否则禄薄难守。',
    defaultCategory: 'auspicious',
  },
  秀: {
    short: '气质清秀 · 文采外现',
    long: '秀气主命主气质清秀、才情外显；多见于文艺、设计、表演类命造，灵感与审美俱佳。',
    defaultCategory: 'auspicious',
  },
  辭館: {
    short: '文采斐然 · 利写作',
    long: '辞馆（即"词馆"）主擅长辞章、口才文笔俱佳；利于写作、演说、传媒、律政、谈判事务。',
    defaultCategory: 'auspicious',
  },
  金輿: {
    short: '华车富贵 · 主荣禄',
    long: '金舆主家世显赫或配偶条件优越，一生多享富贵荣禄；行运逢之易得提携，利婚配与事业相助。',
    defaultCategory: 'auspicious',
  },
  魁罡貴人: {
    short: '魁罡刚毅 · 掌权之象',
    long: '魁罡（庚戌/庚辰/壬辰/戊戌）主性情刚毅果决、掌权之象；喜身旺而忌刑冲，合局则为将帅之才。',
    defaultCategory: 'auspicious',
  },

  // ========== 中性（luckLevel=0） ==========
  將星: {
    short: '权威之象 · 宜掌印',
    long: '将星主领导力与权威感，能统御众人；利于管理、军警、竞技、裁判类工作，命坐将星者宜持正御下。',
    defaultCategory: 'neutral',
  },
  華蓋: {
    short: '孤高艺术 · 宜玄学',
    long: '华盖主艺术、宗教、玄学之缘，性偏孤高；利独立研究、创作；命坐华盖者宜在清静环境中发挥所长。',
    defaultCategory: 'neutral',
  },
  驛馬: {
    short: '变动迁移 · 利远行',
    long: '驿马主奔波、变动、外出之象；利旅行、贸易、出差、迁居、留学；逢冲动则应变时宜顺势而行。',
    defaultCategory: 'neutral',
  },
  桃花: {
    short: '人缘桃花 · 异性缘浓',
    long: '桃花（又名咸池）主人缘好、异性缘浓；适度则有助感情与公关，过旺则易生感情纠葛，宜留意界限。',
    defaultCategory: 'neutral',
  },

  // ========== 凶煞（luckLevel=-1） ==========
  九醜: {
    short: '容貌阻滞 · 防外伤',
    long: '九丑主相貌或肢体易有破损、留疤之象；行运逢之宜防意外磕碰，感情上亦易因外貌自卑生困扰。',
    defaultCategory: 'inauspicious',
  },
  亡神: {
    short: '暗耗之煞 · 防官非',
    long: '亡神主暗中损耗、官非口舌，宜低调处事、避免招惹；柱带亡神者宜修心沉稳，少逞口舌之快。',
    defaultCategory: 'inauspicious',
  },
  元辰: {
    short: '浮沉起伏 · 宜稳住',
    long: '元辰主心绪浮躁、事业反复；逢之宜稳守本分、避免投机；行运入元辰多有起落，宜守不宜攻。',
    defaultCategory: 'inauspicious',
  },
  八專: {
    short: '偏专易偏 · 防感情起伏',
    long: '八专（干支同类日）主个性强烈、偏执专一；感情易过热或过冷；事业上专精可成器，但人际易生摩擦。',
    defaultCategory: 'inauspicious',
  },
  六厄: {
    short: '阻滞之煞 · 宜忍耐',
    long: '六厄主事务停滞、诸事不顺，如身陷困厄而难即脱；行运逢之宜忍耐积蓄，不宜强求突破。',
    defaultCategory: 'inauspicious',
  },
  劫煞: {
    short: '破财损耗 · 防意外',
    long: '劫煞主突发破财、失窃、意外伤损；逢之宜防守谨慎、避免冒险投资，亦需注意人身安全。',
    defaultCategory: 'inauspicious',
  },
  勾煞: {
    short: '口舌纠葛 · 防是非',
    long: '勾煞（即"勾绞"）主口舌、纠纷、牵连之事；逢之宜避是非、谨言慎行，合约签字亦宜详核条款。',
    defaultCategory: 'inauspicious',
  },
  十惡大敗: {
    short: '禄空之日 · 防大败',
    long: '十恶大败为六甲旬中禄入空亡之日，主事业易有大挫、钱财易散；柱见此日宜修德持稳以化其凶。',
    defaultCategory: 'inauspicious',
  },
  吊客: {
    short: '悲事之煞 · 宜积福',
    long: '吊客主丧事、悲伤之事，心情易低落，亲友健康宜多关怀；积福行善、远离丧场可化其气。',
    defaultCategory: 'inauspicious',
  },
  喪門: {
    short: '丧事之气',
    long: '丧门主丧事或家中老人健康事宜，宜关怀长辈、行善积德；与吊客同现时需更加留意健康与情绪。',
    defaultCategory: 'inauspicious',
  },
  地網: {
    short: '拘束之象 · 宜谨慎',
    long: '地网与天罗相配，主人受束缚、阻滞；逢之宜忍耐谨慎，动而有节；女命忌地网，遇之多感情滞碍。',
    defaultCategory: 'inauspicious',
  },
  墓煞: {
    short: '入墓伏藏 · 主阻滞',
    long: '墓煞（七杀入墓）主亲情、妻子、财禄易有伤损；行运入墓则诸事伏藏、难有开展，宜守静待时。',
    defaultCategory: 'inauspicious',
  },
  天羅: {
    short: '纠缠之象 · 宜守静',
    long: '天罗主事务纠缠、牵绊较多，逢之宜守静勿妄动；男命忌天罗，遇之事业易生阻滞，宜以柔化之。',
    defaultCategory: 'inauspicious',
  },
  太白星: {
    short: '锋锐之煞 · 防伤病',
    long: '太白星（金气肃杀）主外伤、手术、刀兵之事；亦主决断过度、易伤感情；行运宜避险慎行。',
    defaultCategory: 'inauspicious',
  },
  孤辰: {
    short: '孤独之象 · 少人缘',
    long: '孤辰主性情清冷、独处多；感情、家人关系宜多经营；不必视为定数，社交与家庭修养可化其气。',
    defaultCategory: 'inauspicious',
  },
  孤鸞: {
    short: '孤鸾煞 · 感情宜慎',
    long: '孤鸾日（乙巳/丁巳/辛亥/戊申/甲寅等）主感情多波折，男克妻、女克夫；逢之宜晚婚缓进、忌早配。',
    defaultCategory: 'inauspicious',
  },
  寡宿: {
    short: '孤寡之气 · 宜多交际',
    long: '寡宿与孤辰类似，主独处、孤僻；女命逢之感情宜慎择、多交际化解；男命则宜多与家人互动。',
    defaultCategory: 'inauspicious',
  },
  截路空亡: {
    short: '行途受阻 · 宜缓行',
    long: '截路空亡主行途被阻、事业中断之象；签约、出行、转职遇之易有反复，宜预留退路、缓步推进。',
    defaultCategory: 'inauspicious',
  },
  時墓: {
    short: '时入墓库 · 子息宜慎',
    long: '时墓主时柱入墓之象，涉子息、晚运之事；主晚年宜守静、与子女关系需多沟通，不宜过于严苛。',
    defaultCategory: 'inauspicious',
  },
  月煞: {
    short: '月内损耗 · 防家宅事',
    long: '月煞主月支内暗耗之事，常涉母亲、配偶、家宅健康；逢之宜多关照家人、避免家事矛盾扩大。',
    defaultCategory: 'inauspicious',
  },
  災煞: {
    short: '灾厄之气 · 宜化解',
    long: '灾煞主血光横死、病厄损耗之事；古论以五行配位定灾类（水火焚溺、金木杖刃、土坠落）；宜积德行善以化。',
    defaultCategory: 'inauspicious',
  },
  絞煞: {
    short: '缠绕牵连 · 防官讼',
    long: '绞煞主事务缠绕、牵连不清；易涉官讼、合约纠纷；逢之宜避签合约高风险事务，口舌宜克制。',
    defaultCategory: 'inauspicious',
  },
  羊刃: {
    short: '刚烈果决 · 双刃之剑',
    long: '羊刃（即"阳刃"）主刚烈、决断；能成大事亦能伤己，宜修身自制；喜身旺任之，忌再见刑冲。',
    defaultCategory: 'inauspicious',
  },
  金神: {
    short: '金气肃杀 · 防伤损',
    long: '金神主金气肃杀刚烈之气，喜火炼方成大器；柱无火则主刚愎易伤、破财口舌；宜以火炼其锋。',
    defaultCategory: 'inauspicious',
  },
  陰陽差錯: {
    short: '错位纠缠 · 感情多波',
    long: '阴阳差错（即"阴差阳错"）主感情、婚姻易有错位、波折；需多沟通包容；女命尤忌，宜晚婚缓进。',
    defaultCategory: 'inauspicious',
  },
  陰陽煞: {
    short: '阴阳失调 · 宜和合',
    long: '阴阳煞主阴阳失和、情感摇摆之象；男女感情易冷热反复；宜寻求性格互补之配偶，重和合不重激情。',
    defaultCategory: 'inauspicious',
  },
  隔角: {
    short: '兄弟疏离 · 亲情宜护',
    long: '隔角主兄弟姐妹、至亲关系疏离之象；逢之宜主动维系家人纽带，避免因小事生隙而长期冷淡。',
    defaultCategory: 'inauspicious',
  },

  // ========== 以下 key 虽不由 plugin 输出，但历史 UI 曾出现；保留作为同义词索引 ==========
  // （若未来有别的神煞源也输出这些 key，查表仍可命中）
  天德貴人: {
    short: '积善修德 · 消灾解难',
    long: '天德贵人为吉神之首，主善德深厚；遇凶煞能化解，一生平安少灾。',
    defaultCategory: 'auspicious',
  },
  月德貴人: {
    short: '温和厚道 · 化险为夷',
    long: '月德贵人与天德相配，主心性温和、多得助力；凶险自解。',
    defaultCategory: 'auspicious',
  },
  福星貴人: {
    short: '福禄双全 · 富贵之星',
    long: '福星贵人主一生衣禄无缺、常得幸运之助；事业感情易逢良机。',
    defaultCategory: 'auspicious',
  },
  天厨貴人: {
    short: '食禄不缺 · 衣食丰足',
    long: '天厨贵人（异体字形）主食禄丰足；一生少愁吃穿，饮食行业尤佳。',
    defaultCategory: 'auspicious',
  },
  詞館: {
    short: '文采斐然 · 利写作',
    long: '词馆（即"辞馆"）主擅长辞章、口才文笔俱佳；利于写作、演说、传媒。',
    defaultCategory: 'auspicious',
  },
  三奇: {
    short: '英华秀气 · 非凡之命',
    long: '三奇（甲戊庚、乙丙丁、壬癸辛相连）主才华出众，命格较贵。',
    defaultCategory: 'auspicious',
  },
  紅鸞: {
    short: '喜庆婚缘',
    long: '红鸾主婚姻喜庆、感情顺遂，运限逢之多有姻缘、喜事。',
    defaultCategory: 'auspicious',
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
  陽刃: {
    short: '刚烈果决 · 双刃之剑',
    long: '阳刃即羊刃，主刚烈决断；能成大业亦需防自伤。',
    defaultCategory: 'neutral',
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
  陰差陽錯: {
    short: '错位纠缠 · 感情多波',
    long: '阴差阳错（即"阴阳差错"）主感情、婚姻易有错位、波折；需多沟通包容。',
    defaultCategory: 'inauspicious',
  },
  勾絞: {
    short: '口舌是非',
    long: '勾绞（即"勾煞"）主口舌、纠纷、争执；逢之宜避是非、谨言慎行。',
    defaultCategory: 'inauspicious',
  },
}

/**
 * 查询神煞短释义，若未配置则返回空字符串 short（UI 层可做空态处理）。
 */
export function getShenshaMeaning(key: string): ShenshaMeaning {
  return SHENSHA_MEANING[key] ?? { short: '' }
}
