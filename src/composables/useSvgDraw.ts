/**
 * Tiny helpers for drawing SVG inside Vue components.
 *
 * These are intentionally framework-agnostic — they take raw element refs
 * (the parent `<svg>` and `host` containers) and read DOM rects, mirroring the
 * behaviour of the prototype scripts so the UI matches pixel-for-pixel.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

export function svgNode(name: string, attrs: Record<string, string | number>, text?: string) {
  const n = document.createElementNS(SVG_NS, name)
  Object.keys(attrs).forEach((k) => n.setAttribute(k, String(attrs[k])))
  if (text != null) n.textContent = text
  return n
}

export function clearSvg(svg: SVGElement) {
  while (svg.firstChild) svg.removeChild(svg.firstChild)
}

export function fitSvg(svg: SVGElement, host: HTMLElement) {
  const W = host.clientWidth
  const H = host.clientHeight
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.setAttribute('width', String(W))
  svg.setAttribute('height', String(H))
  return { W, H }
}

export interface CellRect {
  cx: number
  cy: number
  left: number
  right: number
  top: number
  bottom: number
}

export function rectRelativeTo(el: Element, host: HTMLElement): CellRect {
  const r = el.getBoundingClientRect()
  const hostRect = host.getBoundingClientRect()
  return {
    cx: r.left - hostRect.left + r.width / 2,
    cy: r.top - hostRect.top + r.height / 2,
    left: r.left - hostRect.left,
    right: r.right - hostRect.left,
    top: r.top - hostRect.top,
    bottom: r.bottom - hostRect.top,
  }
}

/** Run `fn` on the next paint, twice — gives layout time to settle. */
export function scheduleDoubleRaf(fn: () => void) {
  if (typeof requestAnimationFrame === 'undefined') {
    fn()
    return
  }
  requestAnimationFrame(() => requestAnimationFrame(fn))
}
