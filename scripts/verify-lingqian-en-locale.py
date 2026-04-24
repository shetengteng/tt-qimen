#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证：EN locale 下灵签可正常加载、抽签成功、level 文案显示英文（"Auspicious" 等）。

场景：
1. 进入首页，把语言切到 EN
2. 进入灵签页，等待数据加载，确保启签按钮可见（说明 guanyin.en.json 加载成功）
3. 点启签，等待仪式动画结束（~3800ms）
4. 校验：
   - `.result-banner.revealed` 出现
   - 签号有效（1-100）
   - level 文案是英文 ('Excellent' / 'Auspicious' / 'Favorable' / 'Neutral' / 'Cautionary' / 'Inauspicious')，
     而不是中文 '上上' / '上吉' / etc.
"""

import re
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5180"

EN_LEVELS = {
    "Excellent",
    "Auspicious",
    "Favorable",
    "Neutral",
    "Cautionary",
    "Inauspicious",
}
ZH_LEVELS = {"上上", "上吉", "中吉", "中平", "中凶", "下下"}


def main() -> int:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(locale="en-US")
        page = ctx.new_page()

        page.goto(BASE_URL, wait_until="networkidle")

        # 切到英文 locale（写入 localStorage 后刷新最稳，避免和 dropdown UI 强耦合）
        page.evaluate(
            """() => {
                try {
                    const store = JSON.parse(localStorage.getItem('tt-locale-store') || '{}');
                    store.id = 'en';
                    localStorage.setItem('tt-locale-store', JSON.stringify(store));
                } catch (e) {
                    localStorage.setItem('tt-locale-store', JSON.stringify({ id: 'en' }));
                }
            }"""
        )
        page.evaluate("() => { window.location.hash = '#/lingqian'; }")
        page.wait_for_load_state("networkidle")

        # 等启签按钮（英文 "Draw" 或 sticky 兜底）
        try:
            paipan_btn = page.locator("button").filter(
                has_text=re.compile(r"\bDraw\b|啟[籤簽]|启签")
            ).first
            paipan_btn.wait_for(state="visible", timeout=10_000)
        except Exception as e:
            print(f"❌ 启签按钮未出现：{e}")
            return 1

        paipan_btn.click()

        # 仪式 + 揭示需要 ~3.8s，留余量等到 6s
        try:
            page.wait_for_selector(
                ".result-banner.revealed, .mn-result-banner.revealed",
                state="visible",
                timeout=8_000,
            )
        except Exception as e:
            print(f"❌ result-banner 未在动画后出现：{e}")
            return 1

        # 读签号
        lot_id = page.evaluate(
            """() => {
                const nums = document.querySelectorAll(
                    '.lq-qian-number-value, .lq-qian-num, .lq-centerpiece-number-value'
                );
                for (const el of nums) {
                    const m = (el.textContent || '').match(/\\d+/);
                    if (m) return Number(m[0]);
                }
                return null;
            }"""
        )
        if not lot_id or lot_id < 1 or lot_id > 100:
            print(f"❌ 签号无效：{lot_id}")
            return 1
        print(f"✅ 抽得签号：{lot_id}")

        # 读 level 显示文案
        level_text = page.evaluate(
            """() => {
                const el = document.querySelector('.lq-qian-level');
                return el ? el.textContent.trim() : null;
            }"""
        )
        if level_text is None:
            print("❌ 未找到 .lq-qian-level 元素")
            return 1
        print(f"   level 元素文案：{level_text!r}")

        if level_text in ZH_LEVELS:
            print(f"❌ EN locale 下 level 仍为中文 '{level_text}'，i18n 映射失败")
            return 1
        if level_text not in EN_LEVELS:
            # 不在已知英文集 + 不在中文集 → 可能 i18n key 拼错或回退到 key 字面
            print(f"❌ level 既非英文标签也非中文：{level_text!r}")
            return 1

        print(f"✅ EN locale 下 level 显示英文：{level_text}")
        browser.close()
        return 0


if __name__ == "__main__":
    sys.exit(main())
