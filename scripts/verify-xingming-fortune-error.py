#!/usr/bin/env python3
"""Verify Xingming A — FortuneError integration.

Coverage:
  - Core (calculateXingming) throws FortuneError with correct code+details for:
      * empty surname / empty givenName
      * non-CJK surname / non-CJK givenName
      * surname length > 2 / givenName length > 2
      * (StrokesNotFoundError still kept separate for rare chars — not asserted here)
  - XingmingPage UI shows the right hint text per locale (zh-CN / zh-TW / en)
    when invalid input triggers FortuneError via the form submit path.

Run:
  python3 scripts/verify-xingming-fortune-error.py
"""
from __future__ import annotations

import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/xingming"


def section(title: str) -> None:
    print(f"\n=== {title} ===")


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

        # ---------------------------------------------------------------
        # Part 1 — core 直接调用，确认每个 throw 都是 FortuneError + 正确 code/details
        # ---------------------------------------------------------------
        section("Part 1 — core throws FortuneError")
        result = page.evaluate("""
        async () => {
          const mod = await import('/src/modules/xingming/core/xingming.ts');
          const errMod = await import('/src/lib/errors.ts');
          const { calculateXingming } = mod;
          const { FortuneError } = errMod;

          const cases = [
            { name: 'empty-surname',     input: { surname: '', givenName: '伟', gender: 'male', birthYear: null } },
            { name: 'empty-givenName',   input: { surname: '王', givenName: '', gender: 'male', birthYear: null } },
            { name: 'nonCjk-surname',    input: { surname: 'A', givenName: '伟', gender: 'male', birthYear: null } },
            { name: 'nonCjk-givenName',  input: { surname: '王', givenName: 'B', gender: 'male', birthYear: null } },
            { name: 'long-surname',      input: { surname: '王王王', givenName: '伟', gender: 'male', birthYear: null } },
            { name: 'long-givenName',    input: { surname: '王', givenName: '伟伟伟', gender: 'male', birthYear: null } },
          ];

          const out = [];
          for (const c of cases) {
            try {
              await calculateXingming(c.input, 'zh-CN');
              out.push({ name: c.name, ok: false, why: 'did not throw' });
            } catch (e) {
              const isFE = FortuneError.is(e);
              out.push({
                name: c.name,
                ok: isFE,
                code: isFE ? e.code : null,
                details: isFE ? e.details : null,
                ctor: e?.constructor?.name,
                message: e?.message,
              });
            }
          }
          return out;
        }
        """)

        # 期望表
        expected = {
            'empty-surname':     {'code': 'invalid-input', 'reason': 'empty',   'field': 'surname'},
            'empty-givenName':   {'code': 'invalid-input', 'reason': 'empty',   'field': 'givenName'},
            'nonCjk-surname':    {'code': 'invalid-input', 'reason': 'non-cjk', 'field': 'surname'},
            'nonCjk-givenName':  {'code': 'invalid-input', 'reason': 'non-cjk', 'field': 'givenName'},
            'long-surname':      {'code': 'invalid-input', 'reason': 'length',  'field': 'surname'},
            'long-givenName':    {'code': 'invalid-input', 'reason': 'length',  'field': 'givenName'},
        }

        for r in result:
            name = r['name']
            exp = expected[name]
            if not r['ok']:
                msg = f"[FAIL] {name}: not FortuneError ({r.get('ctor')}, why={r.get('why', r.get('message'))})"
                print(msg)
                failures.append(msg)
                continue
            if r['code'] != exp['code']:
                msg = f"[FAIL] {name}: code={r['code']} (want {exp['code']})"
                print(msg)
                failures.append(msg)
                continue
            d = r['details'] or {}
            if d.get('reason') != exp['reason']:
                msg = f"[FAIL] {name}: reason={d.get('reason')} (want {exp['reason']})"
                print(msg)
                failures.append(msg)
                continue
            if d.get('field') != exp['field']:
                msg = f"[FAIL] {name}: field={d.get('field')} (want {exp['field']})"
                print(msg)
                failures.append(msg)
                continue
            print(f"[OK]   {name}: code={r['code']} reason={d.get('reason')} field={d.get('field')}")

        # ---------------------------------------------------------------
        # Part 2 — UI 三语错误态
        #   通过 store.input 直接注入“非 CJK 姓氏 'A'”然后调 runCalculate，
        #   断言 .compute-error-card 文案命中 byCode.nonCjk.surname 三语对应翻译。
        # ---------------------------------------------------------------
        section("Part 2 — UI shows i18n hint per locale (nonCjk.surname)")

        expected_hint_substring = {
            'zh-CN': '姓氏仅支持中文汉字',
            'zh-TW': '姓氏僅支援中文漢字',
            'en':    'Surname must be Chinese characters only',
        }

        for locale_id in ['zh-CN', 'zh-TW', 'en']:
            # 切 locale
            page.evaluate(f"""
            async () => {{
              const localeMod = await import('/src/stores/locale.ts');
              localeMod.useLocaleStore().set('{locale_id}');
            }}
            """)
            # 等 i18n 切换稳定
            page.wait_for_timeout(200)

            # 直接通过 UI 填入非 CJK 姓氏 'A'（maxlength=2 也满足）
            inputs = page.locator('.xm-name-input input[type="text"]')
            inputs.nth(0).fill('A')        # surname
            inputs.nth(1).fill('伟')        # givenName

            # 提交按钮（输入卡内最后一个 button = 计算）
            btn = page.locator('.xm-name-input button').last
            btn.click()

            # 等错误卡片出现
            page.wait_for_selector('.compute-error-card', timeout=5_000)
            text = page.locator('.compute-error-card').inner_text()

            want = expected_hint_substring[locale_id]
            if want in text:
                print(f"[OK]   {locale_id}: error card contains '{want}'")
            else:
                msg = f"[FAIL] {locale_id}: error card text={text!r} missing '{want}'"
                print(msg)
                failures.append(msg)

            # 重置：点击 retry 按钮清空错误（XingmingPage 的 onRecalculate 会清 computeError）
            retry_btn = page.locator('.compute-error-card button').last
            if retry_btn.is_visible():
                retry_btn.click()
                page.wait_for_timeout(150)

        # ---------------------------------------------------------------
        # Result
        # ---------------------------------------------------------------
        section("Result")
        if failures:
            print(f"❌ {len(failures)} failure(s):")
            for f in failures:
                print('  -', f)
            ctx.close()
            browser.close()
            return 1
        print("✅ all checks passed")
        ctx.close()
        browser.close()
        return 0


if __name__ == "__main__":
    sys.exit(main())
