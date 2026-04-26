#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""综合评分卡视觉审计：

聚焦三个用户痛点：
  1) 指针效果不好 — 抓 OverallGauge 的 SVG 指针特写
  2) 评分模块多余线条 — 抓 .xm-score-card 全卡 + 5 项 .xm-score-items 区域特写
  3) 各模块宽度不一致 — 抓整张 share-card 全身（凹凸侧边一目了然）

输出到 design/screenshots/2026-04-26-xingming-gauge-audit/

约定：
  审计阶段保持 zh-CN 单语言（双主题足够定位），不浪费时间在 3 语 × 双主题 × 桌面/移动 矩阵
  改完后另用 verify-xingming-gauge-redesign.py 做完整覆盖
"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import Page, sync_playwright

BASE_URL = "http://localhost:5180"
OUT_DIR = Path("design/screenshots/2026-04-26-xingming-gauge-audit").resolve()


def reset_state(page: Page, theme: str, lang: str = "zh-CN") -> None:
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
    # gauge 动画 1.2s，等到稳定
    page.wait_for_timeout(1_500)


def shot_full(page: Page, name: str) -> None:
    out = OUT_DIR / f"{name}.png"
    page.screenshot(path=str(out), full_page=True)
    print(f"  ✓ {out.name}")


def shot_element(page: Page, selector: str, name: str) -> None:
    out = OUT_DIR / f"{name}.png"
    el = page.locator(selector).first
    el.wait_for(state="visible", timeout=3_000)
    el.screenshot(path=str(out))
    print(f"  ✓ {out.name}  ({selector})")


def audit_one(page: Page, theme: str) -> None:
    short_t = "guofeng" if theme == "guofeng" else "minimal"
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(BASE_URL, wait_until="networkidle")
    reset_state(page, theme)
    goto_xingming(page)
    click_calculate(page)

    shot_full(page, f"{short_t}-result-full")
    shot_element(page, ".xingming-share-card", f"{short_t}-share-card")
    shot_element(page, ".xm-score-card", f"{short_t}-score-card")
    shot_element(page, ".xm-gauge-wrap", f"{short_t}-gauge-only")
    shot_element(page, ".xm-score-items", f"{short_t}-score-items")


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"截图输出目录：{OUT_DIR}")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()

        for theme in ["guofeng", "minimal"]:
            print(f"\n=== [{theme}] ===")
            audit_one(page, theme)

        browser.close()
    print("\n[OK] DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
