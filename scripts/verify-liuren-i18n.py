#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证小六壬 36 段解读 + 12 组宜忌 + 6 宫名的三语化（zh-CN / zh-TW / en）

验证矩阵：
  对每个 locale 起一次 custom 卦（month=5, day=18, hourIndex=7 → 赤口）
  对每个 aspect tab 切换并断言 readingText/yiji 文本：
    zh-CN：应包含简体特征字（如"赤口"、"职场"）
    zh-TW：应包含繁体特征字（如"赤口"宫名汉字、繁化字符如"職場"）
    en   ：应为 ASCII（不含 CJK），且包含特定关键词（如"Chi-Kou"或英文 readings 中的名词）

  另外验证：
    - PalaceWheel 中心字按 locale 渲染（zh-CN/zh-TW/en）
    - locale 切换不丢失 result，readings 实时切换
"""
from __future__ import annotations

import json
import re
import sys

from playwright.sync_api import Page, sync_playwright

BASE = "http://localhost:5180"

CJK_RANGE = re.compile(r"[\u4e00-\u9fff]")

LOCALES = [
    ("zh-CN", "赤口", "职场"),    # 简体
    ("zh-TW", "赤口", "職場"),    # 繁体（chinese-conv 转）
    ("en",    "Chi-Kou", "Workplace"),  # 拼音 + 英文 readings
]


def reset_localstorage(page: Page, locale: str) -> None:
    page.evaluate(
        f"""(loc) => {{
            localStorage.removeItem('tt-divination:liuren-input');
            localStorage.removeItem('tt-divination:liuren-last-computed');
            localStorage.setItem('tt-qimen:locale', loc);
            localStorage.setItem('tt-qimen:theme', 'guofeng');
            const inp = {{
                mode: 'custom',
                aspect: 'overall',
                question: '',
                custom: {{ month: 5, day: 18, hourIndex: 7 }}
            }};
            localStorage.setItem('tt-divination:liuren-input', JSON.stringify(inp));
        }}""",
        locale,
    )


def goto_liuren(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/liuren'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(300)


def click_paipan(page: Page) -> None:
    btn = page.locator(".ds-input-actions button").first
    btn.wait_for(state="visible", timeout=5_000)
    btn.click()


def read_center_palace(page: Page) -> str:
    el = page.locator(".lr-wheel-center-main").first
    el.wait_for(state="visible", timeout=3_000)
    return el.inner_text().strip()


def read_reading_body(page: Page) -> str:
    el = page.locator(".lr-reading-body").first
    el.wait_for(state="visible", timeout=3_000)
    return el.inner_text().strip()


def read_yiji_content(page: Page) -> tuple[str, str]:
    """返回 (suitable, avoid) 文本（已由组件按 locale 用 '、' 或 ', ' 拼接）"""
    yi = page.locator(".lr-yiji-content").nth(0).inner_text().strip()
    ji = page.locator(".lr-yiji-content").nth(1).inner_text().strip()
    return yi, ji


def read_reading_title(page: Page) -> str:
    el = page.locator(".lr-reading-title").first
    el.wait_for(state="visible", timeout=3_000)
    return el.inner_text().strip()


def click_aspect_tab(page: Page, aspect_index: int) -> None:
    """0=overall 1=career 2=love 3=wealth 4=health 5=travel"""
    tab = page.locator(".lr-aspect-tab").nth(aspect_index)
    tab.click()
    page.wait_for_timeout(150)


def fail(msg: str):
    print(f"  [FAIL] {msg}")
    sys.exit(1)


def ok(msg: str):
    print(f"  [OK]   {msg}")


def has_cjk(s: str) -> bool:
    return bool(CJK_RANGE.search(s))


def main() -> int:
    print("\n=========== liuren i18n 三语验证 ===========\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")

        for locale, expect_palace, expect_career in LOCALES:
            print(f"--- Locale: {locale} ---")
            reset_localstorage(page, locale)
            page.reload()
            page.wait_for_load_state("networkidle")
            goto_liuren(page)
            page.wait_for_timeout(400)

            click_paipan(page)
            page.wait_for_selector(".result-banner.revealed", timeout=6_000)
            page.wait_for_timeout(1_500)

            # 1. PalaceWheel 中心字
            center = read_center_palace(page)
            if center != expect_palace:
                fail(f"中心宫名期望 {expect_palace!r}，实际 {center!r}")
            ok(f"中心宫名: {center}")

            # 2. overall 段 readings
            click_aspect_tab(page, 0)
            page.wait_for_timeout(200)
            body_overall = read_reading_body(page)
            if locale == "en":
                if has_cjk(body_overall):
                    fail(f"en overall 段不应含 CJK 字符: {body_overall[:80]!r}")
                if "Chi-Kou" not in body_overall and "disputes" not in body_overall.lower():
                    fail(f"en overall 段缺关键词 (Chi-Kou/disputes): {body_overall[:120]!r}")
            else:
                if not has_cjk(body_overall):
                    fail(f"{locale} overall 段应含 CJK: {body_overall!r}")
            ok(f"overall body OK: {body_overall[:60]}…")

            # 3. career 段切换
            click_aspect_tab(page, 1)
            page.wait_for_timeout(200)
            body_career = read_reading_body(page)
            if expect_career not in body_career:
                fail(f"{locale} career 段缺关键词 {expect_career!r}: {body_career[:120]!r}")
            ok(f"career body 含关键词 '{expect_career}'")

            # 4. yiji 内容
            yi, ji = read_yiji_content(page)
            if not yi or yi == "—":
                fail(f"{locale} suitable 列表为空")
            if not ji or ji == "—":
                fail(f"{locale} avoid 列表为空")
            if locale == "en":
                if has_cjk(yi) or has_cjk(ji):
                    fail(f"en yi/ji 含 CJK: yi={yi!r} ji={ji!r}")
            ok(f"yi={yi[:40]}… ji={ji[:40]}…")

            # 5. 标题中包含 displayName
            title = read_reading_title(page)
            if expect_palace not in title:
                fail(f"标题应含 {expect_palace!r}: {title!r}")
            ok(f"标题: {title}")

            print()

        # ---------- locale 切换：不重新点击就能切换文本 ----------
        print("--- 即时切换：zh-CN → en 期间 result 应实时换语种 ---")
        reset_localstorage(page, "zh-CN")
        page.reload()
        page.wait_for_load_state("networkidle")
        goto_liuren(page)
        click_paipan(page)
        page.wait_for_selector(".result-banner.revealed", timeout=6_000)
        page.wait_for_timeout(1_500)

        body_before = read_reading_body(page)
        if not has_cjk(body_before):
            fail("zh-CN 时 body 应含 CJK")
        ok(f"zh-CN body: {body_before[:50]}…")

        # 切换到 en
        page.evaluate("() => localStorage.setItem('tt-qimen:locale', 'en')")
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_selector(".result-zone.revealed", timeout=2_500)
        page.wait_for_timeout(800)

        body_after = read_reading_body(page)
        if has_cjk(body_after):
            fail(f"切换到 en 后 body 仍含 CJK: {body_after[:80]!r}")
        ok(f"en body (切换后): {body_after[:60]}…")

        center_after = read_center_palace(page)
        if center_after != "Chi-Kou":
            fail(f"en 中心宫名应为 Chi-Kou，实际 {center_after!r}")
        ok(f"en 中心宫名: {center_after}")

        browser.close()
    print("\n=========== [OK] i18n 三语全部通过 ===========\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
