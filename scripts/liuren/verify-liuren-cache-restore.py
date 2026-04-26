#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证小六壬模块 lastComputed 缓存恢复（P0-4 / 2026-04-26）

核心设计：immediate 模式不缓存（避免显示昨天的卦），custom 模式按月日时+aspect+question 哈希缓存。

验证矩阵：
  Part 1 — custom 模式首访：lastComputed=null + 无结果区
  Part 2 — custom 起卦成功后：lastComputed 写入 + 与 store.custom 一致
  Part 3 — 刷新页面：< 1.8s 内出现结果，骨架被跳过
  Part 4 — 改 month → onMounted 不恢复（mismatch）
  Part 5 — onRepaipan 后 lastComputed=null + 再刷新无恢复
  Part 6 — immediate 模式起卦：lastComputed 应保持为 null（按设计不缓存）
"""
from __future__ import annotations

import json
import sys
import time

from playwright.sync_api import Page, sync_playwright

BASE = "http://localhost:5180"
INPUT_KEY = "tt-divination:liuren-input"
COMPUTED_KEY = "tt-divination:liuren-last-computed"


def reset_localstorage(page: Page) -> None:
    page.evaluate(
        f"""() => {{
            localStorage.removeItem('{INPUT_KEY}');
            localStorage.removeItem('{COMPUTED_KEY}');
            localStorage.setItem('tt-qimen:locale', 'zh-CN');
            localStorage.setItem('tt-qimen:theme', 'guofeng');
        }}"""
    )


def goto_liuren(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/liuren'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(300)


def _parse_storage(raw):
    if raw is None or raw == '' or raw == 'null':
        return None
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except Exception:
            return raw
    return raw


def read_last_computed(page: Page):
    raw = page.evaluate(f"""() => localStorage.getItem('{COMPUTED_KEY}')""")
    return _parse_storage(raw)


def read_input_state(page: Page):
    raw = page.evaluate(f"""() => localStorage.getItem('{INPUT_KEY}')""")
    return _parse_storage(raw)


def write_input_state(page: Page, patch: dict) -> None:
    """合并 patch 到 input localStorage（不破坏其他字段）"""
    page.evaluate(
        f"""(patch) => {{
            const cur = JSON.parse(localStorage.getItem('{INPUT_KEY}') || '{{}}');
            const next = {{ ...cur, ...patch }};
            if (patch.custom) next.custom = {{ ...(cur.custom || {{}}), ...patch.custom }};
            localStorage.setItem('{INPUT_KEY}', JSON.stringify(next));
        }}""",
        patch,
    )


def is_result_visible(page: Page) -> bool:
    return page.evaluate(
        """() => {
            const el = document.querySelector('.result-zone.revealed');
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return rect.height > 0;
        }"""
    )


def is_skeleton_visible(page: Page) -> bool:
    return page.evaluate(
        """() => {
            const el = document.querySelector('.skeleton-overlay.visible');
            return el !== null;
        }"""
    )


def read_palace_name(page: Page):
    """从 PalaceWheel 中心或激活的宫位读取当前宫名（圆环：.lr-wheel-center-main，网格：.lr-palace.active .lr-palace-name）"""
    return page.evaluate(
        """() => {
            const center = document.querySelector('.lr-wheel-center-main');
            if (center && center.textContent.trim()) return center.textContent.trim();
            const active = document.querySelector('.lr-palace.active .lr-palace-name');
            if (active && active.textContent.trim()) return active.textContent.trim();
            return null;
        }"""
    )


def click_paipan(page: Page) -> None:
    btn = page.locator(".ds-input-actions button").first
    btn.wait_for(state="visible", timeout=5_000)
    btn.click()


def fail(msg: str):
    print(f"  [FAIL] {msg}")
    sys.exit(1)


def ok(msg: str):
    print(f"  [OK]   {msg}")


def main() -> int:
    print("\n=========== liuren lastComputed 缓存恢复验证 ===========\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")

        # ---------------- Part 1 ----------------
        print("--- Part 1: custom 模式首访 ---")
        reset_localstorage(page)
        # 预置 custom 模式（默认 immediate，需要切换到 custom 进行后续操作）
        write_input_state(page, {"mode": "custom", "aspect": "overall", "question": "",
                                  "custom": {"month": 5, "day": 18, "hourIndex": 7}})
        page.reload()
        page.wait_for_load_state("networkidle")
        goto_liuren(page)
        page.wait_for_timeout(500)

        last = read_last_computed(page)
        if last is not None:
            fail(f"期望 lastComputed=null，实际={last}")
        ok("lastComputed 为 null")

        if is_result_visible(page):
            fail("首访不应该显示结果区")
        ok("首访无结果区")

        # ---------------- Part 2 ----------------
        print("\n--- Part 2: custom 起卦成功 → lastComputed 写入 ---")
        click_paipan(page)
        page.wait_for_selector(".result-banner.revealed", timeout=6_000)
        page.wait_for_timeout(1_500)

        last = read_last_computed(page)
        inp = read_input_state(page)
        if last is None or not isinstance(last, dict):
            fail(f"lastComputed 写入失败: {last}")
        expected = {
            "month": inp["custom"]["month"],
            "day": inp["custom"]["day"],
            "hourIndex": inp["custom"]["hourIndex"],
            "aspect": inp["aspect"],
            "question": inp.get("question", ""),
        }
        for k, v in expected.items():
            if last.get(k) != v:
                fail(f"lastComputed.{k}={last.get(k)}, 期望 {v}")
        ok(f"lastComputed 字段完整: month={last['month']} day={last['day']} hourIndex={last['hourIndex']}")

        palace_p2 = read_palace_name(page)
        if not palace_p2:
            fail("结果中没有可读取的宫名")
        ok(f"结果宫名: {palace_p2}")

        # ---------------- Part 3 ----------------
        print("\n--- Part 3: 刷新后缓存恢复（跳过骨架） ---")
        reload_t0 = time.time()
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_selector(".result-zone.revealed", timeout=2_500)
        elapsed_ms = (time.time() - reload_t0) * 1000
        if elapsed_ms > 1_800:
            fail(f"刷新后结果出现耗时 {elapsed_ms:.0f}ms，超过 1.8s（怀疑走骨架）")
        ok(f"刷新后 {elapsed_ms:.0f}ms 内出现结果区")

        if is_skeleton_visible(page):
            fail("骨架仍可见，缓存路径未生效")
        ok("骨架已被跳过")

        page.wait_for_timeout(600)
        palace_p3 = read_palace_name(page)
        if palace_p3 != palace_p2:
            fail(f"刷新前后宫名不一致: P2={palace_p2}, P3={palace_p3}")
        ok(f"刷新后宫名一致: {palace_p3}")

        # ---------------- Part 4 ----------------
        print("\n--- Part 4: input mismatch 时 cache 路径不再生效 ---")
        write_input_state(page, {"custom": {"month": 11}})  # 改 month
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1_500)

        if is_result_visible(page):
            fail("input mismatch 时不应自动恢复")
        ok("mismatch 时未走 cache 路径")

        last_still = read_last_computed(page)
        if last_still is None:
            fail("不应该清掉 lastComputed，只是不 match")
        if last_still.get("month") != 5:
            fail(f"lastComputed 应保留旧值 month=5，实际 {last_still.get('month')}")
        ok(f"lastComputed 保留旧快照: month={last_still['month']}")

        # ---------------- Part 5 ----------------
        print("\n--- Part 5: onRepaipan 清除 cache ---")
        # 把 month 还原 → cache 路径恢复结果，再点 repaipan
        write_input_state(page, {"custom": {"month": 5}})
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_selector(".result-zone.revealed", timeout=2_500)
        page.wait_for_timeout(500)
        ok("Part 5 前置：input 还原 → cache 恢复结果")

        # 点击 repaipan 按钮（国风：.action-bar 第 3 个 button = repaipan）
        repaipan_btn = page.locator(".action-bar button").last
        repaipan_btn.wait_for(state="visible", timeout=3_000)
        repaipan_btn.click()
        page.wait_for_timeout(800)

        last_after = read_last_computed(page)
        if last_after is not None:
            fail(f"onRepaipan 后 lastComputed 应为 null，实际 {last_after}")
        ok("onRepaipan 后 lastComputed=null")

        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1_000)
        if is_result_visible(page):
            fail("repaipan 后再刷新不应自动显示结果")
        ok("repaipan 后再刷新无结果区（cache 已清）")

        # ---------------- Part 6 ----------------
        print("\n--- Part 6: immediate 模式起卦后 lastComputed 应仍为 null ---")
        reset_localstorage(page)
        write_input_state(page, {"mode": "immediate", "aspect": "career", "question": "",
                                  "custom": {"month": 3, "day": 2, "hourIndex": 7}})
        page.reload()
        page.wait_for_load_state("networkidle")
        goto_liuren(page)
        page.wait_for_timeout(400)

        # 此时应在 immediate 模式
        cur_inp = read_input_state(page)
        if cur_inp.get("mode") != "immediate":
            fail(f"预置 immediate 模式失败，当前 mode={cur_inp.get('mode')}")

        click_paipan(page)
        page.wait_for_selector(".result-banner.revealed", timeout=6_000)
        page.wait_for_timeout(1_500)

        last_imm = read_last_computed(page)
        if last_imm is not None:
            fail(f"immediate 模式起卦后 lastComputed 应为 null，实际 {last_imm}")
        ok("immediate 模式起卦后 lastComputed=null（不缓存，避免昨日卦污染）")

        # 此时刷新，由于 mode=immediate 且 lastComputed=null，shouldRestore=false → 无恢复
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1_000)
        if is_result_visible(page):
            fail("immediate 模式下刷新不应自动显示结果")
        ok("immediate 模式刷新后无自动恢复")

        browser.close()
    print("\n=========== [OK] 全部 6 部分通过 ===========\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
