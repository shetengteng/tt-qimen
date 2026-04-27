#!/usr/bin/env node
/**
 * 验证：bazi / ziwei 模块的 lastComputed snapshot 模式
 *
 * 复刻 src/modules/{bazi,ziwei}/stores/*.ts 内的 snapshotKey 逻辑（独立实现而非 import，
 * 因为这些是 Vue/Pinia 文件依赖浏览器 API），然后跑 case 验证：
 *   1) 同 birth 写入 → 读出 → shouldRestore = true
 *   2) birth 任意字段变化 → shouldRestore = false（穷举每个字段）
 *   3) longitude undefined vs 0 vs 121 三段切换 → 互不相等
 *   4) clearComputed() → null → shouldRestore = false
 *
 * 这是"输入指纹"模式的契约测试，刷新页面静默恢复的正确性依赖此契约。
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function snapshotKey(s) {
  return [
    s.calendar,
    s.year,
    s.month,
    s.day,
    s.hour,
    s.minute,
    s.gender,
    s.longitude ?? 'na',
  ].join('|')
}

function birthToSnapshot(b) {
  return {
    calendar: b.calendar,
    year: b.year,
    month: b.month,
    day: b.day,
    hour: b.hour,
    minute: b.minute,
    gender: b.gender,
    longitude: b.longitude,
  }
}

function shouldRestoreImpl(stored, currentBirth) {
  if (stored == null || typeof stored !== 'object') return false
  return snapshotKey(stored) === snapshotKey(birthToSnapshot(currentBirth))
}

const baseBirth = {
  calendar: 'solar',
  year: 1990,
  month: 5,
  day: 20,
  hour: 12,
  minute: 0,
  gender: 'male',
}

const cases = []

cases.push({
  label: '同 birth 写入 → 读出 → shouldRestore = true',
  stored: birthToSnapshot(baseBirth),
  current: { ...baseBirth },
  expected: true,
})

cases.push({
  label: '空快照 → shouldRestore = false',
  stored: null,
  current: { ...baseBirth },
  expected: false,
})

cases.push({
  label: '损坏快照（"[object Object]" 字符串）→ shouldRestore = false',
  stored: '[object Object]',
  current: { ...baseBirth },
  expected: false,
})

const fieldDeltas = [
  { calendar: 'lunar' },
  { year: 1991 },
  { month: 6 },
  { day: 21 },
  { hour: 13 },
  { minute: 30 },
  { gender: 'female' },
]

for (const delta of fieldDeltas) {
  const k = Object.keys(delta)[0]
  cases.push({
    label: `字段 ${k} 变化 → shouldRestore = false`,
    stored: birthToSnapshot(baseBirth),
    current: { ...baseBirth, ...delta },
    expected: false,
  })
}

cases.push({
  label: 'longitude undefined → 121.5（真太阳时开启）→ shouldRestore = false',
  stored: birthToSnapshot(baseBirth),
  current: { ...baseBirth, longitude: 121.5 },
  expected: false,
})

cases.push({
  label: 'longitude 121.5 → 0（开启后切到本初子午线）→ shouldRestore = false',
  stored: birthToSnapshot({ ...baseBirth, longitude: 121.5 }),
  current: { ...baseBirth, longitude: 0 },
  expected: false,
})

cases.push({
  label: 'longitude 121.5 同号 → shouldRestore = true',
  stored: birthToSnapshot({ ...baseBirth, longitude: 121.5 }),
  current: { ...baseBirth, longitude: 121.5 },
  expected: true,
})

let passed = 0
let failed = 0

for (const c of cases) {
  const actual = shouldRestoreImpl(c.stored, c.current)
  const ok = actual === c.expected
  if (ok) {
    passed++
    console.log(`${colors.green}✓${colors.reset} ${c.label}`)
  } else {
    failed++
    console.log(`${colors.red}✗${colors.reset} ${c.label}`)
    console.log(`  ${colors.gray}stored: ${JSON.stringify(c.stored)}${colors.reset}`)
    console.log(`  ${colors.gray}current: ${JSON.stringify(c.current)}${colors.reset}`)
    console.log(
      `  ${colors.gray}expected ${c.expected}, got ${actual}${colors.reset}`,
    )
  }
}

console.log()
console.log(
  `${colors.cyan}=== Snapshot restore contract: ${passed}/${cases.length} passed ===${colors.reset}`,
)

if (failed > 0) {
  console.log(`${colors.red}${failed} case(s) failed${colors.reset}`)
  process.exit(1)
}
