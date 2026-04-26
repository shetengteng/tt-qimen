"""
探测 SelectContent 内部 ScrollUp/Down 按钮 DOM 状态。
"""
from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/#/huangli"


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for vp_name, vp in (("desktop", {"width": 1280, "height": 900}), ("mobile", {"width": 390, "height": 844})):
            ctx = browser.new_context(viewport=vp)
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
              const sc = document.querySelector('[data-slot="select-content"]');
              if (!sc) return { error: 'no SelectContent' };
              const up = sc.querySelector('[data-slot="select-scroll-up-button"]');
              const down = sc.querySelector('[data-slot="select-scroll-down-button"]');
              const mk = (el) => el ? {
                inDom: true,
                offsetParent: !!el.offsetParent,
                rect: el.getBoundingClientRect(),
                display: getComputedStyle(el).display,
                visibility: getComputedStyle(el).visibility,
                opacity: getComputedStyle(el).opacity,
                attrs: Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' '),
              } : { inDom: false };
              const vp = sc.querySelector('[data-position]');
              const vpRect = vp ? vp.getBoundingClientRect() : null;
              return {
                content: { rect: sc.getBoundingClientRect(), display: getComputedStyle(sc).display, overflow: getComputedStyle(sc).overflow, maxHeight: getComputedStyle(sc).maxHeight },
                viewport: { rect: vpRect, scrollTop: vp?.scrollTop, scrollHeight: vp?.scrollHeight, clientHeight: vp?.clientHeight },
                upBtn: mk(up),
                downBtn: mk(down),
              };
            }""")
            print(f"\n[{vp_name}]")
            for k, v in info.items():
                print(f"  {k}: {v}")
            ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
