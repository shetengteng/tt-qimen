#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""综合评分 + 模块宽度统一 验证截图（最终版）。

覆盖：
  双主题 × 三语 × 桌面 result-full + share-card 局部
  双主题 × 双语 (zh-CN/en) × 移动 result

对比 design/screenshots/2026-04-26-xingming-gauge-audit/（仅双主题 zh-CN，定位用）
完整覆盖 → design/screenshots/2026-04-26-xingming-gauge-final/

关注点：
  1. polygon 锥形指针 vs 旧菱形指针
  2. 60/75/90 tick-mark 已彻底消失
  3. 4 个主模块（字拆解 / 五格 / 三才 / 综评）左右边沿对齐 (820px)
"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import Page, sync_playwright

BASE_URL = "http://localhost:5180"
OUT_DIR = Path("design/screenshots/2026-04-26-xingming-gauge-final").resolve()


def reset_state(page: Page, theme: str, lang: str) -> None:
    page.evaluate(
        f"""() => {{
            localStorage.setItem('tt-qimen:locale', '{lang}');
            localStorage.setItem('tt-qimen:theme', '{theme}');
        }}"""
    )
    page.evaluate("() => window.location.reload()")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(500)


def goto_xingming(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/xingming'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(400)


def click_calculate(page: Page) -> None:
    btn = page.locator(".ds-input-actions button").first
    btn.wait_for(state="visible", timeout=5_000)
    btn.click()
    page.wait_for_selector(".result-banner.revealed", timeout=6_000)
    page.wait_for_timeout(1_500)


def shot_full(page: Page, name: str) -> None:
    out = OUT_DIR / f"{name}.png"
    page.screenshot(path=str(out), full_page=True)
    print(f"  [OK] {out.name}")


def shot_element(page: Page, selector: str, name: str) -> None:
    out = OUT_DIR / f"{name}.png"
    el = page.locator(selector).first
    el.wait_for(state="visible", timeout=3_000)
    el.screenshot(path=str(out))
    print(f"  [OK] {out.name}  ({selector})")


def shoot_desktop(page: Page, theme: str, lang: str) -> None:
    short_t = "guofeng" if theme == "guofeng" else "minimal"
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme, lang)
    goto_xingming(page)
    click_calculate(page)
    shot_full(page, f"desktop-{short_t}-{lang}-result")
    shot_element(page, ".xm-score-card", f"desktop-{short_t}-{lang}-score-card")


def shoot_mobile(page: Page, theme: str, lang: str) -> None:
    short_t = "guofeng" if theme == "guofeng" else "minimal"
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme, lang)
    goto_xingming(page)
    click_calculate(page)
    shot_full(page, f"mobile-{short_t}-{lang}-result")


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
            for lang in ["zh-CN", "en"]:
                print(f"\n[mobile] theme={theme} lang={lang}")
                shoot_mobile(page, theme, lang)

        browser.close()
    print("\n[OK] DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
