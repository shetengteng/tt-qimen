/**
 * 观音灵签 zh-TW 数据集生成脚本
 *
 * 原则：
 *   1. 以 src/modules/lingqian/data/guanyin.json (zh-CN) 为源
 *   2. 使用 chinese-conv 的 tifyJson 做字符级简→繁
 *   3. 用 TW_OVERRIDES 做一组"台版习惯用词"矫正（签文语境）
 *   4. 保留 raw 字段（原公版古文）原样简→繁
 *
 * 输出：
 *   - src/modules/lingqian/data/guanyin.zh-TW.json
 *
 * 为什么不用 OpenCC：
 *   - OpenCC 需要引入 opencc-js（~400 KB runtime/build）
 *   - 本项目已依赖 chinese-conv（4 KB），API `tifyJson` 即可覆盖深度对象
 *   - 台湾词习惯以手工 overrides 补充即可
 *
 * 使用：
 *   node scripts/build-lingqian-zhtw.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..')

const SRC_PATH = resolve(PROJECT_ROOT, 'src/modules/lingqian/data/guanyin.json')
const OUT_PATH = resolve(PROJECT_ROOT, 'src/modules/lingqian/data/guanyin.zh-TW.json')

/**
 * 台湾用词矫正表（签文语境）
 *
 * 原则：
 *   - 只修改在签文/白话注解中明显偏大陆用词的词汇
 *   - 古文（签诗、典故人名地名、仙机术语）保持公版原样，不强加台版用法
 *   - 不涉及地名、人名
 */
const TW_OVERRIDES = [
  [/网络/g, '網路'],
  [/程序/g, '程式'],
  [/软件/g, '軟體'],
  [/硬件/g, '硬體'],
  [/优盘/g, '隨身碟'],
  [/视频/g, '影片'],
  [/短信/g, '簡訊'],
  [/内存/g, '記憶體'],
  [/信息/g, '資訊'],
  [/谷歌/g, 'Google'],
  [/冰箱/g, '冰箱'],
  [/空调/g, '冷氣'],
  [/出租车/g, '計程車'],
  [/地铁/g, '捷運'],
  [/盒饭/g, '便當'],
  [/电脑/g, '電腦'],
  [/鼠标/g, '滑鼠'],
  [/打印/g, '列印'],
  [/打印机/g, '印表機'],
  [/光盘/g, '光碟'],
  [/U盘/g, '隨身碟'],
  [/集装箱/g, '貨櫃'],
]

async function main() {
  const { tifyJson } = await import('chinese-conv')

  console.log('→ 读取源文件：', SRC_PATH)
  const src = JSON.parse(readFileSync(SRC_PATH, 'utf-8'))
  if (!Array.isArray(src) || src.length === 0) {
    throw new Error('guanyin.json 为空或格式异常')
  }
  console.log(`  签数：${src.length}`)

  console.log('→ chinese-conv.tifyJson 简→繁（递归对象）')
  const tw = tifyJson(src)

  console.log('→ 应用台版用词矫正（overrides）')
  let overridesApplied = 0
  const applyOverrides = (value) => {
    if (typeof value === 'string') {
      let out = value
      for (const [re, replacement] of TW_OVERRIDES) {
        if (re.test(out)) {
          out = out.replace(re, replacement)
          overridesApplied++
        }
      }
      return out
    }
    if (Array.isArray(value)) return value.map(applyOverrides)
    if (value && typeof value === 'object') {
      const next = {}
      for (const [k, v] of Object.entries(value)) {
        next[k] = applyOverrides(v)
      }
      return next
    }
    return value
  }
  const final = applyOverrides(tw)
  console.log(`  overrides 命中：${overridesApplied} 处`)

  const validation = validateTw(final, src)
  if (validation.errors.length > 0) {
    console.error('\n× 校验失败：')
    validation.errors.forEach((e) => console.error('  -', e))
    process.exit(1)
  }
  if (validation.warnings.length > 0) {
    console.warn('\n! 校验警告：')
    validation.warnings.slice(0, 10).forEach((w) => console.warn('  -', w))
    if (validation.warnings.length > 10) {
      console.warn(`  ... 还有 ${validation.warnings.length - 10} 条`)
    }
  }

  console.log(`\n→ 写入输出：${OUT_PATH}`)
  writeFileSync(OUT_PATH, JSON.stringify(final, null, 2) + '\n', 'utf-8')

  const outBytes = readFileSync(OUT_PATH).length
  console.log(`  输出大小：${(outBytes / 1024).toFixed(1)} KB`)
  console.log('\n✅ zh-TW 数据集生成完成')
}

function validateTw(tw, src) {
  const errors = []
  const warnings = []

  if (!Array.isArray(tw) || tw.length !== src.length) {
    errors.push(`输出长度 ${tw?.length} 与源 ${src.length} 不符`)
    return { errors, warnings }
  }

  for (let i = 0; i < tw.length; i++) {
    const s = src[i]
    const t = tw[i]
    if (t.id !== s.id) errors.push(`[${i}] id 不一致：src=${s.id} tw=${t.id}`)
    if (t.level !== tifyQuick(s.level)) {
      warnings.push(`[id=${s.id}] level 异常：src=${s.level} tw=${t.level}`)
    }
    if (!Array.isArray(t.poem) || t.poem.length !== s.poem.length) {
      errors.push(`[id=${s.id}] poem 数组长度不一致`)
    }
    const requiredStrFields = ['title', 'jieyue', 'xianji', 'diangu']
    for (const f of requiredStrFields) {
      if (typeof t[f] !== 'string' || t[f].length === 0) {
        errors.push(`[id=${s.id}] 字段 ${f} 缺失或空`)
      }
    }
    if (!t.topics || typeof t.topics !== 'object') {
      errors.push(`[id=${s.id}] topics 缺失`)
      continue
    }
    const expectedTopics = ['family', 'marriage', 'career', 'wealth', 'travel', 'health']
    for (const k of expectedTopics) {
      if (typeof t.topics[k] !== 'string' || t.topics[k].length === 0) {
        errors.push(`[id=${s.id}] topics.${k} 缺失或空`)
      }
    }
    // 将 item 序列化成字符串后扫描是否残留简体字（或大陆用词）
    const flat = JSON.stringify(t)
    const MAINLAND_TERMS = /(网络|软件|硬件|视频|短信|内存|信息|电脑|鼠标|打印机|光盘|出租车|地铁|盒饭|空调)/
    const m = flat.match(MAINLAND_TERMS)
    if (m) warnings.push(`[id=${s.id}] 残留大陆用词：${m[1]}`)
    const m2 = flat.match(/[纪给级红约总结练组经验]/)
    if (m2) warnings.push(`[id=${s.id}] 残留简体字：${m2[0]}`)
  }

  return { errors, warnings }
}

function tifyQuick(s) {
  // 仅做小串快速校验，避免重复大对象转换
  return s
    .replace(/觀/g, '觀')
    .replace(/簽/g, '簽')
    .replace(/觀音/g, '觀音')
}

main().catch((err) => {
  console.error('[lingqian-zhtw] 生成失败：', err)
  process.exit(1)
})
