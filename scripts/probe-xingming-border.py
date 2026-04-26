#!/usr/bin/env python3
"""
Probe: 移动端 (375 × 800) 下姓名学 .xm-fivegrids 右边框是否丢失。

输出：
  - bounding box (left/right/top/bottom) of .xm-fivegrids vs viewport width
  - computed border-right-width / overflow-x of .xm-fivegrids 及主要祖先
  - 是否 .xm-fivegrids 容器 right > viewport.width（说明溢出，右边框被裁掉）
  - 截图 viewport
"""
from playwright.sync_api import sync_playwright
import os, json, sys

BASE = "http://localhost:5180/"
OUT = "/Users/TerrellShe/Documents/personal/tt-projects/tt-divination/design/screenshots/2026-04-25-xingming-border-probe"
os.makedirs(OUT, exist_ok=True)

THEMES = ["guofeng", "minimal"]
LOCALES = ["zh-CN"]
NAME = ("张", "伟峰")  # 已知能算出五格的样本


def go_xingming_and_run(page, name):
    page.goto(BASE + "#/xingming", wait_until="domcontentloaded")
    page.wait_for_load_state("load")
    page.wait_for_timeout(1500)
    page.wait_for_selector(".xm-name-input", timeout=15_000)
    surname_input = page.locator(".xm-name-input input").nth(0)
    given_input = page.locator(".xm-name-input input").nth(1)
    surname_input.fill(name[0])
    given_input.fill(name[1])
    btn = page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first
    btn.click()
    page.wait_for_selector(".xm-fivegrids", timeout=15_000)
    try:
        page.wait_for_selector(".skeleton-overlay:not(.visible)", timeout=4_000)
    except Exception:
        pass
    page.wait_for_timeout(1200)


def probe_box(page, sel):
    return page.evaluate(
        """(sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {
                left: r.left, right: r.right, top: r.top, bottom: r.bottom,
                width: r.width, height: r.height,
                border_right_width: cs.borderRightWidth,
                border_right_color: cs.borderRightColor,
                border_right_style: cs.borderRightStyle,
                box_sizing: cs.boxSizing,
                overflow_x: cs.overflowX,
                overflow_y: cs.overflowY,
                display: cs.display,
                viewport_w: window.innerWidth,
                viewport_h: window.innerHeight,
            };
        }""",
        sel,
    )


def probe_ancestors(page, leaf_sel):
    return page.evaluate(
        """(leaf) => {
            const out = [];
            let el = document.querySelector(leaf);
            while (el && el !== document.body) {
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                out.push({
                    tag: el.tagName.toLowerCase(),
                    cls: el.className && el.className.toString().slice(0, 80),
                    width: r.width,
                    overflow_x: cs.overflowX,
                    padding_right: cs.paddingRight,
                    box_sizing: cs.boxSizing,
                });
                el = el.parentElement;
            }
            return out;
        }""",
        leaf_sel,
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for theme in THEMES:
            for locale in LOCALES:
                ctx = browser.new_context(viewport={"width": 375, "height": 800})
                page = ctx.new_page()
                # 1) 先用 search query 引导写入 localStorage
                page.goto(
                    f"{BASE}?theme={theme}&lang={locale}",
                    wait_until="domcontentloaded",
                )
                page.wait_for_load_state("load")
                # 2) 再切到目标路由
                page.evaluate("location.hash = '#/xingming'")
                page.wait_for_load_state("load")
                page.wait_for_timeout(2500)
                page.screenshot(path=os.path.join(OUT, f"_dbg-{theme}-{locale}.png"), full_page=True)
                title = page.title()
                hash_ = page.evaluate("location.hash")
                body_class_count = page.evaluate("document.querySelectorAll('*').length")
                print(f"[debug] title={title} hash={hash_} dom_count={body_class_count}")
                console = []
                page.on("console", lambda m: console.append(f"{m.type}:{m.text}"))
                page.wait_for_selector(".xm-name-input", timeout=15_000)
                surname_input = page.locator(".xm-name-input input").nth(0)
                given_input = page.locator(".xm-name-input input").nth(1)
                surname_input.fill(NAME[0])
                given_input.fill(NAME[1])
                btn = page.locator(".xm-name-input .gf-btn, .xm-name-input .mn-btn").first
                btn.click()
                page.wait_for_selector(".xm-fivegrids", timeout=15_000)
                try:
                    page.wait_for_selector(".skeleton-overlay:not(.visible)", timeout=4_000)
                except Exception:
                    pass
                page.wait_for_timeout(1200)

                box = probe_box(page, ".xm-fivegrids")
                ancestors = probe_ancestors(page, ".xm-fivegrids")

                shot = os.path.join(OUT, f"{theme}-{locale}-xm-fivegrids.png")
                page.locator(".xm-fivegrids").scroll_into_view_if_needed()
                page.wait_for_timeout(300)
                page.screenshot(path=shot, full_page=False)

                print(f"\n===== theme={theme} locale={locale} =====")
                print(json.dumps(box, ensure_ascii=False, indent=2))
                print("--- ancestors (innermost → outermost) ---")
                for a in ancestors:
                    print(json.dumps(a, ensure_ascii=False))
                print(f"shot -> {shot}")

                ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
