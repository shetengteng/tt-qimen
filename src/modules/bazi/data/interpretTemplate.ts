/**
 * 命盘简析模板（B 类公版文献整理）
 *
 * ⚠ 溯源状态：
 *   - `PARAGRAPH_1_BY_DAYMASTER`（50 段：10 干 × 5 旺衰）→ **非古籍 · 已抽检 P-6 合规**
 *     （2026-04-22 T-2.2-D 完成：50 段以"五行意象 + 旺衰象意"为主体，
 *      通篇古法术语（甲木/灯烛/江河/甘霖 / 根深/失令/刚极易折 …），
 *      **无过窄现代词**；按 P-6 原则保持现状不做古法化改写；
 *      待 T-2.2-A 新建 extracted/07-daymaster-strength.md 后，
 *      可进一步由"意象描述"回填至"raw 锚点对照"。）
 *   - `PATTERN_HINT`（11 段）→ **schema 已升级为 PatternHintEntry · 本身非古籍**
 *     （2026-04-22 T-2.2-C 完成：isClassical: false + classicalRef/sourceRef 镜像 patternLongInterpret；
 *      文案本身保留现代化简析定位 · 按 P-6 原则不做古法术语化改写 · 文案 P-6 审查走 T-2.2-D）
 *   - `ELEMENT_TIPS.industry` → **非古籍 · 五行象意现代推衍**
 *     （古籍无"五行 → 现代行业"直接映射表，见 TODO T-2.2-B）
 *
 * 改造计划：见 `design/bazi/2026-04-22-03-八字文案溯源改造方案TODO.md` § 2.2
 *
 * 用于：BaziPage / InterpretBlock 拼装命盘简析（约 150 字 + 4 个 chip）。
 *
 * 设计：
 *   - 段落 1：日主（五行 + 阴阳） · 月令旺衰 · 用神方向
 *   - 段落 2：格局简评 · 财官印关系 · 喜用神调候
 *
 * 当前现状：
 *   - 基础模板：`PARAGRAPH_1_TEMPLATE` / `PARAGRAPH_2_TEMPLATE`（占位符填充）
 *   - 差异化模板：`PARAGRAPH_1_BY_DAYMASTER`（50 段，已实现，非 MVP）
 *   - 格局提示：`PATTERN_HINT`（11 段 · PatternHintEntry schema · 附 classicalRef/sourceRef）
 *   - 五行 → 现代行业：`ELEMENT_TIPS`（5 段，其中 industry 为产品推衍）
 *
 * 后续如按"日主 × 旺衰 × 月令"继续细化（30~120 段），需先完成 extracted 溯源。
 */

/**
 * 文件级溯源状态标记。
 * - PARAGRAPH_1_BY_DAYMASTER / PATTERN_HINT / ELEMENT_TIPS.industry 均为非古籍
 * - UI 层可在相关提示上加"产品模板 · 非古籍"标识
 */
export const INTERPRET_TEMPLATE_IS_CLASSICAL = false

/**
 * PARAGRAPH_1_BY_DAYMASTER 抽检状态（T-2.2-D 产出 · 2026-04-22）。
 *
 * - 'pending':                抽检未执行
 * - 'non-classical-verified': 已抽检 · 非古籍但 P-6 合规（无过窄现代词）
 * - 'non-classical-dirty':    已抽检 · 发现过窄现代词需改写
 * - 'verified':               已挂 raw 锚点（需先完成 T-2.2-A 新建 extracted/07）
 *
 * 当前为 'non-classical-verified'：50 段通篇古法术语（甲木 / 灯烛 / 江河 /
 * 根深 / 失令 / 刚极易折 …），无自媒体 / 投资 / 合伙 / IT 等过窄现代词。
 */
export const PARAGRAPH_1_BY_DAYMASTER_AUDIT_STATUS:
  | 'pending'
  | 'non-classical-verified'
  | 'non-classical-dirty'
  | 'verified' = 'non-classical-verified'

import type { ElementName, StrengthLevel, PatternName } from '../types'

/**
 * 第一段模板（约 70 字）
 * 占位符：{dayMaster}, {dayMasterYinYang}, {strength}, {monthZhi}, {favorable}
 */
export const PARAGRAPH_1_TEMPLATE
  = '日主{dayMaster}（{dayMasterYinYang}{element}），生于{monthZhi}月，月令{strengthDesc}。综合四柱五行权重，日主{strength}，喜用以{favorable}为主，宜借此调候、平衡命局。'

/**
 * 第二段模板（约 80 字）
 * 占位符：{strength}, {favorable}, {unfavorable}, {pattern}
 */
export const PARAGRAPH_2_TEMPLATE
  = '命局格局以{pattern}为主，财官印之间有{relation}。喜用神为{favorable}，忌神为{unfavorable}。日常宜亲近{favorable}属性的人事物（如颜色、方位、行业），避免{unfavorable}属性过盛带来的失衡。'

/** 旺衰 → 描述短语 */
export const STRENGTH_DESC: Record<StrengthLevel, string> = {
  极旺: '令神当令、得地有助',
  偏旺: '得令有气',
  中和: '不旺不弱',
  偏弱: '失令乏助',
  极弱: '失令、根浅气衰',
}

/**
 * 五行 → 颜色/方位/行业（用于"喜用提示"chip 提示语）
 *
 * 字段溯源：
 *   - color / dir：沿用古籍"五色配五行""五方配五行"标准映射，来源可考（ST1·L43-51）
 *   - industry：**非古籍 · 五行象意现代推衍**
 *     古籍无"五行 → 现代行业"直接映射表；本字段依"五行象意 + 现代产业分类"二次推衍
 *     （木 → 生长/文教；火 → 热能/光明；土 → 承载/经营；金 → 锐利/律法；水 → 流动/智慧）
 *     P1 审查时可决定：保留现状并在 UI 标注，或改写为更古法的表述
 */
export const ELEMENT_TIPS: Record<ElementName, { color: string; dir: string; industry: string }> = {
  木: { color: '青/绿', dir: '东方', industry: '教育、出版、林业、纺织' },
  火: { color: '红/紫', dir: '南方', industry: '能源、餐饮、传媒、广告' },
  土: { color: '黄/棕', dir: '中央', industry: '房产、农业、陶瓷、咨询' },
  金: { color: '白/金', dir: '西方', industry: '金融、机械、五金、法律' },
  水: { color: '黑/蓝', dir: '北方', industry: '贸易、物流、水产、IT' },
}

/**
 * 简单的格局识别（MVP 版）
 *  - 只输出"财官相济 / 印星护身 / 食神制杀 / 比劫帮身 / 普通格局" 之一
 *  - 后续可扩展为 8 大正格 + 7 种特殊格
 */
export interface PatternHint {
  pattern: string
  relation: string
}

export const PATTERN_DEFAULT: PatternHint = {
  pattern: '常规',
  relation: '相对均衡',
}

// ---------------------------------------------------------------------------
// 第一段差异化模板（10 干 × 5 旺衰 = 50 段）
// ---------------------------------------------------------------------------
//
// key = `${dayMaster}-${strength}`，例如 "甲-极旺" / "丙-中和"。
// 每段约 60-80 字，已经把"日主气质 + 旺衰意象 + 喜用方向（描述性）"
// 写入；core 端在调用时仍会 append "喜用以X为主"，避免重复用神可去掉。

type DayMasterStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸'

const PARAGRAPH_1_BY_DAYMASTER: Record<DayMasterStem, Record<StrengthLevel, string>> = {
  甲: {
    极旺: '甲木巍然，根深盖世，生于得令之月，独木成林之象。气势刚强，宜以金削成器，以火舒英；最忌再行水木助旺，否则刚极易折。',
    偏旺: '甲木挺秀，根气有余，月令相生而枝叶繁茂。性情刚直、心怀大志，宜以官杀修剪，财以滋养，方能由秀而成材。',
    中和: '甲木中正，得令而不亢，失令而不衰，五行流通顺畅。为人正直坦荡，行事有定见，宜守本心、循序渐进。',
    偏弱: '甲木根浅气虚，月令乏助，性情虽直而易受外伤。宜得水之润、印之生扶，避免金克过重，损其元气。',
    极弱: '甲木根气全无，孤木无援，月令克泄交加。气衰而易折，须急用印水生身、比劫扶助，方可保元气于不堕。',
  },
  乙: {
    极旺: '乙木藤蔓萦绕，得令丛生，柔中带韧，缠攀而上。气盛宜疏，须以金削、以火耀，再借财以舒展；忌再增水木，反成繁累。',
    偏旺: '乙木花草盛开，得月令生扶，柔顺而含秀气。宜借辛金修整、丙火吐华，方显花艳叶茂之美。',
    中和: '乙木婉转随和，根气得宜，五行各安其位。性情温柔体贴、善与人合，宜借自身柔韧之性周旋于天地之间。',
    偏弱: '乙木柔弱乏力，月令不助，易随风而摇。宜得水之滋、印之护、比劫之援，避免金克重重，伤其根荄。',
    极弱: '乙木孤花无依，月令克泄齐至，几近凋零。须急以水印润之、以同类相扶，方可使柔木续命于寒霜。',
  },
  丙: {
    极旺: '丙火太阳当空，得令而焰势冲霄。气性刚烈炽热，宜以水济、以土泄、以金敛，方不至焚林涸海；最忌木火再来，反成燎原。',
    偏旺: '丙火光华夺目，月令得气，性情豪爽开朗。宜以壬水调候，以财土疏泄，方能光被四方而不灼己。',
    中和: '丙火光明磊落，旺衰得宜，照而不耀、暖而不灼。为人热情而有分寸，宜以光辉感人、以诚意待物。',
    偏弱: '丙火失令气虚，光辉黯淡，性情虽热而力不足。宜得木印生扶、比劫聚气，避免水克过重，掩其光华。',
    极弱: '丙火日没西山，月令克泄交战，光焰几灭。须急以木火相扶、以印生身，方可使日重升于寒夜。',
  },
  丁: {
    极旺: '丁火灯烛炽盛，月令助焰，光芒外显。气势虽烈而易耗，宜以壬水润泽，以金生水，方使灯火长明；忌木助焰起，反致燎心。',
    偏旺: '丁火心明眼亮，月令得气，文明含秀。宜借木以续焰、借金以生财，使灯影常照他人，自身亦得余光。',
    中和: '丁火文质彬彬，旺衰得宜，灯烛温润，不耀而明。性情含蓄聪慧，宜潜心文学、玄学、医卜之事。',
    偏弱: '丁火灯油不足，月令克之，光芒微弱。宜借木印添油、比劫续焰，避免水克过重，扑灭微光。',
    极弱: '丁火残烛风中，月令克泄齐发，光将熄矣。须急以木印生扶、同类相援，方可使一灯重燃于幽暗。',
  },
  戊: {
    极旺: '戊土厚重如山，得令而坚不可摧。气势凝重，宜以木疏、以水润，再借财以滋养；最忌火土再来，反成壅塞，万物难生。',
    偏旺: '戊土稳健安详，月令相扶，性情敦厚正直。宜借甲木疏壤、癸水润田，方使大地承万物而生机不息。',
    中和: '戊土中正笃实，旺衰得宜，承载有度。为人敦厚守信、宽容沉稳，宜守正而不偏，行事循序而有恒。',
    偏弱: '戊土松散乏力，月令不助，承载不固。宜借火印生扶、比劫培根，避免木克过重，崩塌堤岸。',
    极弱: '戊土崩散无依，月令克泄齐至，地基已损。须急以火印生身、同类填补，方可使大地重得生机。',
  },
  己: {
    极旺: '己土田园肥沃，得令而厚壤生苔。气盛宜疏，须以甲木松土、以水润田、以金泄秀；最忌火土再增，反成板结、稼穑不兴。',
    偏旺: '己土湿润肥泽，月令得气，性情温和包容。宜借甲木为友疏壤，丙火暖之而不焚，方使田中作物丰登。',
    中和: '己土温润仁厚，旺衰适中，蓄养万物。为人随和体贴、善解人意，宜以柔顺待人、以诚意待事。',
    偏弱: '己土瘠薄无气，月令克之，养分不足。宜借火印滋养、比劫培根，避免木克过重，致田园荒芜。',
    极弱: '己土干涸龟裂，月令克泄并至，万物难生。须急以火印温之、同类培土，方可使瘠土重沃。',
  },
  庚: {
    极旺: '庚金顽刚不化，得令而锋芒毕露。气势刚烈，宜以丁火炼之、以水泄秀，再借财以富身；最忌金土再来，反成顽石，难成大器。',
    偏旺: '庚金锋利刚劲，月令得气，性情果决义勇。宜借丁火锻打、壬水淬之，方成栋梁之器、可堪大用。',
    中和: '庚金刚柔得宜，旺衰适中，外刚内秀。为人正直果断、重义守诺，宜以决断行事、以信义立身。',
    偏弱: '庚金顽钝乏力，月令不助，锋芒不显。宜借土印生身、比劫帮扶，避免火克过重，伤其本质。',
    极弱: '庚金销熔无形，月令克泄交加，几成废铁。须急以土印生身、同类聚气，方可使顽铁重得锋芒。',
  },
  辛: {
    极旺: '辛金珠玉璀璨，得令而光华夺目。气性清贵，宜以壬水洗涤而显其辉，以财养之；最忌火炼太过、土埋过深，反掩其光。',
    偏旺: '辛金清秀精致，月令得气，性情敏感细腻。宜借壬水淘洗、甲木为财，方使珠玉之质得以彰显。',
    中和: '辛金圆润含光，旺衰得宜，含蓄而不张扬。为人精明敏锐、品味高雅，宜以才华动人、以雅致立世。',
    偏弱: '辛金光泽暗淡，月令克之，气韵不足。宜借土印生扶、比劫相援，避免火克过重，灼伤珠玉之质。',
    极弱: '辛金蒙尘失色，月令克泄齐至，光华尽失。须急以土印生身、同类相聚，方可使明珠重见光辉。',
  },
  壬: {
    极旺: '壬水汪洋恣肆，得令而江河泛滥。气势浩大，宜以戊土筑堤、以木泄秀，再借财以稳之；最忌金水再增，反成洪流泛滥，损物伤人。',
    偏旺: '壬水奔腾向前，月令得气，性情豪迈机敏。宜借戊土制之、甲木顺流，方使水势归江而灌溉万物。',
    中和: '壬水滔滔有度，旺衰适中，势顺而不溢。为人聪明机敏、有韬略远见，宜以智谋立身、以胸襟纳物。',
    偏弱: '壬水气衰干涸，月令克之，源流不畅。宜借金印生身、比劫聚气，避免土克过重，断其源头。',
    极弱: '壬水涓滴几断，月令克泄并至，水脉将枯。须急以金印生身、同类相会，方可使江河重启奔流。',
  },
  癸: {
    极旺: '癸水甘霖时雨，得令而细润绵绵。气性虽柔却势盛，宜以戊土制、以木泄秀；最忌再行金水，反成阴霾遮日，万物难荣。',
    偏旺: '癸水滋润万物，月令得气，性情聪明柔顺。宜借戊土收之、甲木顺流，方使雨露及时而万物生长。',
    中和: '癸水甘冽清凉，旺衰得宜，润而不滥。为人聪慧温雅、识大体懂分寸，宜以智慧济人、以柔顺立世。',
    偏弱: '癸水稀薄气虚，月令克之，润泽不足。宜借金印生扶、比劫聚气，避免土克过重，断其源流。',
    极弱: '癸水点滴将干，月令克泄齐至，甘霖断绝。须急以金印生身、同类相聚，方可使细雨复滋润万物。',
  },
}

/** 取指定日主 + 旺衰的第一段；不命中时退回通用模板 */
export function getParagraph1ByDayMaster(dayMaster: string, strength: StrengthLevel): string | null {
  const ds = dayMaster as DayMasterStem
  const map = PARAGRAPH_1_BY_DAYMASTER[ds]
  if (!map) return null
  return map[strength] ?? null
}

// ---------------------------------------------------------------------------
// 第二段格局对应的 hint（11 段，按 PatternName）
// ---------------------------------------------------------------------------
//
// 段长约 70-90 字，已经把"格局意象 + 喜忌方向 + 行运提示"写入；
// 调用方仍会在最后追加 "喜用属性参考：颜色/方位/行业"。
//
// 2026-04-22 T-2.2-C schema 升级：
//   - 类型从 `Record<PatternName, string>` 升级为 `Record<PatternName, PatternHintEntry>`
//   - 每条 hint 附 classicalRef / sourceRef，镜像自 patternLongInterpret 对应条目
//   - `isClassical: false` + `auditStatus: 'non-classical'`：本条 hint 作为"现代化简析"不计入古籍
//   - 原句文案本轮**保留现状**（按 P-6 原则禁止古代词替代 · 过窄现代词审查走 T-2.2-D）
//   - `getPatternHint(pattern): string` 签名不变（内部改为 .hint 取值），调用点 0 改动
//   - 新增 `getPatternHintEntry(pattern): PatternHintEntry | null` 供 UI 显示"深入阅读"链接

/**
 * 单条格局短提示结构。
 *
 * 定位：命盘简析第二段的中段文本，面向"产品入门用户"的现代化简述。
 * 与已 verified 的 `patternLongInterpret`（180-220 字古法长解读）分层：
 *   - 本条（70-90 字）= 现代化简析 · `isClassical: false`
 *   - patternLong（180-220 字）= 古法详注 · `isClassical: true`
 *
 * classicalRef / sourceRef 镜像自 patternLongInterpret 对应条目，便于：
 *   - UI 在简析下方渲染"深入阅读：《子平真诠》· XX"小字链接
 *   - CI / 审计机器化校验：产品层简析始终指向古籍原文锚点
 */
export interface PatternHintEntry {
  /** 现代化简析文本（70-90 字，产品层） */
  hint: string
  /** 关联的古籍原文关键句（镜像 patternLongInterpret[key].classical · 繁体忠于 raw） */
  classicalRef: string
  /** 关联的原文锚点（镜像 patternLongInterpret[key].source） */
  sourceRef: string
  /** 本条 hint 本身是否古籍可溯源（固定 false：现代化简析） */
  isClassical: false
  /** 审校状态（固定 'non-classical'：现代化产品模板） */
  auditStatus: 'non-classical'
}

export const PATTERN_HINT: Record<PatternName, PatternHintEntry> = {
  正官格: {
    hint: '正官秉持纪律，宜得财生官、印护官，最忌伤官见官、七杀混杂。命主端方守正，行运逢印官财之地，名位与权衡可成；逢伤官、比劫之运，则需慎防口舌与官非。',
    classicalRef: '正官者分所當尊，如在國有君，在家有親，刑衝破害，以下犯上，烏乎可乎？',
    sourceRef: '《子平真诠评注》· 三十一·论正官 / 三十二·论正官取运 · L219-230',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  七杀格: {
    hint: '七杀威权刚烈，需食神或印星制化，方能由凶转吉。命主魄力强、敢任事；行运逢印化、食制之乡可立威权，逢杀重财生之运则风险骤增，宜避边缘险地。',
    classicalRef: '煞以攻身，似非美物，而大貴之格，多存七煞。蓋控制得宜，煞為我用。',
    sourceRef: '《子平真诠评注》· 三十九·论偏官 / 四十·论偏官取运 · L282-298',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  正财格: {
    hint: '正财勤俭安稳，宜身强能任，最喜见食神生财、官星护财。命主务实有度、聚财有方；行运逢比劫之乡需防破耗，逢财官印俱全之运可安享中富之福。',
    classicalRef: '財為我克，使用之物也，以能生官，所以為美；財喜根深，不宜太露。',
    sourceRef: '《子平真诠评注》· 三十三·论财 / 三十四·论财取运 · L231-249',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  偏财格: {
    hint: '偏财善财横财兼收，宜身强、忌比劫劫夺。命主慷慨豪爽、人缘极佳；行运逢财官之乡可一鸣惊人，逢比劫之运则需控制风险投资、慎防合伙纠纷。',
    classicalRef: '財與印不分偏正，同為一格而論之；財旺生官，露亦不忌。',
    sourceRef: '《子平真诠评注》· 三十三·论财 · L232（財旺生官露亦不忌）/ 三十五·论印绶 · L250（财不分偏正语出此处）',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  正印格: {
    hint: '正印学识深厚，宜官星生印，最忌财坏印。命主重学问、得长辈缘；行运逢官印相生可获文凭、晋升之喜，逢财旺破印之运则学业事业易现波折。',
    classicalRef: '印綬喜其生身，正偏同為美格，故財與印不分偏正，同為一格而論之。',
    sourceRef: '《子平真诠评注》· 三十五·论印绶 / 三十六·论印绶取运 · L250-267',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  偏印格: {
    hint: '偏印心思缜密，性情独立而带几分孤高。宜走技术、玄学、宗教、研究之路；行运逢七杀化印可得贵人，逢食神被夺（枭神夺食）则需防偏激与孤独。',
    classicalRef: '偏官本非美物，藉其生印，不得已而用之；身印並重而用七煞，非孤則貧矣。',
    sourceRef: '《子平真诠评注》· 三十五·论印绶 / 三十六·论印绶取运 · L253-264',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  食神格: {
    hint: '食神温润有福，主生活安逸、食禄丰盈。宜身强而食神有气，最忌偏印夺食。行运逢食生财之乡可得艺名与口碑，逢七杀冲克之运则需养身安神、勿过劳。',
    classicalRef: '食神本屬洩氣，以其能生正財，所以喜之。故食神生財，美格也。',
    sourceRef: '《子平真诠评注》· 三十七·论食神 / 三十八·论食神取运 · L268-281',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  伤官格: {
    hint: '伤官才华横溢，性情率真。须配印或配财方为大用——伤官配印贵显，伤官生财富贵。行运逢印或财之地最佳，逢正官之乡则易招口舌与是非，慎言慎行。',
    classicalRef: '傷官雖非吉神，實為秀氣，故文人學士，多於傷官格內得之。',
    sourceRef: '《子平真诠评注》· 四十一·论伤官 / 四十二·论伤官取运 · L299-315',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  建禄格: {
    hint: '建禄自坐根气，性格独立自强、白手起家。宜行财官之运得用，最忌再逢比劫帮身、群比争财。命主中年后多有自创基业之象。',
    classicalRef: '建祿者，月建逢祿堂也，祿即是劫；皆以透干支，別取財官煞食為用。',
    sourceRef: '《子平真诠评注》· 四十五·论建禄月劫 / 四十六·论建禄月劫取运 · L325-344',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  月刃格: {
    hint: '月刃刚强果断，宜动不宜静。须有官杀制化方为大用，否则易冲撞惹祸。行运逢七杀官星之乡可立威立功，逢比劫又起之运则需谨防意外与争端。',
    classicalRef: '陽刃者，劫我正財之神，乃正財之七煞也；不曰劫而曰刃，劫之甚也。',
    sourceRef: '《子平真诠评注》· 四十三·论阳刃 / 四十四·论阳刃取运 · L316-324',
    isClassical: false,
    auditStatus: 'non-classical',
  },
  杂气格: {
    hint: '杂气格藏财官印于库中，需岁运冲开方显其用。命主早年多有不显之象，中年后渐露锋芒；逢冲库之年（辰戌冲、丑未冲）往往有重大转机。',
    classicalRef: '雜氣正官，透幹會支，最為貴格；用神已破，棄之以就外格，則謬之又謬矣。',
    sourceRef: '《子平真诠评注》· L220（雜氣正官例）/ L172（棄用神就外格之謬）',
    isClassical: false,
    auditStatus: 'non-classical',
  },
}

/**
 * 取指定格局的 hint 文本（兼容签名 · 调用点 0 改动）。
 *
 * @param pattern 识别出的格局名
 * @returns 70-90 字现代化简析文本；未命中时返回通用兜底
 */
export function getPatternHint(pattern: PatternName): string {
  return (
    PATTERN_HINT[pattern]?.hint
    ?? '命局格局以常规为主，财官印之间相对均衡，宜以稳健务实为原则。'
  )
}

/**
 * 取指定格局的完整 hint 条目（含 classicalRef / sourceRef）。
 *
 * @param pattern 识别出的格局名
 * @returns PatternHintEntry 结构；未命中时返回 null
 *
 * 使用示例（UI "深入阅读"链接）：
 *   const entry = getPatternHintEntry(chart.pattern.name)
 *   if (entry) {
 *     showSimpleHint(entry.hint)
 *     showInlineLink(`深入阅读：${entry.sourceRef}`)
 *   }
 */
export function getPatternHintEntry(pattern: PatternName): PatternHintEntry | null {
  return PATTERN_HINT[pattern] ?? null
}
