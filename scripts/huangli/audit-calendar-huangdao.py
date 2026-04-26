#!/usr/bin/env python3
"""审计黄道日在国风 / 简约下的表现，并截年月选择器原貌。

输出：
  design/screenshots/2026-04-25-cal-audit/
    guofeng-calendar.png
    guofeng-calendar-huangdao-detail.png
    guofeng-picker-open.png
    minimal-calendar.png
    minimal-picker-open.png

同时打印当月每一天 `is-huangdao / is-heidao` 的命中数 + 黄道日格的实际渲染色。
"""
from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"
OUT_DIR = Path(__file__).resolve().parents[2] / "design" / "screenshots" / "2026-04-25-cal-audit"


def shoot(theme: str) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=2)
        page = ctx.new_page()
        page.add_init_script(
            f"localStorage.setItem('tt-qimen:theme', '{theme}');"
            "localStorage.setItem('tt-qimen:locale', 'zh-CN');"
        )
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_selector(".hl-cal", timeout=15_000)
        page.wait_for_timeout(400)

        # 完整日历区
        cal = page.locator(".hl-cal")
        cal.scroll_into_view_if_needed()
        cal.screenshot(path=str(OUT_DIR / f"{theme}-calendar.png"))

        # 计数
        info = page.evaluate("""
        () => {
          const days = Array.from(document.querySelectorAll('.hl-cal-day'));
          const inMonth = days.filter(d => !d.classList.contains('is-off'));
          const hd = inMonth.filter(d => d.classList.contains('is-huangdao'));
          const hei = inMonth.filter(d => d.classList.contains('is-heidao'));
          const today = inMonth.find(d => d.classList.contains('is-today'));
          // 取一个非 today 的黄道日，看它数字的 computed color
          const sampleHd = hd.find(d => !d.classList.contains('is-today'));
          let sampleHdNumColor = null;
          let sampleHdBgColor = null;
          if (sampleHd) {
            const num = sampleHd.querySelector('.hl-cal-day-num');
            sampleHdNumColor = num ? getComputedStyle(num).color : null;
            sampleHdBgColor = getComputedStyle(sampleHd).backgroundColor;
          }
          // 取一个非 today 的黑道日，看它的 borderColor
          const sampleHei = hei.find(d => !d.classList.contains('is-today'));
          const sampleHeiBorder = sampleHei ? getComputedStyle(sampleHei).borderColor : null;
          return {
            inMonth: inMonth.length,
            huangdao: hd.length,
            heidao: hei.length,
            todayDay: today?.querySelector('.hl-cal-day-num')?.textContent ?? null,
            sampleHd: sampleHd?.querySelector('.hl-cal-day-num')?.textContent ?? null,
            sampleHdNumColor,
            sampleHdBgColor,
            sampleHei: sampleHei?.querySelector('.hl-cal-day-num')?.textContent ?? null,
            sampleHeiBorder,
          };
        }
        """)
        print(f"[{theme}] info:", info)

        # 截黄道日单独 cell（首个非 today 的）
        if info.get("sampleHd"):
            sample = page.evaluate("""
            () => {
              const days = Array.from(document.querySelectorAll('.hl-cal-day'));
              const inMonth = days.filter(d => !d.classList.contains('is-off'));
              const hd = inMonth.find(d => d.classList.contains('is-huangdao') && !d.classList.contains('is-today'));
              if (!hd) return null;
              const r = hd.getBoundingClientRect();
              return { x: r.x, y: r.y, w: r.width, h: r.height };
            }
            """)
            if sample:
                page.screenshot(
                    path=str(OUT_DIR / f"{theme}-calendar-huangdao-detail.png"),
                    clip={
                        "x": max(0, sample["x"] - 6),
                        "y": max(0, sample["y"] - 6),
                        "width": sample["w"] + 12,
                        "height": sample["h"] + 12,
                    },
                )

        # 打开年月 picker
        # MonthYearPicker 的 trigger 是月份标题按钮（包在 hl-cal-head 中间）
        trigger = page.locator(".hl-cal-head button").nth(1)
        trigger.click()
        page.wait_for_timeout(300)
        page.screenshot(path=str(OUT_DIR / f"{theme}-picker-open.png"), full_page=False)

        ctx.close()
        browser.close()


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    shoot("guofeng")
    shoot("minimal")
    print(f"\n截图保存到：{OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
