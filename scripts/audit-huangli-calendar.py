#!/usr/bin/env python3
"""Audit huangli MiniCalendar — capture screenshots + probe metrics.

Goals:
  - 4 cases: desktop / mobile × guofeng / minimal
  - For each: full + focused crop on .hl-cal
  - Probe: cal width / overflow, day cell w/h/aspect, font sizes,
           today / selected / different-month visual states,
           keyboard accessibility (tabindex / aria-label),
           legend visibility, header click target size.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"
OUT = Path("design/screenshots/2026-04-25-huangli-cal-audit")
OUT.mkdir(parents=True, exist_ok=True)

CASES = [
    ("desktop-guofeng", (1280, 800), "guofeng"),
    ("desktop-minimal", (1280, 800), "minimal"),
    ("mobile-guofeng", (390, 844), "guofeng"),
    ("mobile-minimal", (390, 844), "minimal"),
]


def probe(page) -> dict:
    js = """
    () => {
      const num = (v) => Number.isFinite(v) ? Math.round(v * 10) / 10 : v;
      const rectOf = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: num(r.x), y: num(r.y), w: num(r.width), h: num(r.height) };
      };
      const styleKeys = (el, keys) => {
        if (!el) return null;
        const s = getComputedStyle(el);
        const o = {};
        keys.forEach(k => { o[k] = s.getPropertyValue(k); });
        return o;
      };

      const cal = document.querySelector('.hl-cal');
      const calRect = rectOf(cal);
      const calStyle = styleKeys(cal, ['padding', 'gap', 'background-color', 'border']);
      const calOverflow = cal ? (cal.scrollWidth > cal.clientWidth) : null;
      const calScroll = cal ? { scrollW: cal.scrollWidth, clientW: cal.clientWidth } : null;

      const head = document.querySelector('.hl-cal-head');
      const headBtns = Array.from(document.querySelectorAll('.hl-cal-head button, .hl-cal-head .gf-btn'))
        .map(b => ({ rect: rectOf(b), text: (b.textContent || '').trim().slice(0, 8) }));
      const title = document.querySelector('.hl-cal-title');

      const weekHead = Array.from(document.querySelectorAll('.hl-cal-week, .hl-cal-weekday'))
        .map(el => ({ tag: el.className, rect: rectOf(el), text: (el.textContent||'').trim() }));

      const days = Array.from(document.querySelectorAll('.hl-cal-day'));
      const dayCount = days.length;

      const sample = days.slice(0, 7).map(d => ({
        rect: rectOf(d),
        cls: d.className,
        attrs: { tabindex: d.getAttribute('tabindex'), role: d.getAttribute('role'), ariaLabel: d.getAttribute('aria-label') || d.getAttribute('title') },
        text: (d.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 30),
      }));

      const today = document.querySelector('.hl-cal-day--today, .hl-cal-day.is-today');
      const selected = document.querySelector('.hl-cal-day--selected, .hl-cal-day.is-selected, [aria-selected=true]');
      const otherMonth = document.querySelector('.hl-cal-day--other, .hl-cal-day.is-other-month, .hl-cal-day--out');

      const dayStyle = days[0] ? styleKeys(days[0], ['width','height','padding','font-size','aspect-ratio','min-height','border-radius']) : null;
      const todayStyle = today ? styleKeys(today, ['background-color','color','border','font-weight','outline','box-shadow']) : null;
      const selectedStyle = selected ? styleKeys(selected, ['background-color','color','border','outline','box-shadow']) : null;

      const legend = document.querySelector('.hl-cal-legend, .hl-legend, [class*="legend"]');
      const legendRect = rectOf(legend);

      const focusable = Array.from(document.querySelectorAll('.hl-cal-day[tabindex], .hl-cal-day button')).length;

      return {
        cal: { rect: calRect, style: calStyle, overflowX: calOverflow, scroll: calScroll },
        head: { rect: rectOf(head), buttons: headBtns, titleRect: rectOf(title) },
        weekHead,
        days: { count: dayCount, sample, dayStyle, focusable },
        states: {
          today: { found: !!today, rect: rectOf(today), style: todayStyle },
          selected: { found: !!selected, rect: rectOf(selected), style: selectedStyle },
          otherMonth: { found: !!otherMonth, rect: rectOf(otherMonth) },
        },
        legend: { rect: legendRect, exists: !!legend, text: legend ? legend.textContent.replace(/\\s+/g,' ').trim().slice(0, 80) : null },
      };
    }
    """
    return page.evaluate(js)


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

    cal = page.locator(".hl-cal")
    cal.scroll_into_view_if_needed()
    page.wait_for_timeout(150)

    page.screenshot(path=str(OUT / f"{tag}-full.png"), full_page=False)
    cal.screenshot(path=str(OUT / f"{tag}-cal.png"))

    metrics = probe(page)
    metrics["tag"] = tag
    metrics["theme"] = theme
    metrics["viewport"] = vp

    ctx.close()
    browser.close()
    return metrics


def main() -> int:
    with sync_playwright() as p:
        all_metrics = []
        for tag, vp, theme in CASES:
            try:
                m = run(theme, vp, tag, p)
                all_metrics.append(m)
                cal = m["cal"]
                days = m["days"]
                print(f"\n=== {tag} ===")
                print(f"  cal rect: {cal['rect']}, overflowX={cal['overflowX']}, scroll={cal['scroll']}")
                print(f"  cal style: {cal['style']}")
                print(f"  day count: {days['count']}, focusable: {days['focusable']}")
                if days['dayStyle']:
                    print(f"  day cell style: {days['dayStyle']}")
                print(f"  sample day cls: {days['sample'][0]['cls'] if days['sample'] else None}")
                print(f"  sample day attrs: {days['sample'][0]['attrs'] if days['sample'] else None}")
                print(f"  today: {m['states']['today']['found']}, selected: {m['states']['selected']['found']}, other-month: {m['states']['otherMonth']['found']}")
                if m['legend']['exists']:
                    print(f"  legend: {m['legend']['text']}")
                else:
                    print("  legend: NONE")
            except Exception as e:
                print(f"  ! {tag}: {e}")
                all_metrics.append({"tag": tag, "error": str(e)})

        out_json = OUT / "metrics.json"
        out_json.write_text(json.dumps(all_metrics, ensure_ascii=False, indent=2))
        print(f"\nSaved: {out_json}")

        return 0


if __name__ == "__main__":
    sys.exit(main())
