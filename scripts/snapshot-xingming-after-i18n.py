#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""姓名学模块 i18n 修复后截图：覆盖 2 主题 × 3 语言 × (输入态/结果态) × 桌面/移动。"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import Page, sync_playwright

BASE_URL = "http://localhost:5180"
OUT_DIR = Path("design/screenshots/2026-04-25-xingming-i18n-final").resolve()


def reset_state(page: Page, theme: str, lang: str) -> None:
    page.evaluate(
        f"""() => {{
            localStorage.setItem('tt-qimen:locale', '{lang}');
            localStorage.setItem('tt-qimen:theme', '{theme}');
        }}"""
    )
    page.evaluate("() => window.location.reload()")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(400)


def goto_xingming(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/xingming'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(300)


def click_calculate(page: Page) -> None:
    btn = page.locator(".ds-input-actions button").first
    btn.wait_for(state="visible", timeout=5_000)
    btn.click()
    page.wait_for_selector(".result-banner.revealed", timeout=4_000)
    page.wait_for_timeout(400)


def shot(page: Page, name: str, full: bool = False) -> None:
    out = OUT_DIR / f"{name}.png"
    page.screenshot(path=str(out), full_page=full)
    print(f"  ✓ {out.name}")


def shoot_desktop(page: Page, theme: str, lang: str) -> None:
    short_t = "guofeng" if theme == "guofeng" else "minimal"
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme, lang)
    goto_xingming(page)
    click_calculate(page)
    shot(page, f"desktop-{short_t}-{lang}-result", full=True)


def shoot_mobile(page: Page, theme: str, lang: str) -> None:
    short_t = "guofeng" if theme == "guofeng" else "minimal"
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme, lang)
    goto_xingming(page)
    click_calculate(page)
    shot(page, f"mobile-{short_t}-{lang}-result", full=True)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"截图输出目录：{OUT_DIR}")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()

        for theme in ["guofeng", "minimal"]:
            for lang in ["zh-CN", "zh-TW", "en"]:
                print(f"\n[desktop] theme={theme} lang={lang}")
                shoot_desktop(page, theme, lang)

        for theme in ["guofeng", "minimal"]:
            for lang in ["zh-CN", "zh-TW", "en"]:
                print(f"\n[mobile] theme={theme} lang={lang}")
                shoot_mobile(page, theme, lang)

        browser.close()
    print("\n✅ 完成")
    return 0


if __name__ == "__main__":
    sys.exit(main())
