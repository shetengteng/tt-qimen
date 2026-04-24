#!/usr/bin/env node
/**
 * 补丁脚本：将 lingqian-humanized.mjs 的最新文案直接应用到 guanyin.json
 *
 * 背景：完整 build 依赖外部抓取文本，这里仅覆盖 humanized 主字段以便快速迭代。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { LINGQIAN_HUMANIZED } from './lingqian-humanized.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const outPath = path.join(ROOT, 'src/modules/lingqian/data/guanyin.json')

const data = JSON.parse(fs.readFileSync(outPath, 'utf8'))
const byId = new Map(data.map((it) => [it.id, it]))

let applied = 0
for (const h of LINGQIAN_HUMANIZED) {
  const cur = byId.get(h.id)
  if (!cur) continue
  cur.jieyue = h.jieyue
  cur.xianji = h.xianji
  cur.topics = h.topics
  if (h.diangu) cur.diangu = h.diangu
  applied += 1
}

const out = [...byId.values()].sort((a, b) => a.id - b.id)
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
console.log(`[ok] patched ${applied} signs → ${path.relative(ROOT, outPath)}`)
