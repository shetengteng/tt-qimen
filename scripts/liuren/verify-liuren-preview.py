#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证小六壬 PalaceWheel 点击预览功能（P2-1 / 2026-04-26）

验证矩阵：
  Part 1 — 起卦后命中宫为"赤口"
  Part 2 — 点击非命中宫"大安" → AspectReading 标题切换为"大安"，preview banner 出现
  Part 3 — 再次点击"大安" → 退出预览，标题回到"赤口"
  Part 4 — 点击命中宫"赤口" → 预览态自动退出（仍是"赤口"）
  Part 5 — 点 banner 上的"返回本卦"按钮 → 退出预览
  Part 6 — onRepaipan 后预览态被清，previewedPalace=null（结果区也消失）
  Part 7 — 未起卦时点击宫位无效（current=null，不触发 emit）
"""
from __future__ import annotations

import sys

from playwright.sync_api import Page, sync_playwright

BASE = "http://localhost:5180"


def reset_localstorage(page: Page) -> None:
    page.evaluate(
        """() => {
            localStorage.removeItem('tt-divination:liuren-input');
            localStorage.removeItem('tt-divination:liuren-last-computed');
            localStorage.setItem('tt-qimen:locale', 'zh-CN');
            localStorage.setItem('tt-qimen:theme', 'guofeng');
            const inp = {
                mode: 'custom',
                aspect: 'overall',
                question: '',
                custom: { month: 5, day: 18, hourIndex: 7 }
            };
            localStorage.setItem('tt-divination:liuren-input', JSON.stringify(inp));
        }"""
    )


def goto_liuren(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/liuren'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(300)


def click_paipan(page: Page) -> None:
    btn = page.locator(".ds-input-actions button").first
    btn.wait_for(state="visible", timeout=5_000)
    btn.click()


def read_reading_title(page: Page) -> str:
    return page.locator(".lr-reading-title").first.inner_text().strip()


def read_center_palace(page: Page) -> str:
    return page.locator(".lr-wheel-center-main").first.inner_text().strip()


def click_palace(page: Page, palace_text: str) -> None:
    """通过 palace name 文本定位并点击宫位"""
    page.locator(".lr-palace", has_text=palace_text).first.click()
    page.wait_for_timeout(250)


def has_preview_banner(page: Page) -> bool:
    return page.locator(".lr-preview-banner").count() > 0


def has_previewing_class(page: Page, palace_text: str) -> bool:
    """检查目标宫是否带 .previewing class"""
    return page.evaluate(
        """(text) => {
            const els = Array.from(document.querySelectorAll('.lr-palace'));
            const t = els.find(e => e.textContent.includes(text));
            return t ? t.classList.contains('previewing') : false;
        }""",
        palace_text,
    )


def fail(msg: str):
    print(f"  [FAIL] {msg}")
    sys.exit(1)


def ok(msg: str):
    print(f"  [OK]   {msg}")


def main() -> int:
    print("\n=========== liuren PalaceWheel 预览交互验证 ===========\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")

        # ---------------- Part 1 ----------------
        print("--- Part 1: 起卦命中赤口 ---")
        reset_localstorage(page)
        page.reload()
        page.wait_for_load_state("networkidle")
        goto_liuren(page)
        page.wait_for_timeout(400)
        click_paipan(page)
        page.wait_for_selector(".result-banner.revealed", timeout=6_000)
        page.wait_for_timeout(1_500)

        center = read_center_palace(page)
        if center != "赤口":
            fail(f"中心宫名应为赤口，实际 {center!r}")
        title = read_reading_title(page)
        if "赤口" not in title:
            fail(f"标题应含赤口: {title!r}")
        ok(f"中心={center}, 标题={title}")
        if has_preview_banner(page):
            fail("初始不应有 preview banner")
        ok("初始无 preview banner")

        # ---------------- Part 2 ----------------
        print("\n--- Part 2: 点击大安 → AspectReading 切到大安 + previewing 高亮 ---")
        click_palace(page, "大安")
        page.wait_for_timeout(300)
        title2 = read_reading_title(page)
        if "大安" not in title2:
            fail(f"点击后标题应含大安: {title2!r}")
        ok(f"标题切换: {title2}")
        if not has_preview_banner(page):
            fail("应出现 preview banner")
        ok("preview banner 出现")
        if not has_previewing_class(page, "大安"):
            fail("大安宫应带 .previewing class")
        ok("大安宫 .previewing 高亮")
        # 中心字仍是赤口（命中没变）
        center2 = read_center_palace(page)
        if center2 != "赤口":
            fail(f"中心字应仍是赤口，实际 {center2!r}")
        ok(f"中心字保持: {center2}")

        # ---------------- Part 3 ----------------
        print("\n--- Part 3: 再次点击大安 → 退出预览 ---")
        click_palace(page, "大安")
        page.wait_for_timeout(300)
        title3 = read_reading_title(page)
        if "赤口" not in title3:
            fail(f"退出预览后标题应含赤口: {title3!r}")
        if has_preview_banner(page):
            fail("退出预览后不应有 banner")
        ok(f"退出预览成功: {title3}")

        # ---------------- Part 4 ----------------
        print("\n--- Part 4: 点击命中宫赤口 → 不切换（保持本卦视图）---")
        click_palace(page, "赤口")
        page.wait_for_timeout(300)
        title4 = read_reading_title(page)
        if "赤口" not in title4:
            fail(f"点击赤口后标题应含赤口: {title4!r}")
        if has_preview_banner(page):
            fail("点击命中宫不应触发 preview banner")
        ok(f"点击命中宫保持本卦: {title4}, 无 banner")

        # ---------------- Part 5 ----------------
        print("\n--- Part 5: 点 banner 上的'返回本卦'按钮 → 退出预览 ---")
        click_palace(page, "速喜")  # 先进入预览态
        page.wait_for_timeout(300)
        if not has_preview_banner(page):
            fail("应进入预览态")
        ok("已进入速喜预览态")

        # banner 内的 button（gf-btn-outline gf-btn-sm）
        back_btn = page.locator(".lr-preview-banner button").first
        back_btn.click()
        page.wait_for_timeout(300)
        if has_preview_banner(page):
            fail("点'返回本卦'后应退出预览")
        title5 = read_reading_title(page)
        if "赤口" not in title5:
            fail(f"返回本卦后标题应含赤口: {title5!r}")
        ok(f"返回本卦成功: {title5}")

        # ---------------- Part 6 ----------------
        print("\n--- Part 6: onRepaipan 清掉预览态 ---")
        click_palace(page, "小吉")  # 进入预览
        page.wait_for_timeout(200)
        # 找重新起卦按钮（.action-bar 第 3 个）
        page.locator(".action-bar button").last.click()
        page.wait_for_timeout(800)
        # 此时 result.value=null → 整个结果区不渲染
        if page.locator(".lr-preview-banner").count() != 0:
            fail("onRepaipan 后 preview banner 不应存在")
        if page.locator(".lr-reading-card").count() != 0:
            fail("onRepaipan 后 reading-card 不应存在")
        ok("onRepaipan 后所有结果区与预览均消失")

        # ---------------- Part 7 ----------------
        print("\n--- Part 7: 未起卦时点击宫位无效 ---")
        # 此时已是空白态。在 PalaceWheel 还可见的话尝试点击大安——但 PalaceWheel 只在 result 非空时挂载
        if page.locator(".lr-wheel").count() == 0 and page.locator(".lr-palace-grid").count() == 0:
            ok("未起卦时 PalaceWheel 未挂载，自然不可点击")
        else:
            # 如果挂载了（不应），尝试点击应不触发任何变化
            click_palace(page, "大安")
            page.wait_for_timeout(200)
            if page.locator(".lr-preview-banner").count() != 0:
                fail("未起卦时点击不应触发预览")
            ok("未起卦时点击宫位无任何反应")

        browser.close()
    print("\n=========== [OK] PalaceWheel 预览 7 部分通过 ===========\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
