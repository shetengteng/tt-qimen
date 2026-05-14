# Tauri 应用图标

本目录的图标文件**全部由脚本生成**，事实来源是 [`/public/favicon.svg`](../../public/favicon.svg)。

## 生成

```bash
npm run tauri:icons
```

## 产物清单

| 文件 | 平台 | 用途 |
|---|---|---|
| `32x32.png` | 通用 | 任务栏小图标 |
| `128x128.png` | 通用 | 应用列表中等图标 |
| `128x128@2x.png` | 通用 | HiDPI 应用列表图标 |
| `icon.icns` | macOS | 应用 bundle 图标 |
| `icon.ico` | Windows | 安装器与应用图标 |
| `Square*.png` / `StoreLogo.png` | Windows | MSIX 资源（NSIS 不用，但 tauri-cli 会生成） |

## 为什么不入库

避免二进制污染 git diff；CI 与本地开发都通过 `npm run tauri:icons` 重新生成，保证与 `favicon.svg` 同步。
