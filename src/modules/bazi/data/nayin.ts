/**
 * 纳音 30 种含义（六十甲子纳音）
 *
 * ✅ 审校状态：已完成（2026-04-22）· 数据层 schema 升级为 SourcedContent
 *
 * 原文来源：
 * - 主：《三命通会 · 卷一 · 论纳音取象 / 释六十甲子性质吉凶》
 *   `design/bazi/raw/sanming-tonghui/volume-01.md`（L281-L399）
 * - 辅：《渊海子平 · 纳音歌》、《五行精纪 · 卷三十四》
 * - 审校档案：`design/bazi/extracted/01-nayin.md`（30 段原文锚点 + 象意要点）
 * 白话改写：2026-04-21（客观陈述口径，不采用算命化措辞）
 *
 * key 策略：
 *   使用 tyme4ts `Sound.NAMES` 的运行时输出（即 `cycle.getSound().getName()` 返回值），
 *   避免与命盘数据源出现简繁/别写不匹配（如"金箔金"非"金泊金"，"泉中水"非"井泉水"）。
 *   若后续切换计算引擎，请在 normalize 层映射，不污染本表。
 *
 *   ⚠ 3 条名称与古籍原文有别（tyme4ts 现代用字 vs 三命通会原名）：
 *   - 金箔金（code）≈ 金泊金（raw）
 *   - 沙中金（code）≈ 砂中金（raw）
 *   - 泉中水（code）≈ 井泉水（raw）
 *   source 字段会在这 3 条注明 raw 原名，便于回溯。
 *
 * short:     ≤20 字一句话概括，用于四柱表纳音单元直接提示
 * long:      80-120 字详细释义，用于 tooltip / 详情页
 * classical: 古籍原文主旨句（繁体，≤ 40 字），UI 在 long 下方用小字引用
 * source:    原文锚点（"《三命通会》· 卷一 · L###"）
 * element:   纳音五行，便于上游按五行分类处理
 *
 * 2026-04-22 schema 升级：
 *   - `NayinMeaning` 从 `{short, long, element}` 升级为含 `classical` / `source` / `isClassical` / `auditStatus`
 *   - 兼容函数 `getNayinMeaning()` 签名不变（仍返回完整 NayinMeaning 结构，新字段自然可用）
 *   - 与 `patternLongInterpret.ts` 的 PatternLongEntry 结构对齐（见 2026-04-22-03 TODO § 1.1）
 */

export type NayinElement = '金' | '木' | '水' | '火' | '土'

/**
 * 文件级审校状态。
 * - `NAYIN_IS_CLASSICAL = true`：30 段 long 均已对齐《三命通会 · 卷一》原文
 * - `NAYIN_MEANING_STATUS = 'verified'`：30 段逐条补 classical + source，可对外展示出处
 */
export const NAYIN_IS_CLASSICAL = true as const
export const NAYIN_MEANING_STATUS: 'pending' | 'verified' = 'verified'

export interface NayinMeaning {
  /** ≤20 字短语，纳音单元 hover 首行或占位副标题 */
  short: string
  /** 80-120 字详细释义，tooltip / 展开态显示 */
  long: string
  /** 古籍原文主旨句（繁体，≤ 40 字），UI 在 long 下方用小字引用 */
  classical: string
  /** 原文锚点（《三命通会》· 卷一 · L###） */
  source: string
  /** 是否古籍可溯源（本表统一 true） */
  isClassical: true
  /** 审校状态（本表统一 'verified'） */
  auditStatus: 'verified'
  /** 纳音五行属性 */
  element: NayinElement
}

/**
 * 30 种纳音的白话释义表。
 *
 * 字数约束：
 * - short 不超过 20 字
 * - long 控制在 80-120 字
 * - classical 不超过 40 字（繁体，句读保留原文，末尾用"。"）
 *
 * 文风约束：
 * - 以"意象 + 性格倾向 + 喜忌配合"三段式结构撰写
 * - 避免"必、定、绝对"等断言性措辞，改用"主、宜、宜配、遇 ... 则"等调和措辞
 * - 与 fortuneHints / flowYearHints 现有风格保持一致
 */
export const NAYIN_MEANING: Record<string, NayinMeaning> = {
  // ——— 金类 6 条 ———
  海中金: {
    short: '藏锋蓄锐，动则见光',
    long: '藏于深海之金，珠蕴龙宫，不假火炼亦能自成其器。性格多内敛沉稳，心志不显于外；机遇来临时需借冲动之势，方得浮出水面。宜配水木相生以润其本，忌命局过燥、火煅太过，反伤其器。',
    classical: '海中金者，寶藏龍宮，珠孕蛟寶，出現雖假於空衝，成器無借乎火力。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L281-283',
    isClassical: true,
    auditStatus: 'verified',
    element: '金',
  },
  剑锋金: {
    short: '锋芒百炼，决断有威',
    long: '白帝司权之金，经百炼而成锋，红光射斗、白刃凝霜。主性情刚毅果断、临事有威；既可建功立业，亦易因过刚伤人伤己。宜得大溪、海水淬养以化其锐，忌再遇刑冲火煅徒增戾气。',
    classical: '劍鋒金者，白帝司權，剛由百煉，紅光射於斗牛，白刃凝於霜雪。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L297-299',
    isClassical: true,
    auditStatus: 'verified',
    element: '金',
  },
  白蜡金: {
    short: '玉质清华，炼而更贵',
    long: '昆山片玉、洛浦遗金，形明体洁，交映日月之光。初成时质地尚软，须经炉火淬炼方成大器。主早年温润含蓄、中年之后以磨砺彰显贵气。宜得禄马、贵人扶助以资其炼，忌身弱而火煅过度，使器未成先损。',
    classical: '白蠟金者，崑山片玉，洛浦遺金，交栖日月之光，凝聚陰陽之氣。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L289-291',
    isClassical: true,
    auditStatus: 'verified',
    element: '金',
  },
  沙中金: {
    short: '淘沙见金，因人始贵',
    long: '刚形布地、宝质藏沙，直待陶洗、淘汰方为珍宝。主早年辛劳积累，后凭贵人提携或机缘磨砺而显，属于"因人成事"之格局。宜配清贵禄马、火土得中以助其成器，忌水泛则沙散、刑冲破则财折。',
    classical: '砂中金者，剛形布地，寶質藏砂，直教陶洗為珍，必須因人始貴。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L293-295（raw 原名「砂中金」）',
    isClassical: true,
    auditStatus: 'verified',
    element: '金',
  },
  金箔金: {
    short: '金薄有光，依人而贵',
    long: '润色杯盘、增光宫室之薄金，贴附于器物之上方显其彩。主性情精致外向、善于借势借力，贵气多来自合作与依附而非独立锻造。宜与别金、厚土相佐以成其薄而不弱之质，忌遇炉火粗煅、猛器破损。',
    classical: '金泊金者，潤色杯盤，增光宮室，打薄須借乎別金，描彩必假乎水力。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L285-287（raw 原名「金泊金」）',
    isClassical: true,
    auditStatus: 'verified',
    element: '金',
  },
  钗钏金: {
    short: '美器藏闺，华而不露',
    long: '美容首饰、偎红倚翠之宝，小巧精工，藏于枕玉眠香之处。主性情秀雅内敛，偏向家庭与私密领域的雅致；行事讲究分寸与细节。宜静水相润、厚土安藏以存其姿，忌火烈并临或刑冲破损，伤其精工之形。',
    classical: '釵釧金者，美容首飾，增光膩肌，偎紅倚翠之珍，枕玉眠香之寶。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L301-303',
    isClassical: true,
    auditStatus: 'verified',
    element: '金',
  },

  // ——— 火类 6 条 ———
  炉中火: {
    short: '炉暖炭热，稳燃成器',
    long: '天地为炉、阴阳为炭，火性得炉有节，非狂焰亦非易熄。主性情外热内稳、情绪有界，持续用功而能炼物化器，利于技艺与实业之道。宜得木生为薪、金来为财可供冶炼，忌水泛熄炉或土厚埋火，阻其光明。',
    classical: '爐中火者，天地為爐，陰陽為炭，騰光輝於宇宙，成陶冶於乾坤。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L309-311',
    isClassical: true,
    auditStatus: 'verified',
    element: '火',
  },
  山头火: {
    short: '燎原之势，气势宏大',
    long: '野焚燎原、延烧极目，九月秋山之火，势若天际斜晖、山头落日。主气象恢宏、做事声势远达，能聚人成势、成就一方局面。宜得山木、松柏为燃料以持久发光，忌无木可焚或遭刑冲而骤熄，盛极一时反难延续。',
    classical: '山頭火者，野焚燎原，延燒極目，依稀天際斜暉，彷彿山頭落日。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L325-327',
    isClassical: true,
    auditStatus: 'verified',
    element: '火',
  },
  霹雳火: {
    short: '雷火迅发，声震一方',
    long: '一缕毫光承九天号令，电掣金蛇、云驱铁马之势，起势神速。主性情激烈刚猛、反应敏锐，能在关键处爆发而改变格局、开辟新路。宜有风水雷相助以资变化，忌身弱承受不住，反易造成一时起落、难以收局。',
    classical: '霹靂火者，一縷毫光，九天號令，電掣金蛇之勢，雲驅鐵馬之奔。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L305-307',
    isClassical: true,
    auditStatus: 'verified',
    element: '火',
  },
  山下火: {
    short: '荧光点缀，清华出尘',
    long: '草间熠耀、花理荧煌，如寒林缀叶、隔幔点衣，属秋夜之荧光。主性情清雅隐逸、审美高远，适合学术、设计与文艺之域。宜木山为助、得水反制而显清贵，忌过于张扬或命局浮躁，反失其含光之本色。',
    classical: '山下火者，草間熠耀，花理熒煌，寒林綴葉之光，隔幔點衣之彩。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L321-323',
    isClassical: true,
    auditStatus: 'verified',
    element: '火',
  },
  覆灯火: {
    short: '灯明幽处，照人未见',
    long: '金盏光辉、玉台吐艳，照日月未照之处、明天地未明之时，夜明之灯也。主性格沉静含蓄、善于在暗中坚持与奉献。宜以木为灯心、水为灯油，忌阳气过盛夺其光，或无油无心失其明。',
    classical: '覆燈火者，金盞光輝，玉臺吐艷，照日月不照之處，明天地未明之時。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L313-315',
    isClassical: true,
    auditStatus: 'verified',
    element: '火',
  },
  天上火: {
    short: '辉映乾坤，光耀远达',
    long: '温暖山海、辉光宇宙之火，兼阳德丽天之照与阴精离海之明。主光明磊落、影响力远及他人，常有公众属性或领袖气质。宜配清润水木以保持温和节制，忌水泛浇熄或土多遮蔽，使其光明不得远播于人。',
    classical: '天上火者，溫暖山海，輝光宇宙，陽德麗天之照，陰精離海之明。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L317-319',
    isClassical: true,
    auditStatus: 'verified',
    element: '火',
  },

  // ——— 木类 6 条 ———
  大林木: {
    short: '林木成荫，气象不凡',
    long: '枝干撼风、柯条撑月，耸壑昂霄、凌云蔽日之大林。主格局宏大、器量深厚，适合担当大任与培育后辈，是可成栋梁之材。最爱厚土为根、剑锋之金修枝，忌无土浮悬或遇巨火延烧，折损其栋梁本质。',
    classical: '大林木者，枝幹撼風，柯條撐月，聳壑昂霄之德，凌雲蔽日之功。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L337-339',
    isClassical: true,
    auditStatus: 'verified',
    element: '木',
  },
  杨柳木: {
    short: '柳影轻柔，风姿绰约',
    long: '隋堤袅娜、汉苑轻盈，万缕不蚕之丝、千条不针之带。主性格温柔细腻、应变灵活，外柔内韧，但根基偏浅需外力稳固。宜砂土艮山为根、清水滋养以固其质，忌狂风骤雨或刑冲破损，损其柔韧之姿。',
    classical: '楊柳木者，隋堤嫋娜，漢苑輕盈，萬縷不蠶之絲，千條不針之帶。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L341-343',
    isClassical: true,
    auditStatus: 'verified',
    element: '木',
  },
  松柏木: {
    short: '凌寒独立，坚贞长青',
    long: '泼雪凑霜、参天覆地，风撼笙篁之奏、雨余旌旆之张。主性情刚正坚贞、耐得住岁月寒暑，是可信赖的长效之材，宜承担长线之责。宜有山为根、得水为润以养生机，忌遇金斧砍伐或孤立无助，伤其本心之操守。',
    classical: '松柏木者，潑雪湊霜，參天覆地，風撼笙篁之奏，雨餘旌旆之張。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L333-335',
    isClassical: true,
    auditStatus: 'verified',
    element: '木',
  },
  平地木: {
    short: '初发萌芽，待时而成',
    long: '初生萌蘖、始发枝条，唯资雨露之功，不喜雪霜之积。主人生起步阶段、蓄势待发，成长需要时机与持续栽培方能成林。宜以厚土为基、清水为润以定根茎，忌无根浮萍或金煞伤幼苗，须小心护持方能成其材。',
    classical: '平地木者，初生萌櫱，始發枝條，唯資雨露之功，不喜雪霜之積。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L349-351',
    isClassical: true,
    auditStatus: 'verified',
    element: '木',
  },
  桑柘木: {
    short: '育蚕织彩，润泽众生',
    long: '缯彩之基、绮罗之本，士民飘飘之袂、圣贤楚楚之衣所自出。主生性奉献、能以己养他，利于服务、教育、扶持他人之业。最爱砂土为根基，忌刑冲破根、金斧无度，断其供养之能。',
    classical: '桑柘木者，繒彩基礎，綺羅根本，士民飄飄之袂，聖賢楚楚之衣。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L329-331',
    isClassical: true,
    auditStatus: 'verified',
    element: '木',
  },
  石榴木: {
    short: '红花多子，富厚有家',
    long: '性辛如姜、花红似火，数颗枝头累累多子，房内莹莹可观。纳音木而干支带金，性情独特敏锐；主家业兴旺、后嗣繁盛之象。最喜成器之土为根，忌遇燥火焚花或无土浮根，失其厚福。',
    classical: '石榴木者，性辛如薑，花紅似火，數顆枝頭，累累多子，房內瑩瑩。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L345-347',
    isClassical: true,
    auditStatus: 'verified',
    element: '木',
  },

  // ——— 水类 6 条 ———
  涧下水: {
    short: '涧水清明，绵延不息',
    long: '山环细浪、雪涌飞端，相连南北之流，对峙坎离之脉，属山谷细流。主性格清澈透明、持续而不张扬，宜静心笃行、细处着力。喜清金相养、木来顺导以助其流，忌土浊塞流或水势过多反成漂荡之势。',
    classical: '澗下水者，山環細浪，雪湧飛端，相連南北之流，對峙坎離之脈。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L377-379',
    isClassical: true,
    auditStatus: 'verified',
    element: '水',
  },
  大溪水: {
    short: '大川奔涌，气象万千',
    long: '惊涛薄岸、骇浪浮天，光涵万里之宽、碧倒千山之影，奔流向海之大河。主性情进取、气势磅礴，利于开拓与远行。喜归有所养，宜金助水源；忌屋土壅阻或狂风横冲，使其失其本流。',
    classical: '大溪水者，驚濤薄岸，駭浪浮天，光涵萬里之寬，碧倒千山之影。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L381-383',
    isClassical: true,
    auditStatus: 'verified',
    element: '水',
  },
  长流水: {
    short: '流长不竭，恒持而贵',
    long: '混混无穷、滔滔不竭，就下必纳于东南，顺流自归于辰巳。主性格持久有恒、步步推进，做事讲究绵延之功。喜白蜡、钗钏金生养，亦喜雷动生机；忌断源或土塞，打断其长流之势。',
    classical: '長流水者，混混無窮，滔滔不竭，就下必納於東南，順流自歸於辰巳。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L385-387',
    isClassical: true,
    auditStatus: 'verified',
    element: '水',
  },
  天河水: {
    short: '云行雨施，恩泽普降',
    long: '乱洒六野、密沛千郊，自银河淋泻而下、从碧落细飞而来，雨露甘霖之水。主性情博爱广施、影响力润物无声。土不能克、金不能生，独立自成；最喜霹雳火如神龙助其腾跃，忌命局过燥。',
    classical: '天河水者，亂灑六野，密沛千郊，淋淋瀉下銀河，細細飛來碧落。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L389-391',
    isClassical: true,
    auditStatus: 'verified',
    element: '水',
  },
  泉中水: {
    short: '井泉清冽，惠及众人',
    long: '寒泉清冽、取养不穷，八家凿之以同饮、万民资之以生活，属井泉之水。主性情公道清正，利众而少私心，适合公共事务与服务性工作。喜金助生源、喜阴阳互见之火，忌源枯或污浊乱流。',
    classical: '井泉水者，寒泉清冽，取養不窮，八家鑿之以同飲，萬民資之以生活。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L393-395（raw 原名「井泉水」）',
    isClassical: true,
    auditStatus: 'verified',
    element: '水',
  },
  大海水: {
    short: '海纳百川，包罗万象',
    long: '总纳百川、汪洋无际，包括乾坤之大，升沉日月之光，属江海之水。主性情宽厚包容、格局深远，能容事容人。壬戌偏浊、癸亥偏清；喜金生源、喜路旁大驿厚土以定其界，忌冲动无节。',
    classical: '大海水者，總納百川，汪洋無際，包括乾坤之大，升沉日月之光。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L397-399',
    isClassical: true,
    auditStatus: 'verified',
    element: '水',
  },

  // ——— 土类 6 条 ———
  路旁土: {
    short: '沃野千里，养育万物',
    long: '大地连途、平田万顷，禾稼赖以资生、草木由之畅茂，属田野之土。主性情厚重包容、利于稳定耕耘之业。需火暖土温、水来灌溉以见其生意；忌长流、大海之水过猛，冲散其土脉根基。',
    classical: '路旁土者，大地連途，平田萬頃，禾稼賴以資生，草木由之暢茂。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L365-367',
    isClassical: true,
    auditStatus: 'verified',
    element: '土',
  },
  城头土: {
    short: '城关固守，气势威严',
    long: '天京玉垒、帝里金城，龙盘千里之形、虎踞四维之势，属都城防御之土。主性情稳重有威、适合担当守护与管理之任。须资桑柘、杨柳之木以固垣墙；忌霹雳震动、大海冲决，损其坚城之功。',
    classical: '城頭土者，天京玉壘，帝裡金城，龍盤千里之形，虎踞四維之勢。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L357-359',
    isClassical: true,
    auditStatus: 'verified',
    element: '土',
  },
  屋上土: {
    short: '瓦舍安居，稳重庇身',
    long: '埏埴为林、水火既济，盖蔽雪霜之积、震凌风雨之功，属屋顶瓦片之土。主性情重家守业、以稳为本，利于经营与庇护他人。以平地、大林之木为梁架最佳；忌烈火焚烧或塌陷无木，失其庇身之用。',
    classical: '屋上土者，埏埴為林，水火既濟，蓋蔽雪霜之積，震凌風雨之功。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L373-375',
    isClassical: true,
    auditStatus: 'verified',
    element: '土',
  },
  壁上土: {
    short: '壁立有依，御寒藏器',
    long: '恃栋依梁、兴门立户，却暑御寒之德，遮霜护雪之功，属墙壁之土。主善于依托他人或组织而发展，稳健但需有所凭。喜路旁土、屋上土相助成墙；忌无依孤立或水泡崩塌，失其御寒之效。',
    classical: '壁上土者，恃棟依梁，興門立戶，卻暑禦寒之德，遮霜護雪之功。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L353-355',
    isClassical: true,
    auditStatus: 'verified',
    element: '土',
  },
  大驿土: {
    short: '大道坦途，通达八方',
    long: '堂堂大道、坦坦平途，九州无所不通、万国无所不至，属官道驿路之土。主性情通达开阔、利于商贸、物流、交际之业。宜以木为基安定路面，喜井泉、涧下之水滋润；忌大海对冲，崩坏其路。',
    classical: '大驛土者，堂堂大道，坦坦平途，九州無所不通，萬國無所不至。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L369-371',
    isClassical: true,
    auditStatus: 'verified',
    element: '土',
  },
  沙中土: {
    short: '潮汐所聚，变迁有时',
    long: '浪回所积、波渚而成，龙蛇盘隐之宫、陵谷变迁之地，属河沙淤积之土。主命局多变迁与流动，适合顺势调整、借势而行。喜清金（钗砂剑箔）涵养其质；忌路旁、大驿之土相扰，使其反成泥泞。',
    classical: '砂中土者，浪回所積，波渚而成，龍蛇盤隱之宮，陵谷變遷之地。',
    source: '《三命通会》· 卷一 · 论纳音取象 · L361-363（raw 原名「砂中土」）',
    isClassical: true,
    auditStatus: 'verified',
    element: '土',
  },
}

/**
 * 查询纳音释义。
 *
 * @param nayin tyme4ts `cycle.getSound().getName()` 返回值，或同义字符串
 * @returns 命中返回 NayinMeaning（含 classical / source）；未命中返回 null
 *
 * 使用示例：
 *   const m = getNayinMeaning(pillar.nayin)
 *   if (m) {
 *     showTooltip(m.short, m.long)
 *     // 如需展示出处：`${m.classical}\n—— ${m.source}`
 *   }
 */
export function getNayinMeaning(nayin: string | null | undefined): NayinMeaning | null {
  if (!nayin)
    return null
  return NAYIN_MEANING[nayin] ?? null
}
