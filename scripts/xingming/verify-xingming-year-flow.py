#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""端到端验证：选不同出生年（未指定 / 1995）后点击「五格推演」，确认结果页正常出现。"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import Page, sync_playwright

BASE_URL = "http://localhost:5180"
OUT_DIR = Path("design/screenshots/2026-04-25-xingming-year-flow").resolve()


def reset(page: Page, theme: str, lang: str) -> None:
    page.evaluate(
        f"""() => {{
            localStorage.setItem('tt-qimen:locale', '{lang}');
            localStorage.setItem('tt-qimen:theme', '{theme}');
        }}"""
    )
    page.evaluate("() => window.location.reload()")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(500)


def go(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/xingming'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(400)


def select_year(page: Page, year_label: str) -> None:
    """打开 year select 并选指定年份选项（label 文本匹配）。"""
    triggers = page.locator('button[role="combobox"]')
    triggers.nth(0).click()
    page.wait_for_timeout(300)
    # reka-ui Popover 渲染到 body，可用 role=option 或文本定位
    item = page.locator(f'div[role="option"]:has-text("{year_label}")').first
    item.click()
    page.wait_for_timeout(200)


def click_calc_and_capture(page: Page, label: str, suffix: str) -> bool:
    btn = page.locator(".ds-input-actions button").first
    btn.click()
    try:
        page.wait_for_selector(".result-banner.revealed", timeout=5_000)
    except Exception as e:
        print(f"  ❌ {suffix} 计算后未出现 result-banner: {e}")
        page.screenshot(path=str(OUT_DIR / f"FAIL-{suffix}.png"), full_page=True)
        return False
    page.wait_for_timeout(800)
    out = OUT_DIR / f"OK-{suffix}.png"
    page.screenshot(path=str(out), full_page=True)
    print(f"  ✓ {suffix}: {out.name}")
    return True


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"输出目录：{OUT_DIR}")
    ok = True
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 390, "height": 844})
        page = ctx.new_page()

        # case A: 未指定（默认）→ 计算
        print("\n[case A] 未指定 (default) → 五格推演")
        page.goto(BASE_URL, wait_until="networkidle")
        reset(page, "minimal", "zh-CN")
        go(page)
        ok &= click_calc_and_capture(page, "default", "A-unspecified")

        # case B: 选 1995 → 计算
        print("\n[case B] 选 1995 → 五格推演")
        page.goto(BASE_URL, wait_until="networkidle")
        reset(page, "minimal", "zh-CN")
        go(page)
        select_year(page, "1995")
        ok &= click_calc_and_capture(page, "1995", "B-year-1995")

        # case C: 国风 + 选 2000
        print("\n[case C] guofeng + 选 2000 → 五格推演")
        page.goto(BASE_URL, wait_until="networkidle")
        reset(page, "guofeng", "zh-CN")
        go(page)
        select_year(page, "2000")
        ok &= click_calc_and_capture(page, "2000", "C-guofeng-2000")

        browser.close()
    print("\n" + ("✅ 全部 PASS" if ok else "❌ 有失败"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
