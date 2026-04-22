/**
 * 神煞简短释义表（古法术语版 · 30 项原文锚点考据）
 *
 * ✅ 审校状态：已完成（2026-04-22）
 *
 * 详细审校档案：`design/bazi/extracted/05-shensha.md`
 *
 * 本轮返工内容：
 *   1. 30 个高频神煞（见档案 § 30 项原文锚点清单）→ `auditStatus: 'verified'`，
 *      short / long 已严格对照《三命通会》《五行精纪》原文，
 *      改写为古法术语，附 `source` 字段记录原文行号锚点
 *   2. 其他 plugin-char8ex 输出但未做逐条考据的 key → `auditStatus: 'pending'`，
 *      short 改为简短中性占位，long 缺省，UI 可决定是否展示
 *   3. 全部删除"公职 / 审批 / 心理咨询 / 律政 / 谈判 / 传媒 / 体制内 / 公关 /
 *      餐饮食品 / 法律审批 / 健康食品行业"等无原文出处的现代化扩写
 *      （详见档案 § 现代化扩写黑名单）
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
 *   source:      原文锚点（仅 verified 项必填，格式 "ST3 · L###" 等，详见档案）
 *
 * 来源文献：
 *   - 《三命通会》明·万民英 卷二、卷三论诸神煞
 *     （raw 路径：design/bazi/raw/sanming-tonghui/volume-02.md / volume-03.md）
 *   - 《五行精纪》宋·廖中 卷十四 ~ 卷廿七
 *     （raw 路径：design/bazi/raw/wuxing-jingji/full.md）
 */

/**
 * 整表审校状态。
 * - 'verified': 30 项高频神煞已逐条对照原文锚点，未审校项已显式标 'pending'
 * - 'pending':  整表尚未完成考据
 */
export const SHENSHA_MEANING_STATUS: 'pending' | 'verified' = 'verified'

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
 * ── 第一组：30 项高频神煞（auditStatus: 'verified'，已落原文锚点） ──
 * ── 第二组：其他 plugin 输出 key（auditStatus: 'pending'，short 中性占位、long 缺省） ──
 */
export const SHENSHA_MEANING: Record<string, ShenshaMeaning> = {
  // ============================================================
  // 第一组：30 项高频神煞 · 古法术语版（auditStatus: 'verified'）
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
  // 第二组：plugin 输出但本轮未做逐条考据（auditStatus: 'pending'）
  // short 中性占位、long 缺省、UI 可加"待审校"标识
  // ============================================================
  天印貴人: {
    short: '印信文书之神',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
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
    short: '天德之配神',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  天赦: {
    short: '赦宥之恩',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  垣城: {
    short: '命垣有靠之象',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  天喜: {
    short: '喜庆之神',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  文星貴人: {
    short: '文星之神 · 与文昌相配',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
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
    short: '月德之配神',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  帝座: {
    short: '尊位之象',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
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
    short: '魁罡刚毅之象',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  三奇: {
    short: '三奇相连 · 才华出众',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  紅鸞: {
    short: '婚姻喜庆之神',
    defaultCategory: 'auspicious',
    auditStatus: 'pending',
  },
  九醜: {
    short: '九丑之煞',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  八專: {
    short: '干支同类 · 偏专之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  六厄: {
    short: '阻滞之煞',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  十惡大敗: {
    short: '禄入空亡之日',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  地網: {
    short: '与天罗相配 · 拘束之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  墓煞: {
    short: '七杀入墓之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  天羅: {
    short: '与地网相配 · 纠缠之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  太白星: {
    short: '金气肃杀之煞',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  孤鸞: {
    short: '孤鸾日 · 感情多波',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  截路空亡: {
    short: '空亡之衍化',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  時墓: {
    short: '时柱入墓之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  月煞: {
    short: '月支内暗耗之事',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  絞煞: {
    short: '与勾煞同义 · 缠绕之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  金神: {
    short: '金气刚烈之神',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  陰陽差錯: {
    short: '阴阳差错煞',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  陰差陽錯: {
    short: '阴阳差错煞 · 异体',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  陰陽煞: {
    short: '阴阳煞',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  隔角: {
    short: '兄弟疏离之象',
    defaultCategory: 'inauspicious',
    auditStatus: 'pending',
  },
  紅艷: {
    short: '红艳之煞 · 感情缘浓',
    defaultCategory: 'neutral',
    auditStatus: 'pending',
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
