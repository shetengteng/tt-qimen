#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证综评描述放宽到 720px 后是否单行（默认文案 + 长文案）。"""
from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path("design/snapshots/2026-04-26-xingming-score-desc")
OUT.mkdir(parents=True, exist_ok=True)
BASE = "http://localhost:5180"

CASES = [
    # (label, surname, givenName, expected_lines_max)
    ("default-li-wenxuan", "李", "文轩", 1),
    ("short-wang-yi", "王", "一", 1),
    ("long-ouyang-zixin", "欧阳", "梓欣", 2),
]


def measure_lines(page) -> int:
    return page.evaluate(
        """() => {
            const el = document.querySelector('.xm-score-desc');
            if (!el) return -1;
            const lh = parseFloat(getComputedStyle(el).lineHeight);
            const h = el.getBoundingClientRect().height;
            return Math.round(h / lh);
        }"""
    )


def measure_max_width(page) -> int:
    return page.evaluate(
        """() => {
            const el = document.querySelector('.xm-score-desc');
            if (!el) return -1;
            return parseInt(getComputedStyle(el).maxWidth);
        }"""
    )


def run(theme: str, locale: str = "zh-CN") -> int:
    failures = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")

        for label, surname, given, max_lines in CASES:
            page.evaluate(
                f"""() => {{
                    localStorage.clear();
                    localStorage.setItem('tt-qimen:locale', '{locale}');
                    localStorage.setItem('tt-qimen:theme', '{theme}');
                    localStorage.setItem('tt-qimen:xingming:input',
                      JSON.stringify({{surname:'{surname}',givenName:'{given}',gender:'male',birthYear:null}}));
                }}"""
            )
            page.reload()
            page.wait_for_load_state("networkidle")
            page.evaluate("() => { window.location.hash='#/xingming'; }")
            page.wait_for_timeout(500)
            page.locator(".ds-input-actions button").first.click()
            page.wait_for_selector(".result-banner.revealed", timeout=6_000)
            page.wait_for_timeout(2_000)

            mw = measure_max_width(page)
            lines = measure_lines(page)
            target = OUT / f"{theme}-{locale}-{label}.png"
            card = page.locator(".xm-score-card")
            card.screenshot(path=str(target))

            status = "OK" if lines <= max_lines else "WARN"
            if lines > max_lines:
                failures += 1
            print(
                f"  [{status}] {theme}/{locale}/{label}: lines={lines} (≤{max_lines}), max-width={mw}px"
                f" → {target.name}"
            )
        browser.close()
    return failures


def main() -> int:
    print("\n--- B: xingming score-desc 不断行验证 ---\n")
    fail = 0
    for theme in ("guofeng", "minimal"):
        print(f"=== theme={theme} ===")
        fail += run(theme, "zh-CN")
        print()
    print(f"=== finished: {fail} warnings ===")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
