/**
 * Tauri 应用图标生成脚本
 *
 * 设计原则（见 design/2026-05-14-01-Tauri桌面端实现方案.md §8.1）：
 *   - 事实来源：public/favicon.svg
 *   - 不引入 sharp/svgo 等图片处理依赖，直接调用 @tauri-apps/cli 内置的 icon 命令
 *   - 生成产物全部位于 src-tauri/icons/，受 .gitignore 保护不入库
 *
 * 用法：
 *   npm run tauri:icons
 *
 * 生成内容（由 @tauri-apps/cli 维护，可能随版本变化）：
 *   - 32x32.png / 128x128.png / 128x128@2x.png（通用）
 *   - icon.icns（macOS）
 *   - icon.ico（Windows）
 *   - Square*.png / StoreLogo.png（Windows MSIX，本项目用 NSIS 不引用，但不删）
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..', '..')

const SRC_ICON = path.join(REPO_ROOT, 'public', 'favicon.svg')
const OUT_DIR = path.join(REPO_ROOT, 'src-tauri', 'icons')

const REQUIRED_OUTPUTS = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  'icon.icns',
  'icon.ico',
] as const

function fail(msg: string): never {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

function ok(msg: string): void {
  console.log(`✓ ${msg}`)
}

async function runTauriIcon(): Promise<void> {
  return new Promise((resolve, reject) => {
    /**
     * 直接走 npx 而非 require('@tauri-apps/cli')：
     *   - CLI 内部有平台原生子进程链路，用子进程更稳
     *   - 与开发者本地 `npm run tauri icon` 行为一致
     */
    const child = spawn(
      'npx',
      ['--no-install', '@tauri-apps/cli', 'icon', SRC_ICON, '--output', OUT_DIR],
      {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      },
    )

    child.on('error', (err) => reject(err))
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`tauri icon exited with code ${code}`))
    })
  })
}

async function main(): Promise<void> {
  if (!existsSync(SRC_ICON)) {
    fail(`source icon not found: ${SRC_ICON}`)
  }
  ok(`source icon: ${path.relative(REPO_ROOT, SRC_ICON)}`)

  try {
    await runTauriIcon()
  } catch (err) {
    fail(`tauri icon failed: ${(err as Error).message}`)
  }

  const missing = REQUIRED_OUTPUTS.filter((f) => !existsSync(path.join(OUT_DIR, f)))
  if (missing.length > 0) {
    fail(`expected outputs missing: ${missing.join(', ')}`)
  }

  ok(`generated ${REQUIRED_OUTPUTS.length} required icons in ${path.relative(REPO_ROOT, OUT_DIR)}/`)
}

main().catch((err) => fail((err as Error).message))
