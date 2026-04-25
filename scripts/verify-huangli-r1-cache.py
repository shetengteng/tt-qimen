#!/usr/bin/env python3
"""Verify Huangli R1 — useHuangliStore.getMonthCached() LRU cache.

Coverage:
  - Same month called twice → 1 miss + 1 hit
  - Different month → +1 miss
  - Re-call previous month → +1 hit
  - LRU capacity respected (size never > MONTH_CACHE_CAPACITY=6)
  - Cache survives Vue reactivity (returns referentially equal object on hit)

Run:
  python3 scripts/verify-huangli-r1-cache.py
"""
from __future__ import annotations

import json
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5180/#/huangli"


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.add_init_script(
            "localStorage.setItem('tt-qimen:theme', 'guofeng');"
            "localStorage.setItem('tt-qimen:locale', 'zh-CN');"
        )
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_selector(".hl-cal", timeout=10_000)

        # 通过 window 暴露 store？没暴露的话用动态 import
        result = page.evaluate("""
        async () => {
          const piniaMod = await import('/src/modules/huangli/stores/huangliStore.ts');
          const { useHuangliStore } = piniaMod;
          const store = useHuangliStore();
          // 1) 第一次首屏渲染会消耗 1 miss（默认月）。先清缓存让数据可控。
          store.clearMonthCache();

          const trace = [];
          // 同月 2 次 → 1 miss + 1 hit
          const a1 = store.getMonthCached(2026, 4);
          const a2 = store.getMonthCached(2026, 4);
          trace.push({ step: 'same-twice', sameRef: a1 === a2, ...store._cacheStats() });

          // 跨月 → +1 miss
          store.getMonthCached(2026, 5);
          trace.push({ step: 'next-month', ...store._cacheStats() });

          // 回退原月 → +1 hit
          const a3 = store.getMonthCached(2026, 4);
          trace.push({ step: 'back-prev', sameRef: a1 === a3, ...store._cacheStats() });

          // 加载到 7 个月份触发 LRU 淘汰
          for (let m = 6; m <= 12; m++) {
            store.getMonthCached(2026, m);
          }
          const beforeLru = store._cacheStats();
          trace.push({ step: 'after-7-extra-months', ...beforeLru });

          // 容量必须 ≤ 6
          const capRespected = beforeLru.size <= 6;

          return { trace, capRespected };
        }
        """)

        print(json.dumps(result, ensure_ascii=False, indent=2))

        # 断言
        trace = result["trace"]
        s1 = trace[0]
        if not (s1["misses"] == 1 and s1["hits"] == 1 and s1["sameRef"] is True):
            print(f"FAIL: same-twice should be 1 miss + 1 hit + sameRef: {s1}")
            return 1
        s2 = trace[1]
        if s2["misses"] != 2 or s2["hits"] != 1:
            print(f"FAIL: next-month should be 2 miss + 1 hit: {s2}")
            return 1
        s3 = trace[2]
        if not (s3["misses"] == 2 and s3["hits"] == 2 and s3["sameRef"] is True):
            print(f"FAIL: back-prev should reuse cache (2 miss + 2 hit + sameRef): {s3}")
            return 1
        if not result["capRespected"]:
            print(f"FAIL: LRU capacity violated: size={trace[-1]['size']}")
            return 1

        print("OK: R1 LRU cache works correctly (hit/miss accounting + capacity)")
        browser.close()
        return 0


if __name__ == "__main__":
    sys.exit(main())
