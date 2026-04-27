#!/usr/bin/env node
/**
 * 验证 `assertBirthInput` 前置校验：极端 / 滥参输入是否被精确拦截为 FortuneError(invalid-input)。
 *
 * 这个脚本不能直接 import .ts，所以我们把 assert 逻辑当 spec 复刻一遍 —
 * 真正的契约由 `src/modules/ziwei/core/ziwei.ts::assertBirthInput` 保证。
 * 这里仅检测 spec：
 *   1) 合法 birth 必须不抛
 *   2) 非法 birth 必须抛 FortuneError(invalid-input)
 *
 * 真正的 e2e（buildZiweiChart 一整条链路）通过 vite 构建后人工点 UI 验证。
 */

const ZIWEI_YEAR_MIN = 1900
const ZIWEI_YEAR_MAX = new Date().getFullYear() + 100

function assertBirthInput(birth) {
  const fail = (reason) => {
    const e = new Error(`[ziwei] invalid birth input: ${reason}`)
    e.name = 'FortuneError'
    e.module = 'ziwei'
    e.code = 'invalid-input'
    throw e
  }

  if (birth.calendar !== 'solar' && birth.calendar !== 'lunar') {
    fail(`unknown calendar=${String(birth.calendar)}`)
  }
  if (!Number.isInteger(birth.year) || birth.year < ZIWEI_YEAR_MIN || birth.year > ZIWEI_YEAR_MAX) {
    fail(`year=${birth.year} not in [${ZIWEI_YEAR_MIN}, ${ZIWEI_YEAR_MAX}]`)
  }
  if (!Number.isInteger(birth.month) || birth.month < 1 || birth.month > 12) {
    fail(`month=${birth.month} not in [1, 12]`)
  }
  if (!Number.isInteger(birth.day) || birth.day < 1 || birth.day > 31) {
    fail(`day=${birth.day} not in [1, 31]`)
  }
  if (!Number.isInteger(birth.hour) || birth.hour < 0 || birth.hour > 23) {
    fail(`hour=${birth.hour} not in [0, 23]`)
  }
  if (!Number.isInteger(birth.minute) || birth.minute < 0 || birth.minute > 59) {
    fail(`minute=${birth.minute} not in [0, 59]`)
  }
  if (birth.gender !== 'male' && birth.gender !== 'female') {
    fail(`unknown gender=${String(birth.gender)}`)
  }

  if (birth.calendar === 'solar') {
    const probe = new Date(birth.year, birth.month - 1, birth.day)
    if (
      probe.getFullYear() !== birth.year
      || probe.getMonth() !== birth.month - 1
      || probe.getDate() !== birth.day
    ) {
      fail(`solar date ${birth.year}-${birth.month}-${birth.day} does not exist`)
    }
  }
}

const baseLegal = {
  calendar: 'solar',
  year: 1990,
  month: 5,
  day: 20,
  hour: 12,
  minute: 0,
  gender: 'male',
}

const cases = [
  // 合法
  ['legal solar 1990-05-20 12:00 male', baseLegal, 'pass'],
  ['legal lunar 2020 leap-april', { ...baseLegal, calendar: 'lunar' }, 'pass'],
  ['legal year=1900 (lower bound)', { ...baseLegal, year: 1900 }, 'pass'],
  ['legal year=2125 (now+100)', { ...baseLegal, year: new Date().getFullYear() + 100 }, 'pass'],

  // 非法 - calendar
  ['bad calendar=undef', { ...baseLegal, calendar: undefined }, 'fail'],
  ['bad calendar=junk', { ...baseLegal, calendar: 'junk' }, 'fail'],

  // 非法 - year
  ['bad year=0', { ...baseLegal, year: 0 }, 'fail'],
  ['bad year=-1', { ...baseLegal, year: -1 }, 'fail'],
  ['bad year=1899 (out of range)', { ...baseLegal, year: 1899 }, 'fail'],
  ['bad year=2126 (now+101)', { ...baseLegal, year: new Date().getFullYear() + 101 }, 'fail'],
  ['bad year=NaN', { ...baseLegal, year: NaN }, 'fail'],
  ['bad year=1.5 (non-int)', { ...baseLegal, year: 1.5 }, 'fail'],

  // 非法 - month
  ['bad month=0', { ...baseLegal, month: 0 }, 'fail'],
  ['bad month=13', { ...baseLegal, month: 13 }, 'fail'],
  ['bad month=-1', { ...baseLegal, month: -1 }, 'fail'],

  // 非法 - day
  ['bad day=0', { ...baseLegal, day: 0 }, 'fail'],
  ['bad day=32', { ...baseLegal, day: 32 }, 'fail'],

  // 非法 - hour / minute
  ['bad hour=24', { ...baseLegal, hour: 24 }, 'fail'],
  ['bad hour=-1', { ...baseLegal, hour: -1 }, 'fail'],
  ['bad minute=60', { ...baseLegal, minute: 60 }, 'fail'],
  ['bad minute=-1', { ...baseLegal, minute: -1 }, 'fail'],

  // 非法 - gender
  ['bad gender=other', { ...baseLegal, gender: 'other' }, 'fail'],

  // 非法 - solar 不存在的日期
  ['bad solar 2024-02-30', { ...baseLegal, year: 2024, month: 2, day: 30 }, 'fail'],
  ['bad solar 2023-02-29 (non-leap)', { ...baseLegal, year: 2023, month: 2, day: 29 }, 'fail'],
  ['bad solar 2024-04-31 (no Apr 31)', { ...baseLegal, year: 2024, month: 4, day: 31 }, 'fail'],
  ['legal solar 2024-02-29 (leap)', { ...baseLegal, year: 2024, month: 2, day: 29 }, 'pass'],
]

let passed = 0
let failed = 0
for (const [label, birth, expect] of cases) {
  let outcome = 'pass'
  let errMsg = ''
  try {
    assertBirthInput(birth)
  } catch (e) {
    outcome = 'fail'
    errMsg = e.message
  }
  const ok = outcome === expect
  if (ok) {
    passed++
    console.log(`✅ ${label}  → ${outcome}${errMsg ? ` (${errMsg})` : ''}`)
  } else {
    failed++
    console.log(`❌ ${label}  → expected ${expect} but got ${outcome}${errMsg ? ` (${errMsg})` : ''}`)
  }
}

console.log(`\n— summary —  total: ${cases.length} | passed: ${passed} | failed: ${failed}`)
process.exit(failed > 0 ? 1 : 0)
