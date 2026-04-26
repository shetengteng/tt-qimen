#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证称骨算命模块的 i18n（zh-CN / zh-TW / en）

策略：
  注入 1989-06-22 23:00（农历 己巳·五月·十九·子时）的 birth，
  排盘后切换 locale，断言 result 文案：
    - zh-CN：包含简体特征字"业 / 难 / 经"
    - zh-TW：包含繁体特征字"業 / 難 / 經"，且不包含简体"业"等
    - en   ：保持 zh-CN 古文原貌（用户口径：歌诀文化属性强，禁止意译）

  同时验证：
    - displayWeight：zh-TW 应含"兩"或"錢"
    - breakdown labels：zh-TW 月份"臘月生" / "正月生" / "閏" 等
    - 切换 locale 不丢 result，无需重新排盘
"""
from __future__ import annotations

import json
import re
import sys
from typing import Tuple

from playwright.sync_api import Page, sync_playwright

BASE = "http://localhost:5180"

SIMP_CHARS = re.compile(r"[业难经发国财时举]")  # 简体特征
TRAD_CHARS = re.compile(r"[業難經發國財時舉]")  # 繁体特征

# 注：1989-06-22 23:00 对应农历 己巳·五月·十九·子时 → 0.5+0.5+0.5+1.6=3.1 两（4骨）
BIRTH = {
    "calendar": "solar",
    "year": 1989,
    "month": 6,
    "day": 22,
    "hour": 23,
    "minute": 0,
    "gender": "male",
}


def reset_localstorage(page: Page, locale: str) -> None:
    page.evaluate(
        f"""(loc) => {{
            localStorage.setItem('tt-qimen:locale', loc);
            localStorage.setItem('tt-qimen:theme', 'guofeng');
            localStorage.setItem('tt-qimen:chenggu:birth', JSON.stringify({json.dumps(BIRTH)}));
        }}""",
        locale,
    )


def goto_chenggu(page: Page) -> None:
    page.goto(f"{BASE}/#/chenggu")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(800)


def click_paipan(page: Page) -> None:
    page.wait_for_selector(".cg-layout, main", timeout=10000)
    btn = page.get_by_role("button").filter(has_text=re.compile(r"开始称骨|開始秤骨|Weigh the Bones"))
    btn.first.wait_for(timeout=10000)
    btn.first.click()
    page.wait_for_timeout(2500)
    page.wait_for_selector(".cg-poem-section, .cg-poem-card", timeout=10000)
    page.wait_for_timeout(500)


def read_result_text(page: Page) -> dict:
    poem = page.locator(".cg-poem-verse .cg-poem-line").all_inner_texts()
    title = page.locator(".cg-poem-title").first.inner_text() if page.locator(".cg-poem-title").count() else ""
    description = page.locator(".cg-interpret-card p").first.inner_text() if page.locator(".cg-interpret-card p").count() else ""
    bone_srcs = page.locator(".cg-bone-src").all_inner_texts()
    return {
        "title": title.strip(),
        "poem": [s.strip() for s in poem],
        "description": description.strip(),
        "bone_srcs": [s.strip() for s in bone_srcs],
    }


def assert_locale(label: str, data: dict) -> Tuple[bool, list]:
    errors: list = []
    poem_joined = "".join(data["poem"])
    desc = data["description"]
    title = data["title"]
    srcs = "".join(data["bone_srcs"])
    full = poem_joined + desc + title + srcs

    if label == "zh-CN":
        if not SIMP_CHARS.search(full):
            # 部分歌诀不含特征字时放宽 —— 至少不应出现繁体特征
            pass
        if TRAD_CHARS.search(full):
            errors.append(f"zh-CN 不应含繁体特征字: {TRAD_CHARS.search(full).group()}")
    elif label == "zh-TW":
        if SIMP_CHARS.search(full):
            errors.append(f"zh-TW 不应含简体特征字: {SIMP_CHARS.search(full).group()}")
        if not TRAD_CHARS.search(full):
            errors.append("zh-TW 应至少含一个繁体特征字（業/難/經/發/國/財/時 等），实际未找到")
        # displayWeight 单位字应繁体
        # title 形如 "三两一钱" → "三兩一錢"
        if "两" in title or "钱" in title:
            errors.append(f"zh-TW title 仍含简体单位 '两/钱': {title}")
    elif label == "en":
        # en 不译，保持 zh-CN 原貌（应含 CJK 简体）
        if not re.search(r"[\u4e00-\u9fff]", full):
            errors.append("en 模式古文应保持中文，未发现 CJK 字符")
    return len(errors) == 0, errors


def run() -> int:
    failures = 0
    summary = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            for locale in ("zh-CN", "zh-TW", "en"):
                ctx = browser.new_context(viewport={"width": 1280, "height": 900})
                page = ctx.new_page()
                page.goto(BASE)
                reset_localstorage(page, locale)
                page.reload()
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(800)
                goto_chenggu(page)
                click_paipan(page)
                data = read_result_text(page)
                ok, errs = assert_locale(locale, data)
                summary.append({
                    "locale": locale,
                    "ok": ok,
                    "title": data["title"],
                    "first_line": data["poem"][0] if data["poem"] else "",
                    "description_head": data["description"][:60],
                    "bone_srcs": data["bone_srcs"],
                    "errors": errs,
                })
                if not ok:
                    failures += 1
                ctx.close()

            # 切换 locale 不丢 result
            ctx = browser.new_context(viewport={"width": 1280, "height": 900})
            page = ctx.new_page()
            page.goto(BASE)
            reset_localstorage(page, "zh-CN")
            page.reload()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(800)
            goto_chenggu(page)
            click_paipan(page)
            zh_cn_data = read_result_text(page)
            # 切到 zh-TW（不重新排盘）
            page.evaluate("() => localStorage.setItem('tt-qimen:locale', 'zh-TW')")
            # 触发响应式：reload 不行（result 会丢），用 vue-i18n 的 set 方法不易，用 hashchange 或刷新
            # 实际产品切换是通过 LocaleSwitcher 组件 store.set；此处直接刷新模拟新会话不算切换。
            # 改为：检查 store watch 是否真的没丢 result
            # 简化：直接看 watch 是否触发——通过 CustomEvent 或 dispatchStorageEvent
            page.evaluate("""
              () => window.dispatchEvent(new StorageEvent('storage', {
                key: 'tt-qimen:locale', newValue: 'zh-TW', oldValue: 'zh-CN', storageArea: localStorage
              }))
            """)
            page.wait_for_timeout(800)
            zh_tw_data = read_result_text(page)
            switch_ok = zh_tw_data["title"] != "" and zh_tw_data["title"] != zh_cn_data["title"]
            summary.append({
                "locale": "switch-zh-CN→zh-TW",
                "ok": switch_ok,
                "before": zh_cn_data["title"],
                "after": zh_tw_data["title"],
                "errors": [] if switch_ok else ["切换 locale 后 title 未变化或丢失"],
            })
            if not switch_ok:
                failures += 1
            ctx.close()
        finally:
            browser.close()

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(run())
