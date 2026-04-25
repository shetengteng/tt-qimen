"""
探测黄历日历顶部 title row 的实际布局：
  [← 上月]   [2026 年 4 月 ▾]   [下月 →]

用户报告：mobile 下"年月文本没居中，靠左"。
查清是 flex 容器没居中、还是 prev/next 按钮宽度不等导致 trigger 视觉偏。
"""
from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/#/huangli"


def probe(theme: str, vp_label: str, vp: dict) -> None:
    print(f"--- {vp_label} / {theme} ---")
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
              const r = (el) => {
                if (!el) return null;
                const b = el.getBoundingClientRect();
                const cs = getComputedStyle(el);
                return {
                  x: Math.round(b.x), y: Math.round(b.y),
                  w: Math.round(b.width), h: Math.round(b.height),
                  cx: Math.round(b.x + b.width/2),
                  display: cs.display,
                  justifyContent: cs.justifyContent,
                  gap: cs.gap,
                  flex: cs.flex,
                };
              };
              const head = document.querySelector('.hl-cal-head');
              const headChildren = head ? Array.from(head.children) : [];
              const titleBtn = document.querySelector('.hl-cal-title-btn');
              return {
                viewport_cx: Math.round(window.innerWidth / 2),
                head: r(head),
                head_kids_count: headChildren.length,
                prev: r(headChildren[0]),
                prev_text: headChildren[0]?.textContent?.trim().slice(0, 40),
                middle: r(headChildren[1]),
                next: r(headChildren[2]),
                next_text: headChildren[2]?.textContent?.trim().slice(0, 40),
                titleBtn: r(titleBtn),
              };
            }"""
        )
        for k, v in info.items():
            print(f"  {k}: {v}")
        if info["head"] and info["titleBtn"]:
            head_cx = info["head"]["cx"]
            title_cx = info["titleBtn"]["cx"]
            print(f"  >>> titleBtn cx({title_cx}) - head cx({head_cx}) = {title_cx - head_cx}px (居中应为 0)")
            print(f"  >>> titleBtn cx({title_cx}) - viewport cx({info['viewport_cx']}) = {title_cx - info['viewport_cx']}px")
        if info["prev"] and info["next"] and info["titleBtn"]:
            left_gap = info["titleBtn"]["x"] - (info["prev"]["x"] + info["prev"]["w"])
            right_gap = info["next"]["x"] - (info["titleBtn"]["x"] + info["titleBtn"]["w"])
            print(f"  >>> prev w={info['prev']['w']} text='{info.get('prev_text')}' next w={info['next']['w']} text='{info.get('next_text')}'")
            print(f"  >>> titleBtn 左边距 prev: {left_gap}px / 右边距 next: {right_gap}px (差 {abs(left_gap - right_gap)}px)")
        ctx.close()
        browser.close()


def main() -> int:
    for theme in ("guofeng", "minimal"):
        for vp_label, vp in (("desktop", {"width": 1280, "height": 900}),
                              ("mobile", {"width": 390, "height": 844}),
                              ("mobile-narrow", {"width": 360, "height": 800})):
            probe(theme, vp_label, vp)
    return 0


if __name__ == "__main__":
    main()
