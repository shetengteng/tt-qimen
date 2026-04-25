#!/usr/bin/env python3
"""Verify huangli day-detail dialog (open / close / theme).

桌面 (1280x800) + 移动 (390x844) × guofeng / minimal 共 4 组。
点击月历某一天 → 断言 [role=dialog] 出现且包含 .hl-detail-subhead；
点击关闭按钮 → 断言 dialog 消失。
"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = "http://localhost:5180/#/huangli"
OUT = Path("design/screenshots/2026-04-25-huangli-day-dialog")
OUT.mkdir(parents=True, exist_ok=True)

CASES = [
    # name, viewport, theme
    ("desktop-guofeng", (1280, 800), "guofeng"),
    ("desktop-minimal", (1280, 800), "minimal"),
    ("mobile-guofeng", (390, 844), "guofeng"),
    ("mobile-minimal", (390, 844), "minimal"),
]


def run(theme: str, vp: tuple[int, int], tag: str, p) -> dict:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": vp[0], "height": vp[1]})
    page = ctx.new_page()
    page.add_init_script(
        f"localStorage.setItem('tt-qimen:theme', '{theme}');"
        "localStorage.setItem('tt-qimen:locale', 'zh-CN');"
    )
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_selector(".hl-cal", timeout=10_000)

    cal_day = page.locator(".hl-cal-day").nth(10)
    cal_day.scroll_into_view_if_needed()
    page.wait_for_timeout(150)
    page.screenshot(path=str(OUT / f"{tag}-01-before.png"), full_page=False)

    cal_day.click()

    dialog = page.locator("[role=dialog]")
    dialog.wait_for(state="visible", timeout=5_000)
    page.wait_for_timeout(280)

    has_subhead = dialog.locator(".hl-detail-subhead").count() > 0
    has_body = dialog.locator(".hl-detail-body").count() > 0
    title_text = dialog.locator(".jm-dialog-title").first.text_content() or ""

    page.screenshot(path=str(OUT / f"{tag}-02-open.png"), full_page=False)

    close_btn = dialog.locator(".jm-dialog-close").first
    close_btn.click()
    page.wait_for_timeout(220)

    closed = page.locator("[role=dialog]").count() == 0
    page.screenshot(path=str(OUT / f"{tag}-03-closed.png"), full_page=False)

    ctx.close()
    browser.close()

    return {
        "tag": tag,
        "theme": theme,
        "viewport": vp,
        "subhead": has_subhead,
        "body": has_body,
        "title_text": title_text.strip(),
        "closed_after_close_click": closed,
    }


def main() -> int:
    with sync_playwright() as p:
        results = []
        for tag, vp, theme in CASES:
            try:
                r = run(theme, vp, tag, p)
                ok = r["subhead"] and r["body"] and r["closed_after_close_click"]
                r["ok"] = ok
                print(f"  {'OK' if ok else 'FAIL'} {tag}: {r}")
                results.append(r)
            except Exception as e:
                print(f"  ! {tag}: {e}")
                results.append({"tag": tag, "ok": False, "error": str(e)})

        all_ok = all(r.get("ok") for r in results)
        print("\n=== summary ===")
        for r in results:
            print(f"  {r.get('tag')}: ok={r.get('ok')}")
        return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
