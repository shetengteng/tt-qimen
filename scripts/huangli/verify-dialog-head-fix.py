"""
验证：mobile 模式下 dialog 顶部"展示不全"bug 已修复。
检查项：
  1. overlay 颜色更深 + blur 更大 → 透出 navbar 不可辨识
  2. dialog top 8vh 区域整体糊化，不再有杂质
  3. dialog 顶部圆角 20px + 顶部 12px padding，视觉更"独立"
"""
from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path("design/screenshots/2026-04-25-dialog-head-fix")
OUT.mkdir(parents=True, exist_ok=True)

URL = "http://localhost:5180/#/huangli"


def set_theme(page, theme):
    """主题切换：tt-qimen:theme 用裸 string（serializer.write 不 stringify）。"""
    page.evaluate(
        """([theme]) => {
          try { localStorage.setItem('tt-qimen:theme', theme); } catch(e) {}
        }""",
        [theme],
    )


def open_day_detail(page):
    page.wait_for_selector(".hl-cal-day", timeout=15000)
    today = page.locator(".hl-cal-day.is-today").first
    if today.count() == 0:
        today = page.locator(".hl-cal-day").nth(15)
    today.click()
    page.wait_for_selector(".jm-dialog-content", timeout=10000)


def open_solar_term(page):
    page.wait_for_selector(".hl-cal-day", timeout=15000)
    cell = page.locator(".hl-cal-day.is-solar-term").first
    if cell.count() == 0:
        return False
    cell.click()
    page.wait_for_selector(".jm-dialog-content", timeout=10000)
    return True


def shoot(page, name):
    full = OUT / f"{name}.png"
    page.screenshot(path=str(full), full_page=False)
    print(f"  -> {full}")


def probe_overlay_styles(page):
    """读取 overlay 计算属性，确认修复生效。"""
    return page.evaluate(
        """() => {
          const ov = document.querySelector('.jm-dialog-overlay');
          const ct = document.querySelector('.jm-dialog-content');
          if (!ov || !ct) return null;
          const ovs = getComputedStyle(ov);
          const cts = getComputedStyle(ct);
          return {
            overlayBg: ovs.backgroundColor,
            overlayBlur: ovs.backdropFilter || ovs.webkitBackdropFilter,
            contentRadius: cts.borderTopLeftRadius,
            contentMaxHeight: cts.maxHeight,
            contentBoxShadow: cts.boxShadow,
            headPaddingTop: getComputedStyle(document.querySelector('.jm-dialog-head')).paddingTop,
          };
        }"""
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        for theme in ("guofeng", "minimal"):
            ctx = browser.new_context(viewport={"width": 390, "height": 844})
            page = ctx.new_page()
            page.goto(URL)
            page.wait_for_load_state("networkidle")
            # 主题切换 + 等待 reactive 系统应用 css class
            set_theme(page, theme)
            # 强制 force reload 让主题 css 生效
            page.reload()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(600)

            # DayDetail
            try:
                open_day_detail(page)
                page.wait_for_timeout(400)
                styles = probe_overlay_styles(page)
                print(f"[{theme}] DayDetail styles: {styles}")
                shoot(page, f"{theme}-day-detail-mobile-fixed")
                page.keyboard.press("Escape")
                page.wait_for_timeout(200)
            except Exception as e:
                print(f"  ! day-detail: {e}")

            # SolarTerm
            try:
                if open_solar_term(page):
                    page.wait_for_timeout(400)
                    shoot(page, f"{theme}-solar-term-mobile-fixed")
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(200)
            except Exception as e:
                print(f"  ! solar-term: {e}")

            ctx.close()

        # 桌面端也截一组以确保没破坏（保留浅 overlay）
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(URL)
        page.wait_for_load_state("networkidle")
        try:
            open_day_detail(page)
            page.wait_for_timeout(400)
            shoot(page, "guofeng-day-detail-desktop-after")
            styles = probe_overlay_styles(page)
            print(f"[desktop] styles: {styles}")
        except Exception as e:
            print(f"  ! desktop: {e}")
        ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
