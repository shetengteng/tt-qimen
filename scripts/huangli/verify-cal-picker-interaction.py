#!/usr/bin/env python3
"""验证年月选择器交互。

Coverage:
  - 打开 picker 后改月份 select → 不立即提交（store.month 不变）
  - 点击"确定" → store 更新到新月份，picker 关闭
  - 重开后点击"返回今日" → store 跳回今日所在年月
  - 双主题分别走一次
"""
from __future__ import annotations

import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"


def run(theme: str, failures: list[str]) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.add_init_script(
            f"localStorage.setItem('tt-qimen:theme', '{theme}');"
            "localStorage.setItem('tt-qimen:locale', 'zh-CN');"
        )
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_selector(".hl-cal", timeout=15_000)

        # 当前 store.year/month
        before = page.evaluate("""
        async () => {
          const m = await import('/src/modules/huangli/stores/huangliStore.ts');
          const s = m.useHuangliStore();
          return { year: s.year, month: s.month };
        }
        """)
        print(f"[{theme}] before:", before)

        # 1) 打开 picker（点月份标题按钮）
        page.locator('.hl-cal-head button').nth(1).click()
        page.wait_for_selector('.hl-mp-content', timeout=3_000)

        # 2) 把 draftMonth 改成另一个值（与当前 month 不同）
        target_month = 6 if before['month'] != 6 else 7

        # 通过 Reka-UI Select 的 trigger 打开下拉，然后点击 SelectItem
        # 找到 month 那个 trigger（picker 内第二个）
        triggers = page.locator('.hl-mp-content .hl-mp-select-trigger')
        triggers.nth(1).click()  # month select
        page.wait_for_timeout(150)
        # SelectContent 是 portal，全文搜索包含"6 月"的 SelectItem
        page.locator(f'[data-slot="select-content"] [role="option"]:has-text("{target_month} 月")').click()
        page.wait_for_timeout(150)

        # 3) 此时不应改 store
        mid = page.evaluate("""
        async () => {
          const m = await import('/src/modules/huangli/stores/huangliStore.ts');
          const s = m.useHuangliStore();
          return { year: s.year, month: s.month };
        }
        """)
        if mid['month'] != before['month']:
            msg = f"[FAIL][{theme}] picker mid: store.month already changed to {mid['month']} (should still be {before['month']})"
            print(msg); failures.append(msg)
        else:
            print(f"[OK]   [{theme}] picker mid: store.month still {mid['month']} (no premature commit)")

        # 4) 点"确定"
        confirm_btn = page.locator('.hl-mp-content .hl-mp-action--primary')
        confirm_btn.click()
        page.wait_for_timeout(300)

        after = page.evaluate("""
        async () => {
          const m = await import('/src/modules/huangli/stores/huangliStore.ts');
          const s = m.useHuangliStore();
          return { year: s.year, month: s.month };
        }
        """)
        if after['month'] == target_month:
            print(f"[OK]   [{theme}] confirm: store.month={after['month']} (= target {target_month})")
        else:
            msg = f"[FAIL][{theme}] confirm: store.month={after['month']} (want {target_month})"
            print(msg); failures.append(msg)

        # picker 应已关闭
        if page.locator('.hl-mp-content').count() == 0 or not page.locator('.hl-mp-content').is_visible():
            print(f"[OK]   [{theme}] picker closed after confirm")
        else:
            msg = f"[FAIL][{theme}] picker still open after confirm"
            print(msg); failures.append(msg)

        # 5) 重开后点击"返回今日"
        page.locator('.hl-cal-head button').nth(1).click()
        page.wait_for_selector('.hl-mp-content', timeout=3_000)
        page.locator('.hl-mp-content .hl-mp-action--ghost').click()
        page.wait_for_timeout(300)

        today = page.evaluate("""
        () => {
          const d = new Date();
          return { year: d.getFullYear(), month: d.getMonth() + 1 };
        }
        """)
        final = page.evaluate("""
        async () => {
          const m = await import('/src/modules/huangli/stores/huangliStore.ts');
          const s = m.useHuangliStore();
          return { year: s.year, month: s.month };
        }
        """)
        if final == today:
            print(f"[OK]   [{theme}] today button: store={final} (= today {today})")
        else:
            msg = f"[FAIL][{theme}] today button: store={final} (want today {today})"
            print(msg); failures.append(msg)

        ctx.close()
        browser.close()


def main() -> int:
    failures: list[str] = []
    run('guofeng', failures)
    run('minimal', failures)
    print()
    if failures:
        print(f"❌ {len(failures)} failure(s)")
        for f in failures: print('  -', f)
        return 1
    print("✅ all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
