"""
复现 bug：MonthYearPicker 中 Select 年下拉头部展示不全。
"""
from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path("design/screenshots/2026-04-25-year-select-head-bug")
OUT.mkdir(parents=True, exist_ok=True)

URL = "http://localhost:5180/#/huangli"


def set_theme(page, theme):
    page.evaluate("([t]) => { try { localStorage.setItem('tt-qimen:theme', t); } catch(e) {} }", [theme])


def shoot(page, name):
    p = OUT / f"{name}.png"
    page.screenshot(path=str(p), full_page=False)
    print(f"  -> {p}")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for vp_name, vp in (("desktop", {"width": 1280, "height": 900}), ("mobile", {"width": 390, "height": 844})):
            for theme in ("guofeng", "minimal"):
                ctx = browser.new_context(viewport=vp)
                page = ctx.new_page()
                page.goto(URL, wait_until="domcontentloaded", timeout=15000)
                set_theme(page, theme)
                page.reload(wait_until="domcontentloaded", timeout=15000)
                page.wait_for_timeout(1000)
                # 1. 打开 MonthYearPicker（点击 .hl-cal-title-btn）
                try:
                    page.locator(".hl-cal-title-btn").first.click(timeout=8000)
                    page.wait_for_timeout(500)
                    shoot(page, f"01-{vp_name}-{theme}-picker")
                except Exception as e:
                    print(f"  ! [{vp_name}/{theme}] open picker: {e}")
                    ctx.close()
                    continue
                # 2. 打开 Year SelectTrigger
                try:
                    page.locator(".hl-mp-select-trigger").first.click(timeout=5000)
                    page.wait_for_timeout(800)
                    shoot(page, f"02-{vp_name}-{theme}-year-open")
                except Exception as e:
                    print(f"  ! [{vp_name}/{theme}] open year: {e}")
                    ctx.close()
                    continue
                # 3. 探测 SelectContent 位置
                try:
                    info = page.evaluate("""() => {
                      const sc = document.querySelector('.hl-mp-select-content, [data-reka-select-content]');
                      if (!sc) return { error: 'no SelectContent' };
                      const r = sc.getBoundingClientRect();
                      const cs = getComputedStyle(sc);
                      return {
                        top: r.top, left: r.left, width: r.width, height: r.height,
                        zIndex: cs.zIndex, position: cs.position,
                        firstItem: sc.querySelector('[data-reka-select-item], [role="option"]')?.textContent?.trim() || null,
                        itemCount: sc.querySelectorAll('[role="option"], [data-reka-select-item]').length,
                      };
                    }""")
                    print(f"  [{vp_name}/{theme}] SelectContent: {info}")
                except Exception as e:
                    print(f"  ! probe: {e}")
                ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
