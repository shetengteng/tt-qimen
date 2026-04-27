/**
 * 紫微斗数模块类型定义
 *
 * 对齐设计文档 design/modules/17-紫微斗数模块.md §3.1。
 *
 * 关键约定：
 *  - PalaceKey 是项目内的稳定 key（与 i18n / SVG 选择器对齐），与 iztro 的中文宫名一一映射
 *  - slot 是 4×4 网格中的位置（1..16，行优先），由 EarthlyBranch 派生
 */

import type {
  EarthlyBranchName,
  HeavenlyStemName,
  PalaceName as IztroPalaceName,
} from 'iztro/lib/i18n'

/** 四化（中文 short：禄/权/科/忌 → 英文 key） */
export type SihuaKey = 'lu' | 'quan' | 'ke' | 'ji'

/** 星耀视觉分类（mock 与 UI 共享） */
export type StarKind = 'main' | 'aux' | 'malefic'

/** 12 宫稳定 key（与 i18n / SVG 选择器一致） */
export type PalaceKey =
  | 'fumu'
  | 'fude'
  | 'tianzhai'
  | 'guanlu'
  | 'ming'
  | 'jiaoyou'
  | 'xiongdi'
  | 'qianyi'
  | 'fuqi'
  | 'zinv'
  | 'caibo'
  | 'jie'

/** 庙旺得利平不陷 7 档 */
export type Brightness = '庙' | '旺' | '得' | '利' | '平' | '不' | '陷'

/** 单颗星（mock 与真实数据共用） */
export interface Star {
  /** 中文星名（与 i18n / iztro 中文输出一致） */
  name: string
  /** 视觉分类 */
  kind: StarKind
  /** 主星亮度 */
  brightness?: Brightness
  /** 本命四化 */
  sihua?: SihuaKey
}

/** 单宫 */
export interface Palace {
  /** 稳定 key */
  key: PalaceKey
  /** 是否命宫 */
  isMing?: boolean
  /** 是否身宫 */
  isShen?: boolean
  /** 4×4 slot（1..16） */
  slot: number
  /** 干支组合（如 "庚辰"） */
  ganzhi: string
  /** 长生 12 神 / 博士 12 神中其一（按设计文档 MVP 取一个用于 UI） */
  changsheng12: string
  /** 大限区间显示文案（"36-45"），无大限显示 "—" */
  daxianRange: string
  /** 主星 + 副星 + 煞星 */
  stars: Star[]
}

/** 大限单元 */
export interface DaxianCell {
  /** 显示文案 "6-15" */
  age: string
  /** 落宫 */
  palaceKey: PalaceKey
  /** 干支 */
  ganzhi: string
  /** 是否当前所处 */
  current?: boolean
}

/** 小限单元 */
export interface XiaoxianCell {
  /** 公历年 */
  year: number
  /** 落宫 */
  palaceKey: PalaceKey
  /** 干支 */
  ganzhi: string
  /** 是否当年 */
  current?: boolean
}

/** 大限四化飞星：基于大限天干起 */
export interface DaxianMutagenStar {
  /** 中文星名 */
  name: string
  /** 化哪一种 */
  sihua: SihuaKey
  /** 落入哪个宫（按本命宫位） */
  palaceKey?: PalaceKey
}

/**
 * 当前大限详情（M2 第一发布 §10）
 *
 * 描述：当前大限段的主星配合 + 大限四化共振
 */
export interface DecadalDetail {
  /** "36-45" 形态 */
  age: string
  /** 干支（如「庚辰」） */
  ganzhi: string
  /** 落入哪个宫（本命宫位 key） */
  palaceKey: PalaceKey
  /** 该宫主星 */
  mainStars: { name: string; brightness?: Brightness }[]
  /** 大限四化（按大限天干起） */
  mutagens: DaxianMutagenStar[]
}

/** 流年卡单元（M2 第一发布 §11） */
export interface FlowYearCell {
  /** 公历年 */
  year: number
  /** 干支（如「甲辰」） */
  ganzhi: string
  /** 流年命宫（落本命哪个宫） */
  palaceKey: PalaceKey
  /** 流年四化（按流年天干起） */
  mutagens: DaxianMutagenStar[]
  /** 是否当年 */
  current?: boolean
}

/** 四化落宫表（本命四化） */
export type SihuaPalaceMap = Record<SihuaKey, { star: string; palaceKey: PalaceKey }>

/** 解读卡 tag 配色 */
export type TagTone = 'accent' | 'success' | 'danger' | 'gold' | 'jade' | 'plain'

/** 解读卡 */
export interface InterpretCard {
  /** i18n key（在 ziwei.interpret.cards.<key>.title） */
  key: 'mingPalace' | 'sihua' | 'minorStars' | 'shenZhu'
  /** 标签列表 */
  tags: { label: string; tone?: TagTone }[]
}

/** 三方四正定义（驱动 SVG 绘制） */
export interface SanfangSiZheng {
  benming: PalaceKey
  triad: PalaceKey[]
  duigong: PalaceKey
}

/** 元信息 */
export interface ZiweiMetaInfo {
  /** 阳历日期 + 时辰文案 ("1990-05-20 午时") */
  solar: string
  /** 农历 ("庚午年 四月廿七") */
  lunar: string
  /** 五行局 ("木三局") */
  fiveElementsClass: string
  /** 起运岁数（仅展示，无算法依赖） */
  qiyunAge: number
  /** 命主 */
  mingZhu: string
  /** 身主 */
  shenZhu: string
  /** 斗君（暂展示） */
  doujun: string
  /** 命主姓名（占位） */
  ownerName: string
  /** 性别中文（"男" / "女"） */
  gender: '男' | '女'
  /** 当前年龄（虚岁，与小限对齐） */
  currentAge: number
  /** 当前公历年 */
  currentYear: number
  /** 当前流年干支 */
  currentYearGz: string
}

/**
 * 命宫主星论命卡片（设计文档 §3.3 第一行 / §5 步骤 4）
 *
 * 数据来源：`src/modules/ziwei/data/soulPalace.ts` × 三语
 * 派生策略（buildSoulPalaceCard）：
 *   1. 命宫主星 → 直接命中 14 主星论命
 *   2. 命宫无主星 → 借迁移宫主星，UI 标记"借宫"
 *   3. 借宫亦无主星 → 返回 null（极小概率，UI 隐藏整段）
 *
 * 注意：本卡片是文本资产+keywords 集合，并非 InterpretCard（后者为通用 tag 卡）。
 * 之所以独立成型，是因 SoulPalace 是紫微"命理引擎首屏"的语义中心，
 * 后续会引入"性别 / 大限主星 / 流年主星"等多维派生，与 InterpretCard 的轻量 tag 模型不同。
 */
export interface SoulPalaceCard {
  /** 主星稳定 key（与 data/soulPalace.ts 对齐） */
  starKey:
    | 'ziwei'
    | 'tianji'
    | 'taiyang'
    | 'wuqu'
    | 'tiantong'
    | 'lianzhen'
    | 'tianfu'
    | 'taiyin'
    | 'tanlang'
    | 'jumen'
    | 'tianxiang'
    | 'tianliang'
    | 'qisha'
    | 'pojun'
  /** 主星中文名（iztro 输出，UI 副标题用） */
  starName: string
  /** 是否借宫（命宫无主星，从迁移宫借用） */
  borrowed: boolean
  /** 主星亮度（庙旺利平閒陷不得地） */
  brightness?: string
  /** 主星本命四化（如果有） */
  sihua?: 'lu' | 'quan' | 'ke' | 'ji'
}

/**
 * 单宫主星简析项（设计文档 §3.3 第二行 / §5 步骤 4）
 *
 * 派生策略（buildPalaceMajorReadings）：
 *   1. 该宫主星 → 取该主星 × 该宫位的 PalaceMajor 文案
 *   2. 该宫无主星 → borrowed=true，借对宫主星
 *   3. 借宫亦无主星 → 不进入数组（UI 不渲染）
 *
 * 注意：每段是「单一主星 × 宫位」组合；如果该宫有 2 颗主星（如紫微+破军），
 * 则会在数组中产生 2 个 reading（同 palaceKey、不同 starKey）。
 */
export interface PalaceMajorReading {
  /** 12 宫稳定 key */
  palaceKey: PalaceKey
  /** 主星稳定 key（与 SoulPalaceCard.starKey 同集合） */
  starKey: SoulPalaceCard['starKey']
  /** 主星中文名（iztro 输出） */
  starName: string
  /** 是否借宫（该宫无主星，从对宫借用） */
  borrowed: boolean
  /** 主星亮度（来自 Star.brightness） */
  brightness?: Brightness
  /** 主星本命四化（来自 Star.sihua） */
  sihua?: SihuaKey
}

/** 完整紫微命盘（领域对象，UI 直接消费） */
export interface ZiweiChart {
  meta: ZiweiMetaInfo
  /** 12 宫位（顺序与 mock 一致：先按 slot 升序排列） */
  palaces: Palace[]
  /** 本命四化落宫 */
  sihuaMap: SihuaPalaceMap
  /** 大限 12 段 */
  daxianCells: DaxianCell[]
  /** 小限 6 段（当前年向前 2 年、向后 3 年，含当前年） */
  xiaoxianCells: XiaoxianCell[]
  /** 解读卡（本轮为启发式派生，后续替换为模板 JSON） */
  interpretCards: InterpretCard[]
  /**
   * 命宫主星论命（M3 数据工程·首中能量）
   * - 来源：`buildSoulPalaceCard` + i18n 文本（runtime 取）
   * - 命宫与迁移宫均无主星 → null（UI 隐藏）
   */
  soulPalaceCard: SoulPalaceCard | null
  /**
   * 各宫主星简析数组（M3 数据工程·168 段）
   * - 来源：`buildPalaceMajorReadings` + i18n 文本（runtime 取）
   * - 顺序：按 palace.slot 升序，每宫内主星顺序保持 iztro 原序
   */
  palaceMajorReadings: PalaceMajorReading[]
  /** 三方四正（命宫驱动） */
  sanfangSiZheng: SanfangSiZheng
  /** 当前大限详情（无当前大限时为 null） */
  currentDecadal: DecadalDetail | null
  /** 流年卡：当前年 + 后续 9 年（共 10 段） */
  flowYears: FlowYearCell[]
}

/** ---------- 内部映射常量（被 core 与 UI 共享） ---------- */

/** iztro 中文宫名 → 项目 PalaceKey */
export const IZTRO_PALACE_TO_KEY: Record<IztroPalaceName, PalaceKey> = {
  命宫: 'ming',
  兄弟: 'xiongdi',
  夫妻: 'fuqi',
  子女: 'zinv',
  财帛: 'caibo',
  疾厄: 'jie',
  迁移: 'qianyi',
  仆役: 'jiaoyou',
  官禄: 'guanlu',
  田宅: 'tianzhai',
  福德: 'fude',
  父母: 'fumu',
} as Record<IztroPalaceName, PalaceKey>

/** 地支 → 4×4 slot（行优先 1..16） */
export const EARTHLY_BRANCH_TO_SLOT: Record<EarthlyBranchName, number> = {
  巳: 1, 午: 2, 未: 3, 申: 4,
  辰: 5, 酉: 8,
  卯: 9, 戌: 12,
  寅: 13, 丑: 14, 子: 15, 亥: 16,
} as Record<EarthlyBranchName, number>

/** 中文四化 → SihuaKey */
export const MUTAGEN_TO_SIHUA_KEY: Record<string, SihuaKey> = {
  禄: 'lu',
  权: 'quan',
  科: 'ke',
  忌: 'ji',
}

/** 月份天干 / 年干干支辅助：复用现有 ganzhi 字符串拼接 */
export function joinGanZhi(stem: HeavenlyStemName, branch: EarthlyBranchName): string {
  return `${stem}${branch}`
}
