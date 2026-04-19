import { onBeforeUnmount, onMounted } from 'vue'
import {
  clearSvg,
  fitSvg,
  rectRelativeTo,
  scheduleDoubleRaf,
  svgNode,
} from '@/composables/useSvgDraw'

export interface BaziArc {
  type: 'chong' | 'zixing' | 'anhe'
  from: number
  to: number
  label: string
  /** 关系图例中跟在 `label` 后的可选描述。
   * 简约原型用括号补充上下文（如 "子午相冲（年支 ↔ 日支，主动荡）"），
   * 国风原型则只显示简短的 `label`。 */
  desc?: string
  /** 'up' = 弧线向上拱（向天干行）· 'down' = 弧线向下拱（向藏干行） */
  dir: 'up' | 'down'
}

export interface RelationsConfig {
  arcs: BaziArc[]
  /** stack offset between sibling arcs in the same direction */
  stackGap?: number
  /** padding from the character side edge to the arc endpoint */
  sidePad?: number
  /** endpoint dot radius */
  dotR?: number
  /** label distance outside the arc apex */
  labelOut?: number
  /** apex distance from cy for the first arc */
  baseBump?: number
}

const DEFAULT_RELATIONS_CFG: Required<Omit<RelationsConfig, 'arcs'>> = {
  stackGap: 14,
  sidePad: 4,
  dotR: 3.2,
  labelOut: 8,
  baseBump: 14,
}

/**
 * Mirrors `drawBaziRelations` in the prototype:
 *  - reads each `.bazi-cell-zhi` rect inside the table
 *  - draws arcs anchored to the matching characters
 *  - stacks sibling arcs in the same direction with `stackGap`
 */
export function drawBaziRelations(
  svg: SVGElement | null,
  table: HTMLElement | null,
  cfg: RelationsConfig,
) {
  if (!svg || !table) return
  const host = svg.parentElement
  if (!host) return

  const merged = { ...DEFAULT_RELATIONS_CFG, ...cfg }
  fitSvg(svg, host)
  clearSvg(svg)

  const zhiCells = table.querySelectorAll('.bazi-table-grid .bazi-cell .bazi-cell-zhi')
  if (zhiCells.length < 4) return

  const zhiPos = Array.from(zhiCells).map((el) => rectRelativeTo(el, host))

  let upStack = 0
  let downStack = 0

  cfg.arcs.forEach((arc) => {
    const a = zhiPos[arc.from]
    const b = zhiPos[arc.to]
    if (!a || !b) return

    const L = a.cx < b.cx ? a : b
    const R = a.cx < b.cx ? b : a

    const startX = L.right + merged.sidePad
    const endX = R.left - merged.sidePad
    const midX = (startX + endX) / 2
    const startY = L.cy
    const endY = R.cy
    const midCy = (startY + endY) / 2

    let ctrlY: number
    let labelY: number
    if (arc.dir === 'up') {
      ctrlY = midCy - merged.baseBump - upStack
      labelY = ctrlY - merged.labelOut + 1
      upStack += merged.stackGap
    } else {
      ctrlY = midCy + merged.baseBump + downStack
      labelY = ctrlY + merged.labelOut - 1
      downStack += merged.stackGap
    }

    const d = `M${startX},${startY} Q${midX},${ctrlY} ${endX},${endY}`

    svg.appendChild(svgNode('path', {
      class: `bazi-relation-line ${arc.type}`,
      d,
    }))

    svg.appendChild(svgNode('circle', {
      class: `bazi-relation-dot ${arc.type}`,
      cx: startX, cy: startY, r: merged.dotR,
    }))
    svg.appendChild(svgNode('circle', {
      class: `bazi-relation-dot ${arc.type}`,
      cx: endX, cy: endY, r: merged.dotR,
    }))

    svg.appendChild(svgNode('text', {
      class: `bazi-relation-label ${arc.type}`,
      x: midX,
      y: labelY,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
    }, arc.label))
  })
}

/**
 * Mirrors `drawFortuneConnectors` in the prototype — draws subway-style
 * connectors between `.decade` cards inside `.fortune-track`:
 *   - same row → horizontal dashed line on the row centre
 *   - cross row → completed U-shape with rounded corners + arrow marker
 */
export function drawFortuneConnectors(
  svg: SVGElement | null,
  track: HTMLElement | null,
) {
  if (!svg || !track) return
  const host = svg.parentElement
  if (!host) return

  const cards = Array.from(track.querySelectorAll<HTMLElement>('.decade'))
  if (!cards.length) return

  fitSvg(svg, host)
  clearSvg(svg)

  const items = cards.map((el, i) => ({ el, i, ...rectRelativeTo(el, host) }))

  const rowBuckets: { anchor: number; items: typeof items }[] = []
  items.forEach((it) => {
    let placed = false
    for (let r = 0; r < rowBuckets.length; r++) {
      if (Math.abs(rowBuckets[r].anchor - it.top) < 30) {
        rowBuckets[r].items.push(it)
        placed = true
        break
      }
    }
    if (!placed) rowBuckets.push({ anchor: it.top, items: [it] })
  })
  rowBuckets.sort((a, b) => a.anchor - b.anchor)

  const rowCenterY: Record<number, number> = {}
  rowBuckets.forEach((b, idx) => {
    const sum = b.items.reduce((s, it) => s + (it.top + it.bottom) / 2, 0)
    rowCenterY[idx] = sum / b.items.length
    b.items.forEach((it) => ((it as any).rowKey = idx))
  })

  for (let i = 0; i < items.length - 1; i++) {
    const a = items[i] as typeof items[number] & { rowKey: number }
    const b = items[i + 1] as typeof items[number] & { rowKey: number }
    const sameRow = a.rowKey === b.rowKey

    if (sameRow) {
      const y = rowCenterY[a.rowKey]
      svg.appendChild(svgNode('line', {
        x1: a.right + 2, y1: y, x2: b.left - 2, y2: y,
        class: 'track-line',
      }))
    } else {
      const aBottom = a.bottom + 4
      const bTop = b.top - 4
      const midY = (aBottom + bTop) / 2
      const R = 10

      const goLeft = b.cx < a.cx
      const hStartX = goLeft ? a.cx - R : a.cx + R
      const hEndX = goLeft ? b.cx + R : b.cx - R

      const d = [
        'M', a.cx, aBottom,
        'L', a.cx, midY - R,
        'Q', a.cx, midY, hStartX, midY,
        'L', hEndX, midY,
        'Q', b.cx, midY, b.cx, midY + R,
        'L', b.cx, bTop,
      ].join(' ')

      svg.appendChild(svgNode('path', { d, class: 'track-wrap' }))

      svg.appendChild(svgNode('polygon', {
        points: `${b.cx - 5},${bTop - 2} ${b.cx + 5},${bTop - 2} ${b.cx},${bTop + 6}`,
        class: 'track-arrow',
      }))
    }
  }
}

/**
 * Convenience wrapper — wires double-raf scheduling, ResizeObserver and the
 * window resize listener around the two draw passes.
 *
 * Pass a getter for each ref so the composable can re-read after Vue swaps
 * dom on theme change.
 */
export interface UseBaziDrawingsOptions {
  getRelationsSvg: () => SVGElement | null
  getRelationsTable: () => HTMLElement | null
  relationsArcs: () => BaziArc[]
  getConnectorsSvg: () => SVGElement | null
  getConnectorsTrack: () => HTMLElement | null
}

export function useBaziDrawings(opts: UseBaziDrawingsOptions) {
  let ro: ResizeObserver | null = null

  function drawAll() {
    drawBaziRelations(opts.getRelationsSvg(), opts.getRelationsTable(), { arcs: opts.relationsArcs() })
    drawFortuneConnectors(opts.getConnectorsSvg(), opts.getConnectorsTrack())
  }

  function schedule() {
    scheduleDoubleRaf(drawAll)
  }

  onMounted(() => {
    schedule()
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(schedule)
      const t = opts.getRelationsTable()
      const c = opts.getConnectorsTrack()
      if (t) ro.observe(t)
      if (c) ro.observe(c)
    }
    window.addEventListener('resize', schedule)
  })

  onBeforeUnmount(() => {
    if (ro) ro.disconnect()
    window.removeEventListener('resize', schedule)
  })

  return { drawAll, schedule }
}
