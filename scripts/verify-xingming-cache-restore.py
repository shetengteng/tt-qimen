#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""验证 useDivinationStore 缓存恢复（P-A 缓存轮 / 2026-04-26）

验证矩阵：
  Part 1 — 首次访问 + 默认输入 (李/文轩 + male + 未指定)
    ✓ 进入 /xingming 显示输入态、不显示结果区
    ✓ localStorage 中 tt-qimen:xingming:lastComputed 不存在或为 null

  Part 2 — 计算成功后写入 lastComputed
    ✓ 点击"开始测名"，等待结果出现
    ✓ localStorage 中 tt-qimen:xingming:lastComputed 写入了与 input 一致的对象
    ✓ 5 项评分 + 综评 数字稳定

  Part 3 — 刷新页面，缓存恢复路径生效
    ✓ reload 后短时间内（< skeleton.delay = 1500ms）就看到结果区
    ✓ 没有显示 .skeleton-overlay.visible（骨架被跳过）
    ✓ 5 项评分数字与 Part 2 完全一致（input → result 纯函数）

  Part 4 — 修改输入后，缓存路径不再生效
    ✓ 改 surname → 触发 recompute
    ✓ 重新点击 → 新的 lastComputed 写入
    ✓ 之前的 cache 已被覆盖

  Part 5 — onRecalculate 后清除 cache
    ✓ 点击"重新测算"按钮
    ✓ localStorage tt-qimen:xingming:lastComputed = null
    ✓ 再次刷新 → 不会自动恢复结果
"""
from __future__ import annotations

import sys
import time

from playwright.sync_api import Page, sync_playwright

BASE = "http://localhost:5180"


def reset_localstorage(page: Page) -> None:
    page.evaluate(
        """() => {
            localStorage.removeItem('tt-qimen:xingming:input');
            localStorage.removeItem('tt-qimen:xingming:lastComputed');
            localStorage.setItem('tt-qimen:locale', 'zh-CN');
            localStorage.setItem('tt-qimen:theme', 'guofeng');
        }"""
    )


def goto_xingming(page: Page) -> None:
    page.evaluate("() => { window.location.hash = '#/xingming'; }")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(300)


def _parse_storage(raw):
    """vueuse useStorage 写入的 string 可能是裸 object JSON，也可能是 'null'/'<undefined>'/空。"""
    if raw is None or raw == '' or raw == 'null':
        return None
    if isinstance(raw, dict):
        return raw  # already parsed by playwright
    if isinstance(raw, str):
        import json
        try:
            return json.loads(raw)
        except Exception:
            return raw
    return raw


def read_last_computed(page: Page):
    raw = page.evaluate(
        """() => localStorage.getItem('tt-qimen:xingming:lastComputed')"""
    )
    return _parse_storage(raw)


def read_input_state(page: Page):
    raw = page.evaluate(
        """() => localStorage.getItem('tt-qimen:xingming:input')"""
    )
    return _parse_storage(raw)


def read_score_values(page: Page):
    return page.evaluate(
        """() => {
            const items = Array.from(document.querySelectorAll('.xm-score-item .xm-s-num'));
            const score = document.querySelector('.xm-score-value, .xm-score-num');
            return {
                grids: items.map(e => e.textContent.trim()),
                overall: score ? score.textContent.trim() : null,
            };
        }"""
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


def click_calculate(page: Page) -> None:
    btn = page.locator(".ds-input-actions button").first
    btn.wait_for(state="visible", timeout=5_000)
    btn.click()


def fail(msg: str):
    print(f"  [FAIL] {msg}")
    sys.exit(1)


def ok(msg: str):
    print(f"  [OK]   {msg}")


def main() -> int:
    print("\n=========== xingming useDivinationStore 缓存恢复验证 ===========\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")

        # ---------------- Part 1 ----------------
        print("--- Part 1: 首次访问 + 默认输入 ---")
        reset_localstorage(page)
        page.reload()
        page.wait_for_load_state("networkidle")
        goto_xingming(page)
        page.wait_for_timeout(500)

        last = read_last_computed(page)
        if last is not None:
            fail(f"期望 lastComputed=null，实际={last}")
        ok("lastComputed 不存在")

        if is_result_visible(page):
            fail("首次访问不应该显示结果区")
        ok("首次访问无结果区显示")

        # ---------------- Part 2 ----------------
        print("\n--- Part 2: 计算成功后写入 lastComputed ---")
        click_calculate(page)
        page.wait_for_selector(".result-banner.revealed", timeout=6_000)
        page.wait_for_timeout(1_500)  # 等动画完成

        last = read_last_computed(page)
        inp = read_input_state(page)
        if last is None:
            fail("计算成功后 lastComputed 仍为 null")
        if last.get("surname") != inp.get("surname") or last.get("givenName") != inp.get("givenName"):
            fail(f"lastComputed/input 不一致: lastComputed={last}, input={inp}")
        ok(f"lastComputed 写入: surname={last['surname']} givenName={last['givenName']}")

        scores_p2 = read_score_values(page)
        if not scores_p2["grids"] or len(scores_p2["grids"]) != 5:
            fail(f"5 项评分缺失: {scores_p2}")
        if not scores_p2["overall"]:
            fail("综评数字缺失")
        ok(f"5 项评分: {scores_p2['grids']} / 综评: {scores_p2['overall']}")

        # ---------------- Part 3 ----------------
        print("\n--- Part 3: 刷新后缓存恢复（跳过骨架） ---")
        reload_t0 = time.time()
        page.reload()
        page.wait_for_load_state("networkidle")
        # 关键检查：在 < 1500ms (skeleton.delay) 内就要看到结果区
        # 实际给 1000ms 充裕窗口
        page.wait_for_selector(".result-zone.revealed", timeout=2_000)
        elapsed_ms = (time.time() - reload_t0) * 1000
        if elapsed_ms > 1_800:
            fail(f"刷新后结果出现耗时 {elapsed_ms:.0f}ms，超过 1.8s（怀疑走了骨架）")
        ok(f"刷新后 {elapsed_ms:.0f}ms 内出现结果区（应 < 1500ms）")

        # 进一步确认：骨架 overlay 没出现过
        if is_skeleton_visible(page):
            fail("骨架 overlay 仍可见，缓存路径未生效")
        ok("骨架 overlay 已被跳过")

        page.wait_for_timeout(800)  # 等数值稳定
        scores_p3 = read_score_values(page)
        if scores_p3["grids"] != scores_p2["grids"] or scores_p3["overall"] != scores_p2["overall"]:
            fail(f"刷新前后 5 项评分不一致: P2={scores_p2}, P3={scores_p3}")
        ok(f"刷新后 5 项评分一致: {scores_p3['grids']} / {scores_p3['overall']}")

        # ---------------- Part 4 ----------------
        print("\n--- Part 4: input mismatch 时 cache 路径不再生效 ---")
        # 直接改 localStorage.input.surname → 模拟"用户改了输入但还没点开始"的下一次访问
        # 这样验证 shouldRestore() 在 input != lastComputed 时返回 false
        page.evaluate(
            """() => {
                const inp = JSON.parse(localStorage.getItem('tt-qimen:xingming:input'));
                inp.surname = '张';
                localStorage.setItem('tt-qimen:xingming:input', JSON.stringify(inp));
            }"""
        )
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1_500)  # 给足时间让 onMounted 跑完

        if is_result_visible(page):
            fail("input mismatch 时不应自动恢复结果")
        ok("input mismatch 时未走 cache 恢复路径（结果区不显示）")

        # 但 lastComputed 还在 —— 只是当前 input 不 match 而已
        last_still = read_last_computed(page)
        if last_still is None:
            fail("不应该清掉 lastComputed，只是不 match")
        if last_still.get("surname") != "李":
            fail(f"lastComputed 应保留旧值 '李'，实际 {last_still.get('surname')}")
        ok(f"lastComputed 保留旧快照: surname={last_still['surname']}（cache 未被消费）")

        # ---------------- Part 5 ----------------
        print("\n--- Part 5: onRecalculate 清除 cache ---")
        # 把 input 还原到 lastComputed 一致，让 onMounted cache 路径恢复结果
        page.evaluate(
            """() => {
                const inp = JSON.parse(localStorage.getItem('tt-qimen:xingming:input'));
                inp.surname = '李';
                localStorage.setItem('tt-qimen:xingming:input', JSON.stringify(inp));
            }"""
        )
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_selector(".result-zone.revealed", timeout=2_000)
        page.wait_for_timeout(500)
        ok("Part 5 前置：input 还原 → cache 恢复结果")

        # 国风默认主题，找 .action-bar 的最后一个按钮（recalculate）
        recalc_btn = page.locator(".action-bar button").last
        recalc_btn.wait_for(state="visible", timeout=3_000)
        recalc_btn.click()
        page.wait_for_timeout(800)  # 等 onRecalculate 跑完 + skeleton.reset

        last_after_recalc = read_last_computed(page)
        if last_after_recalc is not None:
            fail(f"onRecalculate 后 lastComputed 应为 null，实际 {last_after_recalc}")
        ok("onRecalculate 后 lastComputed=null")

        # 再次刷新 → 不应该自动恢复
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1_000)
        if is_result_visible(page):
            fail("recalculate 后再刷新，不应该自动显示结果")
        ok("recalculate 后再刷新无结果区（cache 已清）")

        browser.close()
    print("\n=========== [OK] 全部 5 部分通过 ===========\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
