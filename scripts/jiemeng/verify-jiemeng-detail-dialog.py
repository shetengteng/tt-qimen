#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证：解梦模块的「查看详情」CTA + Dialog 弹框交互。

覆盖矩阵：
    desktop (1440x900)  × { guofeng, minimal }
    mobile  ( 390x844)  × { guofeng, minimal }

每组断言：
    1. 进入 /#/jiemeng 后，输入 "蛇" 触发搜索，至少出现 1 个 .jm-entry
    2. .jm-entry 内能看到 .jm-entry-cta（说明 affordance 存在）
    3. 点击 .jm-entry：role=dialog 出现，且内部有 .jm-share-card 与 footer 按钮
    4. 点击 .jm-dialog-close：role=dialog 消失（说明 onAnother / store.setSelectedId(null) 生效）

并对每组截图 2 张（list + open），共 16 张写入：
    design/screenshots/2026-04-25-jiemeng-dialog/
"""

from __future__ import annotations

import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, Page, expect, TimeoutError as PWTimeout

BASE_URL = "http://localhost:5180/#/jiemeng"
SHOT_DIR = Path("design/screenshots/2026-04-25-jiemeng-dialog")

CASES = [
    # (name, viewport_w, viewport_h, theme)
    ("desktop-guofeng", 1440, 900, "guofeng"),
    ("desktop-minimal", 1440, 900, "minimal"),
    ("mobile-guofeng",   390, 844, "guofeng"),
    ("mobile-minimal",   390, 844, "minimal"),
]

KEYWORD = "蛇"


def prepare(page: Page, theme: str) -> None:
    """注入 localStorage、强制 zh-CN，刷新到目标主题。"""
    page.goto(BASE_URL, wait_until="networkidle")
    page.evaluate(
        """({theme}) => {
            localStorage.setItem('tt-qimen:locale', 'zh-CN');
            localStorage.setItem('tt-qimen:theme', theme);
        }""",
        {"theme": theme},
    )
    page.evaluate("() => window.location.reload()")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(400)


def trigger_search(page: Page) -> None:
    """在 DreamInput 输入关键字并触发搜索。

    DreamInput 内 Enter 会 emit('search') → JiemengPage.onSearch（pushRecent + scroll）。
    """
    box = page.locator("input.jm-input-keyword, .jm-input-card input[type='text']").first
    box.wait_for(state="visible", timeout=10_000)
    box.click()
    box.fill(KEYWORD)
    box.press("Enter")
    page.wait_for_timeout(400)


def assert_list_and_cta(page: Page, label: str) -> None:
    entries = page.locator(".jm-entry")
    cnt = entries.count()
    if cnt < 1:
        raise AssertionError(f"[{label}] 搜索 '{KEYWORD}' 未得到 .jm-entry 结果")
    cta = entries.first.locator(".jm-entry-cta")
    if cta.count() != 1:
        raise AssertionError(f"[{label}] 第一个 .jm-entry 内未找到 .jm-entry-cta")
    txt = cta.inner_text().strip()
    if "查看详情" not in txt:
        raise AssertionError(f"[{label}] CTA 文案异常：{txt!r}")


def assert_dialog_after_click(page: Page, label: str) -> None:
    page.locator(".jm-entry").first.click()
    dialog = page.locator("[role='dialog']")
    try:
        dialog.wait_for(state="visible", timeout=4000)
    except PWTimeout as exc:
        raise AssertionError(f"[{label}] 点击 .jm-entry 后 [role=dialog] 未出现") from exc
    page.wait_for_timeout(350)
    if dialog.locator(".jm-share-card").count() != 1:
        raise AssertionError(f"[{label}] dialog 内未找到 .jm-share-card")
    foot_btns = dialog.locator(".jm-dialog-foot button")
    if foot_btns.count() < 3:
        raise AssertionError(
            f"[{label}] dialog 底部按钮数 {foot_btns.count()} < 3（期望 share/save/another）"
        )


def assert_dialog_closed(page: Page, label: str) -> None:
    dialog = page.locator("[role='dialog']")
    close_btn = dialog.locator(".jm-dialog-close").first
    close_btn.click()
    try:
        dialog.wait_for(state="hidden", timeout=4000)
    except PWTimeout as exc:
        raise AssertionError(f"[{label}] 点击关闭按钮后 dialog 未消失") from exc


def run_case(page: Page, name: str, theme: str) -> tuple[bool, str]:
    label = f"{name}/{theme}"
    try:
        prepare(page, theme)
        trigger_search(page)
        assert_list_and_cta(page, label)
        page.screenshot(path=str(SHOT_DIR / f"{name}-01-list.png"), full_page=False)
        assert_dialog_after_click(page, label)
        page.screenshot(path=str(SHOT_DIR / f"{name}-02-open.png"), full_page=False)
        assert_dialog_closed(page, label)
    except AssertionError as exc:
        return False, str(exc)
    except Exception as exc:  # noqa: BLE001
        return False, f"[{label}] 未知异常：{exc!r}"
    return True, label


def main() -> int:
    SHOT_DIR.mkdir(parents=True, exist_ok=True)
    fails: list[str] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        for name, w, h, theme in CASES:
            ctx = browser.new_context(viewport={"width": w, "height": h})
            page = ctx.new_page()
            ok, msg = run_case(page, name, theme)
            mark = "✅" if ok else "❌"
            print(f"{mark} {msg}")
            if not ok:
                fails.append(msg)
            ctx.close()
        browser.close()

    print("\n=== 截图目录 ===")
    print(SHOT_DIR.resolve())
    if fails:
        print("\n=== 失败汇总 ===")
        for m in fails:
            print(" -", m)
        return 1
    print("\n所有用例通过。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
