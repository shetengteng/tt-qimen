import { computed, onBeforeUnmount, onMounted, watch, type Ref, type WatchSource } from 'vue'
import { useThemeStore } from '@/stores/theme'
import {
  clearSvg,
  fitSvg,
  scheduleDoubleRaf,
  svgNode,
} from '@/composables/useSvgDraw'
import type { PalaceKey } from '../types'

/**
 * Mirrors the prototype `drawRelations()` IIFE in
 * `design/prototypes/{guofeng,minimal}/ziwei.html`:
 *   - reads each `.palace[data-palace="<key>"]` rect inside the chart
 *   - draws a curved triangle connecting the 三方 (triad)
 *   - draws a straight line connecting 命宫 ↔ 对宫
 *   - toggles `.p-ming / .p-sanhe / .p-duigong` classes on the palace cells
 */

export interface ZiweiRelationsConfig {
  /** 主宫 key（命宫） */
  benming: PalaceKey
  /** 三合 key 列表（含命宫） */
  triad: PalaceKey[]
  /** 对宫 key */
  duigong: PalaceKey
}

interface InnerEdgePoint {
  x: number
  y: number
}

function innerEdgePoint(el: Element, host: HTMLElement, cx: number, cy: number, pad = 8): InnerEdgePoint {
  const r = el.getBoundingClientRect()
  const hostRect = host.getBoundingClientRect()
  const left = r.left - hostRect.left
  const top = r.top - hostRect.top
  const ecx = left + r.width / 2
  const ecy = top + r.height / 2
  const dx = cx - ecx
  const dy = cy - ecy
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: dx > 0 ? (left + r.width - pad) : (left + pad), y: ecy }
  }
  return { x: ecx, y: dy > 0 ? (top + r.height - pad) : (top + pad) }
}

export function drawZiweiRelations(
  chart: HTMLElement | null,
  svg: SVGElement | null,
  cfg: ZiweiRelationsConfig,
) {
  if (!chart || !svg) return

  clearSvg(svg)
  chart.querySelectorAll('.palace').forEach((p) => {
    p.classList.remove('p-ming', 'p-sanhe', 'p-duigong')
  })

  const { W, H } = fitSvg(svg, chart)
  const cx = W / 2
  const cy = H / 2

  const getPalace = (key: PalaceKey) =>
    chart.querySelector<HTMLElement>(`.palace[data-palace="${key}"]`)

  const triadPts: InnerEdgePoint[] = []
  cfg.triad.forEach((k) => {
    const el = getPalace(k)
    if (!el) return
    if (k === cfg.benming) el.classList.add('p-ming')
    else el.classList.add('p-sanhe')
    triadPts.push(innerEdgePoint(el, chart, cx, cy))
  })

  const oppEl = getPalace(cfg.duigong)
  if (oppEl) oppEl.classList.add('p-duigong')

  if (triadPts.length === 3) {
    const bend = (p1: InnerEdgePoint, p2: InnerEdgePoint) => {
      const mx = (p1.x + p2.x) / 2
      const my = (p1.y + p2.y) / 2
      const cpx = mx - (cx - mx) * 0.12
      const cpy = my - (cy - my) * 0.12
      return `Q${cpx},${cpy} ${p2.x},${p2.y}`
    }
    const d = `M${triadPts[0].x},${triadPts[0].y} ` +
      `${bend(triadPts[0], triadPts[1])} ` +
      `${bend(triadPts[1], triadPts[2])} ` +
      `${bend(triadPts[2], triadPts[0])}`

    svg.appendChild(svgNode('path', { class: 'line-sanhe', d }))
    triadPts.forEach((p) => {
      svg.appendChild(svgNode('circle', {
        class: 'dot-anchor',
        cx: p.x, cy: p.y, r: 4,
      }))
    })
  }

  if (oppEl) {
    const benEl = getPalace(cfg.benming)
    if (benEl) {
      const a = innerEdgePoint(benEl, chart, cx, cy)
      const b = innerEdgePoint(oppEl, chart, cx, cy)
      svg.appendChild(svgNode('path', {
        class: 'line-duigong',
        d: `M${a.x},${a.y} L${b.x},${b.y}`,
      }))
      ;[a, b].forEach((p) => {
        svg.appendChild(svgNode('circle', {
          class: 'dot-anchor opp',
          cx: p.x, cy: p.y, r: 3.5,
        }))
      })
    }
  }
}

export interface UseZiweiRelationsOptions {
  getChart: () => HTMLElement | null
  getSvg: () => SVGElement | null
  /**
   * 配置（命宫 / 三合 / 对宫）—— 接受 WatchSource，
   * 内部会 deep watch，命宫变化（例如重新排盘）将自动重画。
   */
  config: WatchSource<ZiweiRelationsConfig>
  /** 是否启用绘制 */
  enabled: Ref<boolean>
}

/** 把 WatchSource<T> 同步取值（支持 ref/getter/普通值，与 vue 内部一致的读法） */
function unwrap<T>(src: WatchSource<T>): T {
  if (typeof src === 'function') return (src as () => T)()
  const obj = src as unknown
  if (obj && typeof obj === 'object' && 'value' in (obj as Record<string, unknown>)) {
    return (obj as { value: T }).value
  }
  return src as T
}

export function useZiweiRelations(opts: UseZiweiRelationsOptions) {
  let ro: ResizeObserver | null = null

  // 主题切换需要重画 —— 国风 / 简约 SVG 样式不同，且布局尺寸可能微调
  const themeStore = useThemeStore()
  const themeId = computed(() => themeStore.id)

  function drawNow() {
    if (!opts.enabled.value) {
      const svg = opts.getSvg()
      const chart = opts.getChart()
      if (svg) clearSvg(svg)
      if (chart) {
        chart.querySelectorAll('.palace').forEach((p) => {
          p.classList.remove('p-ming', 'p-sanhe', 'p-duigong')
        })
      }
      return
    }
    drawZiweiRelations(opts.getChart(), opts.getSvg(), unwrap(opts.config))
  }

  function schedule() {
    scheduleDoubleRaf(drawNow)
  }

  /**
   * 同 useBaziDrawings.bootstrapDraw 的节奏：double-raf + 三个延迟兜底，
   * 因为 12 宫 grid 在 CollapsibleSection 折叠展开 / 字体异步加载 / theme 切换
   * 的多个时间点都可能引起尺寸抖动。
   */
  function bootstrapDraw() {
    schedule()
    window.setTimeout(schedule, 150)
    window.setTimeout(schedule, 700)
    window.setTimeout(schedule, 1400)
  }

  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(schedule)
      const chart = opts.getChart()
      if (chart) ro.observe(chart)
    }
    bootstrapDraw()
    window.addEventListener('resize', schedule)
  })

  onBeforeUnmount(() => {
    if (ro) ro.disconnect()
    window.removeEventListener('resize', schedule)
  })

  watch(opts.enabled, () => {
    schedule()
  })

  // 配置变化（命宫 / 三合 / 对宫）→ 重画
  watch(opts.config, () => {
    bootstrapDraw()
  }, { deep: true })

  // 主题切换 → 重画（带兜底节奏，等待 CSS 变量 / 字号渲染完）
  watch(themeId, () => {
    bootstrapDraw()
  })

  return { schedule, drawNow, bootstrapDraw }
}
