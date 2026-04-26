#!/usr/bin/env python3
"""
R2 验证：吉神 / 凶神 三语显示。

策略：
  1. 选一天必有吉神 / 凶神（默认今天就行）。
  2. 通过 LangSwitch 切到 zh-CN / zh-TW / en，
     依次截取 ShenshaCards 区域的吉神 / 凶神文本。
  3. 断言：
     - zh-CN 含简体常见字（"神"）；
     - zh-TW 含繁体特征字（"龍" 或 "陽" 或 "陰"）；
     - en 含英文（"Pinyin (Translation)" 形式 → 至少含 "(" 或 ASCII 字母）。
  4. 还顺手 evaluate translateGod() 抽样 5 个，确保译表确实生效。
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/#/huangli"
SHOTS = Path("design/screenshots/2026-04-25-r2-gods-i18n")
SHOTS.mkdir(parents=True, exist_ok=True)


def main() -> int:
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        ctx = b.new_context(viewport={"width": 1280, "height": 900}, locale="zh-CN")
        pg = ctx.new_page()
        pg.goto(URL, wait_until="domcontentloaded")
        # 首屏 vite 编译可能慢，给足时间
        pg.wait_for_selector(".hl-shensha-section", timeout=30_000)

        results: dict[str, dict[str, str]] = {}
        # 也额外验证 DayDetailDialog 内的 tag 渲染
        dialog_results: dict[str, dict[str, str]] = {}

        for code in ("zh-CN", "zh-TW", "en"):
            # 直接通过 useLocaleStore 切换，避免 PopoverPortal 选择器抖动
            pg.evaluate(
                """async (code) => {
                    const m = await import('/src/stores/locale.ts');
                    const { useLocaleStore } = m;
                    useLocaleStore().set(code);
                }""",
                code,
            )
            pg.wait_for_timeout(400)
            pg.wait_for_selector(".hl-shensha-section", timeout=5_000)
            cards = pg.locator(".hl-shensha-card")
            gods_text = cards.nth(0).locator(".hl-shensha-content").inner_text()
            fiends_text = cards.nth(1).locator(".hl-shensha-content").inner_text()
            results[code] = {"gods": gods_text, "fiends": fiends_text}
            pg.locator(".hl-shensha-section").screenshot(path=SHOTS / f"shensha-{code}-region.png")

            # 打开 DayDetailDialog（点今天那格非节气日；选今日格子最稳）
            today_cell = pg.locator(".hl-cal-day.is-today").first
            if today_cell.count() == 0:
                # 万一今天恰好是节气，找一个非节气格子
                today_cell = pg.locator(".hl-cal-day.in-month:not(.is-solar-term)").first
            today_cell.click()
            try:
                pg.wait_for_selector(".hl-detail-card", timeout=3_000)
                tags_good = pg.locator(".hl-dd-tag--good")
                tags_warn = pg.locator(".hl-dd-tag--warn")
                dialog_results[code] = {
                    "good_tags": " | ".join(tags_good.all_text_contents()[:5]),
                    "warn_tags": " | ".join(tags_warn.all_text_contents()[:5]),
                }
                pg.locator(".hl-detail-card").screenshot(path=SHOTS / f"detail-{code}-tags.png")
                # 关 dialog
                pg.keyboard.press("Escape")
                pg.wait_for_timeout(200)
            except Exception as e:
                dialog_results[code] = {"error": repr(e)}

        # translateGod 抽样验证
        translate_check = pg.evaluate("""
        async () => {
          const m = await import('/src/modules/huangli/data/godNames.ts');
          const samples = ['青龙', '天牢', '月德', '触水龙', '阴阳俱错'];
          return samples.map((n) => ({
            name: n,
            tw: m.translateGod(n, 'zh-TW'),
            en: m.translateGod(n, 'en'),
          }));
        }
        """)

        b.close()

    print("=== ShenshaCards 三语吉神 / 凶神 ===")
    for code, r in results.items():
        print(f"\n[{code}]")
        print(f"  gods   : {r['gods']!r}")
        print(f"  fiends : {r['fiends']!r}")

    print("\n=== DayDetailDialog 三语 tag 渲染 ===")
    for code, r in dialog_results.items():
        print(f"\n[{code}]")
        for k, v in r.items():
            print(f"  {k}: {v!r}")

    print("\n=== translateGod() 抽样 ===")
    for s in translate_check:
        print(f"  {s['name']:>6} → TW={s['tw']:<24} EN={s['en']}")

    # 简单断言
    fails = []
    zh_cn_text = results["zh-CN"]["gods"] + results["zh-CN"]["fiends"]
    zh_tw_text = results["zh-TW"]["gods"] + results["zh-TW"]["fiends"]
    en_text = results["en"]["gods"] + results["en"]["fiends"]

    if not any(c in zh_cn_text for c in "神煞德龙阳"):
        fails.append("zh-CN 文本不含中文")
    # 繁体特征：陽 陰 龍 寶 倉 醫
    if not any(c in zh_tw_text for c in "陽陰龍寶倉醫義"):
        fails.append(f"zh-TW 不含繁体特征字: {zh_tw_text!r}")
    # 英文：必须含 ASCII 字母 + 括号
    has_ascii_letter = any(c.isascii() and c.isalpha() for c in en_text)
    if not has_ascii_letter or "(" not in en_text:
        fails.append(f"en 不含英文+括号: {en_text!r}")

    print()
    if fails:
        print("❌ FAIL:", fails)
        return 1
    print("✅ R2 三语吉神/凶神显示均正常。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
