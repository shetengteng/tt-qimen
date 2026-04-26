#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证：Header 的 Lang/Theme Icon 切换（PopoverRoot 版）。

覆盖：
  * 两个 trigger 都能被点击、面板能弹出（has data-state='open'）
  * 当前项在面板里带 `.is-active`
  * 选 list 中另一项后：localStorage 写入正确、点击关闭面板、新 trigger 文字更新
  * 选语言后再选回原值，确保切换可逆

调用：python3 scripts/common/verify-layout-switch-popover.py
"""

import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5180"


def main() -> int:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        page.goto(BASE_URL, wait_until="networkidle")
        # 重置到 zh-CN + guofeng（避免上一次本地存储干扰）
        page.evaluate(
            """() => {
                localStorage.setItem('tt-qimen:locale', 'zh-CN');
                localStorage.setItem('tt-qimen:theme', 'guofeng');
            }"""
        )
        page.evaluate("() => window.location.reload()")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(400)

        # 精确按修饰类锁定：`--lang` / `--theme` / `--nav`，避免新增的 nav popover 冲入
        lang_btn = page.locator(".layout-popover-trigger--lang").first
        theme_btn = page.locator(".layout-popover-trigger--theme").first
        nav_count = page.locator(".layout-popover-trigger--nav").count()
        if lang_btn.count() != 1 or theme_btn.count() != 1:
            print(
                "❌ trigger 数量异常："
                f"lang={lang_btn.count()}, theme={theme_btn.count()}, nav={nav_count}"
            )
            return 1

        # === 语言切换：zh-CN → en ===
        lang_btn.click()
        page.wait_for_timeout(200)
        # 面板打开后该项 trigger data-state='open'
        if lang_btn.get_attribute("data-state") != "open":
            print("❌ 语言 trigger 点击后 data-state 不是 'open'")
            return 1
        # 当前项（简体中文）应当 is-active
        active_in_panel = page.locator(".layout-popover-content--lang .layout-popover-option.is-active")
        if active_in_panel.count() != 1:
            print(f"❌ 语言面板中 is-active 选项数 {active_in_panel.count()} ≠ 1")
            return 1
        active_text = active_in_panel.first.inner_text().strip()
        if "简" not in active_text and "简体" not in active_text:
            print(f"❌ 当前 is-active 选项不是简体中文：{active_text!r}")
            return 1

        # 点 English
        page.locator(".layout-popover-content--lang .layout-popover-option").filter(
            has_text="English"
        ).click()
        page.wait_for_timeout(300)
        # locale store 应已切换
        loc = page.evaluate("() => localStorage.getItem('tt-qimen:locale')")
        if loc != "en":
            print(f"❌ localStorage tt-qimen:locale 不是 'en'：{loc!r}")
            return 1
        # trigger 文字更新为 EN
        trig_text = lang_btn.inner_text().strip()
        if trig_text != "EN":
            print(f"❌ 语言 trigger 文字不是 'EN'：{trig_text!r}")
            return 1
        # 面板已关闭
        if lang_btn.get_attribute("data-state") != "closed":
            print("❌ 选完后语言 trigger data-state 不是 'closed'")
            return 1
        print(f"✅ 语言切换成功：locale='en'，trigger='{trig_text}'")

        # === 主题切换：guofeng → minimal ===
        theme_btn.click()
        page.wait_for_timeout(200)
        if theme_btn.get_attribute("data-state") != "open":
            print("❌ 主题 trigger 点击后 data-state 不是 'open'")
            return 1
        active_theme = page.locator(".layout-popover-content--theme .layout-popover-option.is-active")
        if active_theme.count() != 1:
            print(f"❌ 主题面板中 is-active 选项数 {active_theme.count()} ≠ 1")
            return 1

        # 点 Minimal
        page.locator(".layout-popover-content--theme .layout-popover-option").filter(
            has_text="Minimal"
        ).click()
        page.wait_for_timeout(300)
        theme = page.evaluate("() => localStorage.getItem('tt-qimen:theme')")
        if theme != "minimal":
            print(f"❌ localStorage tt-qimen:theme 不是 'minimal'：{theme!r}")
            return 1
        # documentElement data-theme 同步
        data_theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        if data_theme != "minimal":
            print(f"❌ documentElement data-theme 不是 'minimal'：{data_theme!r}")
            return 1
        # trigger 文字更新为 'M'
        theme_text = theme_btn.inner_text().strip()
        if theme_text != "M":
            print(f"❌ 主题 trigger 文字不是 'M'：{theme_text!r}")
            return 1
        print(f"✅ 主题切换成功：theme='minimal'，trigger='{theme_text}'，data-theme='{data_theme}'")

        # === 切回 zh-CN，验证可逆 ===
        lang_btn.click()
        page.wait_for_timeout(200)
        page.locator(".layout-popover-content--lang .layout-popover-option").filter(
            has_text="简体"
        ).click()
        page.wait_for_timeout(300)
        loc = page.evaluate("() => localStorage.getItem('tt-qimen:locale')")
        if loc != "zh-CN":
            print(f"❌ 切回 zh-CN 失败：{loc!r}")
            return 1
        if lang_btn.inner_text().strip() != "简":
            print(f"❌ 语言 trigger 没回到 '简'：{lang_btn.inner_text()!r}")
            return 1
        print("✅ 语言切回 zh-CN 成功")

        browser.close()
        print("\n🎉 所有 popover 切换断言通过")
        return 0


if __name__ == "__main__":
    sys.exit(main())
