#!/usr/bin/env python3
"""审计黄历模块所有弹框的头部展示是否截断。

弹框清单：
  1. DayDetailDialog（点击日历某日触发）
  2. SolarTermDialog（点击节气日触发）
  3. MonthYearPicker（不是 dialog 而是 popover，但也算"弹框"）

输出：
  design/screenshots/2026-04-25-dialog-header/
    {theme}-{locale}-{dialog}.png
"""
from __future__ import annotations
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"
OUT = Path(__file__).resolve().parent.parent / "design" / "screenshots" / "2026-04-25-dialog-header"


def shoot(theme: str, locale: str, viewport: dict, label: str) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport=viewport, device_scale_factor=2)
        page = ctx.new_page()
        page.add_init_script(
            f"localStorage.setItem('tt-qimen:theme', '{theme}');"
            f"localStorage.setItem('tt-qimen:locale', '{locale}');"
        )
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_selector(".hl-cal", timeout=15_000)
        page.wait_for_timeout(400)

        slug = f"{theme}-{locale}-{label}"

        # 1) 点击普通日（如 25 即今日）→ DayDetailDialog
        # 寻找今日 cell
        page.evaluate("""
        () => {
          const today = document.querySelector('.hl-cal-day.is-today');
          if (today) today.click();
        }
        """)
        page.wait_for_selector(".jm-dialog-content", timeout=3_000)
        page.wait_for_timeout(300)
        # 整体截图
        page.screenshot(path=str(OUT / f"{slug}-day-detail.png"))
        # 头部局部截图
        head = page.locator('.jm-dialog-head').first
        head_box = head.bounding_box()
        if head_box:
            page.screenshot(
                path=str(OUT / f"{slug}-day-detail-head.png"),
                clip={
                    "x": max(0, head_box["x"] - 6),
                    "y": max(0, head_box["y"] - 6),
                    "width": head_box["width"] + 12,
                    "height": head_box["height"] + 12,
                }
            )
        # 关闭
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)

        # 2) 点击节气日（清明 = 4月5日）→ SolarTermDialog
        page.evaluate("""
        () => {
          const days = Array.from(document.querySelectorAll('.hl-cal-day.is-solar-term'));
          if (days.length) days[0].click();
        }
        """)
        page.wait_for_selector(".jm-dialog-content", timeout=3_000)
        page.wait_for_timeout(300)
        page.screenshot(path=str(OUT / f"{slug}-solar-term.png"))
        head = page.locator('.jm-dialog-head').first
        head_box = head.bounding_box()
        if head_box:
            page.screenshot(
                path=str(OUT / f"{slug}-solar-term-head.png"),
                clip={
                    "x": max(0, head_box["x"] - 6),
                    "y": max(0, head_box["y"] - 6),
                    "width": head_box["width"] + 12,
                    "height": head_box["height"] + 12,
                }
            )
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)

        # 3) MonthYearPicker
        page.locator('.hl-cal-head button').nth(1).click()
        page.wait_for_selector('.hl-mp-content', timeout=3_000)
        page.wait_for_timeout(200)
        page.screenshot(path=str(OUT / f"{slug}-picker.png"))

        ctx.close()
        browser.close()


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    # Desktop + Mobile 双分辨率，三语 × 双主题
    desktop = {"width": 1280, "height": 900}
    mobile = {"width": 390, "height": 844}

    for theme in ['guofeng', 'minimal']:
        for locale in ['zh-CN', 'zh-TW', 'en']:
            shoot(theme, locale, desktop, "desktop")
            shoot(theme, locale, mobile, "mobile")

    print(f"saved to {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
