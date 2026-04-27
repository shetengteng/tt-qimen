#!/usr/bin/env node
/**
 * 校验 zh-CN / zh-TW / en 三语 MINOR_STARS 数据 verdict 矩阵对齐
 */
import fs from 'node:fs'

const STARS = [
  'zuofu', 'youbi', 'wenchang', 'wenqu', 'tiankui', 'tianyue',
  'qingyang', 'tuoluo', 'huoxing', 'lingxing', 'dikong', 'dijie',
]
const PALACES = [
  'ming', 'xiongdi', 'fuqi', 'zinv', 'caibo', 'jie',
  'qianyi', 'jiaoyou', 'guanlu', 'tianzhai', 'fude', 'fumu',
]

function extractCnTw(content) {
  const result = {}
  for (const star of STARS) {
    const headerRe = new RegExp(`^  ${star}: `, 'm')
    const startIdx = content.search(headerRe)
    if (startIdx < 0) continue
    const tail = content.substring(startIdx)
    let endIdx = tail.length
    for (const next of STARS) {
      if (next === star) continue
      const nextIdx = tail.substring(20).search(new RegExp(`^  ${next}: `, 'm'))
      if (nextIdx > 0) endIdx = Math.min(endIdx, nextIdx + 20)
    }
    const block = tail.substring(0, endIdx)

    result[star] = {}
    for (const palace of PALACES) {
      const re = new RegExp(`${palace}: \\{ text:.*?verdict: '(ji|zhong|xiong)'`, 's')
      const match = block.match(re)
      if (match) result[star][palace] = match[1]
    }
  }
  return result
}

function extractEn(content) {
  const result = {}
  for (const star of STARS) {
    const headerRe = new RegExp(`${star}: buildSkeleton\\('${star}', \\[`, 'm')
    const startIdx = content.search(headerRe)
    if (startIdx < 0) continue
    const tail = content.substring(startIdx)
    const endMatch = tail.match(/\]\),/)
    if (!endMatch) continue
    const block = tail.substring(0, tail.indexOf('])') + 2)

    result[star] = {}
    const tupleRe = /\['(\w+)', '(ji|zhong|xiong)'\]/g
    let m
    while ((m = tupleRe.exec(block)) !== null) {
      result[star][m[1]] = m[2]
    }
  }
  return result
}

const cn = extractCnTw(fs.readFileSync('src/modules/ziwei/data/minorStars.ts', 'utf8'))
const tw = extractCnTw(fs.readFileSync('src/modules/ziwei/data/minorStars.zh-TW.ts', 'utf8'))
const en = extractEn(fs.readFileSync('src/modules/ziwei/data/minorStars.en.ts', 'utf8'))

let mismatches = 0
let cnTotal = 0
const verdictDist = { ji: 0, zhong: 0, xiong: 0 }

for (const star of STARS) {
  for (const palace of PALACES) {
    const cv = cn[star]?.[palace]
    const tv = tw[star]?.[palace]
    const ev = en[star]?.[palace]
    if (!cv) {
      console.log(`zh-CN MISSING: ${star} × ${palace}`)
      mismatches++
      continue
    }
    cnTotal++
    verdictDist[cv]++
    if (cv !== tv) { console.log(`MISMATCH zh-CN/zh-TW: ${star} × ${palace} cn=${cv} tw=${tv}`); mismatches++ }
    if (cv !== ev) { console.log(`MISMATCH zh-CN/en: ${star} × ${palace} cn=${cv} en=${ev}`); mismatches++ }
  }
}

console.log(`\n=== Summary ===`)
console.log(`zh-CN entries: ${cnTotal} / 144`)
console.log(`Verdict distribution (zh-CN): ${JSON.stringify(verdictDist)}`)
console.log(`Total mismatches across 3 langs: ${mismatches}`)
process.exit(mismatches > 0 ? 1 : 0)
