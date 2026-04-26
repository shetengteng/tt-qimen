#!/usr/bin/env python3
"""
现状截图：姓名学综合评分 OverallGauge（指针 + 仪表盘）
- 双主题 × desktop(1280) + mobile(375)
- 截 .xm-score-card 区域
"""
from playwright.sync_api import sync_playwright
import os

BASE = "http://localhost:5180/"
OUT = "/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/screenshots/2026-04-25-xingming-gauge-before"
os.makedirs(OUT, exist_ok=True)

THEMES = ["guofeng", "minimal"]
VIEWPORTS = {"desktop": (1280, 900), "mobile": (375, 800)}
NAME = ("张", "伟峰")


def setup_and_run(page):
    page.wait_for_load_state("load")
    page.wait_for_timeout(1500)
    page.wait_for_selector(".xm-name-input", timeout=15_000)
    page.locator(".xm-name-input input").nth(0).fill(NAME[0])
    page.locator(".xm-name-input input").nth(1).fill(NAME[1])
    page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first.click()
    page.wait_for_selector(".xm-score-card", timeout=15_000)
    try:
        page.wait_for_selector(".skeleton-overlay:not(.visible)", timeout=4_000)
    except Exception:
        pass
    page.wait_for_timeout(1500)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for theme in THEMES:
            for vp_label, (w, h) in VIEWPORTS.items():
                ctx = browser.new_context(viewport={"width": w, "height": h})
                page = ctx.new_page()
                page.goto(
                    f"{BASE}?theme={theme}&lang=zh-CN", wait_until="domcontentloaded"
                )
                page.wait_for_load_state("load")
                page.evaluate("location.hash = '#/xingming'")
                setup_and_run(page)
                el = page.locator(".xm-score-card")
                el.scroll_into_view_if_needed()
                page.wait_for_timeout(500)
                shot = os.path.join(OUT, f"{theme}-{vp_label}.png")
                el.screenshot(path=shot)
                print(f"shot -> {shot}")
                ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
