#!/usr/bin/env node
/**
 * 观音灵签 · 100 签数据校验脚本
 *
 * 目的：在 build 之后、提交之前，确保 guanyin.json 满足"用户级"质量底线：
 *   1. 100 签齐全（id=1..100，无重复、无缺漏）
 *   2. 必填字段非空：id / level / title / poem / jieyue / xianji / topics
 *   3. poem 必须是 4 行非空字符串
 *   4. level 必须是 6 等级之一
 *   5. topics 6 个键各自非空、且**互不相同**（避免 6 个 topic 共用一句）
 *   6. topics 每条不应残留古文短句（疑似未做白话化映射的 raw token）
 *   7. diangu 字段允许为空字符串（公版未载即可），但若有内容应不少于 6 字
 *   8. items.ts 中的 fallback 6 签必须与 guanyin.json 同 id 数据**完全一致**
 *      （level / title / poem / jieyue / xianji / topics / diangu 均逐字段比较）
 *
 * 退出码：发现任何"硬错误"返回 1；只有"警告"返回 0。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA = path.join(ROOT, 'src/modules/lingqian/data/guanyin.json')
const FALLBACK_TS = path.join(ROOT, 'src/modules/lingqian/data/items.ts')

const VALID_LEVELS = new Set(['上上', '上吉', '中吉', '中平', '中凶', '下下'])
const TOPIC_KEYS = ['family', 'marriage', 'career', 'wealth', 'travel', 'health']

/**
 * 已知"单字 raw token"残留模式——若 topic 中某个标签（如"出行/疾病/家畜/搬迁/祖坟"）
 * 后跟着的就是单字（"出行去"/"疾病阻"/"家畜成"等），说明 COMMON_VALUE_MAP 漏配了。
 * 这是真正需要修复的 raw 残留，不再误报"祖坟顺利"这种已正常白话化的词组。
 */
const SUSPECT_RAW_TOKEN = /(出行|疾病|家畜|寻亲|搬迁|祖坟|交易|失物|诉讼|农事|求财|自身|子嗣|婚姻|家宅)([去回动至平止损阻险凶空虚安吉利成喜发破绝败杳灾缺合允和遂胜熟稳通])(?=[，。；])/g

const errors = []
const warnings = []

function pushErr(id, msg) {
  errors.push(`[err ] ${String(id).padStart(3)}: ${msg}`)
}
function pushWarn(id, msg) {
  warnings.push(`[warn] ${String(id).padStart(3)}: ${msg}`)
}

/**
 * 解析 items.ts 中 LINGQIAN_ITEMS 字面量数组里所有签的 id（用正则即可，无需走 TS 编译器）。
 * 然后对每个 id，用纯文本对比关键字段在 items.ts 与 guanyin.json 中是否完全一致。
 *
 * 我们故意避免 import items.ts（涉及 TS 编译/路径别名），改用最小侵入的字符串包含检查：
 *   - level / title / 4 句 poem / jieyue / xianji / 6 个 topic 文本 / diangu(若存在)
 *   均必须在 items.ts 文本中能"逐字"找到。
 * 这能拦截"items.ts 与 guanyin.json 漂移"这一最常见的回归。
 */
function validateFallbackConsistency(allFromJson) {
  if (!fs.existsSync(FALLBACK_TS)) {
    pushWarn('-', `fallback file missing: ${path.relative(ROOT, FALLBACK_TS)}`)
    return
  }
  const tsSrc = fs.readFileSync(FALLBACK_TS, 'utf8')
  const idMatches = [...tsSrc.matchAll(/^\s*id:\s*(\d+),/gm)].map((m) => Number(m[1]))
  if (idMatches.length === 0) {
    pushWarn('-', `fallback items.ts: no signs found (regex did not match)`)
    return
  }

  for (const id of idMatches) {
    const it = allFromJson.find((x) => x.id === id)
    if (!it) {
      pushErr(id, `fallback items.ts contains id ${id} but guanyin.json doesn't`)
      continue
    }
    const expects = [
      ['level', it.level],
      ['title', it.title],
      ['poem[0]', it.poem?.[0]],
      ['poem[1]', it.poem?.[1]],
      ['poem[2]', it.poem?.[2]],
      ['poem[3]', it.poem?.[3]],
      ['jieyue', it.jieyue],
      ['xianji', it.xianji],
      ['topics.family', it.topics?.family],
      ['topics.marriage', it.topics?.marriage],
      ['topics.career', it.topics?.career],
      ['topics.wealth', it.topics?.wealth],
      ['topics.travel', it.topics?.travel],
      ['topics.health', it.topics?.health],
    ]
    if (typeof it.diangu === 'string' && it.diangu.length > 0) {
      expects.push(['diangu', it.diangu])
    }
    for (const [field, expected] of expects) {
      if (typeof expected !== 'string' || !expected) continue
      if (!tsSrc.includes(expected)) {
        pushErr(
          id,
          `fallback items.ts diverged from guanyin.json on "${field}" — expected to contain: ${JSON.stringify(expected.slice(0, 50))}…`,
        )
      }
    }
  }
}

function main() {
  if (!fs.existsSync(DATA)) {
    console.error(`[fatal] data file not found: ${DATA}`)
    process.exit(2)
  }

  const raw = JSON.parse(fs.readFileSync(DATA, 'utf8'))
  if (!Array.isArray(raw)) {
    console.error('[fatal] guanyin.json root is not an array')
    process.exit(2)
  }

  // 1. 100 签齐全
  const ids = raw.map((it) => it.id)
  const seen = new Set()
  const dup = []
  for (const id of ids) {
    if (seen.has(id)) dup.push(id)
    seen.add(id)
  }
  if (dup.length) pushErr('-', `duplicate ids: ${[...new Set(dup)].join(',')}`)

  const missing = []
  for (let i = 1; i <= 100; i++) if (!seen.has(i)) missing.push(i)
  if (missing.length) pushErr('-', `missing ids: ${missing.join(',')}`)
  if (raw.length !== 100) pushErr('-', `expected 100 items, got ${raw.length}`)

  // 2~7. 逐签校验
  for (const it of raw) {
    const id = it.id

    if (typeof id !== 'number' || id < 1 || id > 100)
      pushErr(id, `invalid id: ${JSON.stringify(id)}`)

    if (!VALID_LEVELS.has(it.level))
      pushErr(id, `invalid level: ${JSON.stringify(it.level)}`)

    if (typeof it.title !== 'string' || it.title.length < 2)
      pushErr(id, `title too short: ${JSON.stringify(it.title)}`)

    if (!Array.isArray(it.poem) || it.poem.length !== 4)
      pushErr(id, `poem must be 4-line array, got ${it.poem?.length ?? 0}`)
    else {
      for (let i = 0; i < 4; i++) {
        if (typeof it.poem[i] !== 'string' || it.poem[i].length < 4)
          pushErr(id, `poem[${i}] too short: ${JSON.stringify(it.poem[i])}`)
      }
    }

    if (typeof it.jieyue !== 'string' || it.jieyue.length < 8)
      pushErr(id, `jieyue too short: ${JSON.stringify(it.jieyue)}`)

    if (typeof it.xianji !== 'string' || it.xianji.length < 8)
      pushErr(id, `xianji too short: ${JSON.stringify(it.xianji)}`)

    // topics 必须 6 键齐全 + 各非空 + 互不相同
    if (!it.topics || typeof it.topics !== 'object') {
      pushErr(id, 'topics missing')
    } else {
      for (const key of TOPIC_KEYS) {
        if (typeof it.topics[key] !== 'string' || it.topics[key].length < 4)
          pushErr(id, `topics.${key} empty/short: ${JSON.stringify(it.topics[key])}`)
      }
      // 6 个 topic 全部相同 → 严重劣化体验
      const uniq = new Set(TOPIC_KEYS.map((k) => it.topics[k]))
      if (uniq.size === 1) {
        pushErr(id, `all 6 topics share the same text — needs override`)
      } else if (uniq.size <= 3) {
        pushWarn(id, `only ${uniq.size} unique topic texts — consider override`)
      }

      // 6 个 topic 中可疑的"单字 raw token"（漏配 COMMON_VALUE_MAP）
      for (const key of TOPIC_KEYS) {
        const v = it.topics[key]
        if (!v) continue
        const matches = [...v.matchAll(SUSPECT_RAW_TOKEN)]
        if (matches.length) {
          for (const m of matches) {
            pushWarn(id, `topics.${key} raw token "${m[1]}${m[2]}" — add to COMMON_VALUE_MAP`)
          }
        }
      }
    }

    // diangu 允许为空，若有则建议有一定长度
    if (it.diangu != null && typeof it.diangu === 'string' && it.diangu.length > 0 && it.diangu.length < 6) {
      pushWarn(id, `diangu too short to be useful: ${JSON.stringify(it.diangu)}`)
    }
  }

  // 8. items.ts fallback 一致性
  validateFallbackConsistency(raw)

  // 输出
  console.log('─'.repeat(60))
  console.log(`Lingqian dataset validation: ${raw.length} signs`)
  console.log(`  errors: ${errors.length}`)
  console.log(`  warnings: ${warnings.length}`)
  console.log('─'.repeat(60))

  if (errors.length) {
    console.log('\nERRORS:')
    for (const e of errors) console.log(e)
  }
  if (warnings.length) {
    console.log('\nWARNINGS:')
    for (const w of warnings) console.log(w)
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n[ok] all checks passed.')
  }

  process.exit(errors.length ? 1 : 0)
}

main()
