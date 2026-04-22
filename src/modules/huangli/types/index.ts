/**
 * 黄历择日（Huangli）类型定义
 *
 * 数据来源：全部由 `tyme4ts` 计算，无额外请求。
 * 设计文档：design/modules/15-黄历择日模块.md
 * 原型参考：design/prototypes/{guofeng,minimal}/huangli.html
 */

/**
 * 9 类事由（设计文档 §1 关键词映射）
 *   - jisi      祭祀
 *   - qifu      祈福
 *   - jiaqu     嫁娶
 *   - chuxing   出行
 *   - qianyue   签约（立券）
 *   - kaishi    开市
 *   - dongtu    动土
 *   - ruzhai    入宅
 *   - potu      破土
 */
export type HuangliMatterKey =
  | 'jisi'
  | 'qifu'
  | 'jiaqu'
  | 'chuxing'
  | 'qianyue'
  | 'kaishi'
  | 'dongtu'
  | 'ruzhai'
  | 'potu'

/** 事由评判：宜 / 忌 / 平（既不宜也不忌） */
export type MatterVerdict = 'yi' | 'ji' | 'ping'

/** 12 建星：建除满平定执破危成收开闭 */
export type TwelveDuty =
  | '建' | '除' | '满' | '平' | '定' | '执'
  | '破' | '危' | '成' | '收' | '开' | '闭'

/** 黄 / 黑道（12 神 → ecliptic） */
export type Ecliptic = '黄道' | '黑道'

/** 单个时辰（12 时辰）+ 黄/黑道 */
export interface HourStar {
  /** 时辰名，如 "子时" */
  name: string
  /** 干支，如 "戊子" */
  ganzhi: string
  /** 12 神，如 "青龙" */
  star: string
  /** 黄道 / 黑道 */
  ecliptic: Ecliptic
}

/** 日历格的轻量字段（月历用） */
export interface HuangliMonthDay {
  /** 公历日（1-31） */
  day: number
  /** 公历年月日（备份，便于点击后定位详情） */
  year: number
  month: number
  /** 农历日简称，如 "初六"、"清明" */
  lunarShort: string
  /** 是否今日 */
  isToday: boolean
  /** 是否属于本月（跨月格子用） */
  inMonth: boolean
  /** 黄/黑道 */
  ecliptic: Ecliptic
  /** 宜关键词集合（短版，用于事由筛选与悬浮） */
  recommends: readonly string[]
  /** 忌关键词集合（短版） */
  avoids: readonly string[]
}

/** 单日完整黄历数据（今日卡 / 详情卡用） */
export interface HuangliDay {
  /** 公历日期 */
  year: number
  month: number
  day: number
  /** ISO 日期字符串 yyyy-MM-dd */
  dateIso: string
  /** 星期（中文一/二/.../日） */
  weekday: string
  /** 星期序号 0(周日)-6(周六) */
  weekdayIndex: number
  /** 农历：丙午年 */
  lunarYearGanzhi: string
  /** 农历年生肖 */
  zodiac: string
  /** 农历月名 + 日名，如 "三月初六" */
  lunarMonthDay: string
  /** 年柱 / 月柱 / 日柱 */
  pillarYear: string
  pillarMonth: string
  pillarDay: string
  /** 12 建星 */
  duty: TwelveDuty
  /** 12 神（青龙/明堂/...） */
  twelveStar: string
  /** 黄/黑道 */
  ecliptic: Ecliptic
  /** 宜 */
  recommends: readonly string[]
  /** 忌 */
  avoids: readonly string[]
  /** 吉神 */
  gods: readonly string[]
  /** 凶神 */
  fiends: readonly string[]
  /** 冲：冲{生肖}({干支}) */
  chong: {
    zodiac: string
    ganzhi: string
  }
  /** 煞方 */
  shaDirection: string
  /** 胎神 */
  fetus: string
  /** 彭祖百忌 */
  pengzuGan: string
  pengzuZhi: string
  /** 喜神方位 */
  joyDirection: string
  /** 财神方位 */
  wealthDirection: string
  /** 福神（吉神 / Mascot） */
  fuDirection: string
  /** 阳贵人 / 阴贵人 */
  yangGuiDirection: string
  yinGuiDirection: string
  /** 当日所处节气 */
  term: string
  /** 公历节日（可能为空） */
  solarFestival: string | null
  /** 农历节日（可能为空） */
  lunarFestival: string | null
  /** 西方星座 */
  constellation: string
  /** 12 时辰 × 黄黑道 */
  hours: readonly HourStar[]
  /** 吉时（黄道时辰，按时辰顺序拼接） */
  luckyHours: readonly HourStar[]
}

/** 月历整月数据 */
export interface HuangliMonth {
  year: number
  month: number
  /** 42 格（6 行 × 7 列），含跨月补足 */
  days: readonly HuangliMonthDay[]
}

/** 9 事由评判 */
export interface MatterRow {
  key: HuangliMatterKey
  verdict: MatterVerdict
}
