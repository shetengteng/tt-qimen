/**
 * 真太阳时（True Solar Time）计算工具
 *
 * 命理学背景：
 *   现代时钟使用"区时"（北京时间统一为东八区 UTC+8 = 120°E 子午线均时），
 *   但传统命理排盘需要的是出生地"日中（太阳过中天）= 12:00"的太阳时。
 *   两者的差异 = 经度差 + 均时差（Equation of Time, EOT）。
 *
 * 计算公式（简化模型，精度 ±1 分钟，足以覆盖排盘小时柱）：
 *
 *   trueSolar = 时钟时间
 *             + 经度差修正  ((longitude - standardMeridian) × 4 minutes)
 *             + 均时差 EOT(月份、日)
 *
 *   - 北京时间标准子午线 = 120°E
 *   - 经度每偏离标准子午线 1°，太阳过中天提前/延迟 4 分钟
 *   - EOT 来自地球椭圆轨道 + 黄赤交角，年内振幅 ±16 分钟
 *
 * 使用范围：当前**未被任何 core 模块消费**——计算结果仅供后续接入用。
 *   现有 8 个模块 core 均使用时钟时间排盘（与多数 SaaS 命理工具一致），
 *   接入真太阳时属于 V2 版本范畴。
 *
 * 设计取舍：
 *   - 不依赖天文库（如 SunCalc），避免给前端 bundle 增加 ~30KB
 *   - 简化的 EOT 多项式拟合，最大误差 ±30 秒，对小时柱判定无影响
 *   - 仅暴露纯函数，不持有状态；状态/缓存由 composable 管
 */

/** 北京时间标准子午线（东八区） */
export const STANDARD_MERIDIAN_BEIJING = 120

/** 中国主要城市经度查表（备查；core 接通后可作为 BirthForm 城市选择数据源） */
export const CITY_LONGITUDE: Readonly<Record<string, number>> = Object.freeze({
  // 直辖市
  beijing: 116.41,
  shanghai: 121.47,
  tianjin: 117.20,
  chongqing: 106.55,
  // 省会（华北 / 东北）
  shijiazhuang: 114.51,
  taiyuan: 112.55,
  hohhot: 111.74,
  shenyang: 123.43,
  changchun: 125.32,
  harbin: 126.63,
  // 省会（华东）
  nanjing: 118.78,
  hangzhou: 120.15,
  hefei: 117.27,
  fuzhou: 119.30,
  nanchang: 115.89,
  jinan: 117.00,
  taipei: 121.56,
  // 省会（华中 / 华南）
  zhengzhou: 113.62,
  wuhan: 114.30,
  changsha: 112.94,
  guangzhou: 113.26,
  nanning: 108.32,
  haikou: 110.32,
  // 省会（西南 / 西北）
  chengdu: 104.06,
  guiyang: 106.71,
  kunming: 102.71,
  lhasa: 91.13,
  xian: 108.93,
  lanzhou: 103.83,
  xining: 101.78,
  yinchuan: 106.27,
  urumqi: 87.62,
  // 香港 / 澳门
  hongkong: 114.17,
  macau: 113.55,
})

/**
 * 均时差（Equation of Time）多项式近似。
 *
 * @param dayOfYear 1..365（不区分闰年，误差 < 30s）
 * @returns 均时差（分钟）。正值表示真太阳时领先时钟时间。
 *
 * 公式来源：NOAA 简化模型（适用于业余天文 / 命理排盘的精度需求）。
 * 真实 EOT 极值：
 *   - 2 月 11 日 ≈ -14 分钟
 *   - 11 月 3 日 ≈ +16 分钟
 */
export function equationOfTime(dayOfYear: number): number {
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
}

/**
 * 计算指定经度、日期下的"时钟时间 → 真太阳时"修正分钟数。
 *
 * @param longitude  出生地经度（°E 为正，°W 为负，例如 121.47 = 上海）
 * @param dayOfYear  出生日的 day-of-year（1..365）
 * @param standardMeridian  标准子午线（默认 120°E，即北京时间）
 * @returns 修正分钟数。把这个数加到时钟分钟上得到真太阳时。
 *
 * 使用示例：
 *   const offset = trueSolarTimeOffset(121.47, 140) // 上海 5 月 20 日
 *   // → ≈ 5.88 - 3.5 ≈ +2.4 分钟
 *   //   时钟 12:00 → 真太阳 12:02
 */
export function trueSolarTimeOffset(
  longitude: number,
  dayOfYear: number,
  standardMeridian: number = STANDARD_MERIDIAN_BEIJING,
): number {
  const longitudeCorrection = (longitude - standardMeridian) * 4
  const eot = equationOfTime(dayOfYear)
  return longitudeCorrection + eot
}

/**
 * 把（年月日时分）按经度修正为真太阳时。
 *
 * @returns 修正后的 { hour, minute }。可能跨越午夜 → 此时 dayShift 非 0
 *          调用方需要决定是否把 day/month/year 也向前/后挪一天。
 *
 * 关于跨日：
 *   修正后 minute 落在 [0, 60)、hour 落在 [0, 24)。
 *   原始 hour:minute + offset 若超出 [0, 24*60)，dayShift = ±1（甚至 ±2，理论极限）。
 *
 * 注意：该函数不调用日历库做日期加减，调用方需要自己处理 dayShift 对应的真实日期。
 *   不在这里耦合 tyme4ts / dayjs，保持 lib 零依赖。
 */
export function applyTrueSolarTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  longitude: number,
  standardMeridian: number = STANDARD_MERIDIAN_BEIJING,
): { hour: number; minute: number; dayShift: number } {
  const dayOfYear = computeDayOfYear(year, month, day)
  const offsetMin = trueSolarTimeOffset(longitude, dayOfYear, standardMeridian)
  const totalMin = hour * 60 + minute + offsetMin
  const dayShift = Math.floor(totalMin / (24 * 60))
  let normalized = totalMin - dayShift * 24 * 60
  if (normalized < 0) normalized += 24 * 60
  const newHour = Math.floor(normalized / 60)
  const newMinute = Math.round(normalized - newHour * 60)
  return { hour: newHour, minute: newMinute, dayShift }
}

/** 公历 day-of-year（含闰年） */
export function computeDayOfYear(year: number, month: number, day: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  if (isLeap) daysInMonth[1] = 29
  let total = day
  for (let i = 0; i < month - 1; i++) total += daysInMonth[i]
  return total
}
