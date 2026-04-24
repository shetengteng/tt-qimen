import { ref } from 'vue'

/**
 * Skeleton-reveal flow used by paipan modules:
 *  - shows the skeleton overlay
 *  - waits `delay` ms (1500ms in the prototype)
 *  - flips a `revealed` flag to fade-in result-zone + result-banner
 *  - smooth-scrolls the banner into view (with a small offset hold)
 *
 * Returns reactive flags consumers can wire to v-bind:class.
 */
export interface UseSkeletonRevealOptions {
  delay?: number
  scrollOffset?: number
  scrollHoldMs?: number
  /**
   * Optional hook fired after `revealed` flips to true and *before* the scroll —
   * use it to schedule SVG draws (relations / connectors).
   */
  onReveal?: () => void
}

export function useSkeletonReveal(opts: UseSkeletonRevealOptions = {}) {
  const { delay = 1500, scrollOffset = 30, scrollHoldMs = 280, onReveal } = opts

  const skeletonVisible = ref(false)
  const revealed = ref(false)

  function scrollTo(el: HTMLElement | null, offset = 0) {
    if (!el || typeof window === 'undefined') return
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  function start(getBanner?: () => HTMLElement | null) {
    skeletonVisible.value = true
    window.setTimeout(() => {
      skeletonVisible.value = false
      revealed.value = true
      onReveal?.()
      window.setTimeout(() => scrollTo(getBanner?.() ?? null, scrollOffset), scrollHoldMs)
    }, delay)
  }

  function reset(getInputCard?: () => HTMLElement | null) {
    revealed.value = false
    scrollTo(getInputCard?.() ?? null, 80)
  }

  /**
   * 直接把 revealed 翻到 true，跳过 skeleton → reveal 的延迟。
   * 专为"从持久化快照恢复上一轮结果"这种无需仪式动画的场景准备。
   */
  function revealImmediately() {
    skeletonVisible.value = false
    revealed.value = true
  }

  return { skeletonVisible, revealed, start, reset, revealImmediately, scrollTo }
}
