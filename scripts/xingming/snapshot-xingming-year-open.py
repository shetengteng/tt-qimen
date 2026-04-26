#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证姓名学出生年下拉打开后效果（关键尺寸 320 / 390 / 768，双主题，zh-CN/en）。"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import Page, sync_playwright

BASE_URL = "http://localhost:5180"
OUT_DIR = Path("design/screenshots/2026-04-25-xingming-year-open").resolve()

VIEWPORTS = [
    (320, 720),
    (390, 844),
    (768, 1024),
]


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


def shoot_year_open(page: Page, theme: str, lang: str, vp: tuple[int, int]) -> None:
    short_t = "guofeng" if theme == "guofeng" else "minimal"
    w, h = vp
    page.set_viewport_size({"width": w, "height": h})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme, lang)
    goto_xingming(page)
    page.wait_for_timeout(300)

    # 找到出生年的 SelectTrigger 并点击
    # SelectTrigger 内部 SelectValue 显示 placeholder/选中文本，点 trigger 展开 popover
    triggers = page.locator('button[role="combobox"]')
    cnt = triggers.count()
    print(f"  combobox count = {cnt}")
    if cnt == 0:
        print("  ⚠️  no combobox found, fallback to plain shot")
        page.screenshot(path=str(OUT_DIR / f"{short_t}-{lang}-w{w}-fallback.png"), full_page=True)
        return
    # 第一个就是出生年（NameInput 唯一一个 Select）
    triggers.nth(0).click()
    page.wait_for_timeout(400)
    out = OUT_DIR / f"{short_t}-{lang}-w{w}-year-open.png"
    page.screenshot(path=str(out), full_page=False)  # 视口截图，能看到 popover
    print(f"  ✓ {out.name}")


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"截图输出目录：{OUT_DIR}")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()

        for theme in ["guofeng", "minimal"]:
            for lang in ["zh-CN", "en"]:
                for vp in VIEWPORTS:
                    print(f"\n[{theme} / {lang} / {vp[0]}×{vp[1]}]")
                    shoot_year_open(page, theme, lang, vp)

        browser.close()
    print("\n✅ 完成")
    return 0


if __name__ == "__main__":
    sys.exit(main())
