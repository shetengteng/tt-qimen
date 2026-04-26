#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性截图脚本：验证 2026-04-25 的 header 改动。

覆盖：
  * 桌面 1440×900：guofeng / minimal × (closed, lang-open, theme-open) 共 6 张
  * 移动 390×844 ：guofeng / minimal × (closed, mobile-nav-open, lang-open) 共 6 张

用途：人工/AI 视觉检查
  * 桌面 trigger 是不是「方形 + Languages icon」、popover 弹层有没有被右侧裁切
  * 桌面 nav + toolbar 是不是一组靠右
  * 移动 nav 折叠成 dropdown trigger，弹出可正确路由
"""

from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import Page, sync_playwright

BASE_URL = "http://localhost:5180"
OUT_DIR = Path(
    "design/screenshots/2026-04-25-header-nav-redesign"
).resolve()


def reset_state(page: Page, theme: str) -> None:
    """清掉本地存储防止上次状态串扰，然后强制设回指定主题与简体。"""
    page.evaluate(
        f"""() => {{
            localStorage.setItem('tt-qimen:locale', 'zh-CN');
            localStorage.setItem('tt-qimen:theme', '{theme}');
        }}"""
    )
    page.evaluate("() => window.location.reload()")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(400)


def shot(page: Page, name: str) -> None:
    out = OUT_DIR / f"{name}.png"
    page.screenshot(path=str(out), full_page=False)
    print(f"  ✓ {out.name}")


def shoot_desktop(page: Page, theme: str) -> None:
    short = "guofeng" if theme == "guofeng" else "minimal"
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme)

    # closed
    shot(page, f"desktop-{short}-01-closed")

    # lang open
    page.locator(".layout-popover-trigger--lang").first.click()
    page.wait_for_timeout(250)
    shot(page, f"desktop-{short}-02-lang-open")
    page.keyboard.press("Escape")
    page.wait_for_timeout(150)

    # theme open
    page.locator(".layout-popover-trigger--theme").first.click()
    page.wait_for_timeout(250)
    shot(page, f"desktop-{short}-03-theme-open")
    page.keyboard.press("Escape")
    page.wait_for_timeout(150)


def shoot_mobile(page: Page, theme: str) -> None:
    short = "guofeng" if theme == "guofeng" else "minimal"
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme)

    # closed
    shot(page, f"mobile-{short}-01-closed")

    # mobile nav open
    page.locator(".layout-popover-trigger--nav").first.click()
    page.wait_for_timeout(250)
    shot(page, f"mobile-{short}-02-nav-open")
    page.keyboard.press("Escape")
    page.wait_for_timeout(150)

    # lang open（验证移动端弹层不被裁）
    page.locator(".layout-popover-trigger--lang").first.click()
    page.wait_for_timeout(250)
    shot(page, f"mobile-{short}-03-lang-open")
    page.keyboard.press("Escape")
    page.wait_for_timeout(150)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📸 输出目录: {OUT_DIR}")

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()

        for theme in ("guofeng", "minimal"):
            print(f"\n--- desktop · {theme} ---")
            shoot_desktop(page, theme)
            print(f"--- mobile  · {theme} ---")
            shoot_mobile(page, theme)

        browser.close()

    print("\n✅ 截图完成")
    return 0


if __name__ == "__main__":
    sys.exit(main())
