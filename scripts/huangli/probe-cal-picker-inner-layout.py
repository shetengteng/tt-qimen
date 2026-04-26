"""
精确探测 MonthYearPicker 内部布局：
  - popover 容器
  - row（两个 field 容器）
  - 两个 field
  - 两个 select-trigger
  - actions 区域
  - 两个 action button

确认是否有不对称的 padding / margin。
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
        page.locator(".hl-cal-title-btn").first.click(timeout=8000)
        page.wait_for_timeout(500)
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
                  pl: cs.paddingLeft, pr: cs.paddingRight,
                  ml: cs.marginLeft, mr: cs.marginRight,
                  gap: cs.gap,
                  display: cs.display,
                  justifyContent: cs.justifyContent,
                };
              };
              const popover = document.querySelector('.hl-mp-content');
              const row = document.querySelector('.hl-mp-row');
              const fields = document.querySelectorAll('.hl-mp-field');
              const labels = document.querySelectorAll('.hl-mp-label');
              const trigs = document.querySelectorAll('.hl-mp-select-trigger');
              const actions = document.querySelector('.hl-mp-actions');
              const actionBtns = document.querySelectorAll('.hl-mp-action');
              return {
                popover: r(popover),
                row: r(row),
                field_year: r(fields[0]),
                field_month: r(fields[1]),
                trig_year: r(trigs[0]),
                trig_month: r(trigs[1]),
                actions: r(actions),
                action_today: r(actionBtns[0]),
                action_confirm: r(actionBtns[1]),
              };
            }"""
        )
        for k, v in info.items():
            print(f"  {k}: {v}")
        # 关键诊断：两个 field 是否相对 popover 中线对称
        if info["popover"] and info["field_year"] and info["field_month"]:
            pop_cx = info["popover"]["cx"]
            year_cx = info["field_year"]["cx"]
            month_cx = info["field_month"]["cx"]
            year_dist = pop_cx - year_cx
            month_dist = month_cx - pop_cx
            print(f"  >>> field_year 距 popover 中线: {year_dist}px (应 = -{year_dist}px 才对称)")
            print(f"  >>> field_month 距 popover 中线: {month_dist}px")
            print(f"  >>> 不对称量: {abs(year_dist - month_dist)}px")
        ctx.close()
        browser.close()


def main() -> int:
    for theme in ("guofeng", "minimal"):
        for vp_label, vp in (("desktop", {"width": 1280, "height": 900}),
                              ("mobile", {"width": 390, "height": 844})):
            probe(theme, vp_label, vp)
    return 0


if __name__ == "__main__":
    main()
