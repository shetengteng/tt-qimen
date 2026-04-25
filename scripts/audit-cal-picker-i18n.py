#!/usr/bin/env python3
"""快速截图 zh-TW / en 下年月选择器 + 黄道识别度。"""
from __future__ import annotations
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"
OUT = Path(__file__).resolve().parent.parent / "design" / "screenshots" / "2026-04-25-cal-i18n"


def shoot(theme: str, locale: str) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=2)
        page = ctx.new_page()
        page.add_init_script(
            f"localStorage.setItem('tt-qimen:theme', '{theme}');"
            f"localStorage.setItem('tt-qimen:locale', '{locale}');"
        )
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_selector(".hl-cal", timeout=15_000)
        page.wait_for_timeout(400)

        # 先截日历
        page.locator(".hl-cal").screenshot(path=str(OUT / f"{theme}-{locale}-cal.png"))

        # 打开 picker
        page.locator(".hl-cal-head button").nth(1).click()
        page.wait_for_selector(".hl-mp-content", timeout=3_000)
        page.wait_for_timeout(200)
        page.screenshot(path=str(OUT / f"{theme}-{locale}-picker.png"))

        ctx.close()
        browser.close()


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for theme in ['guofeng', 'minimal']:
        for locale in ['zh-TW', 'en']:
            shoot(theme, locale)
    print(f"saved to {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
