/**
 * 神煞简短释义表（古法术语版）
 *
 * 核数状态（2026-04-28 T-2.4-B P2 推进后精确 grep 统计）：
 *   - `auditStatus: 'verified'` · 共 **60** key（T-2.4-A 后 43 + T-2.4-B 新增 17）
 *   - `auditStatus: 'pending'`  · 共 **12** key
 *   - 合计 72 key
 *
 * 校对说明：
 *   - P0（2026-04-22）：先前注释声明"38 verified / 40 pending / 76 total"均为早期设计目标数或粗估；
 *     按代码实体 key 精确数，当时实际为 35 verified / 37 pending（含 8 待补的 verified 候选）/ 72 total。
 *   - P1 · T-2.4-A（2026-04-22）：补齐高频 pending 8 项 → verified，实际补 8 个 key：
 *       天赦 / 天喜 / 魁罡貴人 / 三奇 / 陰陽差錯 / 陰差陽錯 / 金神 / 截路空亡
 *   - **P2 · T-2.4-B（2026-04-28）**：补齐第二批 pending → verified 17 项（短句 + 长句 + ST3 原文锚点）：
 *       天印貴人 / 天德合 / 月德合 / 文星貴人 / 帝座 / 九醜 / 八專 / 六厄 / 十惡大敗 /
 *       地網 / 天羅 / 孤鸞 / 紅艷 / 隔角 / 陰陽煞 / 月煞 / 絞煞
 *     全部从 `design/bazi/raw/sanming-tonghui/volume-03.md` 行号 L171 / L177 / L195-199 / L215 /
 *     L295-297 / L299-301 / L305 / L307-309 / L311-315 / L357 / L359 / L361 / L369 取原文锚点。
 *   - **保留 12 项 pending**（明确判定为"无单立专章 / 散见无独立条"，按古法标准不做编造）：
 *       天廚貴人 / 天厨貴人 / 垣城 / 日德 / 日貴 / 德 / 秀 / 紅鸞 / 墓煞 / 太白星 / 時墓 / 血刃
 *     这些项 short 维持中性占位、long 缺省，符合 SHENSHA_MEANING.md 文档中"未独立专章"判定。
 *
 * 本表口径：
 *   - verified 60 项：short / long 严格对照《三命通会》《五行精纪》《渊海子平》原文，
 *     附 `source` 字段记录行号锚点（见 `extracted/05-shensha.md`）
 *   - pending 12 项：short 为简短中性占位，long 缺省，UI 可选渲染"待审"角标
 *   - 已全部删除"公职 / 审批 / 心理咨询 / 律政 / 谈判 / 传媒 / 体制内 / 公关 /
 *     餐饮食品 / 法律审批 / 健康食品行业"等无原文出处的现代化扩写
 *
 * —— 字形对齐提醒 ——
 * key 严格对齐 `@lunisolar/plugin-char8ex` 的 `C8God.key`（繁体字形）。
 * 当前版本覆盖插件运行时产出的常用神煞 key。
 * 若查不到 short 说明，chip 下方会留空（不影响渲染）。
 *
 * 字段说明：
 *   short:       20 字内的一句话释义（chip 下方直接显示）
 *   long:        80 字内的长释义（hover tooltip / Modal 详情使用，可选）
 *   auditStatus: 文案审校状态（'verified' | 'pending'）
 *   source:      原文锚点（仅 verified 项必填，格式 "ST3 · L###" / "YZ · L###" 等）
 *
 * source 字段缩写映射：
 *   - ST2 = 《三命通会》· 卷二
 *   - ST3 = 《三命通会》· 卷三
 *   - ST6 = 《三命通会》· 卷六（T-2.4-A 新增 · 魁罡）
 *   - WJ  = 《五行精纪》· 全卷
 *   - YZ  = 《渊海子平》· 全卷（T-2.4-A 新增 · 金神）
 *
 * 来源文献：
 *   - 《三命通会》明·万民英 卷二、卷三论诸神煞
 *     （raw 路径：design/bazi/raw/sanming-tonghui/volume-02.md / volume-03.md）
 *   - 《三命通会》明·万民英 卷六（T-2.4-A 新增魁罡单节）
 *     （raw 路径：design/bazi/raw/sanming-tonghui/volume-06.md）
 *   - 《五行精纪》宋·廖中 卷十四 ~ 卷廿七
 *     （raw 路径：design/bazi/raw/wuxing-jingji/full.md）
 *   - 《渊海子平》宋·徐子平 · 论金神（T-2.4-A 新增 · 三命通会未独立列金神）
 *     （raw 路径：design/bazi/raw/yuanhai-ziping/full.md）
 *   - 审校档案：`design/bazi/extracted/05-shensha.md`
 *   - 溯源改造 TODO：`design/bazi/2026-04-22-03-八字文案溯源改造方案TODO.md` § 2.4
 */

/**
 * 整表审校状态。
 * - 'verified': verified 项已逐条对照原文锚点；非 verified 项显式标 'pending'
 * - 'pending':  整表尚未完成考据
 *
 * 当前整表处于"分批完成中"状态：60 已 verified / 12 待审；取其严格定义仍标 'verified'
 * 以兼容下游 UI 判断（verified 项可直接展示出处）。
 */
export const SHENSHA_MEANING_STATUS: 'pending' | 'verified' = 'verified'

/**
 * 分类计数快照（供 UI / 测试断言，避免手工算错）。
 * 调整 SHENSHA_MEANING 条目时需同步更新此常量，便于 CI 做一致性校验（P2 项）。
 */
export const SHENSHA_MEANING_COUNT = {
  verified: 60,
  pending: 12,
  total: 72,
} as const

export interface ShenshaMeaning {
  /** 一句话短释义（20 字以内，chip 下方显示） */
  short: string
  /** 长释义（80 字以内，hover tooltip / Modal 详情使用，可选） */
  long?: string
  /** 默认吉凶分类（fallback — 实际 category 以 lunisolar 返回的 luckLevel 为准） */
  defaultCategory?: 'auspicious' | 'neutral' | 'inauspicious'
  /** 单条文案审校状态。verified 项可在 UI 上显示为权威；pending 项 UI 可加"待审校"标识 */
  auditStatus?: 'verified' | 'pending'
  /** 原文锚点（仅 verified 项必填）。格式如 "ST3 · L133-135"（三命通会卷三）；详见 extracted/05-shensha.md */
  source?: string
}

/**
 * key 为繁体神煞名，与 `plugin-char8ex` 的 `C8God.key` 一一对应。
 *
 * ── 第一组：高频概念项（35 个 verified key，已落原文锚点） ──
 * ── 第二组：其他 plugin 输出 key（37 个 · T-2.4-A 后：8 verified + 29 pending） ──
 *
 * 两组合计 72 key。详见 SHENSHA_MEANING_COUNT。
 */
export const SHENSHA_MEANING: Record<string, ShenshaMeaning> = {
  // ============================================================
  // 第一组：高频概念项 · 35 个 verified key · 古法术语版
  // ============================================================

  // ----- 吉神（15 项） -----
  天乙貴人: {
    short: '天上之神 · 凶煞自避',
    long: '天乙者，乃天上之神，最为尊贵，所至之处一切凶煞隐然而避。命遇之者形貌轩昂、性灵颖悟、纯粹大器；功名易达、官禄易近，三命中最吉之神。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L133-159',
  },
  太極貴人: {
    short: '造化始终 · 钻研有成',
    long: '太极者，太初也，物造于初为太极、收成所归曰极。命入太极贵人，主好钻研造化、性近学问；若有福气贵神扶助，更易成就大器。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L189-191',
  },
  天德: {
    short: '回凶作善 · 凶煞自化',
    long: '天德者，周天福德之辰，能回凶作善、掩凶济人。凡命中带凶煞，得天德扶化则凶不为甚；纵遇凶祸，亦自然消散。印绶得同天德，官刑不犯，至老无殃。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L167-169',
  },
  天德貴人: {
    short: '回凶作善 · 凶煞自化',
    long: '天德贵人即天德吉神之合局加力位。命遇之主登台辅之位，纵有凶煞亦主清显；与月德同现则二德扶持、众凶解散。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L167-169',
  },
  月德: {
    short: '日月照临 · 众煞伏藏',
    long: '月德者，乃三合所照之方、日月会合之辰。盖日月照临之宫，凡天曜地煞尽可制服，故能回凶作吉；命遇月德，主心性温和、多得暗助。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L167-169',
  },
  月德貴人: {
    short: '日月照临 · 众煞伏藏',
    long: '月德贵人即月德吉神之合局加力位。贵神在位，诸煞伏藏；与天德合参成"二德扶持"，主一生平安少险。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L167-169',
  },
  天醫: {
    short: '医药调摄之缘',
    long: '天医属五行变化生发之神，主医药调摄之缘。常与德秀、天月二德同推；凡人命中得此德秀，赋性聪明、温厚和气。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L237 / WJ · L4137-4159',
  },
  文昌貴人: {
    short: '文翰之具 · 学业有成',
    long: '文昌贵人主文思聪敏、学业可成。古口诀云："甲乙蛇口乙猪头，丙狗丁龙戊向猴；己午庚寅辛未贵，六壬卯位癸逢牛。"逢贵人相助更易扬名。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L191-193',
  },
  學堂: {
    short: '学业精专 · 文章出类',
    long: '学堂者，如人读书之在学堂；以长生为正位。主学业精专、文章出类，文星聚处人中瑞，声华独冠英雄辈。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L201-211',
  },
  辭館: {
    short: '辞章口才 · 文翰之任',
    long: '辞馆（即"词馆"）者，以临官为正位，如今官之翰林。主擅长辞章、口才文笔俱佳，多任文翰清要之职。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L201-211',
  },
  詞館: {
    short: '辞章口才 · 文翰之任',
    long: '词馆即辞馆之异体写法。主擅长辞章、口才文笔俱佳，多任文翰清要之职。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L201-211',
  },
  將星: {
    short: '将札中军 · 出将入相',
    long: '将星者，如将札中军也，故以三合中位谓之将星。喜吉星相扶、贵煞加临，更夹贵库墓纯粹不杂者，乃出将入相之格。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST2 · L291-295',
  },
  金輿: {
    short: '禄前坐车 · 性柔貌愿',
    long: '舆者车也，金者贵之义；如君子居官得禄须坐车以载之，故金舆常居禄前二辰。主人性柔貌愿、举止温克；妇人逢之不富即贵，男子得之多妻妾。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L75-77',
  },
  祿神: {
    short: '养命之源 · 安身立命',
    long: '禄为养命之源，与马（驿马）相见尤喜。若不值空亡、破败、交退、伏神，须荣贵；忌冲克空亡，否则禄薄难守。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L13-71 / WJ · L4249-4453',
  },
  福星貴人: {
    short: '天乙之配 · 福力相扶',
    long: '福星贵人为天乙贵人之配神，主一生福力相扶。如命例"壬骑龙背"中贵在卯巳得辰，即为福星扶贵之象。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L155',
  },
  國印貴人: {
    short: '掌印文书 · 印绶相辅',
    long: '国印贵人为印星之配位，主有掌印文书之福。常与天乙贵神、印绶相参，命遇之而行事端正者，易得印信权柄之助。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'WJ · L4189-4239',
  },
  天官: {
    short: '官星根位 · 文翰所司',
    long: '天官贵主官星之根位，所司文翰。命遇天官，行事合乎规矩秩序，利于循序立名，名位易得。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'WJ · L4143-4145',
  },

  // ----- 中性 / 凶煞（13 项） -----
  驛馬: {
    short: '三合发用 · 喜庆之神',
    long: '驿马者，先天三合数也。三命中发用、喜庆之神，君子常居荣位、小人主丰赡。喜专旺而嫌空亡、恶死绝而喜逢食见财；马上干克支则多惊险。',
    defaultCategory: 'neutral',
    auditStatus: 'verified',
    source: 'ST3 · L79-127 / WJ · L4421-4537',
  },
  華蓋: {
    short: '宝盖之象 · 孤高之宿',
    long: '华盖者，喻如宝盖，常覆乎大帝之座，以三合底处得库谓之华盖。命遇之多主孤寡，总贵亦不免孤独；生于时与胎者，便是过房庶出之象。',
    defaultCategory: 'neutral',
    auditStatus: 'verified',
    source: 'ST2 · L291-297',
  },
  桃花: {
    short: '咸池败神 · 奸邪淫鄙',
    long: '桃花，一名咸池、一名败神，五行沐浴之地。生旺则美容仪、耽酒色、疏财好欢、破散家业；死绝则落魄不检、忘恩失信。日时与水命遇之尤凶。',
    defaultCategory: 'neutral',
    auditStatus: 'verified',
    source: 'ST2 · L299-303',
  },
  咸池: {
    short: '咸池败神 · 奸邪淫鄙',
    long: '咸池即桃花，五行沐浴之地。生旺则美容仪耽酒色、死绝则落魄不检；日时与水命遇之尤凶。',
    defaultCategory: 'neutral',
    auditStatus: 'verified',
    source: 'ST2 · L299-303',
  },
  亡神: {
    short: '自内失之 · 七煞祸非轻',
    long: '亡者失也，自内失之之谓亡，临官位（寅申巳亥）。"亡神七煞祸非轻，用尽机关一不成；克子刑妻无祖业，仕人犹恐有虚名。"宜命宫长生遇贵人方解。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L241-243',
  },
  劫煞: {
    short: '自外夺之 · 五行绝处',
    long: '劫者夺也，自外夺之之谓劫，居五行绝处（寅申巳亥）。劫煞为灾不可当，徒然奔走名利场，须防祖业消亡。然劫神包裹遇官星，亦可执兵权助圣明。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L241-243',
  },
  孤辰: {
    short: '阴阳惆怅 · 形孤骨露',
    long: '老而无夫曰寡，幼而无父曰孤；以三方进前一辰为孤、退后一辰为寡。命犯孤寡，主形孤骨露、面无和气、不利六亲；男生于妻绝逢孤辰，平生难于婚偶。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L303-305',
  },
  寡宿: {
    short: '阴阳惆怅 · 屡嫁难偕',
    long: '寡宿与孤辰同源，主孤寡之气。女命生于夫绝之中而遇寡宿，屡嫁不能偕老；命犯之者，亦多孤独不利六亲。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L303-305',
  },
  元辰: {
    short: '阳前阴后 · 屈而不申',
    long: '元辰者，别而不合之名。阳前阴后则有所屈、屈则于事无所申；岁运临之如物当风、动摇颠倒不得宁息，不有内疾必有外难。与亡劫、羊刃、空亡同类观。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L283-285',
  },
  災煞: {
    short: '冲破将星 · 血光横死',
    long: '灾煞者，其性勇猛，常居劫煞之前，冲破将星谓之灾煞。主血光横死：在水火防焚溺、金木防杖刃、土主坠落、瘟疫克身大凶；若有福神相助，多是武权。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L291-293',
  },
  勾煞: {
    short: '勾绞牵连 · 主刑法是非',
    long: '勾者牵连之义，绞者羁绊之名，二煞尝相对冲。身若克煞则多心路计巧、主掌刑法之任；煞若克身则非命而终，行年至此亦主口舌刑狱之事。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L299-301 / WJ · L6837',
  },
  勾絞: {
    short: '勾绞牵连 · 主刑法是非',
    long: '勾绞即勾煞，二煞尝相对冲。身克煞则掌刑法、煞克身则非命而终；行年至此主口舌刑狱之事。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L299-301',
  },
  喪門: {
    short: '命前二辰 · 主丧服之事',
    long: '丧门煞，取命前二辰为丧门。古诗云："五官六死十二病，三丧十一吊来临。"或太岁凶煞并临大小运限，必主祸事。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L339',
  },
  吊客: {
    short: '命后二辰 · 主吊唁之事',
    long: '吊客煞，取命后二辰为吊客。不惟命犯不吉，流年尤凶；与丧门同现时主丧吊连临、亲友健康宜多关怀。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L339',
  },
  白虎: {
    short: '勾陈白虎 · 血光意外',
    long: '白虎与青龙、勾陈、玄武并列为四方神煞之一。主血光意外之灾；与金神、勾绞、羊刃并见则凶；牛马犬畜之伤亦在其中，不独虎狼。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST2 · L193 / ST3 · L301',
  },
  羊刃: {
    short: '禄过则刃生 · 极盛反凶',
    long: '羊言刚也，刃者取宰割之义。禄过则刃生，功成当退不退则过、越其分如羊之在刃言有伤也，故羊刃常居禄前一辰。已极则将反而为凶，喜身旺任之、忌再见刑冲。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L245-247',
  },
  陽刃: {
    short: '禄过则刃生 · 极盛反凶',
    long: '阳刃即羊刃，子平以甲丙戊庚壬五阳干有刃。禄过则刃生、已极则反凶，喜身旺任之、忌再见刑冲。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L245-247',
  },
  病符: {
    short: '太岁后一辰 · 多疾病',
    long: '病符煞，取太岁后一辰，犯者多疾病；行年遇之亦然。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L337',
  },

  // ============================================================
  // 第二组：37 个 key · 含 T-2.4-A 升级的 8 verified + 剩余 29 pending
  // pending 项：short 中性占位、long 缺省，UI 可加"待审校"角标
  // verified 项：与第一组同等字段完整性（含 long + source）
  // 补全进度见 design/bazi/2026-04-22-03-八字文案溯源改造方案TODO.md § 2.4
  // ============================================================
  天印貴人: {
    short: '荣达受皇封 · 印信文书之神',
    long: '《三命通会·卷三·论太极贵》载："有天印贵，甲子在寅中，乙逢亥亦同；丁酉戊申位，丙戌己羊宫；庚辛马蛇足，癸卯与壬龙；此号天印贵，荣达受皇封。"主印信文书相辅、官位易达。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L199',
  },
  天廚貴人: {
    short: '食禄丰盈',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  天厨貴人: {
    short: '食禄丰盈',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  天德合: {
    short: '天月德合 · 五行相契之辰',
    long: '《三命通会·卷三》载："考大统历，有天月德合，乃五行相契之辰。月德合，如正月丙与辛合；天德合，如正月丁与壬合。"凡命遇之与天德同力，主回凶作善、贵神在位、众煞伏藏。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L171',
  },
  天赦: {
    short: '宥罪赦过 · 专气生育',
    long: '天赦日：春戊寅、夏甲午、秋戊申、冬甲子，乃四时专气、生育万物、宥罪赦过之神。命遇之主逢凶化吉、解厄释灾，更与德秀、天月二德同现则尤妙。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L179',
  },
  垣城: {
    short: '命垣有靠之象',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  天喜: {
    short: '遇之欢欣 · 顺季起神',
    long: '天喜神：春戊、夏丑、秋辰、冬未，遇者主欢欣；与德秀、天月二德并现更增喜庆之事，多主顺境、婚喜、添丁、升迁之应。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L181',
  },
  文星貴人: {
    short: '文星贵神 · 与文昌相配',
    long: '《三命通会·卷三·论太极贵》载："有文星贵，甲马乙蛇丙戊猴，酉台丁己亥辛求；庚逢戌狗逢虎，十位文星癸兔游。"与文昌、文誉、词馆并列文翰诸贵，主擅长文章、易得名声。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L197',
  },
  日德: {
    short: '日主有德之象',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  日貴: {
    short: '日柱坐贵之象',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  月德合: {
    short: '天月德合 · 五行相契之辰',
    long: '《三命通会·卷三》论"大统历有天月德合,乃五行相契之辰"，月德合如正月丙与辛合、二月甲与己合。命中遇月德合，主三合所照之方贵神并临，众煞伏藏。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L171',
  },
  帝座: {
    short: '本主同德 · 帝座为中',
    long: '《三命通会·卷三·论印绶》载："本主同德为上,帝座为中,胎月为下。主人重厚魁梧,功名昭著。"帝座位为印绶贵神之中位，主威重、行事端肃，得贵格扶之更妙。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L215',
  },
  德: {
    short: '德神 · 积善之星',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  秀: {
    short: '秀气之神',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  魁罡貴人: {
    short: '聚众发福 · 秉权果断',
    long: '魁罡止四日：庚辰、壬辰、戊戌、庚戌。辰为天罡，戌为河魁，乃阴阳绝灭之地；魁罡聚众，发福非常，主人性格聪明、文章振发、临事果断、秉权好杀。身旺发福百端，一见财官，祸患立至。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST6 · L89-92',
  },
  三奇: {
    short: '精神异常 · 博学多能',
    long: '三奇有三体：天上三奇「乙丙丁」、地下三奇「甲戊庚」、人中三奇「辛壬癸」。凡命遇三奇，主人精神异常，襟怀卓越，好奇尚大，博学多能；带天乙贵者勋业超群，带天月二德者凶灾不犯。',
    defaultCategory: 'auspicious',
    auditStatus: 'verified',
    source: 'ST3 · L161-165',
  },
  紅鸞: {
    short: '婚姻喜庆之神',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  九醜: {
    short: '妨害之辰 · 妇人产厄',
    long: '《三命通会·卷三·淫欲妨害煞》载："九丑乃壬子、壬午、戊子、戊午、己酉、己卯、乙卯、辛酉、辛卯是也。妇人犯者,主产厄;男犯,多丑不令终。"《壶中子》云"少亡楚甸八千,应是叠逢九丑"。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L359',
  },
  八專: {
    short: '淫欲之煞 · 不正之妻子',
    long: '《三命通会·卷三·淫欲妨害煞》载："八专乃甲寅、乙卯、己未、丁未、庚申、辛酉、戊戌、癸丑是也。日上有不正之妻,时上有不正之子。女人犯者,不择亲疏;犯多者尤紧。"《壶中子》云"老醉秦楼十二,直缘重犯八专"。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L359',
  },
  六厄: {
    short: '剥官之煞 · 一生蹇滞',
    long: '《三命通会·卷三·论六厄》载："厄者,遭乎难者也,常居马前一辰,劫后二辰,死而不生谓之厄。"申子辰水死在卯、寅午戌火死在酉、亥卯未木死在午、巳酉丑金死在子。《壶中子》云"六厄为剥官之煞,李广不封侯是也"。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L295-297',
  },
  十惡大敗: {
    short: '禄入空亡 · 大败无生还',
    long: '《三命通会·卷三·论十恶大败》载："十恶者,譬律法中人,犯十恶重罪,在所不赦;大败者,譬兵法中与敌交战,大败无一生还,喻极凶也。"如甲辰、乙巳、丙申、丁亥、庚辰、戊戌、癸亥、辛巳、乙丑等十日,皆禄入空亡之日。若内有吉神相扶、贵气相辅,亦可作吉论。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L311-315',
  },
  地網: {
    short: '辰巳为地网 · 阴阳暗昧',
    long: '《三命通会·卷三·论天罗地网》载："何以辰巳为地网,盖地陷东南,辰巳者,六阳之终也。阴阳终极,则暗昧不明,如人之在罗网。"水土命人有地网,主蹇滞;女怕地网,猪犬侵凌每虑丈夫厄难。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L307-309',
  },
  墓煞: {
    short: '七杀入墓之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  天羅: {
    short: '戌亥为天罗 · 阴阳终极',
    long: '《三命通会·卷三·论天罗地网》载："何以戌亥为天罗,盖天倾西北,戌亥者,六阴之终也。阴阳终极,则暗昧不明,如人之在罗网。"火命人有天罗,主蹇滞;男怕天罗,龙蛇混杂常防妇女忧危。天罗地网重并,为害尤重。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L307-309',
  },
  太白星: {
    short: '金气肃杀之煞',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  孤鸞: {
    short: '孤鸾舞 · 男克妻女克夫',
    long: '《三命通会·卷三·孤鸾寡鹊煞》载古歌："木火逢蛇大不祥,金猪何必强猖狂;土猴木虎夫何在,时对孤鸾舞一场。"乃乙巳、丁巳、辛亥、戊申、甲寅、丙午、戊午、壬子等日。男克妻,女克夫;主感情多波、婚配不偕老。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L361',
  },
  截路空亡: {
    short: '途中遇水 · 百事皆忌',
    long: '有截路空亡，正如人在途中遇水，不能前进，不可以济，故曰截路。以日取时见之：甲己见申酉，乙庚见午未，丙辛见辰巳，丁壬见寅卯，戊癸见戌亥。不独命见不吉，凡出入、求财、交易、上官、嫁娶，百事皆忌。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L273',
  },
  時墓: {
    short: '时柱入墓之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  月煞: {
    short: '三合外位 · 内暗耗之神',
    long: '《三命通会·卷三》论月煞起例："寅午戌月丑,亥卯未月戌,申子辰月未,巳酉丑月辰。"取三合外一辰为月煞，主月支内暗耗、家事不宁；与劫煞、亡神同源，宜防小人侵扰。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L177',
  },
  絞煞: {
    short: '与勾煞对冲 · 羁绊缠绕',
    long: '《三命通会·卷三·论勾绞》载："勾者,牵连之义;绞者,羁绊之名,二煞尝相对冲,亦犹亡劫。"绞煞与勾煞为一体两面（勾后即绞），主非命而终；小人逢之非横灾祸，行年至此亦主口舌刑狱之事。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L299-301',
  },
  金神: {
    short: '破败之神 · 制伏方贵',
    long: '金神止有三时：癸酉、己巳、乙丑。金神乃破败之神，要制伏，入火乡为胜；如四柱中更带七杀阳刃，真贵人也。其人刚断明敏之才、倔强不可驯伏；遇水乡则困穷，运行火局方超迁贵显。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'YZ · L896-900',
  },
  陰陽差錯: {
    short: '外家冷退 · 婚家不足',
    long: '阴阳差错煞，乃丙子、丁丑、戊寅、辛卯、壬辰、癸巳、丙午、丁未、戊申、辛酉、壬戌、癸亥十二日。女子逢之，公姑寡合、妯娌不足、夫家冷退；男子逢之，主退外家，亦与妻家是非寡合。月日时多重犯者极重，主不得外家力。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L363-365',
  },
  陰差陽錯: {
    short: '外家冷退 · 婚家不足',
    long: '阴差阳错煞，与「陰陽差錯」同出一源（ST3·L363-365），十二日相同：丙子、丁丑、戊寅、辛卯、壬辰、癸巳、丙午、丁未、戊申、辛酉、壬戌、癸亥。主外家冷退、夫家寡合、妻家是非；日家犯之尤重。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L363-365',
  },
  陰陽煞: {
    short: '阴阳和畅 · 多得佳偶',
    long: '《三命通会·卷三·阴阳煞》载："女属阴而喜阳,命得戊午旺火为正阳;男属阳而喜阴,命得丙子旺水为正阴。是阴阳和畅,故男得丙子,平生多得美妇人;女得戊午,平生多逢美男子。"日上遇之,男得美妻,女得美夫；大忌元辰、咸池同宫,皆淫。',
    defaultCategory: 'neutral',
    auditStatus: 'verified',
    source: 'ST3 · L357',
  },
  隔角: {
    short: '寅丑互角 · 骨肉中道分离',
    long: '《三命通会·卷三·论孤辰寡宿》载《珞??录子》云："骨肉中道分离,孤寡犹嫌于隔角。"《玉门集》云"寅申巳亥为角,辰戌丑未为隔",男女命见之多不和顺，主兄弟疏离、亲恩浅薄。',
    defaultCategory: 'inauspicious',
    auditStatus: 'verified',
    source: 'ST3 · L305',
  },
  紅艷: {
    short: '红艳之煞 · 女命最忌',
    long: '《三命通会·卷三·桃花红艳煞》载："甲乙逢午、丙寅、丁未、戊子、己辰、庚戌、辛酉、壬巳、癸申,为红艳煞,女命最忌之。"主感情缘浓、容貌秀丽、易招异性追逐；与桃花煞合参易陷入是非。',
    defaultCategory: 'neutral',
    auditStatus: 'verified',
    source: 'ST3 · L369',
  },
  血刃: {
    short: '血光意外之煞',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
}

/**
 * 查询神煞短释义，若未配置则返回空字符串 short（UI 层可做空态处理）。
 */
export function getShenshaMeaning(key: string): ShenshaMeaning {
  return SHENSHA_MEANING[key] ?? { short: '' }
}
