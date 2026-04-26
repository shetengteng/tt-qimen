#!/usr/bin/env python3
"""Verify huangli calendar P0+P1 improvements.

Coverage:
  P0-A: cross-month day click → dialog opens (NOT silent month-shift)
  P0-B: aria attributes (gridcell, aria-label, aria-current, role=grid)
  P0-C: today × match: today still visible (background ≠ accent-soft)
  P0-D: guofeng huangdao no longer全格 border; heidao still has red border
  P0-E: keyboard nav (Tab → focus, ArrowRight → next, Enter → click)
  P1-F: clicking title button → popover with year list + month grid
  P1-G: ✓ check mark visible on matched cells when matter is active
  P1-H: selected ring on currently-displayed day (after dialog open)
  P1-I: when matter active, "下一个 ✓ 日" button visible & clickable
  P1-J: scroll-margin-top on .hl-cal
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"
OUT = Path("design/screenshots/2026-04-25-huangli-cal-after")
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

    # ========== Initial screenshot (baseline) ==========
    page.locator(".hl-cal").screenshot(path=str(OUT / f"{tag}-01-baseline.png"))

    # ========== P0-B: a11y probe ==========
    a11y = page.evaluate("""
    () => {
      const grid = document.querySelector('.hl-cal-grid');
      const cells = Array.from(document.querySelectorAll('.hl-cal-day'));
      const today = document.querySelector('.hl-cal-day[aria-current=date]');
      const samples = cells.slice(0, 3).map(c => ({
        role: c.getAttribute('role'),
        ariaLabel: c.getAttribute('aria-label'),
        tabindex: c.getAttribute('tabindex'),
      }));
      return {
        gridRole: grid && grid.getAttribute('role'),
        gridAria: grid && grid.getAttribute('aria-label'),
        cellCount: cells.length,
        rovingTabZero: cells.filter(c => c.getAttribute('tabindex') === '0').length,
        todayHasAriaCurrent: !!today,
        samples,
      };
    }
    """)
    out["p0_b_a11y"] = a11y

    # ========== P0-D: guofeng huangdao 无全格 border, heidao 红框 ==========
    if theme == "guofeng":
      gf_check = page.evaluate("""
      () => {
        const huangdao = document.querySelector('.hl-cal-day.is-huangdao:not(.is-today)');
        const heidao = document.querySelector('.hl-cal-day.is-heidao:not(.is-today)');
        const huangdaoNum = huangdao ? document.querySelector('.hl-cal-day.is-huangdao:not(.is-today) .hl-cal-day-num') : null;
        const huangdaoStyle = huangdao ? (() => {
          const s = getComputedStyle(huangdao);
          return { borderColor: s.borderColor, borderWidth: s.borderWidth };
        })() : null;
        const heidaoStyle = heidao ? (() => {
          const s = getComputedStyle(heidao);
          return { borderColor: s.borderColor, borderWidth: s.borderWidth };
        })() : null;
        const huangdaoNumStyle = huangdaoNum ? getComputedStyle(huangdaoNum).color : null;
        return { huangdaoStyle, huangdaoNumStyle, heidaoStyle };
      }
      """)
      out["p0_d_guofeng"] = gf_check
    else:
      out["p0_d_guofeng"] = "skipped (minimal)"

    # ========== P1-F: month-year picker ==========
    titleBtn = page.locator(".hl-cal-title-btn")
    titleBtn.click()
    page.wait_for_timeout(250)
    picker = page.locator(".hl-mp-content")
    picker.wait_for(state="visible", timeout=3000)
    page.screenshot(path=str(OUT / f"{tag}-02-picker.png"))
    p1_f = page.evaluate("""
    () => {
      const picker = document.querySelector('.hl-mp-content');
      const yearList = document.querySelectorAll('.hl-mp-year-cell').length;
      const monthGrid = document.querySelectorAll('.hl-mp-month-cell').length;
      const activeYear = document.querySelector('.hl-mp-year-cell.is-active');
      const currentMonth = document.querySelector('.hl-mp-month-cell.is-current');
      return {
        pickerVisible: !!picker,
        yearCount: yearList,
        monthCount: monthGrid,
        activeYearText: activeYear?.textContent?.trim(),
        currentMonthText: currentMonth?.textContent?.trim(),
      };
    }
    """)
    out["p1_f_picker"] = p1_f
    # 关闭：esc
    page.keyboard.press("Escape")
    page.wait_for_timeout(200)

    # ========== P1-G + P1-I: 激活 matter ==========
    matter = page.locator(".hl-matter-card").first
    matter.scroll_into_view_if_needed()
    matter.click()
    page.wait_for_timeout(300)
    page.locator(".hl-cal").scroll_into_view_if_needed()
    page.wait_for_timeout(150)
    page.locator(".hl-cal").screenshot(path=str(OUT / f"{tag}-03-with-matter.png"))
    p1_gi = page.evaluate("""
    () => {
      const checks = document.querySelectorAll('.hl-cal-day-check').length;
      const nextGoodBtn = document.querySelector('.hl-cal-next-good');
      const todayMatch = document.querySelector('.hl-cal-day.is-today.is-match');
      const todayMatchStyle = todayMatch ? (() => {
        const s = getComputedStyle(todayMatch);
        return { bg: s.backgroundColor, boxShadow: s.boxShadow };
      })() : null;
      return {
        checkCount: checks,
        nextGoodVisible: !!nextGoodBtn,
        nextGoodText: nextGoodBtn?.textContent?.trim(),
        todayMatchStyle,
      };
    }
    """)
    out["p1_g_i"] = p1_gi

    # ========== P0-A + P1-H: 跨月日点击 → dialog 出现 (并非隐式 setDate) ==========
    # 找跨月格 (.is-off)
    offDay = page.locator(".hl-cal-day.is-off").first
    if offDay.count() > 0:
      offDay.scroll_into_view_if_needed()
      offDay.click()
      dialog = page.locator("[role=dialog]")
      dialog.wait_for(state="visible", timeout=5000)
      page.wait_for_timeout(280)
      page.screenshot(path=str(OUT / f"{tag}-04-cross-month-dialog.png"))
      out["p0_a_cross_month"] = {
        "dialogOpened": True,
        "title": dialog.locator(".jm-dialog-title").first.text_content(),
      }
      # P1-H: 选中态 outline ring
      ring = page.evaluate("""
      () => {
        const sel = document.querySelector('.hl-cal-day.is-selected');
        if (!sel) return { hasRing: false };
        const s = getComputedStyle(sel);
        return { hasRing: true, boxShadow: s.boxShadow };
      }
      """)
      out["p1_h_ring"] = ring
      page.locator(".jm-dialog-close").first.click()
      page.wait_for_timeout(220)
      ring_after = page.evaluate("""
      () => document.querySelectorAll('.hl-cal-day.is-selected').length
      """)
      out["p1_h_ring_cleared_after_close"] = ring_after == 0
    else:
      out["p0_a_cross_month"] = {"error": "no .is-off found"}

    # ========== P0-E: 键盘导航 ==========
    page.evaluate("""
    () => {
      const focused = document.querySelector('.hl-cal-day[tabindex="0"]');
      if (focused) focused.focus();
    }
    """)
    page.keyboard.press("ArrowRight")
    page.wait_for_timeout(150)
    page.keyboard.press("ArrowDown")
    page.wait_for_timeout(150)
    kbd = page.evaluate("""
    () => {
      const f = document.activeElement;
      return {
        isCalDay: f && f.classList && f.classList.contains('hl-cal-day'),
        ariaLabel: f && f.getAttribute && f.getAttribute('aria-label'),
        text: f && f.textContent && f.textContent.replace(/\\s+/g, ' ').trim().slice(0, 20),
      };
    }
    """)
    out["p0_e_keyboard"] = kbd

    page.keyboard.press("Enter")
    dialog = page.locator("[role=dialog]")
    try:
      dialog.wait_for(state="visible", timeout=3000)
      out["p0_e_enter_opens_dialog"] = True
      page.locator(".jm-dialog-close").first.click()
      page.wait_for_timeout(200)
    except Exception:
      out["p0_e_enter_opens_dialog"] = False

    # ========== P1-J: scroll-margin-top ==========
    smt = page.evaluate("""
    () => {
      const cal = document.querySelector('.hl-cal');
      if (!cal) return null;
      return getComputedStyle(cal).scrollMarginTop;
    }
    """)
    out["p1_j_scroll_margin_top"] = smt

    ctx.close()
    browser.close()
    return out


def main() -> int:
    cases = [
      ("desktop-guofeng", (1280, 800), "guofeng"),
      ("desktop-minimal", (1280, 800), "minimal"),
      ("mobile-guofeng", (390, 844), "guofeng"),
      ("mobile-minimal", (390, 844), "minimal"),
    ]
    results = []
    with sync_playwright() as p:
      for tag, vp, theme in cases:
        try:
          r = case(theme, vp, tag, p)
          results.append(r)
          print(f"\n=== {tag} ===")
          print(json.dumps(r, ensure_ascii=False, indent=2))
        except Exception as e:
          print(f"  ! {tag}: {e}")
          results.append({"tag": tag, "error": str(e)})
    out_json = OUT / "results.json"
    out_json.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print(f"\nSaved: {out_json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
