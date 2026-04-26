#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""扫描 design/todo/*.todo.md，按完成度在文件名上加标注。

格式：`01-通用层.todo.md` → `01-通用层 [85%].todo.md`

进度计算：
  - `[x]` 算 1 分（已完成）
  - `[~]` 算 0.5 分（部分实现）
  - `[ ]` 算 0 分（待办）
  - 进度 = sum / total，向下取整成整数百分比

匹配规则：
  - 用反引号包围的（``[x]``）是文档约定说明，**不计**
  - 列表/表格里的纯 `[x]` `[~]` `[ ]` 才计数

幂等：文件名已含 ` [N%]` 后缀的，先剥离再重算。
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

TODO_DIR = Path(__file__).resolve().parents[2] / "design" / "todo"

# Task 标记出现在两种位置：
#   1) 表格单元格：行内任意位置出现 `[x]` `[~]` `[ ]`（用反引号包围、表格内一般至少一个 | 在前）
#   2) markdown 列表项：行首 `- [x] xxx`（无反引号，遵循 GitHub task list 语法）
# 「状态约定」之类的说明性文字也用反引号写 [x]，但通常出现在 blockquote 行（以 `> ` 开头），
#  所以扫描时跳过 `> ` 引用块行。
TASK_TABLE_RE = re.compile(r"`\[(x|X|~| )\]`")
TASK_LIST_RE = re.compile(r"^- \[(x|X|~| )\]", re.MULTILINE)

# 文件名进度后缀正则：匹配 ` [85%]` 这样的尾部（在 .todo.md 之前）
NAME_SUFFIX_RE = re.compile(r" \[\d+%\](?=\.todo\.md$)")


def count_progress(content: str) -> tuple[int, int, int, int, float]:
    """返回 (x_cnt, half_cnt, todo_cnt, total, pct)。

    扫描两类合法 task：
      A. 表格里 `[x]`/`[~]`/`[ ]`（反引号包围）
      B. 列表里 `- [x]`（行首）

    跳过 blockquote（`> ` 开头的行）—— 那里通常是「状态约定」类说明文字。
    """
    x = h = t = 0
    for line in content.splitlines():
        if line.lstrip().startswith(">"):
            continue
        for m in TASK_TABLE_RE.finditer(line):
            tok = m.group(1)
            if tok in ("x", "X"):
                x += 1
            elif tok == "~":
                h += 1
            else:
                t += 1
        m = TASK_LIST_RE.match(line)
        if m:
            tok = m.group(1)
            if tok in ("x", "X"):
                x += 1
            elif tok == "~":
                h += 1
            else:
                t += 1
    total = x + h + t
    if total == 0:
        return 0, 0, 0, 0, 0.0
    pct = (x + h * 0.5) / total * 100
    return x, h, t, total, pct


def normalize_name(p: Path) -> Path:
    """剥掉 ' [N%]' 后缀，返回干净的目标路径。"""
    base = p.name
    base = NAME_SUFFIX_RE.sub("", base)
    return p.with_name(base)


def annotate_name(clean: Path, pct: int) -> Path:
    name = clean.name
    new_name = name.replace(".todo.md", f" [{pct}%].todo.md")
    return clean.with_name(new_name)


def main() -> int:
    if not TODO_DIR.exists():
        print(f"❌ {TODO_DIR} 不存在", file=sys.stderr)
        return 1

    files = sorted(TODO_DIR.glob("*.todo.md"))
    if not files:
        print(f"⚠️ 没找到任何 *.todo.md 文件")
        return 0

    print(f"📂 扫描 {TODO_DIR}（{len(files)} 个文件）\n")

    plan = []
    for f in files:
        content = f.read_text(encoding="utf-8")
        x, h, t, total, pct = count_progress(content)
        clean = normalize_name(f)
        target = annotate_name(clean, round(pct))
        rename_needed = f != target
        plan.append((f, target, x, h, t, total, pct, rename_needed))

    # 表格输出
    print(f"{'当前文件名':<40}  {'x':>4} {'~':>4} {' ':>4} {'total':>5}  {'pct':>6}  {'目标文件名'}")
    print("-" * 120)
    for f, target, x, h, t, total, pct, _ in plan:
        print(f"{f.name:<40}  {x:>4} {h:>4} {t:>4} {total:>5}  {pct:>5.1f}%  {target.name}")

    # 实际重命名
    print("\n--- 重命名 ---")
    rename_count = 0
    for f, target, *_, rename_needed in plan:
        if not rename_needed:
            print(f"  ⏭  {f.name}（已是目标名，跳过）")
            continue
        if target.exists() and target != f:
            print(f"  ⚠️  目标已存在，跳过：{target.name}")
            continue
        f.rename(target)
        print(f"  ✓ {f.name} → {target.name}")
        rename_count += 1

    print(f"\n✅ 完成（重命名 {rename_count} 个文件）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
