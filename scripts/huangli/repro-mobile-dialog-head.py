"""
复现：用户报告"弹框头部展示不全"。
策略：mobile viewport（390×844）下打开 DayDetailDialog / SolarTermDialog / MonthYearPicker，
全屏截图（不裁剪），观察头部上方是否有 navbar 透出 / dialog 头部本身是否有截断。
"""
from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path("design/screenshots/2026-04-25-dialog-head-bug-repro")
OUT.mkdir(parents=True, exist_ok=True)

URL = "http://localhost:5180/#/huangli"


def set_locale(page, code):
    page.evaluate(
        """([code]) => {
          const stored = localStorage.getItem('jiemeng-pinia');
          // 用 store
          const app = window.__APP__;
          // fallback：直接写 localStorage
          try {
            const root = document.documentElement;
            root.setAttribute('lang', code);
          } catch(e) {}
        }""",
        [code],
    )


def set_theme(page, theme):
    page.evaluate(
        """([theme]) => {
          document.documentElement.setAttribute('data-theme', theme);
          try { localStorage.setItem('jiemeng-theme', theme); } catch(e) {}
        }""",
        [theme],
    )


def open_day_detail(page):
    """点击日历中今日（标 . today）触发 DayDetailDialog。"""
    page.wait_for_selector(".hl-cal-day", timeout=15000)
    today = page.locator(".hl-cal-day.is-today").first
    if today.count() == 0:
        today = page.locator(".hl-cal-day").nth(15)
    today.click()
    page.wait_for_selector(".jm-dialog-content", timeout=10000)


def open_solar_term(page):
    """点击带节气的日子（is-solar-term）。"""
    page.wait_for_selector(".hl-cal-day", timeout=15000)
    cell = page.locator(".hl-cal-day.is-solar-term").first
    if cell.count() == 0:
        return False
    cell.click()
    page.wait_for_selector(".jm-dialog-content", timeout=10000)
    return True


def open_picker(page):
    page.wait_for_selector(".hl-cal-month-trigger", timeout=15000)
    page.locator(".hl-cal-month-trigger").click()
    page.wait_for_selector("[data-reka-popover-content], .hl-mp", timeout=10000)


def shoot(page, name):
    full = OUT / f"{name}.png"
    page.screenshot(path=str(full), full_page=False)
    print(f"  -> {full}")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for theme in ("guofeng", "minimal"):
            ctx = browser.new_context(viewport={"width": 390, "height": 844})
            page = ctx.new_page()
            page.goto(URL)
            page.wait_for_load_state("networkidle")
            set_theme(page, theme)
            page.wait_for_timeout(400)

            # 1. DayDetail
            try:
                open_day_detail(page)
                page.wait_for_timeout(300)
                shoot(page, f"{theme}-day-detail-mobile")
                # 关闭
                page.keyboard.press("Escape")
                page.wait_for_timeout(200)
            except Exception as e:
                print(f"  ! day-detail: {e}")

            # 2. SolarTerm
            try:
                if open_solar_term(page):
                    page.wait_for_timeout(300)
                    shoot(page, f"{theme}-solar-term-mobile")
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(200)
            except Exception as e:
                print(f"  ! solar-term: {e}")

            # 3. Picker
            try:
                open_picker(page)
                page.wait_for_timeout(300)
                shoot(page, f"{theme}-picker-mobile")
                page.keyboard.press("Escape")
                page.wait_for_timeout(200)
            except Exception as e:
                print(f"  ! picker: {e}")

            ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
