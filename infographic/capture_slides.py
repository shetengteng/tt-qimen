import sys, os, json
from playwright.sync_api import sync_playwright

HTML_PATH = os.path.expanduser(
    "~/Documents/personal/tt-projects/tt-divination/infographic/infographic.html"
)
OUT_DIR = os.path.expanduser("~/Desktop/ai_news_video")
os.makedirs(OUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 480, "height": 800})
    page.goto(f"file://{HTML_PATH}")

    # Wait for canvas and fonts to load
    page.wait_for_timeout(2000)

    # Find the canvas element
    canvas = page.locator(".canvas")
    canvas.wait_for(state="visible")

    for i in range(6):
        # Navigate to slide i
        if i > 0:
            page.evaluate(f"goTo({i})")
            page.wait_for_timeout(600)  # wait for transition

        # Screenshot just the canvas element
        path = os.path.join(OUT_DIR, f"slide_{i:02d}.png")
        canvas.screenshot(path=path)
        print(f"✅ slide_{i:02d}.png saved ({i+1}/6)")

    browser.close()

print("\n🎉 All slides captured!")
print(f"📁 Output: {OUT_DIR}")
