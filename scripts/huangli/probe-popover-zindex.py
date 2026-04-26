"""
探测 popover 和 SelectContent 的 z-index / portal 嵌套关系。
"""
from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/#/huangli"


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(URL, wait_until="domcontentloaded", timeout=15000)
        page.evaluate("() => localStorage.setItem('tt-qimen:theme', 'guofeng')")
        page.reload(wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(800)
        page.locator(".hl-cal-title-btn").first.click(timeout=8000)
        page.wait_for_timeout(400)
        page.locator(".hl-mp-select-trigger").first.click(timeout=5000)
        page.wait_for_timeout(800)
        info = page.evaluate("""() => {
          const popover = document.querySelector('.hl-mp-content');
          const popoverWrapper = popover?.closest('[data-reka-popper-content-wrapper]');
          const sc = document.querySelector('[data-slot="select-content"]');
          const scWrapper = sc?.closest('[data-reka-popper-content-wrapper]');
          const inspect = (el, label) => el ? {
            label,
            tag: el.tagName,
            class: el.className,
            zIndex: getComputedStyle(el).zIndex,
            position: getComputedStyle(el).position,
            transform: getComputedStyle(el).transform,
            rect: el.getBoundingClientRect(),
          } : null;
          return {
            popover: inspect(popover, 'popover'),
            popoverWrapper: inspect(popoverWrapper, 'popoverWrapper'),
            sc: inspect(sc, 'sc'),
            scWrapper: inspect(scWrapper, 'scWrapper'),
            // 顺便看下页面上所有 popper-content-wrapper 的顺序
            wrappers: Array.from(document.querySelectorAll('[data-reka-popper-content-wrapper]')).map((w, i) => ({
              i, zIndex: getComputedStyle(w).zIndex, child: w.firstElementChild?.className || '?',
            })),
          };
        }""")
        for k, v in info.items():
            print(f"  {k}: {v}")
        ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
