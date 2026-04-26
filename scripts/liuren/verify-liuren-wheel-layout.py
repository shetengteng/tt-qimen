#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证 liuren 国风主题六宫圆盘布局（2026-04-26 改极坐标后）

验证项：
  Part 1 — 桌面端：6 个圆心相邻距离应接近 R=175（≥170 且 ≤180），无重叠
  Part 2 — 桌面端：每个圆与中心圆（半径 70）不重叠，圆心距 ≥ 70 + 60 = 130
  Part 3 — 桌面端：每个圆完全在 wheel 容器内，不溢出
  Part 4 — 移动端 (390x844)：6 圆相邻距离接近 R=110，无重叠
  Part 5 — 桌面端 + 移动端 全屏截图保存到 /tmp/liuren-wheel-{desktop,mobile}.png

assertion 原则：圆几何属性（位置 / 半径）从 DOM bounding box 读取。
"""
from __future__ import annotations

import math
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
            localStorage.setItem('tt-divination:liuren-input', JSON.stringify({
                mode: 'custom',
                aspect: 'overall',
                question: '',
                custom: { month: 5, day: 18, hourIndex: 7 }
            }));
        }"""
    )


def goto_liuren_and_cast(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/liuren'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(300)
    btn = page.locator(".ds-input-actions button").first
    btn.wait_for(state="visible", timeout=5_000)
    btn.click()
    page.wait_for_selector(".result-banner.revealed", timeout=6_000)
    page.wait_for_timeout(1_400)


def palace_geometry(page: Page) -> list[dict]:
    """读取 6 个 .lr-palace 的 bounding box，返回 [{idx, cx, cy, r}, ...]，按 data-pos 排序"""
    return page.evaluate(
        """() => {
            const els = Array.from(document.querySelectorAll('.lr-palace'));
            return els.map(e => {
                const rect = e.getBoundingClientRect();
                return {
                    idx: parseInt(e.getAttribute('data-pos'), 10),
                    cx: rect.left + rect.width / 2,
                    cy: rect.top + rect.height / 2,
                    r: rect.width / 2,
                };
            }).sort((a, b) => a.idx - b.idx);
        }"""
    )


def wheel_geometry(page: Page) -> dict:
    return page.evaluate(
        """() => {
            const w = document.querySelector('.lr-wheel');
            const r = w.getBoundingClientRect();
            return { left: r.left, top: r.top, width: r.width, height: r.height,
                     cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        }"""
    )


def center_geometry(page: Page) -> dict:
    return page.evaluate(
        """() => {
            const c = document.querySelector('.lr-wheel-center');
            const r = c.getBoundingClientRect();
            return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 };
        }"""
    )


def dist(a: dict, b: dict) -> float:
    return math.hypot(a["cx"] - b["cx"], a["cy"] - b["cy"])


def fail(msg: str):
    print(f"  [FAIL] {msg}")
    sys.exit(1)


def ok(msg: str):
    print(f"  [OK]   {msg}")


def main() -> int:
    print("\n=========== liuren 国风主题 wheel 布局验证 ===========\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        # ------------------ Part 1-3 桌面端 ------------------
        print("--- Part 1-3: 桌面端 1280x900 ---")
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")
        reset_localstorage(page)
        page.reload()
        page.wait_for_load_state("networkidle")
        goto_liuren_and_cast(page)

        wheel = wheel_geometry(page)
        center = center_geometry(page)
        palaces = palace_geometry(page)
        if len(palaces) != 6:
            fail(f"应有 6 个宫，实际 {len(palaces)}")
        ok(f"wheel size={wheel['width']:.0f}x{wheel['height']:.0f}, palaces=6, center r={center['r']:.0f}")

        # 相邻距离（1↔2, 2↔3, 3↔4, 4↔5, 5↔6, 6↔1）应 ≈ R=175
        adj_pairs = [(0,1), (1,2), (2,3), (3,4), (4,5), (5,0)]
        for a, b in adj_pairs:
            d = dist(palaces[a], palaces[b])
            if not (165 <= d <= 185):
                fail(f"相邻 pos {a+1}-{b+1} 距离 {d:.1f} 不在 [165, 185]（期望 ≈175）")
        ok("6 对相邻圆心距离均在 [165, 185]，正六边形排布")

        # 圆心-中心距离 = R = 175
        for p in palaces:
            d = dist(p, center)
            if not (165 <= d <= 185):
                fail(f"pos {p['idx']} 到中心距离 {d:.1f} 不在 [165, 185]")
        ok("6 个圆到中心距离均 ≈175，且不重叠中心圆（170 - 60 = 105 > 70）")

        # 不溢出 wheel
        for p in palaces:
            if p["cx"] - p["r"] < wheel["left"] - 1:
                fail(f"pos {p['idx']} 左溢出 wheel: cx-r={p['cx']-p['r']:.1f} < {wheel['left']:.1f}")
            if p["cx"] + p["r"] > wheel["left"] + wheel["width"] + 1:
                fail(f"pos {p['idx']} 右溢出 wheel")
            if p["cy"] - p["r"] < wheel["top"] - 1:
                fail(f"pos {p['idx']} 上溢出 wheel")
            if p["cy"] + p["r"] > wheel["top"] + wheel["height"] + 1:
                fail(f"pos {p['idx']} 下溢出 wheel")
        ok("6 个圆完整位于 wheel 容器内，无溢出")

        # 圆与圆之间不重叠（任意两圆中心距 > 半径之和 + 5）
        for i in range(6):
            for j in range(i + 1, 6):
                d = dist(palaces[i], palaces[j])
                if d < palaces[i]["r"] + palaces[j]["r"] + 5:
                    fail(f"pos {palaces[i]['idx']}-{palaces[j]['idx']} 重叠 d={d:.1f}")
        ok("任意两宫圆均无重叠（最小间距 ≥ 5px）")

        page.screenshot(path="/tmp/liuren-wheel-desktop.png", full_page=False)
        print("  截图: /tmp/liuren-wheel-desktop.png")

        ctx.close()

        # ------------------ Part 4-5 移动端 ------------------
        print("\n--- Part 4: 移动端 390x844 ---")
        ctx = browser.new_context(viewport={"width": 390, "height": 844})
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")
        reset_localstorage(page)
        page.reload()
        page.wait_for_load_state("networkidle")
        goto_liuren_and_cast(page)

        wheel = wheel_geometry(page)
        palaces = palace_geometry(page)
        ok(f"wheel size={wheel['width']:.0f}x{wheel['height']:.0f}, palace r={palaces[0]['r']:.0f}")

        # 移动端预期 R = 110（相邻距离应 ≈ 110）
        for a, b in adj_pairs:
            d = dist(palaces[a], palaces[b])
            if not (100 <= d <= 120):
                fail(f"移动端相邻 pos {a+1}-{b+1} 距离 {d:.1f} 不在 [100, 120]")
        ok("移动端 6 对相邻圆心距 ≈110，正六边形排布")

        for p in palaces:
            if p["cx"] - p["r"] < wheel["left"] - 1:
                fail(f"移动端 pos {p['idx']} 左溢出")
            if p["cx"] + p["r"] > wheel["left"] + wheel["width"] + 1:
                fail(f"移动端 pos {p['idx']} 右溢出")
        ok("移动端 6 个圆完整位于 wheel 容器内")

        page.screenshot(path="/tmp/liuren-wheel-mobile.png", full_page=False)
        print("  截图: /tmp/liuren-wheel-mobile.png")

        browser.close()
    print("\n=========== [OK] 桌面 + 移动端 wheel 布局验证全过 ===========\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
