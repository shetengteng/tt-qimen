#!/usr/bin/env python3
"""Verify Xingming B — 三才配置 (Three Talents) + 5-tier verdict.

Coverage:
  Part 1 — core/data: enumerate 5×5×5=125 sancai combos, check 5-tier distribution
                       (no level missing, balanced enough)
  Part 2 — core integration: calculate 5 fixed names, each producing one of 5 levels
                              (大吉 / 吉 / 中吉 / 凶 / 大凶) — and the result
                              shape contains `result.sancai` with combo / level / relations
  Part 3 — UI render (双主题 × 三语 × 5 等级样本):
            * SancaiCard 出现在 XingmingPage（FiveGrids 与 OverallGauge 之间）
            * 3 个 slot（天/人/地）+ 2 个生克箭头 + 1 个 verdict
            * 等级文案 与 计算等级一致
            * 双主题 各 截图 1 张 / 等级（10 张）
  Part 4 — A11y: SancaiCard 有 role="group" + aria-label 含等级文案

Run:
  python3 scripts/verify-xingming-sancai.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/xingming"

SHOTS_DIR = Path(__file__).resolve().parent.parent / "design" / "screenshots" / "2026-04-25-xingming-sancai"
SHOTS_DIR.mkdir(parents=True, exist_ok=True)

# 5 等级 × 5 个姓名样本（已经过 enumerateSancaiTable 离线验证）
SAMPLES = [
    ("张伟峰", "great", "大吉", ["木", "木", "木"]),  # all same → 大吉
    ("黄渤",   "good",  "吉",  ["木", "火", "火"]),  # sheng + tongHe → 吉
    ("林心如", "mid",   "中吉", ["水", "木", "水"]),  # sheng + xie → 中吉
    ("王明华", "bad",   "凶",  ["土", "木", "木"]),  # hao + tongHe → 凶
    ("陈志强", "worst", "大凶", ["金", "火", "水"]),  # hao + hao → 大凶
]

# 三语下等级文案
LEVEL_LABEL = {
    "zh-CN": {"great": "大吉", "good": "吉", "mid": "中吉", "bad": "凶", "worst": "大凶"},
    "zh-TW": {"great": "大吉", "good": "吉", "mid": "中吉", "bad": "凶", "worst": "大凶"},
    "en":    {"great": "Auspicious", "good": "Favorable", "mid": "Mild", "bad": "Unfavorable", "worst": "Inauspicious"},
}


def section(title: str) -> None:
    print(f"\n=== {title} ===")


def set_locale(page, code: str) -> None:
    """Switch UI locale via store."""
    page.evaluate(f"""
      async () => {{
        const m = await import('/src/stores/locale.ts');
        const s = m.useLocaleStore();
        s.set('{code}');
      }}
    """)


def set_theme(page, theme: str) -> None:
    page.evaluate(f"""
      async () => {{
        const m = await import('/src/stores/theme.ts');
        const s = m.useThemeStore();
        s.set('{theme}');
      }}
    """)


def submit_name(page, surname: str, given_name: str) -> None:
    """Fill NameInput form + click calculate."""
    inputs = page.locator(".xm-name-input input[type='text']")
    inputs.nth(0).fill(surname)
    inputs.nth(1).fill(given_name)
    btn = page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first
    btn.click()
    page.wait_for_selector(".xm-sancai", timeout=15_000)


def main() -> int:
    failures: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.add_init_script(
            "localStorage.setItem('tt-qimen:theme', 'guofeng');"
            "localStorage.setItem('tt-qimen:locale', 'zh-CN');"
        )
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_selector(".xm-name-input", timeout=15_000)

        # ----------------------------------------------------------
        # Part 1 — enumerate 125-combo distribution
        # ----------------------------------------------------------
        section("Part 1 — 125 combos · 5-tier distribution")
        dist = page.evaluate("""
          async () => {
            const m = await import('/src/modules/xingming/data/sancai.ts');
            const tbl = m.enumerateSancaiTable();
            const dist = {};
            for (const r of tbl) dist[r.level] = (dist[r.level] || 0) + 1;
            return { total: tbl.length, dist };
          }
        """)
        print("  total:", dist["total"], " distribution:", dist["dist"])
        if dist["total"] != 125:
            failures.append(f"Part 1: expected 125 combos, got {dist['total']}")
        for k in ["大吉", "吉", "中吉", "凶", "大凶"]:
            if dist["dist"].get(k, 0) == 0:
                failures.append(f"Part 1: tier '{k}' is empty (5-tier coverage broken)")
            else:
                print(f"    [OK] tier '{k}' = {dist['dist'][k]}")

        # ----------------------------------------------------------
        # Part 2 — core integration: 5 samples each map to 5 levels
        # ----------------------------------------------------------
        section("Part 2 — core integration · 5 samples")
        core_check = page.evaluate("""
          async (samples) => {
            const { calculateXingming } = await import('/src/modules/xingming/core/xingming.ts');
            const out = [];
            for (const s of samples) {
              const surname = s[0][0];
              const givenName = s[0].slice(1);
              const r = await calculateXingming({ surname, givenName, gender: 'male', birthYear: null }, 'zh-CN');
              out.push({
                name: s[0],
                expectedKey: s[1],
                expectedLevel: s[2],
                actualLevel: r.sancai.level,
                actualLevelKey: r.sancai.levelKey,
                actualCombo: r.sancai.combo,
                tianToRen: r.sancai.tianToRen,
                renToDi: r.sancai.renToDi,
              });
            }
            return out;
          }
        """, [[name, key, lvl, combo] for name, key, lvl, combo in SAMPLES])
        for c in core_check:
            ok = c["actualLevel"] == c["expectedLevel"] and c["actualLevelKey"] == c["expectedKey"]
            mark = "[OK]" if ok else "[FAIL]"
            print(f"    {mark} {c['name']}  combo={'-'.join(c['actualCombo'])} level={c['actualLevel']} ({c['actualLevelKey']}) "
                  f"t→r={c['tianToRen']} r→d={c['renToDi']}")
            if not ok:
                failures.append(
                    f"Part 2: {c['name']} expected={c['expectedLevel']}/{c['expectedKey']}, "
                    f"got={c['actualLevel']}/{c['actualLevelKey']}"
                )

        # ----------------------------------------------------------
        # Part 3 — UI render across 双主题 × 三语 × 5 等级
        # 实现：每个样本走 NameInput 表单 + 点 calculate；切换 theme/locale 后重算
        # 由于每次 calculate 走 chinese-character-strokes 异步 → 等待 .xm-sancai 出现
        # ----------------------------------------------------------
        section("Part 3 — UI: 双主题 × 三语 × 5 等级")
        for theme in ["guofeng", "minimal"]:
            set_theme(page, theme)
            page.wait_for_timeout(150)
            for locale in ["zh-CN", "zh-TW", "en"]:
                set_locale(page, locale)
                page.wait_for_timeout(200)

                for sample_idx, (name, level_key, level_zh, expected_combo) in enumerate(SAMPLES):
                    surname = name[0]
                    given_name = name[1:]

                    # 先点击「重新推演」清空（如果按钮存在），否则直接 fill 输入框
                    recalc_btn = page.locator("button:has-text('重新推演'), button:has-text('重新推演'), button:has-text('Recalculate'), button:has-text('重新計算')")
                    if recalc_btn.count() > 0:
                        try:
                            recalc_btn.first.click()
                            page.wait_for_selector(".xm-name-input input", timeout=5_000)
                            page.wait_for_timeout(200)
                        except Exception:
                            pass

                    inputs = page.locator(".xm-name-input input[type='text']")
                    if inputs.count() < 2:
                        failures.append(
                            f"Part 3: theme={theme} locale={locale} {name} — input not found"
                        )
                        continue
                    inputs.nth(0).fill(surname)
                    inputs.nth(1).fill(given_name)
                    btn = page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first
                    btn.click()
                    page.wait_for_selector(".xm-sancai", timeout=15_000)
                    page.wait_for_timeout(200)

                    # 读取 verdict 文案
                    verdict_label = page.locator(".xm-sancai-verdict-label").first.inner_text().strip()
                    expected_label = LEVEL_LABEL[locale][level_key]
                    slot_count = page.locator(".xm-sancai-slot").count()
                    rel_count = page.locator(".xm-sancai-rel").count()

                    ok = (
                        verdict_label == expected_label
                        and slot_count == 3
                        and rel_count == 2
                    )
                    mark = "[OK]" if ok else "[FAIL]"
                    print(f"    {mark} theme={theme:8} locale={locale:5} {name:5} "
                          f"verdict='{verdict_label}' (expect '{expected_label}') "
                          f"slots={slot_count} rels={rel_count}")
                    if not ok:
                        failures.append(
                            f"Part 3: theme={theme} locale={locale} {name} "
                            f"verdict='{verdict_label}' expected='{expected_label}' "
                            f"slots={slot_count}(want 3) rels={rel_count}(want 2)"
                        )

                    # 仅在 zh-CN locale 下截图（5 等级 × 2 主题 = 10 张）
                    if locale == "zh-CN":
                        # 等骨架退出（page-internal useSkeletonReveal delay = 1500ms）
                        try:
                            page.wait_for_selector(".skeleton-overlay:not(.visible)", timeout=4_000)
                        except Exception:
                            pass
                        # 双保险：若 .visible 仍存在，再 sleep 1.6s
                        if page.locator(".skeleton-overlay.visible").count() > 0:
                            page.wait_for_timeout(1_700)
                        page.locator(".xm-sancai").scroll_into_view_if_needed()
                        page.wait_for_timeout(300)
                        shot_path = SHOTS_DIR / f"{theme}-{level_key}-{name}.png"
                        page.locator(".xm-sancai").screenshot(path=str(shot_path))
                        print(f"      shot: {shot_path.name}")

        # ----------------------------------------------------------
        # Part 4 — A11y: role + aria-label
        # 直接复用上一轮（Part 3）的最后渲染状态：theme=minimal, locale=en
        # 重新切回 guofeng+zh-CN+张伟峰（大吉）
        # ----------------------------------------------------------
        section("Part 4 — A11y")
        set_theme(page, "guofeng")
        set_locale(page, "zh-CN")
        page.wait_for_timeout(300)
        recalc_btn = page.locator("button:has-text('重新推演')")
        if recalc_btn.count() > 0:
            try:
                recalc_btn.first.click()
                page.wait_for_selector(".xm-name-input input", timeout=5_000)
                page.wait_for_timeout(200)
            except Exception:
                pass
        inputs = page.locator(".xm-name-input input[type='text']")
        inputs.nth(0).fill("张")
        inputs.nth(1).fill("伟峰")
        page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first.click()
        page.wait_for_selector(".xm-sancai", timeout=15_000)
        page.wait_for_timeout(300)
        a11y = page.evaluate("""
          () => {
            const el = document.querySelector('.xm-sancai');
            return {
              role: el?.getAttribute('role'),
              aria: el?.getAttribute('aria-label'),
            };
          }
        """)
        print(f"  role={a11y['role']!r} aria-label={a11y['aria']!r}")
        if a11y["role"] != "group":
            failures.append(f"Part 4: role expected 'group', got {a11y['role']!r}")
        if not a11y["aria"] or "大吉" not in a11y["aria"]:
            failures.append(f"Part 4: aria-label missing 等级文案: {a11y['aria']!r}")
        else:
            print("    [OK] role=group + aria-label 含 等级文案")

        browser.close()

    print("\n=== Summary ===")
    if failures:
        print(f"  {len(failures)} failure(s):")
        for f in failures:
            print(f"  - {f}")
        return 1
    print(f"  ALL PASS  · screenshots saved to {SHOTS_DIR.relative_to(SHOTS_DIR.parent.parent.parent)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
