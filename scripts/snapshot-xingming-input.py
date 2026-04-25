#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""姓名学输入卡 BUG 调查截图：覆盖 2 主题 × 3 语言 × (空态/聚焦/下拉展开/移动) 共多张。"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import Page, sync_playwright

BASE_URL = "http://localhost:5180"
OUT_DIR = Path("design/screenshots/2026-04-25-xingming-input-bug").resolve()


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


def shot(page: Page, name: str, full: bool = False) -> None:
    out = OUT_DIR / f"{name}.png"
    page.screenshot(path=str(out), full_page=full)
    print(f"  ✓ {out.name}")


def shoot_all(page: Page, theme: str, lang: str, viewport: tuple[int, int]) -> None:
    short_t = "guofeng" if theme == "guofeng" else "minimal"
    w, h = viewport
    page.set_viewport_size({"width": w, "height": h})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme, lang)
    goto_xingming(page)
    page.wait_for_timeout(300)

    # 1) 空态：截整个 input card（聚焦表单卡）
    card = page.locator(".ds-input-card").first
    card.scroll_into_view_if_needed()
    page.wait_for_timeout(150)
    bbox = card.bounding_box()
    if bbox is not None:
        clip = {
            "x": max(0, int(bbox["x"]) - 12),
            "y": max(0, int(bbox["y"]) - 12),
            "width": int(bbox["width"]) + 24,
            "height": int(bbox["height"]) + 24,
        }
        page.screenshot(path=str(OUT_DIR / f"{short_t}-{lang}-{w}-form-only.png"), clip=clip)

    # 2) 整页输入态截图
    shot(page, f"{short_t}-{lang}-{w}-input-full", full=True)

    # 3) gender select 聚焦 + 展开（用 keyboard 触发，避免原生下拉浮层在 headless 不可截）
    sel = page.locator("select").first
    if sel.count() > 0:
        sel.scroll_into_view_if_needed()
        sel.focus()
        page.wait_for_timeout(120)
        # gender 区域裁剪
        gbox = sel.bounding_box()
        if gbox is not None:
            clip = {
                "x": max(0, int(gbox["x"]) - 80),
                "y": max(0, int(gbox["y"]) - 30),
                "width": int(gbox["width"]) + 160,
                "height": int(gbox["height"]) + 60,
            }
            page.screenshot(path=str(OUT_DIR / f"{short_t}-{lang}-{w}-gender-zoom.png"), clip=clip)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"截图输出目录：{OUT_DIR}")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()

        for theme in ["guofeng", "minimal"]:
            for lang in ["zh-CN", "zh-TW", "en"]:
                for vp in [(1440, 900), (390, 844)]:
                    print(f"\n[theme={theme} lang={lang} vp={vp}]")
                    shoot_all(page, theme, lang, vp)

        browser.close()
    print("\n✅ 完成")
    return 0


if __name__ == "__main__":
    sys.exit(main())
