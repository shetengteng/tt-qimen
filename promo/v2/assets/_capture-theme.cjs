/* eslint-disable */
/**
 * Capture 2 theme screenshots from live tt-qimen site.
 * - theme-guofeng.png: 国风主题 · 首页
 * - theme-minimal.png: 简约主题 · 首页
 *
 * Run: NODE_PATH=$HOME/.npm/_npx/<id>/node_modules node _capture-theme.cjs
 *      或在装好 playwright 的目录下 `node _capture-theme.cjs`
 */
const { chromium } = require('playwright');
const { join } = require('path');

const BASE = 'https://shetengteng.github.io/tt-qimen/';
const TARGETS = [
  { theme: 'guofeng', file: 'theme-guofeng.png', label: '国风主题' },
  { theme: 'minimal', file: 'theme-minimal.png', label: '简约主题' },
];

(async () => {
  const browser = await chromium.launch();
  for (const t of TARGETS) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
    });
    // localStorage 在 page 之前注入,首屏立刻命中目标主题
    await context.addInitScript((theme) => {
      try {
        localStorage.setItem('tt-qimen:theme', theme);
      } catch (e) {}
    }, t.theme);

    const page = await context.newPage();
    console.log(`[capture] -> ${t.label} (${t.theme})`);
    await page.goto(`${BASE}#/`, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForSelector('h1, h2, .hero, [class*=card]', { timeout: 8_000, state: 'visible' }).catch(() => {});
    await page.waitForTimeout(2200); // 等主题切换 + 字体 + 图片
    const out = join(__dirname, t.file);
    await page.screenshot({ path: out, fullPage: false, type: 'png' });
    console.log(`[ok]      ${out}`);
    await context.close();
  }
  await browser.close();
  console.log('\nDone.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
