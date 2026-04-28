/**
 * 命盘指纹 = sha1(moduleId + 关键入参)
 *
 * 用途：作为 ChatSession 的主键。换一个生辰 = 换一个 fingerprint = 自动切到新会话；
 * 同一个生辰 / 相同入参 = 复用历史对话。
 *
 * 用 Web Crypto API（浏览器原生），不引第三方依赖。
 */

import type { ModuleId } from '@/router'

/**
 * 各模块的 fingerprint 入参字段（设计文档 §11.2）。
 * 仅参与命盘"身份"判定的字段进入 fingerprint，UI 装饰字段（如 birthplace 字符串）排除。
 */
export const FINGERPRINT_FIELDS: Record<ModuleId, readonly string[]> = {
  bazi:     ['calendar', 'year', 'month', 'day', 'hour', 'minute', 'gender'],
  ziwei:    ['calendar', 'year', 'month', 'day', 'hour', 'gender'],
  liuren:   ['year', 'month', 'day', 'hour', 'minute', 'second'],
  chenggu:  ['calendar', 'year', 'month', 'day', 'hour', 'gender'],
  lingqian: ['qianId'],
  xingming: ['name', 'gender', 'calendar', 'year', 'month', 'day'],
  huangli:  ['year', 'month', 'day'],
  jiemeng:  ['dreamId'],
}

/**
 * 构造命盘指纹（异步，因 Web Crypto 是 async）。
 *
 * - 字段顺序无关：先按 key 排序再 stringify
 * - 取 SHA-1 前 16 hex（64 bit），冲突概率 ~2^-32，对个人占卜量足够
 * - 输出形如：`bazi:a3f2c4d18b9e0d11`
 */
export async function buildFingerprint(
  moduleId: ModuleId,
  params: Record<string, unknown>,
): Promise<string> {
  const fields = FINGERPRINT_FIELDS[moduleId] ?? []
  const sorted: Record<string, unknown> = {}
  for (const k of [...fields].sort()) {
    if (k in params) sorted[k] = params[k]
  }
  const text = `${moduleId}|${JSON.stringify(sorted)}`
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text))
  const hex = Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return `${moduleId}:${hex.slice(0, 16)}`
}

/**
 * 同步版本（仅用于无法 await 的场景，如 computed）。
 *
 * 牺牲加密强度换同步：把字段拼成字符串后做 djb2 hash，输出 8 hex。
 * 不能用于安全场景，但对"会话身份"语义完全够用，且不可逆。
 */
export function buildFingerprintSync(
  moduleId: ModuleId,
  params: Record<string, unknown>,
): string {
  const fields = FINGERPRINT_FIELDS[moduleId] ?? []
  const parts: string[] = [moduleId]
  for (const k of [...fields].sort()) {
    parts.push(`${k}=${params[k] ?? ''}`)
  }
  const text = parts.join('|')
  /* djb2 hash */
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i)
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0')
  return `${moduleId}:${hex}`
}
