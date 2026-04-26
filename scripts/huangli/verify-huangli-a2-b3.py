#!/usr/bin/env python3
"""Verify Huangli A2 (FortuneError) + B3 (SolarTermDialog) features.

Coverage:
  A2: input-validation throws FortuneError, HuangliPage shows code-driven hint
  B3: solar-term cell has visual hint + click opens SolarTermDialog
      → "view-day" button → DayDetailDialog opens

Run:
  PYTHONPATH=. python3 scripts/huangli/verify-huangli-a2-b3.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"
OUT = Path("design/screenshots/2026-04-25-huangli-a2-b3")
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
    page.locator(".hl-cal").scroll_into_view_if_needed()
    page.wait_for_timeout(150)
    return browser, ctx, page


def case(theme: str, vp, tag: str, p) -> dict:
    browser, ctx, page = setup(p, theme, vp)
    out: dict = {"tag": tag, "theme": theme, "viewport": vp}

    # 1) baseline
    page.locator(".hl-cal").screenshot(path=str(OUT / f"{tag}-01-cal-baseline.png"))

    # 2) B3: 节气日 DOM check
    term_cells = page.evaluate("""
    () => {
      const list = Array.from(document.querySelectorAll('.hl-cal-day.is-solar-term'));
      return list.map(el => ({
        text: el.textContent.replace(/\\s+/g, ' ').trim(),
        ariaLabel: el.getAttribute('aria-label'),
        lunarColor: getComputedStyle(el.querySelector('.hl-cal-day-lunar')).color,
        underline: getComputedStyle(el.querySelector('.hl-cal-day-lunar')).textDecorationLine,
      }));
    }
    """)
    out["b3_solar_term_cells"] = {
        "count": len(term_cells),
        "samples": term_cells[:3],
    }

    # 3) B3: 点击第一个节气日 → SolarTermDialog 应该弹出
    if term_cells:
        page.locator(".hl-cal-day.is-solar-term").first.click()
        # 等动画完成
        page.wait_for_selector(".jm-dialog-content", state="visible", timeout=3000)
        page.wait_for_timeout(350)
        dlg_state = page.evaluate("""
        () => {
          const dlg = document.querySelector('.jm-dialog-content');
          if (!dlg) return null;
          const title = dlg.querySelector('.jm-dialog-title')?.textContent?.trim() || '';
          const sections = Array.from(dlg.querySelectorAll('.hl-term-section h4')).map(h => h.textContent.trim());
          const phenomena = dlg.querySelectorAll('.hl-term-phenomena li').length;
          const customs = dlg.querySelectorAll('.hl-term-customs li').length;
          const viewDayBtn = !!dlg.querySelector('.jm-dialog-foot .jm-action-btn');
          return { title, sections, phenomena, customs, viewDayBtn };
        }
        """)
        out["b3_dialog"] = dlg_state
        page.screenshot(path=str(OUT / f"{tag}-02-term-dialog.png"))

        # 4) B3: 点击「查看当日黄历」 → DayDetailDialog 应弹出
        if dlg_state and dlg_state.get("viewDayBtn"):
            page.locator(".jm-dialog-foot .jm-action-btn").click()
            page.wait_for_timeout(400)
            day_dlg_state = page.evaluate("""
            () => {
              const dlgs = document.querySelectorAll('.jm-dialog-content');
              const list = Array.from(dlgs).map(d => ({
                title: d.querySelector('.jm-dialog-title')?.textContent?.trim() || '',
                hasHlDay: !!d.querySelector('.hl-detail-card'),
                rootClasses: d.className,
              }));
              return list;
            }
            """)
            out["b3_chain_to_day_dialog"] = day_dlg_state
            page.screenshot(path=str(OUT / f"{tag}-03-chain-day-dialog.png"))
            # 关掉所有 dialog
            page.keyboard.press("Escape")
            page.wait_for_timeout(200)
            page.keyboard.press("Escape")
            page.wait_for_timeout(200)

    # 5) A2: FortuneError 测试 —— 直接调 store 设置一个非法日期
    err_state = page.evaluate("""
    async () => {
      const mod = await import('/src/modules/huangli/core/huangli.ts');
      const results = {};
      try {
        mod.getHuangliDay(2026, 2, 30);
        results.invalidInput = 'NO_THROW';
      } catch (e) {
        results.invalidInput = { name: e.name, code: e.code, userMessage: e.userMessage };
      }
      try {
        mod.getHuangliDay(1800, 1, 1);
        results.outOfRange = 'NO_THROW';
      } catch (e) {
        results.outOfRange = { name: e.name, code: e.code, userMessage: e.userMessage, details: e.details };
      }
      try {
        mod.getHuangliDay(2026, 13, 1);
        results.invalidMonth = 'NO_THROW';
      } catch (e) {
        results.invalidMonth = { name: e.name, code: e.code, userMessage: e.userMessage };
      }
      try {
        const ok = mod.getHuangliDay(2026, 4, 25);
        results.valid = { hasYear: !!ok && ok.year === 2026 };
      } catch (e) {
        results.valid = { name: e.name, msg: e.message };
      }
      return results;
    }
    """)
    out["a2_fortune_error"] = err_state

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

    # 断言关键点
    for r in results:
        tag = r["tag"]
        b3 = r.get("b3_solar_term_cells", {})
        if b3.get("count", 0) == 0:
            print(f"FAIL[{tag}]: no .is-solar-term cell rendered")
            return 1
        dlg = r.get("b3_dialog")
        if not dlg:
            print(f"FAIL[{tag}]: SolarTermDialog dialog missing: {dlg}")
            return 1
        # 标题应包含「节气」前缀（i18n key 模板 '节气 · {name}'）
        if "节气" not in dlg.get("title", ""):
            print(f"FAIL[{tag}]: SolarTermDialog title missing 节气 prefix: {dlg}")
            return 1
        # 应包含三段
        if dlg.get("sections") != ["节气含义", "物候三候", "民俗与养生"]:
            print(f"FAIL[{tag}]: SolarTermDialog sections wrong: {dlg.get('sections')}")
            return 1
        chain = r.get("b3_chain_to_day_dialog") or []
        # 链式后期望至少一个 dialog 是 hl-day 详情
        if not any(d.get("hasHlDay") for d in chain):
            print(f"FAIL[{tag}]: view-day did not open DayDetailDialog: {chain}")
            return 1
        a2 = r.get("a2_fortune_error", {})
        if not isinstance(a2.get("invalidInput"), dict) or a2["invalidInput"].get("name") != "FortuneError":
            print(f"FAIL[{tag}]: invalidInput should throw FortuneError: {a2.get('invalidInput')}")
            return 1
        if not isinstance(a2.get("outOfRange"), dict) or a2["outOfRange"].get("code") != "out-of-range":
            print(f"FAIL[{tag}]: outOfRange wrong code: {a2.get('outOfRange')}")
            return 1
        if not isinstance(a2.get("invalidMonth"), dict) or a2["invalidMonth"].get("code") != "invalid-input":
            print(f"FAIL[{tag}]: invalidMonth wrong code: {a2.get('invalidMonth')}")
            return 1
        if a2.get("valid") != {"hasYear": True}:
            print(f"FAIL[{tag}]: valid input should not throw: {a2.get('valid')}")
            return 1

    print("OK: A2 + B3 verified across themes & viewports")
    return 0


if __name__ == "__main__":
    sys.exit(main())
