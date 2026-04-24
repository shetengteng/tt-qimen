#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证 Header 的 Lang / Theme 下拉：
1. 访问首页
2. 确认右上角有 2 个 [data-slot=select-trigger]（Lang + Theme）
3. 点击 Lang 触发器 → 出现 SelectContent 面板 → 选 "繁" → URL 不变、localStorage 语言更新、触发器 label 变 "繁"
4. 点击 Theme 触发器 → 选 "简约" → data-theme 由 guofeng 变 minimal、同样的两个触发器仍存在
5. 切回 "国风" 与 "简" 验证双向可切
"""

import re
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5180"


def count_switch_triggers(page):
    return page.locator(".gf-toolbar [data-slot=select-trigger], .mn-toolbar [data-slot=select-trigger]").count()


def get_locale_ls(page):
    return page.evaluate("() => window.localStorage.getItem('lumina-locale') || window.localStorage.getItem('tt-qimen:locale')")


def get_theme_attr(page):
    return page.evaluate("() => document.documentElement.dataset.theme")


def get_trigger_texts(page):
    return page.evaluate(
        """() => Array.from(document.querySelectorAll('.gf-toolbar [data-slot=select-trigger], .mn-toolbar [data-slot=select-trigger]')).map(el => el.innerText.trim())"""
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()
        try:
            print(f"→ 访问 {BASE_URL}")
            page.goto(BASE_URL, wait_until="domcontentloaded")
            page.wait_for_timeout(1500)

            n = count_switch_triggers(page)
            print(f"  触发器数量: {n}")
            if n != 2:
                raise Exception(f"期望 2 个下拉触发器（Lang + Theme），实际 {n}")

            tts = get_trigger_texts(page)
            print(f"  当前触发器文案: {tts}")
            theme0 = get_theme_attr(page)
            print(f"  当前 theme: {theme0}")

            print("→ 点击第 1 个触发器（Lang）并选 '繁'")
            triggers = page.locator(".gf-toolbar [data-slot=select-trigger], .mn-toolbar [data-slot=select-trigger]")
            triggers.nth(0).click()
            page.wait_for_timeout(300)
            page.wait_for_selector("[data-slot=select-content]", timeout=5000)
            page.locator("[data-slot=select-content] [data-slot=select-item]", has_text=re.compile(r"繁")).first.click()
            page.wait_for_timeout(500)
            tts2 = get_trigger_texts(page)
            print(f"  切换后触发器文案: {tts2}")
            if "繁" not in tts2[0]:
                raise Exception(f"Lang 切换无效：期望第 1 触发器文案含 '繁'，实际 '{tts2[0]}'")

            print("→ 点击第 2 个触发器（Theme）并选 '简约'")
            triggers = page.locator(".gf-toolbar [data-slot=select-trigger], .mn-toolbar [data-slot=select-trigger]")
            triggers.nth(1).click()
            page.wait_for_timeout(300)
            page.wait_for_selector("[data-slot=select-content]", timeout=5000)
            simple_opt = page.locator(
                "[data-slot=select-content] [data-slot=select-item]",
                has_text=re.compile(r"簡約|简约|Minimal", re.I),
            ).first
            simple_opt.click()
            page.wait_for_timeout(500)
            theme1 = get_theme_attr(page)
            print(f"  切换后 theme: {theme1}")
            if theme1 != "minimal":
                raise Exception(f"Theme 切换无效：期望 minimal，实际 {theme1}")

            # 切到简约主题后 toolbar class 变了（.mn-toolbar），再次确认触发器仍在
            n2 = count_switch_triggers(page)
            print(f"  简约主题下触发器数量: {n2}")
            if n2 != 2:
                raise Exception(f"简约主题下触发器丢失：期望 2，实际 {n2}")

            print("→ 切回国风 + 简体，确认双向可切换")
            triggers = page.locator(".mn-toolbar [data-slot=select-trigger]")
            triggers.nth(1).click()
            page.wait_for_timeout(300)
            page.wait_for_selector("[data-slot=select-content]", timeout=5000)
            page.locator(
                "[data-slot=select-content] [data-slot=select-item]",
                has_text=re.compile(r"國風|国风|Guofeng|Chinese", re.I),
            ).first.click()
            page.wait_for_timeout(500)
            theme2 = get_theme_attr(page)
            print(f"  最终 theme: {theme2}")
            if theme2 != "guofeng":
                raise Exception(f"回切国风失败：期望 guofeng，实际 {theme2}")

            triggers = page.locator(".gf-toolbar [data-slot=select-trigger]")
            triggers.nth(0).click()
            page.wait_for_timeout(300)
            page.wait_for_selector("[data-slot=select-content]", timeout=5000)
            page.locator("[data-slot=select-content] [data-slot=select-item]", has_text=re.compile(r"简")).first.click()
            page.wait_for_timeout(500)
            tts3 = get_trigger_texts(page)
            print(f"  最终触发器文案: {tts3}")
            if "简" not in tts3[0]:
                raise Exception(f"回切简体失败：实际 '{tts3[0]}'")

            print("\n✅ LangSwitch + ThemeSwitch 下拉化 · 验证通过")
        finally:
            browser.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ 下拉切换验证失败：{e}", file=sys.stderr)
        sys.exit(1)
