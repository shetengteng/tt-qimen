/**
 * 姓名学五格剖象主算法
 *
 * 输入：XingmingInput（姓 + 名 + 性别 + 出生年[可选]）
 * 输出：XingmingResult（每字笔画 + 天/人/地/外/总五格 + 综合评分）
 *
 * 流程：
 *   1. 汉字校验（非汉字抛错 → UI 转友好态）
 *   2. 长度校验（姓 1-2，名 1-2）
 *   3. 异步查询每字康熙笔画（修正表优先，npm 包兜底）
 *   4. 按四分支（单姓/复姓 × 单名/双名）计算五格
 *   5. 五格对应 81 数理条目
 *   6. 综合评分（5 格加权）+ 评分档位
 *
 * 异常：
 *   - 非汉字字符 → Error('仅支持中文姓名')
 *   - 姓/名长度超限 → Error('仅支持单姓/复姓 + 单字/双字名')
 *   - 未收录字 → StrokesNotFoundError（由 core/strokes.ts 抛出）
 */

import type {
  CharStroke,
  Element,
  GridInfo,
  GridName,
  Level,
  XingmingInput,
  XingmingResult,
} from '../types'
import { getNumerology, getElementByNumber } from '../data/numerology'
import { getStrokesDetailBatch } from './strokes'

/** 汉字范围校验（CJK 统一汉字基本区） */
const CJK_REGEX = /^[\u4e00-\u9fff]+$/

function assertCjk(text: string, label: string): void {
  if (!CJK_REGEX.test(text)) {
    throw new Error(`${label}仅支持中文汉字`)
  }
}

/** 按 81 数理末位推衍字五行（即单字的"姓名学五行"） */
function elementOfChar(strokes: number): Element {
  return getElementByNumber(strokes)
}

/** 对越界数值折算到 1..81（若落在超界，向回折叠） */
function normalizeGridNumber(n: number): number {
  if (n < 1) return 1
  if (n <= 81) return n
  return ((n - 1) % 81) + 1
}

/** 等级 → 基础分数（用于综合评分） */
const LEVEL_SCORE: Record<Level, number> = {
  大吉: 95,
  吉: 82,
  中吉: 72,
  中平: 60,
  凶: 45,
  大凶: 30,
}

/** 五格权重（合计 = 1.00） */
const GRID_WEIGHT: Record<GridName, number> = {
  tian: 0.1,
  ren: 0.3,
  zong: 0.25,
  di: 0.2,
  wai: 0.15,
}

function makeGridInfo(num: number): GridInfo {
  const normalized = normalizeGridNumber(num)
  const entry = getNumerology(normalized)
  if (!entry) {
    throw new Error(`[xingming] numerology entry missing for ${normalized}`)
  }
  return { number: num, entry }
}

/** 0-100 综合评分（五格加权） */
function computeOverallScore(grids: Record<GridName, GridInfo>): number {
  const sum =
    LEVEL_SCORE[grids.tian.entry.level] * GRID_WEIGHT.tian +
    LEVEL_SCORE[grids.ren.entry.level] * GRID_WEIGHT.ren +
    LEVEL_SCORE[grids.zong.entry.level] * GRID_WEIGHT.zong +
    LEVEL_SCORE[grids.di.entry.level] * GRID_WEIGHT.di +
    LEVEL_SCORE[grids.wai.entry.level] * GRID_WEIGHT.wai
  return Math.round(sum)
}

/** 综合评分 → 4 档显示标签（用于仪表盘） */
function scoreToBadge(score: number): XingmingResult['overallBadge'] {
  if (score >= 90) return '优'
  if (score >= 75) return '良'
  if (score >= 60) return '中'
  return '差'
}

/** 综合评价一句话 */
function buildOverallSummary(
  fullName: string,
  grids: Record<GridName, GridInfo>,
  score: number,
): string {
  const ren = grids.ren.entry
  const zong = grids.zong.entry
  const badge = scoreToBadge(score)
  const badgeWord =
    badge === '优' ? '格局开阔'
    : badge === '良' ? '搭配良好'
    : badge === '中' ? '中规中矩'
    : '需多磨砺'
  return `"${fullName}"整体五格${badgeWord}，人格 ${ren.element} · ${ren.level}，总格 ${zong.element} · ${zong.level}；综合评分 ${score} / 100。`
}

/**
 * 五格计算核心分支函数。
 *
 * 规则（熊崎派通行版）：
 *   - tian：单姓 = strokes[0] + 1；复姓 = strokes[0] + strokes[1]
 *   - ren： 单姓 = strokes[0] + strokes[1]；复姓 = strokes[1] + strokes[2]
 *   - di：  单名 = strokes[S] + 1；双名 = strokes[S] + strokes[S+1]
 *   - zong：所有字笔画之和
 *   - wai： 单名复姓 = strokes[0] + 1 + 1；
 *          单名单姓 = 2（固定）；
 *          其他 = zong - ren + 1
 */
function computeFiveGridNumbers(
  strokes: number[],
  surnameLen: 1 | 2,
  givenLen: 1 | 2,
): Record<GridName, number> {
  const tian =
    surnameLen === 1 ? strokes[0] + 1 : strokes[0] + strokes[1]

  const ren =
    surnameLen === 1
      ? strokes[0] + strokes[1]
      : strokes[1] + strokes[2]

  const di =
    givenLen === 1
      ? strokes[surnameLen] + 1
      : strokes[surnameLen] + strokes[surnameLen + 1]

  const zong = strokes.reduce((acc, s) => acc + s, 0)

  const wai =
    givenLen === 1 && surnameLen === 1
      ? 2
      : zong - ren + 1

  return { tian, ren, di, wai, zong }
}

/** 主函数：姓名 → 完整结果（异步） */
export async function calculateXingming(
  input: XingmingInput,
): Promise<XingmingResult> {
  const surname = input.surname.trim()
  const givenName = input.givenName.trim()

  if (!surname) throw new Error('请填写姓氏')
  if (!givenName) throw new Error('请填写名字')
  assertCjk(surname, '姓氏')
  assertCjk(givenName, '名字')

  if (surname.length < 1 || surname.length > 2) {
    throw new Error('仅支持单姓或复姓（1-2 字）')
  }
  if (givenName.length < 1 || givenName.length > 2) {
    throw new Error('仅支持单字或双字名（1-2 字）')
  }

  const surnameLen = surname.length as 1 | 2
  const givenLen = givenName.length as 1 | 2

  const fullName = surname + givenName
  const charList = fullName.split('')
  const details = await getStrokesDetailBatch(charList)
  const strokes = details.map((d) => d.kangxi)

  const chars: CharStroke[] = charList.map((char, i) => ({
    char,
    kangxi: details[i].kangxi,
    simplified: details[i].simplified,
    element: elementOfChar(details[i].kangxi),
  }))

  const numbers = computeFiveGridNumbers(strokes, surnameLen, givenLen)

  const grids: Record<GridName, GridInfo> = {
    tian: makeGridInfo(numbers.tian),
    ren: makeGridInfo(numbers.ren),
    di: makeGridInfo(numbers.di),
    wai: makeGridInfo(numbers.wai),
    zong: makeGridInfo(numbers.zong),
  }

  const overallScore = computeOverallScore(grids)
  const overallBadge = scoreToBadge(overallScore)
  const overallSummary = buildOverallSummary(fullName, grids, overallScore)

  return {
    fullName,
    surnameLen,
    givenLen,
    chars,
    grids,
    overallScore,
    overallBadge,
    overallSummary,
  }
}

/** 导出字五行推衍辅助（用于 UI 展示每字五行） */
export { elementOfChar }
