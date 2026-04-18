#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
交互式用户输入脚本 - 自动轮询版本（检测内容变化）

设计：配合 Cursor Agent 的 block_until_ms 前台等待机制。
- 每 HEARTBEAT_INTERVAL 秒输出心跳，确保不被 block_until_ms 超时踢到后台
- Agent 收到心跳后重新执行脚本继续等待
- Agent 收到 ✅ 则表示用户已输入新内容

Usage:
    python userinput.py  # 等待 prompts.txt 内容变化
"""

import os
import sys
import time

POLL_INTERVAL = 2
HEARTBEAT_INTERVAL = 100
DEFAULT_TIMEOUT = 60 * 60 * 2  # 2 hours

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def read_prompts_file(filename='prompts.txt'):
    filename = os.path.join(SCRIPT_DIR, filename)
    if not os.path.exists(filename):
        return None
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        if content:
            return content
    except Exception as e:
        print(f"读取文件 {filename} 时出错: {e}")
    return None


def main():
    initial_content = read_prompts_file()

    print(f"⏳ 等待 prompts.txt 内容变化...（每 {POLL_INTERVAL}s 检查一次）")
    if initial_content:
        print(f"    当前内容: {initial_content[:80]}{'...' if len(initial_content) > 80 else ''}")
    else:
        print("    当前文件为空或不存在。")
    print("    请修改 prompts.txt 的内容，脚本会自动检测变化。")
    sys.stdout.flush()

    elapsed = 0
    heartbeat_elapsed = 0
    while elapsed < DEFAULT_TIMEOUT:
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL
        heartbeat_elapsed += POLL_INTERVAL

        content = read_prompts_file()
        if content and content != initial_content:
            print(f"\n✅ 检测到内容变化（等待了 {elapsed}s），新内容如下:")
            print("=" * 60)
            print(content)
            print("=" * 60)
            sys.stdout.flush()
            return

        if heartbeat_elapsed >= HEARTBEAT_INTERVAL:
            heartbeat_elapsed = 0
            print(f"💓 心跳: 已等待 {elapsed}s，继续等待用户输入...")
            sys.stdout.flush()

    print(f"\n⚠️ 超时（{DEFAULT_TIMEOUT}s），未检测到内容变化，跳过。")
    sys.stdout.flush()


if __name__ == "__main__":
    main()
