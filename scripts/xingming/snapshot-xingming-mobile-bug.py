#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""姓名学移动端 BUG 调查 (2026-04-25)：多 viewport / 双主题 / 三语下截输入态全页 + 卡片裁剪。"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import Page, sync_playwright

BASE_URL = "http://localhost:5180"
OUT_DIR = Path("design/screenshots/2026-04-25-xingming-mobile-bug").resolve()

# 覆盖窄到宽的几个常见手机尺寸 + 平板边缘
VIEWPORTS = [
    (320, 720),   # iPhone SE 1st gen
    (360, 800),   # 中端安卓
    (390, 844),   # iPhone 14
    (414, 896),   # iPhone Plus / Max
    (480, 900),   # 大屏手机/小平板
    (768, 1024),  # 平板临界
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
    page.wait_for_timeout(400)


def goto_xingming(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/xingming'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(300)


def shoot(page: Page, theme: str, lang: str, vp: tuple[int, int]) -> None:
    short_t = "guofeng" if theme == "guofeng" else "minimal"
    w, h = vp
    page.set_viewport_size({"width": w, "height": h})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme, lang)
    goto_xingming(page)
    page.wait_for_timeout(300)
    out = OUT_DIR / f"{short_t}-{lang}-w{w}-input.png"
    page.screenshot(path=str(out), full_page=True)
    print(f"  ✓ {out.name}")


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"截图输出目录：{OUT_DIR}")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()

        # 移动端窄屏对比；少量桌面尺寸只取 zh-CN（验证不破坏桌面）
        for theme in ["guofeng", "minimal"]:
            for lang in ["zh-CN", "en"]:
                for vp in VIEWPORTS:
                    print(f"\n[{theme} / {lang} / {vp[0]}×{vp[1]}]")
                    shoot(page, theme, lang, vp)

        browser.close()
    print("\n✅ 完成")
    return 0


if __name__ == "__main__":
    sys.exit(main())
