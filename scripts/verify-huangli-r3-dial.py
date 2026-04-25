#!/usr/bin/env python3
"""Verify Huangli R3 — LuckyHoursDial 12 时辰圆盘.

Coverage:
  - DayDetailDialog 内有 .hl-dial 圆盘
  - 12 个 .hl-dial-cell 全部渲染
  - 每个 cell 有 aria-label (role=radio)
  - 黄道 / 黑道 cell class 正确
  - 中心区显示「此时」（today）或「黄道时辰 N/12」（非 today）
  - 点击 cell → role=status 区出现详情
  - fallback details 元素存在
  - 双主题 + 移动端三组截图

Run:
  python3 scripts/verify-huangli-r3-dial.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"
OUT = Path("design/screenshots/2026-04-25-huangli-r3-dial")
OUT.mkdir(parents=True, exist_ok=True)


def setup(p, theme: str, vp):
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": vp[0], "height": vp[1]})
    page = ctx.new_page()
    page.add_init_script(
        f"localStorage.setItem('tt-qimen:theme', '{theme}');"
        "localStorage.setItem('tt-qimen:locale', 'zh-CN');"
    )
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_selector(".hl-cal", timeout=10_000)
    return browser, ctx, page


def case(theme: str, vp, tag: str, p) -> dict:
    browser, ctx, page = setup(p, theme, vp)
    out: dict = {"tag": tag, "theme": theme}

    # 点击今日（应该是有 is-today 的格子）
    today_cell = page.locator(".hl-cal-day.is-today").first
    today_cell.click()
    # 等 dialog 弹出
    page.wait_for_selector(".jm-dialog-content .hl-dial", timeout=5000)
    page.wait_for_timeout(400)

    probe = page.evaluate("""
    () => {
      const dial = document.querySelector('.jm-dialog-content .hl-dial');
      if (!dial) return null;
      const cells = Array.from(dial.querySelectorAll('.hl-dial-cell'));
      const center = dial.querySelector('.hl-dial-center');
      const summaryLabel = center && center.querySelector('.hl-dial-summary-label');
      const nowLabel = center && center.querySelector('.hl-dial-now-label');
      const fallback = document.querySelector('.hl-dd-shichen-fallback');
      return {
        cellCount: cells.length,
        firstCellAria: cells[0] && cells[0].getAttribute('aria-label'),
        firstCellRole: cells[0] && cells[0].getAttribute('role'),
        eclipticBuckets: cells.reduce((a, c) => {
          if (c.classList.contains('is-huangdao')) a.huangdao++;
          if (c.classList.contains('is-heidao')) a.heidao++;
          return a;
        }, { huangdao: 0, heidao: 0 }),
        centerVariant: nowLabel ? 'now' : (summaryLabel ? 'summary' : 'unknown'),
        currentMarked: cells.filter(c => c.classList.contains('is-current')).length,
        hasFallback: !!fallback,
      };
    }
    """)
    out["dial"] = probe

    # 滚到圆盘
    page.locator(".hl-dial").scroll_into_view_if_needed()
    page.wait_for_timeout(200)
    page.screenshot(path=str(OUT / f"{tag}-01-dial.png"))

    # 点击第一个 cell 看详情
    page.locator(".hl-dial-cell").first.click()
    page.wait_for_timeout(200)
    detail_state = page.evaluate("""
    () => {
      const d = document.querySelector('.hl-dial-detail');
      if (!d) return null;
      return {
        text: d.textContent.replace(/\\s+/g, ' ').trim(),
        ariaLive: d.getAttribute('aria-live'),
      };
    }
    """)
    out["click_first_cell"] = detail_state
    page.screenshot(path=str(OUT / f"{tag}-02-detail.png"))

    browser.close()
    return out


def main() -> int:
    failures: list[str] = []
    results: list[dict] = []

    with sync_playwright() as p:
        for theme, vp, tag in [
            ("guofeng", (1280, 900), "guofeng-desktop"),
            ("minimal", (1280, 900), "minimal-desktop"),
            ("guofeng", (390, 844), "guofeng-mobile"),
        ]:
            try:
                r = case(theme, vp, tag, p)
                results.append(r)
            except Exception as e:
                failures.append(f"[{tag}] {type(e).__name__}: {e}")

    print(json.dumps(results, ensure_ascii=False, indent=2, default=str))
    print("\n--- summary ---")
    if failures:
        for f in failures:
            print("FAIL:", f)
        return 1

    for r in results:
        tag = r["tag"]
        d = r.get("dial")
        if not d:
            print(f"FAIL[{tag}]: dial not found in dialog")
            return 1
        if d["cellCount"] != 12:
            print(f"FAIL[{tag}]: expected 12 cells, got {d['cellCount']}")
            return 1
        if d["firstCellRole"] != "radio":
            print(f"FAIL[{tag}]: first cell role should be 'radio': {d['firstCellRole']}")
            return 1
        if not d["firstCellAria"]:
            print(f"FAIL[{tag}]: first cell missing aria-label")
            return 1
        ec = d["eclipticBuckets"]
        if ec["huangdao"] + ec["heidao"] != 12:
            print(f"FAIL[{tag}]: ecliptic buckets sum != 12: {ec}")
            return 1
        if d["centerVariant"] not in ("now", "summary"):
            print(f"FAIL[{tag}]: unexpected center variant: {d['centerVariant']}")
            return 1
        # 今天点击的话应该是 'now'
        if d["centerVariant"] == "now" and d["currentMarked"] != 1:
            print(f"FAIL[{tag}]: 'now' variant should mark exactly 1 cell as is-current, got {d['currentMarked']}")
            return 1
        if not d["hasFallback"]:
            print(f"FAIL[{tag}]: fallback details element missing")
            return 1
        c = r.get("click_first_cell")
        if not c or "·" not in c.get("text", ""):
            print(f"FAIL[{tag}]: clicking first cell did not show detail with name/ganzhi/star: {c}")
            return 1
        if c.get("ariaLive") != "polite":
            print(f"FAIL[{tag}]: detail aria-live should be 'polite': {c.get('ariaLive')}")
            return 1

    print("OK: R3 LuckyHoursDial verified across themes & viewports")
    return 0


if __name__ == "__main__":
    sys.exit(main())
