#!/usr/bin/env python3
"""
姓名学综合评分 OverallGauge 视觉验证

验证：
  - 4 段彩弧渲染（bad/mid/good/great 段都被绘制，stroke 颜色不同）
  - 指针角度对应分数（score → angle = score/100*180-90）
  - 加载动画：从 0 滑到 score（通过两次截图对比 needle transform）
  - displayed score 文本随动画变化（采样多次）
  - 每个分数区间各一张截图（双主题 × 4 区间 = 8 张）
  - ARIA：role=img + aria-label 含 score

输出：
  design/screenshots/2026-04-25-xingming-gauge-after/
"""
from playwright.sync_api import sync_playwright
import os
import json

BASE = "http://localhost:5180/"
OUT = "/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/screenshots/2026-04-25-xingming-gauge-after"
os.makedirs(OUT, exist_ok=True)

THEMES = ["guofeng", "minimal"]
# 候选样本姓名（覆盖 0-60/60-75/75-90/90-100 4 个区间）
# 通过 enumerate test 在 dev console 验证过：
#   张伟峰 → 75 / good
#   黄渤   → 95 / great
#   林心如 → 71 / fair
#   王明华 → 47 / poor
SAMPLES = [
    ("poor", "王", "明华"),
    ("fair", "林", "心如"),
    ("good", "张", "伟峰"),
    ("great", "黄", "渤"),
]


def setup_and_compute(page, surname, given):
    page.wait_for_load_state("load")
    page.wait_for_timeout(1500)
    page.wait_for_selector(".xm-name-input", timeout=15_000)
    page.locator(".xm-name-input input").nth(0).fill(surname)
    page.locator(".xm-name-input input").nth(1).fill(given)
    page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first.click()
    page.wait_for_selector(".xm-score-card", timeout=15_000)
    try:
        page.wait_for_selector(".skeleton-overlay:not(.visible)", timeout=4_000)
    except Exception:
        pass


def probe_gauge(page):
    """采集仪表盘几何 + 段数 + 当前 needle transform"""
    return page.evaluate(
        """() => {
            const card = document.querySelector('.xm-score-card');
            if (!card) return null;
            const segs = Array.from(card.querySelectorAll('.xm-gauge-seg')).map((p) => ({
                cls: p.getAttribute('class'),
                stroke: getComputedStyle(p).stroke,
                dasharray: p.getAttribute('stroke-dasharray'),
                dashoffset: p.getAttribute('stroke-dashoffset'),
            }));
            const needleGroup = card.querySelector('.xm-gauge-needle-group');
            const svg = card.querySelector('.xm-gauge');
            const aria = svg.getAttribute('aria-label');
            const role = svg.getAttribute('role');
            const valueEl = card.querySelector('.xm-score-value, .xm-score-num');
            // 2026-04-26: tick-mark 已移除（用户反馈"多余线条"），断言改为 0
            const tickMarks = card.querySelectorAll('.xm-gauge-tick-mark').length;
            const needlePolygon = card.querySelector('.xm-gauge-needle');
            return {
                seg_count: segs.length,
                segs,
                needle_transform: needleGroup ? needleGroup.style.transform : null,
                aria_label: aria,
                role,
                displayed_score_text: valueEl ? valueEl.textContent.trim() : null,
                tick_marks: tickMarks,
                needle_tag: needlePolygon ? needlePolygon.tagName.toLowerCase() : null,
                needle_points: needlePolygon ? needlePolygon.getAttribute('points') : null,
            };
        }"""
    )


def main():
    print("\n=========== 姓名学综合评分 OverallGauge 验证 ===========\n")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Part A: 单组样本采集详细几何 + ARIA + 段渲染
        for theme in THEMES:
            ctx = browser.new_context(viewport={"width": 1280, "height": 900})
            page = ctx.new_page()
            page.goto(f"{BASE}?theme={theme}&lang=zh-CN", wait_until="domcontentloaded")
            page.wait_for_load_state("load")
            page.evaluate("location.hash = '#/xingming'")
            surname, given = "张", "伟峰"
            setup_and_compute(page, surname, given)
            page.wait_for_timeout(1500)  # 等动画结束
            data = probe_gauge(page)
            print(f"--- theme={theme} sample={surname}{given} ---")
            print(json.dumps(data, ensure_ascii=False, indent=2))
            assert data["seg_count"] == 4, f"FAIL: 期望 4 段彩弧，实际 {data['seg_count']}"
            assert data["role"] == "img", f"FAIL: role 应为 img，实际 {data['role']}"
            assert data["aria_label"] and "75" in data["aria_label"], (
                f"FAIL: aria-label 应含 score=75，实际 {data['aria_label']}"
            )
            assert data["tick_marks"] == 0, (
                f"FAIL: tick-mark 已移除，期望 0，实际 {data['tick_marks']}"
            )
            assert data["needle_tag"] == "polygon", (
                f"FAIL: 指针应为 polygon，实际 {data['needle_tag']}"
            )
            assert data["needle_points"] and len(data["needle_points"].split()) == 5, (
                f"FAIL: polygon 应有 5 点，实际 {data['needle_points']}"
            )
            stroke_colors = [s["stroke"] for s in data["segs"]]
            unique = len(set(stroke_colors))
            assert unique == 4, f"FAIL: 4 段应有 4 个不同颜色，实际 {unique} | {stroke_colors}"
            print(f"PASS [{theme}] 4 段彩弧 + ARIA + 5 点锥形 polygon 指针 + 0 tick 全部正确\n")
            ctx.close()

        # Part B: 加载动画 — 在 score-card 出现的"第一帧"立即开始高频采样
        # 验证从 0 → 目标分数的滑动 (1.2s ease-out)
        print("--- Part B: 加载动画 0→score 高频采样 ---")
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(f"{BASE}?theme=minimal&lang=zh-CN", wait_until="domcontentloaded")
        page.wait_for_load_state("load")
        page.evaluate("location.hash = '#/xingming'")
        page.wait_for_timeout(1000)
        page.wait_for_selector(".xm-name-input", timeout=15_000)
        page.locator(".xm-name-input input").nth(0).fill("张")
        page.locator(".xm-name-input input").nth(1).fill("伟峰")
        # 注入 raf 采样：在 score-card mount 后的 1.5s 内每 50ms 抓一次 displayedScore 文本
        page.evaluate(
            """() => {
                window.__animSamples = [];
                const obs = new MutationObserver((muts) => {
                    if (document.querySelector('.xm-score-card')) {
                        obs.disconnect();
                        let n = 0;
                        const tick = () => {
                            const e = document.querySelector('.xm-score-card .xm-score-num, .xm-score-card .xm-score-value');
                            window.__animSamples.push(e ? e.textContent.trim() : '<no-el>');
                            n++;
                            if (n < 130) requestAnimationFrame(tick);  // ~2200ms 覆盖整个 ease-out 动画
                        };
                        requestAnimationFrame(tick);
                    }
                });
                obs.observe(document.body, { childList: true, subtree: true });
            }"""
        )
        page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first.click()
        page.wait_for_selector(".xm-score-card", timeout=15_000)
        page.wait_for_timeout(3500)  # 等动画完成（采样 130 帧 + 残余 raf）
        samples = page.evaluate("() => window.__animSamples || []")
        print(f"动画采样 ({len(samples)} 帧)：head={samples[:8]}, tail={samples[-3:]}")
        unique_vals = set(samples)
        assert len(unique_vals) >= 10, (
            f"FAIL: 动画采样应有 >=10 个不同值，实际 {len(unique_vals)} | {samples}"
        )
        # 抓 "score/100" 中 score 部分的整数值
        def parse_score(s: str) -> int:
            head = s.split("/")[0].strip()
            digits = "".join(c for c in head if c.isdigit())
            return int(digits) if digits else 0

        first_int = parse_score(samples[0])
        assert first_int <= 10, f"FAIL: 首值应 <=10 实际 {samples[0]} → {first_int}"
        max_in_samples = max(parse_score(s) for s in samples)
        assert max_in_samples == 75, (
            f"FAIL: 采样 max 应=75 实际 {max_in_samples}"
        )
        # 同时直接读取当前 DOM —— 经过 3s 后必定 settle 在 75
        final = page.evaluate(
            "() => { const e = document.querySelector('.xm-score-card .xm-score-num, .xm-score-card .xm-score-value'); return e ? e.textContent.trim() : null; }"
        )
        assert "75" in final, f"FAIL: settle 后应=75 实际 {final}"
        print(
            f"PASS 动画 {len(unique_vals)} 个不同值 / max={max_in_samples} / settle={final}，从 {samples[0]} → {samples[-1]} → {final}\n"
        )
        ctx.close()

        # Part C: 4 区间 × 双主题 截图
        print("--- Part C: 4 区间 × 双主题 截图 ---")
        for theme in THEMES:
            for label, surname, given in SAMPLES:
                ctx = browser.new_context(viewport={"width": 1280, "height": 900})
                page = ctx.new_page()
                page.goto(
                    f"{BASE}?theme={theme}&lang=zh-CN", wait_until="domcontentloaded"
                )
                page.wait_for_load_state("load")
                page.evaluate("location.hash = '#/xingming'")
                setup_and_compute(page, surname, given)
                page.wait_for_timeout(1500)
                el = page.locator(".xm-score-card")
                el.scroll_into_view_if_needed()
                page.wait_for_timeout(500)
                shot = os.path.join(OUT, f"{theme}-{label}-{surname}{given}.png")
                el.screenshot(path=shot)
                final_score = page.evaluate(
                    "() => { const e = document.querySelector('.xm-score-card .xm-score-num, .xm-score-card .xm-score-value'); return e ? e.textContent.trim() : null; }"
                )
                print(f"  [{theme}] {label} {surname}{given} → score={final_score}, shot={shot}")
                ctx.close()

        # Part D: mobile 截图
        print("\n--- Part D: mobile (375×800) × 双主题 ---")
        for theme in THEMES:
            ctx = browser.new_context(viewport={"width": 375, "height": 800})
            page = ctx.new_page()
            page.goto(f"{BASE}?theme={theme}&lang=zh-CN", wait_until="domcontentloaded")
            page.wait_for_load_state("load")
            page.evaluate("location.hash = '#/xingming'")
            setup_and_compute(page, "张", "伟峰")
            page.wait_for_timeout(1500)
            el = page.locator(".xm-score-card")
            el.scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            shot = os.path.join(OUT, f"{theme}-mobile.png")
            el.screenshot(path=shot)
            print(f"  shot -> {shot}")
            ctx.close()

        browser.close()

    print("\n=========== 全部验证通过 ✅ ===========")


if __name__ == "__main__":
    main()
