/* eslint-disable */
/**
 * 截一张"已经排好盘"的 Bazi 真实页面截图,用于 S5 镜头左半。
 * - 用 URL query 传入生辰,页面 onMounted 时 hydrate + 自动排盘
 * - 排盘是甲寅年丁卯月己巳日辛未时(示例命盘)
 * - 截图保存为 assets/app-bazi-result.png
 *
 * Run:
 *   NODE_PATH="/Users/TerrellShe/.npm/_npx/705bc6b22212b352/node_modules" \
 *     node _capture-bazi-result.cjs
 */
const { chromium } = require('playwright');
const { join } = require('path');

const BASE = 'https://shetengteng.github.io/tt-qimen/';

// 示例命盘: 男 · 公历 1994-04-20 09:00 (甲戌年戊辰月癸卯日丁巳时)
//  - 用近似的真实出生时间, 演示页面会自动算盘
const QUERY = 'year=1994&month=4&day=20&hour=9&minute=0&calendar=solar&gender=male';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });
  // 默认走国风主题, 与 S6 左半呼应
  await context.addInitScript(() => {
    try { localStorage.setItem('tt-qimen:theme', 'guofeng'); } catch (e) {}
  });
  const page = await context.newPage();
  const url = `${BASE}#/bazi?${QUERY}`;
  console.log(`[capture] -> ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  // 等四柱表格 + 解读段渲染出来
  await page.waitForSelector('table, .pillar, .bazi-table, h3', { timeout: 10_000, state: 'visible' }).catch(() => {});
  // 给 reveal 动画时间
  await page.waitForTimeout(3500);
  // 滚到能同时看到四柱与解读
  await page.evaluate(() => {
    const t = document.querySelector('table, .bazi-table, .pillar');
    if (t) (t.scrollIntoView ? t.scrollIntoView({ block: 'start' }) : null);
    window.scrollBy(0, -60);
  });
  await page.waitForTimeout(1200);
  const out = join(__dirname, 'app-bazi-result.png');
  await page.screenshot({ path: out, fullPage: false, type: 'png' });
  console.log(`[ok] ${out}`);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
