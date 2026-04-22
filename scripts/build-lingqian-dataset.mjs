#!/usr/bin/env node
/**
 * 观音灵签 · 100 签数据构建脚本（一次性运行）
 *
 * 输入：公版文献三篇（1-25 / 26-50 / 51-75）的抓取文本 + 脚本内嵌的 76-100 签数据
 * 输出：src/modules/lingqian/data/guanyin.json —— 100 签 LingqianItem[]
 *
 * level 映射（按与用户确认的 simple-map 方案）：
 *   上上 → 上上 ｜ 上 → 上吉 ｜ 中 → 中平 ｜ 下 → 中凶 ｜ 下下 → 下下
 *
 * topics 映射（15 项原始仙机 → 6 大分类）：
 *   family:   家宅 + 田蚕 + 六畜
 *   marriage: 婚姻 + 六甲 + 寻人
 *   career:   自身 + 公讼
 *   wealth:   求财 + 交易 + 失物 + 山坟
 *   travel:   行人 + 移徙
 *   health:   疾病
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ─────────────────────────────────────────────────────────────────────
// 1. 文本预处理 & 中文数字转换
// ─────────────────────────────────────────────────────────────────────

/** 把"二十五"这类中文数字转成阿拉伯数字（0-100 范围内） */
function cn2num(cn) {
  const D = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
  cn = cn.trim()
  if (cn === '百' || cn === '一百') return 100
  if (!cn.includes('十')) return D[cn] ?? NaN
  const [a, b] = cn.split('十')
  const tens = a === '' ? 1 : D[a] ?? NaN
  const ones = b === '' ? 0 : D[b] ?? NaN
  return tens * 10 + ones
}

/** 把任意空白（\n, \r, 全角空格, 多空格）归一为单空格；同时清洗抓取残留 */
function normalize(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\[\*?展开全文\*?\]\s*\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]+\)/g, '') // 其它 markdown 链接
    .replace(/\s+/g, ' ')
    .replace(/　+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────
// 2. 分签切分 & 字段抽取
// ─────────────────────────────────────────────────────────────────────

/**
 * 从一大段文本切出每签的原始字符串
 *   触发锚点：`观音灵签第(中文数字)签：{title}({等级标签})`
 *   等级标签可为：`上上签` | `上签` | `中签` | `下签` | `下下签`
 */
function splitSigns(all) {
  // title 限制 1-8 个非标点汉字，避免跨典故段贪吃到下一签的等级标签
  const signHeadRe = /观音灵签第([一二三四五六七八九十百]+)签：\s*([\u4e00-\u9fa5]{1,8})\s*[（(](上上签|上签|中签|下签|下下签)[)）]/g
  const matches = []
  let m
  while ((m = signHeadRe.exec(all)) !== null) {
    matches.push({ idx: m.index, num: cn2num(m[1]), title: m[2], levelLabel: m[3], end: m.index + m[0].length })
  }
  const out = []
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i]
    const next = matches[i + 1]
    const body = all.slice(cur.end, next ? next.idx : all.length)
    out.push({ ...cur, body })
  }
  return out
}

const LEVEL_MAP = {
  上上签: '上上',
  上签: '上吉',
  中签: '中平',
  下签: '中凶',
  下下签: '下下',
}

/** 抽 `【{level}签{宫位}】{诗}` 的诗句 */
function extractPoem(body) {
  const m = body.match(/【[^】]+】\s*([^观]+?)(?=观音灵签第[一二三四五六七八九十百]+签：诗意|观音灵签第[一二三四五六七八九十百]+签：解曰|观音灵签第[一二三四五六七八九十百]+签：仙机|观音灵签第[一二三四五六七八九十百]+签：典故)/)
  if (!m) return null
  const raw = m[1].trim().replace(/。\s*$/, '')
  // 按 ； ， 。 切四句
  const lines = raw.split(/[，；。]/).map((s) => s.trim()).filter(Boolean)
  if (lines.length < 4) return null
  // 前 4 句
  return lines.slice(0, 4)
}

/** 抽 `观音灵签第X签：{section}` 后到下一个锚点 之间的正文 */
function extractSection(body, section) {
  const re = new RegExp(`观音灵签第[一二三四五六七八九十百]+签：${section}\\s*([\\s\\S]+?)(?=观音灵签第[一二三四五六七八九十百]+签：(?:诗意|解曰|仙机|典故)|$)`)
  const m = body.match(re)
  if (!m) return null
  return m[1].trim().replace(/^\[?\s*展开全文\s*\]?\(?[^)]*\)?\s*/, '')
}

/** 把仙机解析为 15 项 k→v 字典 */
const XIANJI_KEYS = ['家宅', '自身', '求财', '交易', '婚姻', '六甲', '行人', '田蚕', '六畜', '寻人', '公讼', '移徙', '失物', '疾病', '山坟']

function parseXianji(rawXianji) {
  if (!rawXianji) return {}
  const text = normalize(rawXianji)
  const keyPattern = XIANJI_KEYS.join('|')
  const re = new RegExp(`(${keyPattern})`, 'g')
  const parts = text.split(re).filter(Boolean)
  const result = {}
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    if (XIANJI_KEYS.includes(seg)) {
      const next = parts[i + 1]
      if (next && !XIANJI_KEYS.includes(next)) {
        result[seg] = normalize(next).replace(/\(.*?\)|（.*?）/g, '').trim()
        i++
      }
    }
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────
// 3. 15 → 6 topics 映射（现代化标签 + 值白话化）
// ─────────────────────────────────────────────────────────────────────

/** 15 项原始关键字 → 现代用户可读标签 */
const LABEL_MAP = {
  家宅: '家宅',
  自身: '自身',
  求财: '求财',
  交易: '交易',
  婚姻: '婚姻',
  六甲: '子嗣',
  行人: '出行',
  田蚕: '农事',
  六畜: '家畜',
  寻人: '寻亲',
  公讼: '诉讼',
  移徙: '搬迁',
  失物: '失物',
  疾病: '疾病',
  山坟: '祖坟',
}

/** 婚姻-值 白话映射（用户点名"看不懂" → 重点改造） */
const MARRIAGE_VALUE_MAP = {
  成: '姻缘可成',
  合: '两情相合',
  就: '可成就',
  好: '顺遂美满',
  大吉: '大吉',
  吉: '吉利',
  中吉: '小吉',
  利: '有利',
  允: '顺遂',
  和合: '和合顺遂',
  阻: '姻缘受阻',
  阻滞: '姻缘阻滞',
  阻隔: '姻缘阻隔',
  难: '姻缘艰难',
  难合: '难相合',
  不合: '不相投契',
  不就: '尚难成就',
  未合: '缘分未至',
  未许: '缘分未至',
  未就: '尚难成就',
  未成: '尚未成',
  迟合: '缘分迟至',
  平平: '平稳',
  随意: '随缘',
  虚: '有名无实',
  祈福: '宜祈福保佑',
  祈保: '宜祈佑',
  作福: '宜积德求福',
  待时: '待时机',
}

/** 子嗣（原六甲）-值 白话映射 */
const LIUJIA_VALUE_MAP = {
  男: '宜得男胎',
  女: '宜得女胎',
  生男: '宜得男胎',
  生女: '宜得女胎',
  虚: '孕象未显',
  虚惊: '虚惊无碍',
  有险: '须防险情',
  险: '须防险情',
  有惊: '有惊无险',
  安: '母子平安',
  平安: '母子平安',
  祈福: '宜祈福',
  祈保: '宜祈佑',
  作福: '宜积福',
  不利: '不利孕育',
  多灾: '多波折',
}

const VALUE_MAPS = {
  婚姻: MARRIAGE_VALUE_MAP,
  六甲: LIUJIA_VALUE_MAP,
}

/** 拼接一组字段；`xianji` 为 15 项原始字典，`keys` 为本 topic 吸纳的原始关键字 */
function joinHumanized(xianji, keys, placeholder) {
  const parts = keys
    .map((k) => {
      const raw = xianji[k]
      if (!raw) return null
      const label = LABEL_MAP[k] ?? k
      const humanized = VALUE_MAPS[k]?.[raw] ?? raw
      return `${label}：${humanized}`
    })
    .filter(Boolean)
  return parts.length ? parts.join('；') : placeholder
}

function mapTopics(xianji, rawXianji) {
  if (Object.keys(xianji).length === 0 && rawXianji) {
    const unified = normalize(rawXianji)
    return {
      family: unified,
      marriage: unified,
      career: unified,
      wealth: unified,
      travel: unified,
      health: unified,
    }
  }
  return {
    family: joinHumanized(xianji, ['家宅', '寻人', '田蚕', '六畜'], '家宅平安，宜修养德行。'),
    marriage: joinHumanized(xianji, ['婚姻', '六甲'], '姻缘顺其自然，不可强求。'),
    career: joinHumanized(xianji, ['自身', '公讼'], '事业须勤勉守分，不可冒进。'),
    wealth: joinHumanized(xianji, ['求财', '交易', '失物', '山坟'], '财帛平平，宜稳守本业。'),
    travel: joinHumanized(xianji, ['行人', '移徙'], '出行择吉日，诸事留心。'),
    health: joinHumanized(xianji, ['疾病'], '起居有常，注意调养。'),
  }
}

// ─────────────────────────────────────────────────────────────────────
// 4. 单签解析流水线
// ─────────────────────────────────────────────────────────────────────

function parseOneSign(seg) {
  const body = normalize(seg.body)
  const poem = extractPoem(body)
  const shiyi = extractSection(body, '诗意')
  const jieyueRaw = extractSection(body, '解曰')
  const xianjiRaw = extractSection(body, '仙机')
  const diangu = extractSection(body, '典故')

  if (!poem) {
    console.warn(`[warn] sign ${seg.num} 签诗解析失败 → 跳过`)
    return null
  }

  const xianjiMap = parseXianji(xianjiRaw)

  const jieyueParts = []
  if (jieyueRaw) jieyueParts.push(normalize(jieyueRaw))
  if (shiyi) jieyueParts.push(normalize(shiyi))
  const jieyue = jieyueParts.join('　') || '以古语观之，凡事宜顺势而行。'

  // xianji 用于"仙机总引言"：15 项格式则拼串，free-form 则原样展示
  let xianjiSummary
  if (Object.keys(xianjiMap).length > 0) {
    xianjiSummary = XIANJI_KEYS
      .map((k) => (xianjiMap[k] ? `${k}${xianjiMap[k]}` : null))
      .filter(Boolean)
      .join('；')
  } else if (xianjiRaw) {
    xianjiSummary = normalize(xianjiRaw)
  } else {
    xianjiSummary = '凡事谋定而动，积善成吉。'
  }

  return {
    id: seg.num,
    level: LEVEL_MAP[seg.levelLabel],
    title: seg.title,
    poem,
    jieyue,
    xianji: xianjiSummary,
    topics: mapTopics(xianjiMap, xianjiRaw),
    _diangu: diangu || '',
  }
}

// ─────────────────────────────────────────────────────────────────────
// 5. 主流程
// ─────────────────────────────────────────────────────────────────────

const AGENT_TOOLS = '/Users/TerrellShe/.cursor/projects/Users-TerrellShe-Documents-tt-projects-tt-qimen/agent-tools'

const SOURCE_FILES = [
  path.join(AGENT_TOOLS, '4b85453c-bfc4-4af2-b0f9-5726c826aaa8.txt'), // sohu 系列 1 (1-25)
  path.join(AGENT_TOOLS, 'df3758b8-dfd7-48b4-b6af-93b91f822a33.txt'), // sohu 系列 2 (26-50)
  path.join(AGENT_TOOLS, '1c9a658a-f9dd-4fcd-917b-5e42f96a315d.txt'), // sohu 系列 3 (51-75)
  path.join(AGENT_TOOLS, '1694739b-85f7-4cda-983d-498be2d86928.txt'), // 163 系列 4 (77-100，76 签由 MANUAL 补)
]

// 76-100 签（由 zhouyi.cc / 解签网手工整理的公版文献）
import { MANUAL_76_100 } from './lingqian-76-100.mjs'

function main() {
  const parsed = []
  for (const file of SOURCE_FILES) {
    if (!fs.existsSync(file)) {
      console.error(`[err] source missing: ${file}`)
      process.exit(1)
    }
    const text = fs.readFileSync(file, 'utf8')
    const signs = splitSigns(text)
    console.log(`[debug] ${path.basename(file)} matched ids:`, signs.map((s) => s.num).join(','))
    for (const s of signs) {
      const it = parseOneSign(s)
      if (it) parsed.push(it)
    }
  }

  const byId = new Map()
  for (const it of parsed) {
    if (!byId.has(it.id)) byId.set(it.id, it)
  }
  for (const it of MANUAL_76_100) {
    byId.set(it.id, it)
  }

  const all = [...byId.values()].sort((a, b) => a.id - b.id)

  const missing = []
  for (let i = 1; i <= 100; i++) {
    if (!byId.has(i)) missing.push(i)
  }
  if (missing.length) {
    console.warn(`[warn] missing signs: ${missing.join(', ')}`)
  }

  const clean = all.map(({ _diangu, ...rest }) => rest)

  const outPath = path.join(ROOT, 'src/modules/lingqian/data/guanyin.json')
  fs.writeFileSync(outPath, JSON.stringify(clean, null, 2), 'utf8')

  const dist = clean.reduce((acc, it) => {
    acc[it.level] = (acc[it.level] || 0) + 1
    return acc
  }, {})

  console.log(`[ok] wrote ${clean.length} signs → ${path.relative(ROOT, outPath)}`)
  console.log(`     level distribution:`, dist)
}

main()
