#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P4 · 按签 ID 缓存验证脚本

步骤：
1. 访问灵签模块
2. 启签 → 等完整动画链路 → 捕获签号 A
3. 读取 localStorage 快照，确认包含 itemId / topic / drawnAt
4. reload 页面
5. 验证页面直接展示结果区、签号 = A（无需重新抽）
6. （可选）点重签按钮，确认 lastResult 被清空
"""

import json
import re
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5180"


def goto_lingqian(page):
    page.goto(BASE_URL, wait_until="domcontentloaded")
    page.wait_for_timeout(500)
    page.evaluate("() => { window.location.hash = '#/lingqian' }")
    page.wait_for_timeout(1500)
    url = page.url
    print(f"   [debug] current url: {url}")
    btn_count = page.locator("button").count()
    print(f"   [debug] button 总数: {btn_count}")
    try:
        page.wait_for_selector(
            "button:has-text('启签'), button:has-text('啟籤'), button:has-text('啟簽')",
            timeout=15_000,
        )
    except Exception:
        btn_texts = page.locator("button").all_text_contents()
        print(f"   [debug] 当前按钮文案: {btn_texts}")
        page.screenshot(path="/tmp/lingqian-p4-home.png", full_page=True)
        print("   [debug] screenshot → /tmp/lingqian-p4-home.png")
        raise


def draw_once(page):
    start_btn = page.locator("button").filter(has_text=re.compile(r"啟[籤簽]|启签"))
    start_btn.first.wait_for(state="visible", timeout=15_000)
    start_btn.first.click()
    page.wait_for_timeout(4300)
    page.wait_for_selector(
        ".result-banner.revealed, .mn-result-banner.revealed", timeout=20_000
    )


def read_snapshot(page):
    raw = page.evaluate(
        "() => window.localStorage.getItem('tt-divination:lingqian-state')"
    )
    return json.loads(raw) if raw else None


def read_visible_lot_id(page):
    return page.evaluate(
        """() => {
            const cand = document.querySelectorAll('.lq-qian-number-value, .lq-qian-num, .lq-centerpiece-number-value');
            for (const el of cand) {
                const m = (el.textContent || '').match(/\\d+/);
                if (m) return Number(m[0]);
            }
            const banner = document.querySelector('.result-banner.revealed, .mn-result-banner.revealed');
            const m2 = (banner?.textContent || '').match(/第\\s*(\\d+)\\s*[簽签]/);
            return m2 ? Number(m2[1]) : null;
        }"""
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(locale="zh-CN")
        page = ctx.new_page()

        errors = []
        page.on("pageerror", lambda e: errors.append(f"[pageerror] {e.message}"))
        page.on(
            "console",
            lambda msg: (
                errors.append(f"[console.error] {msg.text}")
                if msg.type == "error"
                else None
            ),
        )

        try:
            print(f"→ 访问 {BASE_URL}")
            goto_lingqian(page)

            print("→ 抽第 1 次签")
            draw_once(page)

            snap1 = read_snapshot(page)
            print(f"  localStorage.lastResult: {snap1.get('lastResult') if snap1 else None}")
            id1 = read_visible_lot_id(page)
            print(f"  页面签号: {id1}")

            if not snap1 or not snap1.get("lastResult") or not snap1["lastResult"].get("itemId"):
                raise Exception("P4 失败：localStorage 未写入 lastResult 快照")
            if snap1["lastResult"]["itemId"] != id1:
                raise Exception(
                    f"P4 失败：snap.itemId({snap1['lastResult']['itemId']}) ≠ 页面签号({id1})"
                )

            print("→ reload 页面，验证快照恢复")
            page.reload(wait_until="networkidle")
            page.wait_for_selector(
                ".result-banner.revealed, .mn-result-banner.revealed", timeout=5_000
            )
            id2 = read_visible_lot_id(page)
            print(f"  reload 后签号: {id2}")

            if id1 != id2:
                raise Exception(f"P4 失败：reload 后签号({id2}) ≠ 刷新前({id1})")

            print("→ 主动重签 → lastResult 应被清空")
            reset_btn = page.locator("button").filter(
                has_text=re.compile(r"再[摇搖]|重新[抽启啟]|再求一[簽签]")
            )
            if reset_btn.count() > 0:
                reset_btn.first.click()
                page.wait_for_timeout(400)
                snap2 = read_snapshot(page)
                print(f"  重签后 lastResult: {snap2.get('lastResult') if snap2 else None}")
                if snap2 and snap2.get("lastResult"):
                    raise Exception('P4 失败：用户点"再摇"后 lastResult 未清空')
            else:
                print("  (未找到重签按钮，跳过)")

            if errors:
                print("⚠️  页面错误：")
                for e in errors:
                    print(f"    {e}")

            print("\n✅ P4 按签 ID 缓存 · 验证通过")
        finally:
            browser.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ P4 验证失败：{e}", file=sys.stderr)
        sys.exit(1)
