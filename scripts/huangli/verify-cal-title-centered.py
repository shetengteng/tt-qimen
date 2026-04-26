"""
验证修复：黄历日历顶部 "2026 年 4 月 ▾" 文本在 mobile 下水平居中。

回归保证：desktop 不受影响（desktop 下 .hl-cal-title-btn 没有 flex:1，自然 shrink to content）。
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/#/huangli"
OUT = Path("design/screenshots/2026-04-25-cal-title-centered-fixed")
OUT.mkdir(parents=True, exist_ok=True)


def shoot(theme: str, vp_label: str, vp: dict) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport=vp, device_scale_factor=2)
        page = ctx.new_page()
        page.goto(URL, wait_until="domcontentloaded", timeout=15000)
        page.evaluate(
            f"""() => {{
              localStorage.setItem('tt-qimen:theme', '{theme}');
              localStorage.setItem('tt-qimen:locale', 'zh-CN');
            }}"""
        )
        page.reload(wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(800)
        page.locator(".hl-cal-title-btn").first.scroll_into_view_if_needed(timeout=8000)
        info = page.evaluate(
            """() => {
              const btn = document.querySelector('.hl-cal-title-btn');
              const r = btn.getBoundingClientRect();
              const range = document.createRange();
              range.selectNodeContents(btn);
              const innerRect = range.getBoundingClientRect();
              return {
                btn_cx: Math.round(r.x + r.width / 2),
                btn_w: Math.round(r.width),
                inner_cx: Math.round(innerRect.x + innerRect.width / 2),
                inner_w: Math.round(innerRect.width),
                offset: Math.round(innerRect.x + innerRect.width / 2 - (r.x + r.width / 2)),
              };
            }"""
        )
        out = OUT / f"{vp_label}-{theme}.png"
        page.locator(".hl-cal-head").screenshot(path=str(out))
        verdict = "OK" if abs(info["offset"]) <= 2 else "BAD"
        print(f"  [{verdict}] {vp_label}/{theme}: btn_cx={info['btn_cx']} btn_w={info['btn_w']} inner_cx={info['inner_cx']} inner_w={info['inner_w']} offset={info['offset']}px -> {out}")
        ctx.close()
        browser.close()


def main() -> int:
    for theme in ("guofeng", "minimal"):
        for vp_label, vp in (
            ("desktop", {"width": 1280, "height": 900}),
            ("mobile", {"width": 390, "height": 844}),
            ("mobile-narrow", {"width": 360, "height": 800}),
        ):
            shoot(theme, vp_label, vp)
    return 0


if __name__ == "__main__":
    main()
