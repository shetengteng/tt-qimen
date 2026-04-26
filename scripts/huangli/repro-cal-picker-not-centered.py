"""
复现：用户报告 "日历选择的没有居中"。

可能歧义：
  A. MonthYearPicker 的 popover 相对 ".hl-cal-title-btn"（trigger）没居中
  B. 内部 Year/Month Select 下拉相对各自 ".hl-mp-select-trigger" 没居中
  C. trigger 文字本身在按钮里没水平居中（小可能）

策略：
  - 双主题、桌面 + 移动 viewport
  - 截图 1：仅打开 MonthYearPicker（看 A）
  - 截图 2：再打开内部 year Select（看 B）
  - 同时打印 bounding rect 计算左右间距对比
"""
from __future__ import annotations
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/#/huangli"
OUT = Path("design/screenshots/2026-04-25-cal-picker-not-centered")
OUT.mkdir(parents=True, exist_ok=True)


def measure(page, label: str) -> None:
    """打印 trigger 与下拉的左右间距，判断是否居中。"""
    info = page.evaluate(
        """() => {
          const titleBtn = document.querySelector('.hl-cal-title-btn');
          const popover = document.querySelector('.hl-mp-content');
          const ySelTrig = document.querySelectorAll('.hl-mp-select-trigger')[0];
          const sc = document.querySelector('[data-slot="select-content"]');
          const r = (el) => {
            if (!el) return null;
            const b = el.getBoundingClientRect();
            return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), cx: Math.round(b.x + b.width/2) };
          };
          return {
            titleBtn: r(titleBtn),
            popover: r(popover),
            ySelTrig: r(ySelTrig),
            selectContent: r(sc),
          };
        }"""
    )
    print(f"  [{label}]")
    print(f"    titleBtn:      {info['titleBtn']}")
    print(f"    popover:       {info['popover']}")
    if info["titleBtn"] and info["popover"]:
        diff = info["popover"]["cx"] - info["titleBtn"]["cx"]
        print(f"    popover cx - titleBtn cx = {diff}px (居中应为 0)")
    print(f"    ySelTrig:      {info['ySelTrig']}")
    print(f"    selectContent: {info['selectContent']}")
    if info["ySelTrig"] and info["selectContent"]:
        diff2 = info["selectContent"]["cx"] - info["ySelTrig"]["cx"]
        print(f"    selectContent cx - ySelTrig cx = {diff2}px (居中应为 0)")


def shoot(theme: str, vp_label: str, vp: dict) -> None:
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
        # 截图 A：仅 picker
        a_path = OUT / f"{vp_label}-{theme}-A-picker-only.png"
        page.screenshot(path=str(a_path), full_page=False)
        measure(page, "A: picker open (no select)")
        print(f"    -> {a_path}")

        # 截图 B：再点开 year select
        page.locator(".hl-mp-select-trigger").first.click(timeout=5000)
        page.wait_for_timeout(600)
        b_path = OUT / f"{vp_label}-{theme}-B-year-select-open.png"
        page.screenshot(path=str(b_path), full_page=False)
        measure(page, "B: picker + year select open")
        print(f"    -> {b_path}")

        ctx.close()
        browser.close()


def main() -> int:
    for theme in ("guofeng", "minimal"):
        shoot(theme, "desktop", {"width": 1280, "height": 900})
        shoot(theme, "mobile", {"width": 390, "height": 844})
    return 0


if __name__ == "__main__":
    sys.exit(main())
