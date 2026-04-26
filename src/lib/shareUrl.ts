/**
 * 分享 URL / 二维码 payload 构造器
 *
 * 设计目标：
 *   1. 八大模块各自决定哪些 store 字段需要写进 query（最小必要字段原则）；
 *   2. 序列化与反序列化是同一份 schema，避免新人在两个地方各写一份格式说明；
 *   3. URL 始终走 hash route（hash 不被服务器消费、CDN 缓存 hit 也不受影响）。
 *
 * URL 形态：
 *   https://<host><base>#/<module>?k1=v1&k2=v2
 *   - 无入参时 query 段省略，二维码内容仍是模块根 URL；
 *   - 入参允许少量缺失（hydrateFromQuery 应做容错）。
 *
 * 安全性约束：
 *   - 仅承载用户已**主动输入到当前页面 store** 的数据；
 *   - 不得序列化任何不可见的 secret / token / 推测字段；
 *   - hydrateFromQuery 不应直接 alert / console.error；只做 store 写入，让原模块自己驱动后续 UI。
 */

import type { ModuleId } from '@/router'

export type ShareQuery = Record<string, string | number | boolean | null | undefined>

/**
 * 把 query 对象拼到当前 origin 上，hash route 形式。
 *
 * 不依赖 router 实例，避免把 lib 与 vue-router 强耦合（router 可能在 SSR/独立工具中不可用）。
 */
export function buildShareUrl(moduleId: ModuleId, query?: ShareQuery): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  // base 取自 vite 的 import.meta.env.BASE_URL（默认 '/'，部署到子路径时可能是 '/qimen/'）
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  const path = `#/${moduleId}`
  const qs = serializeQuery(query)
  return `${origin}${base}/${path}${qs ? `?${qs}` : ''}`
}

/**
 * 把对象序列化为 URLSearchParams 字符串。
 *
 * 跳过空字符串与 nil；boolean → '1'/'0'；其余转为字符串；
 * 使用稳定排序（按 key 字典序），避免 query 顺序抖动导致二维码图样变化。
 */
export function serializeQuery(q?: ShareQuery): string {
  if (!q) return ''
  const params = new URLSearchParams()
  const keys = Object.keys(q).sort()
  for (const k of keys) {
    const v = q[k]
    if (v === null || v === undefined || v === '') continue
    params.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
  }
  return params.toString()
}

/**
 * 一个轻量的 query 反解：把 router/route.query（Record<string, string | string[]>）
 * 归一化为 Record<string, string>，便于模块端 hydrate 时无脑取值。
 *
 * 多值时只取第一个，避免 [v1, v2] 进入 schema 化字段（YYYY-MM-DD 类）。
 */
export function normalizeQuery(
  raw: Record<string, string | string[] | null | undefined> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {}
  if (!raw) return out
  for (const [k, v] of Object.entries(raw)) {
    if (v === null || v === undefined) continue
    out[k] = Array.isArray(v) ? (v[0] ?? '') : v
  }
  return out
}

/**
 * 帮助模块从 query 中读 number 字段并做合法范围校验，越界返回 fallback。
 *
 * 用于 year/month/day/hour 这类必须落在区间内的数值；避免 query 注入非法值后
 * 让模块在排盘时抛错或得出无意义结果。
 */
export function readIntInRange(
  q: Record<string, string>,
  key: string,
  min: number,
  max: number,
  fallback: number,
): number {
  const raw = q[key]
  if (raw === undefined) return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < min || n > max) return fallback
  return n
}
