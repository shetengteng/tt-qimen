#!/usr/bin/env node
/**
 * 紫微 boundary probe — 直接调 iztro 扫描极端输入下的崩溃 / 异常行为。
 *
 * 目的：
 *  1. 找出 buildZiweiChart 真实可能崩溃的输入区间（年份下限 / 上限 / 闰月 / 子时跨日）
 *  2. 区分"iztro 抛 Error"（应包成 FortuneError(invalid-input)）vs
 *     "iztro 静默给出错值"（需要在 buildZiweiChart 内增加前置校验）
 *  3. 输出表格让我们决定 BirthForm / FortuneError userMessage 的支持区间下限
 *
 * 用法：
 *  $ node scripts/ziwei/probe-boundaries.mjs
 */

import { astro } from 'iztro'

// 复刻 src/modules/ziwei/core/ziwei.ts::hourToTimeIndex
function hourToTimeIndex(hour) {
  if (hour === 23) return 12
  if (hour === 0) return 0
  return Math.floor((hour + 1) / 2)
}

function fmtDate(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function probe(label, dateStr, hour, gender = '男', calendar = 'solar', isLeap = false) {
  const timeIndex = hourToTimeIndex(hour)
  let result = { label, dateStr, hour, calendar, isLeap, ok: false, err: null, extra: null }
  try {
    const a = calendar === 'lunar'
      ? astro.byLunar(dateStr, timeIndex, gender, isLeap, true, 'zh-CN')
      : astro.bySolar(dateStr, timeIndex, gender, true, 'zh-CN')

    // 模仿 buildZiweiChart 后续访问的字段，看是否有"上面没崩，下面访问字段才炸"
    const palaceCount = a.palaces?.length ?? 0
    const fec = a.fiveElementsClass
    const soul = a.soul
    const body = a.body
    const lunar = a.lunarDate
    const solar = a.solarDate

    // horoscope(year-06-15) 探当前年（2026）
    let horoscopeOk = true
    let horoscopeErr = null
    try {
      a.horoscope('2026-06-15')
    } catch (he) {
      horoscopeOk = false
      horoscopeErr = he?.message ?? String(he)
    }

    result.ok = palaceCount === 12 && Boolean(fec) && Boolean(soul)
    result.extra = {
      palaceCount,
      fiveElementsClass: fec,
      soul,
      body,
      lunarDate: lunar,
      solarDate: solar,
      horoscopeOk,
      horoscopeErr,
    }
  } catch (e) {
    result.err = `${e?.name ?? 'Error'}: ${e?.message ?? String(e)}`
  }
  return result
}

const cases = []

// 1) 年份下限：1899 / 1900 / 1901
for (const y of [1799, 1800, 1899, 1900, 1901, 1912]) {
  cases.push(probe(`year=${y} solar`, fmtDate(y, 6, 15), 12))
  cases.push(probe(`year=${y} lunar`, fmtDate(y, 6, 15), 12, '男', 'lunar', false))
}

// 2) 年份上限
for (const y of [2099, 2100, 2150, 2200]) {
  cases.push(probe(`year=${y} solar`, fmtDate(y, 6, 15), 12))
  cases.push(probe(`year=${y} lunar`, fmtDate(y, 6, 15), 12, '男', 'lunar', false))
}

// 3) 子时边界：早子 (0:00) / 晚子 (23:00) / 紧贴 23:59
for (const h of [0, 1, 22, 23]) {
  cases.push(probe(`year=2000 hour=${h} solar`, '2000-01-01', h))
}

// 4) 跨年子时：12-31 23:00（晚子，归本日 / 归次日的歧义）
cases.push(probe('cross-year solar 1999-12-31 23:00', '1999-12-31', 23))
cases.push(probe('cross-year solar 2000-01-01 00:00', '2000-01-01', 0))

// 5) 闰月：2020 闰四月（农历）
cases.push(probe('leap-month lunar 2020-4-15 (non-leap)', '2020-4-15', 12, '男', 'lunar', false))
cases.push(probe('leap-month lunar 2020-4-15 (leap)', '2020-4-15', 12, '男', 'lunar', true))

// 6) 历史上无 4 月闰的年份强制 isLeapMonth=true（应当有错或 fixLeap=true 时退化）
cases.push(probe('false-leap lunar 2024-3-15 (leap)', '2024-3-15', 12, '男', 'lunar', true))

// 7) 非法日期
cases.push(probe('invalid solar 2024-2-30', '2024-2-30', 12))
cases.push(probe('invalid solar 2024-13-1', '2024-13-1', 12))
cases.push(probe('invalid solar 0-1-1', '0-1-1', 12))
cases.push(probe('invalid solar -1-1-1', '-1-1-1', 12))

// 8) 边界 timeIndex 越界（理论 hourToTimeIndex 给的 0..12，越界由 iztro 自检）
cases.push(probe('weird hour=25', '2000-01-01', 25))
cases.push(probe('weird hour=-1', '2000-01-01', -1))

console.log('\n=== Ziwei boundary probe ===')
console.log('  ok = palaces=12 + fiveElementsClass + soul 都齐')
console.log('  err = iztro 直接抛出（应 wrap 为 FortuneError(invalid-input)）')
console.log('  silent-bad = ok=false 但没抛错（潜在的脏数据，需要前置校验）\n')

const buckets = { ok: [], err: [], silentBad: [] }
for (const r of cases) {
  if (r.err) buckets.err.push(r)
  else if (!r.ok) buckets.silentBad.push(r)
  else buckets.ok.push(r)
}

console.log(`✅ ok: ${buckets.ok.length}`)
for (const r of buckets.ok) {
  console.log(`  ${r.label}  → ${r.extra.fiveElementsClass} | ${r.extra.soul} | ${r.extra.lunarDate} | hs=${r.extra.horoscopeOk}`)
}

console.log(`\n❌ err (iztro throw): ${buckets.err.length}`)
for (const r of buckets.err) {
  console.log(`  ${r.label}  → ${r.err}`)
}

console.log(`\n⚠️  silent-bad (no throw but missing field): ${buckets.silentBad.length}`)
for (const r of buckets.silentBad) {
  console.log(`  ${r.label}  → palaces=${r.extra.palaceCount} fec=${r.extra.fiveElementsClass} soul=${r.extra.soul}`)
}

console.log('\n— summary —')
console.log(`  total: ${cases.length} | ok: ${buckets.ok.length} | err: ${buckets.err.length} | silentBad: ${buckets.silentBad.length}`)
