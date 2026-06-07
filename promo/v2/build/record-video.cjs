// Record the storyboard-dev.html animation to a 1920x1080 webm using Playwright's built-in video recording.
// Usage: NODE_PATH=<playwright cache> node record-video.cjs
// Output: build/storyboard-record.webm (then convert via ffmpeg)

const { chromium } = require('playwright');
const { join, dirname } = require('path');
const fs = require('fs');

const ROOT = __dirname;
const STORYBOARD = `file://${join(dirname(ROOT), 'storyboard-dev.html')}`;
const OUT_DIR = join(ROOT, 'video-raw');
const DURATION_MS = 123_000;
const WIDTH = 1920;
const HEIGHT = 1080;

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[record] launching chromium @ ${WIDTH}x${HEIGHT}`);
  const browser = await chromium.launch({
    args: [
      `--window-size=${WIDTH},${HEIGHT}`,
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  });

  const page = await context.newPage();
  console.log(`[record] loading ${STORYBOARD}`);
  await page.goto(STORYBOARD, { waitUntil: 'load' });

  // Wait for first scene to be active (storyboard's JS sets .is-active)
  await page.waitForSelector('.scene.is-active', { timeout: 10_000 });

  // Hide the storyboard's dev HUD + controls bar so they don't appear in the
  // recording. The CSS rule `#hud.is-hidden { opacity: 0 }` already exists.
  await page.evaluate(() => {
    document.getElementById('hud')?.classList.add('is-hidden');
    document.getElementById('controls')?.classList.add('is-hidden');
  });

  console.log(`[record] first scene active, dev hud hidden. recording for ${DURATION_MS / 1000}s ...`);

  const t0 = Date.now();
  // Log progress every 10s
  const ticker = setInterval(() => {
    const elapsed = (Date.now() - t0) / 1000;
    process.stdout.write(`\r[record] elapsed ${elapsed.toFixed(1)}s / ${DURATION_MS / 1000}s    `);
  }, 5000);

  await page.waitForTimeout(DURATION_MS);

  clearInterval(ticker);
  process.stdout.write('\n');
  console.log(`[record] closing context to flush video ...`);

  // Get the video object BEFORE closing the page (page.video() returns null after close)
  const video = page.video();
  await context.close();
  await browser.close();

  // Move the auto-named webm to a stable filename
  if (video) {
    const rawPath = await video.path();
    const target = join(ROOT, 'storyboard-record.webm');
    fs.renameSync(rawPath, target);
    const stats = fs.statSync(target);
    console.log(`[record] done.`);
    console.log(`  output: ${target}`);
    console.log(`  size:   ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.error('[record] warning: no video object returned');
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
