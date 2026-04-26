"""
精确探测 hl-cal-title-btn 内部"2026 年 4 月 ▾"文本节点的实际位置，
确认是否在 button 内部水平居中。
"""
from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/#/huangli"


def probe(theme: str) -> None:
    print(f"--- mobile / {theme} ---")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
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
              if (!btn) return { error: 'no btn' };
              const cs = getComputedStyle(btn);
              const r = btn.getBoundingClientRect();
              // 文字节点 = 第一个 child node（text node "2026 年 4 月"）
              const range = document.createRange();
              range.selectNodeContents(btn);
              const innerRect = range.getBoundingClientRect();
              const caret = btn.querySelector('.hl-cal-title-caret');
              const cr = caret ? caret.getBoundingClientRect() : null;
              return {
                btn: {
                  x: Math.round(r.x), w: Math.round(r.width), cx: Math.round(r.x + r.width/2),
                  display: cs.display,
                  justifyContent: cs.justifyContent,
                  textAlign: cs.textAlign,
                  flex: cs.flex,
                  paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight,
                },
                inner: {
                  x: Math.round(innerRect.x),
                  w: Math.round(innerRect.width),
                  cx: Math.round(innerRect.x + innerRect.width/2),
                },
                caret: cr ? { x: Math.round(cr.x), w: Math.round(cr.width) } : null,
              };
            }"""
        )
        print(f"  btn:    x={info['btn']['x']}, w={info['btn']['w']}, cx={info['btn']['cx']}")
        print(f"  btn css: display={info['btn']['display']}, justifyContent={info['btn']['justifyContent']}, textAlign={info['btn']['textAlign']}, flex={info['btn']['flex']}")
        print(f"  inner content: x={info['inner']['x']}, w={info['inner']['w']}, cx={info['inner']['cx']}")
        print(f"  caret: {info['caret']}")
        # 计算文字 cx 是否对齐 btn cx
        offset = info["inner"]["cx"] - info["btn"]["cx"]
        print(f"  >>> inner cx - btn cx = {offset}px (居中应为 0；负数=偏左，正数=偏右)")
        # 测左右内边距
        left_inner_gap = info["inner"]["x"] - info["btn"]["x"]
        right_inner_gap = (info["btn"]["x"] + info["btn"]["w"]) - (info["inner"]["x"] + info["inner"]["w"])
        print(f"  >>> 文字距 btn 左 {left_inner_gap}px / 距 btn 右 {right_inner_gap}px")
        ctx.close()
        browser.close()


def main() -> int:
    for theme in ("guofeng", "minimal"):
        probe(theme)


if __name__ == "__main__":
    main()
