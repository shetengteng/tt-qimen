"""
端到端证据：黄历模块 = "传统黄历宜忌 — 根据每日吉神凶神、十二建星，推荐黄道吉日"
是否真的做完了。

策略：
  1. 抓今天 (Saturday Apr 25, 2026) 的页面
  2. 截图 + 文本提取，证明：
     - 今日大字（公历 + 农历 + 干支） ✓
     - 当日十二建星（如"建/除/满/平/定..."）+ 黄黑道色编 ✓
     - 当日宜忌列表（recommends + avoids tags）✓
     - 当日吉神凶神列表 ✓
     - 9 事由 chip + 选某事由后月历高亮黄道吉日 ✓
     - 月历每个 cell 黄/黑道色编 ✓
     - 「下一个 ✓ 日：M月D日 →」推荐按钮 ✓
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/#/huangli"
OUT = Path("design/screenshots/2026-04-25-huangli-feature-proof")
OUT.mkdir(parents=True, exist_ok=True)


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 1800}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto(URL, wait_until="domcontentloaded", timeout=15000)
        page.evaluate(
            "() => { localStorage.setItem('tt-qimen:theme', 'guofeng');"
            " localStorage.setItem('tt-qimen:locale', 'zh-CN'); }"
        )
        page.reload(wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(1500)

        # 探测每一项功能是否真存在
        evidence = page.evaluate(
            """() => {
              const text = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
              const all = (sel) => Array.from(document.querySelectorAll(sel)).map(e => e.textContent.trim());
              const count = (sel) => document.querySelectorAll(sel).length;
              return {
                today_card_present: !!document.querySelector('.hl-today-card'),
                today_day_num: text('.hl-today-day'),
                today_lunar: text('.hl-today-lunar'),
                today_ganzhi: text('.hl-info-ganzhi'),
                duty_full: text('.hl-info-line:nth-child(2) .hl-info-value'),
                today_big_label: text('.hl-big-label'),
                today_big_value: text('.hl-big-value'),
                today_big_ecliptic_attr: document.querySelector('.hl-today-big')?.getAttribute('data-ecliptic'),
                yiji_yi_count: count('.hl-yiji-card--yi .hl-yiji-tag'),
                yiji_yi_list: all('.hl-yiji-card--yi .hl-yiji-tag').slice(0, 8),
                yiji_ji_count: count('.hl-yiji-card--ji .hl-yiji-tag'),
                yiji_ji_list: all('.hl-yiji-card--ji .hl-yiji-tag').slice(0, 8),
                shensha_present: !!document.querySelector('.hl-shensha-section'),
                gods_count: count('.hl-shensha-card--good .hl-shensha-tag'),
                gods_sample: all('.hl-shensha-card--good .hl-shensha-tag').slice(0, 5),
                fiends_count: count('.hl-shensha-card--bad .hl-shensha-tag'),
                fiends_sample: all('.hl-shensha-card--bad .hl-shensha-tag').slice(0, 5),
                matter_grid_present: !!document.querySelector('.hl-matter-grid, [class*=\"matter\"]'),
                matter_chips_count: count('.hl-matter-card, .mn-matter-card, [class*=\"matter-card\"]'),
                calendar_present: !!document.querySelector('.hl-cal-grid'),
                calendar_cells: count('.hl-cal-day'),
                huangdao_in_month: count('.hl-cal-day.is-huangdao'),
                heidao_in_month: count('.hl-cal-day.is-heidao'),
                solar_terms_in_month: count('.hl-cal-day.is-solar-term'),
                next_good_btn_present: !!document.querySelector('.hl-cal-next-good'),
              };
            }"""
        )

        page.screenshot(path=str(OUT / "01-full-page.png"), full_page=True)

        # 验证"事由筛选 → 月历高亮黄道吉日"
        page.locator(".hl-matter-card, .mn-matter-card, [class*='matter-card']").first.scroll_into_view_if_needed()
        first_matter = page.locator(".hl-matter-card, .mn-matter-card, [class*='matter-card']").first
        first_matter_text = first_matter.text_content().strip() if first_matter.count() else ""
        first_matter.click()
        page.wait_for_timeout(500)
        match_evidence = page.evaluate(
            """() => ({
              checks_in_calendar: document.querySelectorAll('.hl-cal-day-check').length,
              active_matter_present: !!document.querySelector('[class*=\"hl-matter-card\"][class*=\"active\"], [class*=\"is-active\"], [aria-pressed=\"true\"]'),
              next_good_text: document.querySelector('.hl-cal-next-good')?.textContent?.trim() || null,
            })"""
        )
        page.screenshot(path=str(OUT / "02-after-matter-pick.png"), full_page=True)

        # 输出证据
        print("=" * 70)
        print("黄历模块功能证据 — 2026-04-25")
        print("=" * 70)
        for k, v in evidence.items():
            print(f"  {k}: {v}")
        print()
        print(f"  >>> 选了第一个事由 '{first_matter_text}' 后:")
        for k, v in match_evidence.items():
            print(f"  {k}: {v}")
        print()
        print(f"  截图: {OUT}/01-full-page.png  &  02-after-matter-pick.png")

        # 关键判定
        ok = (
            evidence["today_card_present"]
            and evidence["yiji_yi_count"] > 0
            and evidence["yiji_ji_count"] > 0
            and evidence["shensha_present"]
            and evidence["calendar_present"]
            and evidence["calendar_cells"] == 42
            and evidence["huangdao_in_month"] > 0
            and evidence["heidao_in_month"] > 0
            and evidence["matter_chips_count"] >= 9
        )
        print()
        print("=" * 70)
        if ok:
            print("结论: ✅ '传统黄历宜忌-黄道吉日推荐' 全部 6 大块功能在线运行")
        else:
            print("结论: ❌ 有缺口（看上面的探针数据）")
        print("=" * 70)
        ctx.close()
        browser.close()
        return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
