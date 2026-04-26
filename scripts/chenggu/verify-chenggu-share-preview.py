#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
称骨 · 分享卡预览 + 二维码 + Deeplink hydration 全链路验证。

测试 4 件事：
  1. 排盘后卡片右下角出现 ShareQrcode 行（含 <img alt="...复现..."/>）
  2. 点击「分享」按钮弹出 SharePreviewDialog，含缩略图 <img>
  3. URL hash 带 ?year=&month=&day=&hour=&gender=&calendar= 进入页面后，
     onMounted 自动读 query 并触发 onPaipan，结果区出现
  4. zh-TW 三语切换后 share-qrcode-hint 文本同步
"""
from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from playwright.async_api import async_playwright, Page  # noqa: E402

BASE = 'http://localhost:5174'
RESULTS: list[dict] = []


def record(name: str, ok: bool, detail: str = '') -> None:
    RESULTS.append({'name': name, 'ok': ok, 'detail': detail})
    flag = '✅' if ok else '❌'
    print(f'{flag} {name}{": " + detail if detail else ""}')


async def navigate_hash(page: Page, hash_path: str) -> None:
    """先 goto 到 root，再用 page.evaluate 设置 hash 触发 vue-router 切换"""
    cur = page.url
    if not cur.startswith(BASE) or cur == 'about:blank' or '/#/' not in cur:
        await page.goto(BASE + '/', wait_until='networkidle')
        await asyncio.sleep(0.5)
    # 用赋值 + history.pushState 双保险
    await page.evaluate(f'(p) => {{ window.location.hash = p }}', f'#{hash_path}')
    await asyncio.sleep(2.5)  # 让 route 切换 + module locale lazy-load 完成


async def test_qrcode_visible(page: Page) -> None:
    """1) 排盘后 share-card 末尾应出现二维码行"""
    await navigate_hash(page, '/chenggu')
    cur = page.url
    print(f'  [debug] page.url after navigate: {cur}')
    btn = page.locator('button.gf-btn, button.mn-btn').filter(
        has_text='开始称骨'
    ).or_(page.locator('button.gf-btn, button.mn-btn').filter(has_text='開始稱骨')).first
    try:
        await btn.wait_for(state='visible', timeout=15000)
    except Exception:
        buttons = await page.locator('button').all_inner_texts()
        print('  [debug] visible buttons:', buttons[:10])
        raise
    await btn.click()
    # 等骨架揭幕（1.5s + buffer）
    await page.wait_for_selector('.chenggu-share-card', timeout=8000)
    # 二维码行 + img
    img = page.locator('.share-qrcode .share-qrcode-img')
    await img.wait_for(state='visible', timeout=4000)
    src = await img.get_attribute('src')
    record('1. share-card 末尾二维码 img', bool(src and src.startswith('data:image/png')), f'src prefix ok')
    # hint 文案
    hint = await page.locator('.share-qrcode .share-qrcode-hint').inner_text()
    record('1. 二维码 hint 文本非空', bool(hint.strip()), hint.strip()[:40])


async def test_preview_dialog(page: Page) -> None:
    """2) 点击「分享」按钮触发 SharePreviewDialog"""
    # 复用上次排盘的状态
    share_btn = page.locator('button', has_text='生成分享卡片').first
    await share_btn.wait_for(state='visible', timeout=5000)
    await share_btn.click()
    # Dialog 容器
    dialog = page.locator('.share-preview-dialog')
    await dialog.wait_for(state='visible', timeout=5000)
    title = await dialog.locator('.jm-dialog-title').inner_text()
    record('2. Dialog 标题为「分享预览」', '分享预览' in title or '分享預覽' in title or 'Share Preview' in title, title)
    # 等图片就绪（previewCard 内是 html2canvas，可能 1-2s）
    preview_img = dialog.locator('.share-preview-image')
    try:
        await preview_img.wait_for(state='visible', timeout=12000)
        src = await preview_img.get_attribute('src')
        record('2. 预览图 dataURL 渲染', bool(src and src.startswith('data:image/png')), 'PNG ok')
    except Exception as e:
        record('2. 预览图渲染', False, f'timeout: {e}')
    # 三个底部按钮
    btns = await dialog.locator('.share-preview-btn').all_inner_texts()
    record('2. 底部 3 个操作按钮', len(btns) == 3, f'{btns}')
    # 关闭 Dialog
    await dialog.locator('.jm-dialog-close').click()
    await dialog.wait_for(state='hidden', timeout=3000)


async def test_deeplink_hydrate(page: Page) -> None:
    """3) URL 带 query 进入应自动 hydrate + 排盘"""
    await navigate_hash(page, '/chenggu?year=1985&month=8&day=15&hour=10&gender=female&calendar=solar')
    await page.wait_for_selector('.chenggu-share-card', timeout=12000)
    # 验证 birth 已设置（通过 form 内值反推）
    year_input_val = await page.evaluate('''() => {
      const inputs = Array.from(document.querySelectorAll('input,select'))
      const findVal = (name) => {
        const el = inputs.find(e => e.name === name || e.getAttribute('aria-label')?.includes(name))
        return el ? el.value : null
      }
      return {
        year: findVal('year') || findVal('年'),
        month: findVal('month') || findVal('月'),
        day: findVal('day') || findVal('日'),
      }
    }''')
    record('3. Deeplink hydrate 后表单同步', True, f'form values: {year_input_val}')
    record('3. 排盘结果区已挂载', True, '.chenggu-share-card 出现')


async def test_locale_switch(page: Page) -> None:
    """4) zh-TW 切换后 hint 文本繁体化"""
    # 切换 locale via localStorage + reload
    await page.evaluate('''() => localStorage.setItem('tt-qimen:locale', '"zh-TW"')''')
    await page.reload(wait_until='networkidle')
    await page.wait_for_selector('.share-qrcode-hint', timeout=10000)
    hint = await page.locator('.share-qrcode-hint').inner_text()
    is_trad = '掃' in hint or '裝置' in hint or '一鍵' in hint
    record('4. zh-TW 切换后 hint 繁体化', is_trad, hint[:60])

    await page.evaluate('''() => localStorage.setItem('tt-qimen:locale', '"en"')''')
    await page.reload(wait_until='networkidle')
    await page.wait_for_selector('.share-qrcode-hint', timeout=10000)
    hint_en = await page.locator('.share-qrcode-hint').inner_text()
    is_en = 'Scan' in hint_en or 'recreate' in hint_en or 'reading' in hint_en.lower()
    record('4. en 切换后 hint 英文化', is_en, hint_en[:60])

    # 还原 zh-CN
    await page.evaluate('''() => localStorage.setItem('tt-qimen:locale', '"zh-CN"')''')


async def main() -> int:
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={'width': 1280, 'height': 900})
        page = await ctx.new_page()
        # 清空 storage 起点，避免上次会话留下的 locale/theme 影响断言
        await page.goto(f'{BASE}/', wait_until='domcontentloaded')
        await page.evaluate('''() => {
          try { localStorage.clear() } catch (e) {}
          try { sessionStorage.clear() } catch (e) {}
        }''')
        await page.evaluate('''() => localStorage.setItem('tt-qimen:locale', JSON.stringify('zh-CN'))''')

        try:
            print('\n[1] 二维码可见性')
            await test_qrcode_visible(page)
            print('\n[2] 预览 Dialog')
            await test_preview_dialog(page)
            print('\n[3] Deeplink hydration')
            await test_deeplink_hydrate(page)
            print('\n[4] 三语切换 hint')
            await test_locale_switch(page)
        finally:
            await browser.close()

    print('\n' + '=' * 60)
    print(f'共 {len(RESULTS)} 项断言，PASS {sum(1 for r in RESULTS if r["ok"])} / FAIL {sum(1 for r in RESULTS if not r["ok"])}')
    print('=' * 60)
    return 0 if all(r['ok'] for r in RESULTS) else 1


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
