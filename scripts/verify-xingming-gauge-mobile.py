#!/usr/bin/env python3
"""mobile 截图（独立跑，避免和 desktop 一起 timeout）"""
from playwright.sync_api import sync_playwright
import os

BASE = "http://localhost:5180/"
OUT = "/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/screenshots/2026-04-25-xingming-gauge-after"
os.makedirs(OUT, exist_ok=True)


def setup_and_compute(page, surname, given):
    page.wait_for_load_state("load")
    page.wait_for_timeout(1500)
    page.wait_for_selector(".xm-name-input", timeout=15_000)
    page.locator(".xm-name-input input").nth(0).fill(surname)
    page.locator(".xm-name-input input").nth(1).fill(given)
    page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first.click()
    page.wait_for_selector(".xm-score-card", timeout=15_000)
    try:
        page.wait_for_selector(".skeleton-overlay:not(.visible)", timeout=4_000)
    except Exception:
        pass


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for theme in ["guofeng", "minimal"]:
            ctx = browser.new_context(viewport={"width": 375, "height": 800})
            page = ctx.new_page()
            page.goto(f"{BASE}?theme={theme}&lang=zh-CN", wait_until="domcontentloaded")
            page.wait_for_load_state("load")
            page.evaluate("location.hash = '#/xingming'")
            setup_and_compute(page, "张", "伟峰")
            page.wait_for_timeout(1500)
            el = page.locator(".xm-score-card")
            el.scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            shot = os.path.join(OUT, f"{theme}-mobile.png")
            el.screenshot(path=shot)
            print(f"  shot -> {shot}")
            ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
