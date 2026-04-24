#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证：点"启签"后，旧结果不应在动画之前泄露新签。

场景：
1. 访问灵签 → 抽第 1 次 → 得到签号 A（result-banner 已挂载显示 A）
2. 再点"启签"开始第 2 次抽签
3. 在 t=+150ms（flying 刚开始）检查 DOM：
   - `.result-banner` 必须不存在（或 opacity=0）——"旧 banner 应立即消失，不能含新签内容"
4. 等待仪式结束（~3800ms）验证 `.result-banner.revealed` 出现、签号 = B
5. 若 B == A（极小概率 filterLastId 仅剩一签时）也算通过；主要核防泄露
"""

import re
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5180"


def get_lot_id_in_banner(page):
    """结果区的签号渲染在 .result-zone 里（LingqianTitle），不是 .result-banner 的直接子元素"""
    return page.evaluate(
        """() => {
            const nums = document.querySelectorAll('.lq-qian-number-value, .lq-qian-num');
            for (const el of nums) {
                const m = (el.textContent || '').match(/\\d+/);
                if (m) return Number(m[0]);
            }
            return null;
        }"""
    )


def banner_visible(page):
    return page.evaluate(
        """() => {
            const b = document.querySelector('.result-banner.revealed, .mn-result-banner.revealed');
            if (!b) return { exists: false, opacity: null };
            const cs = getComputedStyle(b);
            return { exists: true, opacity: Number(cs.opacity) };
        }"""
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(locale="zh-CN")
        page = ctx.new_page()

        try:
            print(f"→ 访问 {BASE_URL}/#/lingqian")
            page.goto(BASE_URL, wait_until="domcontentloaded")
            page.wait_for_timeout(500)
            page.evaluate("() => { window.location.hash = '#/lingqian' }")
            page.wait_for_timeout(2000)
            # 清空 localStorage 避免 P4 snapshot 在 mount 时直接恢复旧结果（影响"刚进来 → 启签"场景）
            page.evaluate("() => window.localStorage.removeItem('tt-divination:lingqian-state')")
            page.reload(wait_until="domcontentloaded")
            page.wait_for_timeout(2000)

            start_btn = page.locator("button").filter(has_text=re.compile(r"啟[籤簽]|启签")).first
            start_btn.wait_for(state="visible", timeout=15_000)

            print("→ 抽第 1 次签（等完整仪式）")
            start_btn.click()
            page.wait_for_timeout(4200)
            page.wait_for_selector(".result-banner.revealed, .mn-result-banner.revealed", timeout=10_000)
            id_a = get_lot_id_in_banner(page)
            print(f"  签号 A = {id_a}")
            if not id_a:
                raise Exception("第 1 次抽签后未能在 banner 中读到签号")

            print("→ 第 2 次点启签，立刻检查旧 banner 是否已消失（防泄露）")
            start_btn.click()
            page.wait_for_timeout(150)
            v1 = banner_visible(page)
            print(f"  t=+150ms banner: {v1}")
            if v1["exists"] and (v1["opacity"] is None or v1["opacity"] > 0.05):
                raise Exception(
                    f"泄露：t=+150ms banner 仍然可见（exists={v1['exists']}, opacity={v1['opacity']}）"
                )

            print("→ 追加采样：t=+600ms / t=+1200ms 仪式中段 banner 仍应不可见")
            for offset in (600, 1200):
                page.wait_for_timeout(max(0, offset - 150) if offset == 600 else 600)
                v = banner_visible(page)
                print(f"  t=+{offset}ms banner: {v}")
                if v["exists"] and (v["opacity"] is None or v["opacity"] > 0.05):
                    raise Exception(
                        f"泄露：t=+{offset}ms banner 仍然可见（opacity={v['opacity']}）"
                    )

            print("→ 等仪式完整结束（总 ~3800ms）验证 banner 再次出现")
            page.wait_for_selector(
                ".result-banner.revealed, .mn-result-banner.revealed", timeout=10_000
            )
            id_b = get_lot_id_in_banner(page)
            print(f"  签号 B = {id_b}")
            if not id_b:
                raise Exception("仪式结束后未读到新签号")

            print("\n✅ 启签防泄露 · 验证通过")
            print(f"  A={id_a} → B={id_b}（仪式前 banner 隐藏，仪式后正常揭示）")
        finally:
            browser.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ 防泄露验证失败：{e}", file=sys.stderr)
        sys.exit(1)
