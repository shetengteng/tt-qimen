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
 * 我们只需要 5 个图标（src-tauri/tauri.conf.json#bundle.icon 引用）：
 *   - 32x32.png / 128x128.png / 128x128@2x.png（通用）
 *   - icon.icns（macOS）
 *   - icon.ico（Windows）
 *
 * 但 @tauri-apps/cli icon 会无差别生成 ~30 个 Windows MSIX / iOS / Android 图标，
 * 本项目不打 MSIX 也不打移动端，因此生成后立即清理冗余文件。
 */

import { spawn } from 'node:child_process'
import { existsSync, readdirSync, rmSync, statSync, unlinkSync } from 'node:fs'
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

const KEEP_FILES = new Set<string>([...REQUIRED_OUTPUTS, 'README.md'])
const KEEP_DIRS = new Set<string>(['', '.']) // 不删根目录本身

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

/**
 * 清理 @tauri-apps/cli icon 生成的冗余文件：
 *   - Windows MSIX 的 Square*.png / StoreLogo.png（本项目用 NSIS，不引用）
 *   - 64x64.png（tauri.conf.json#bundle.icon 未引用）
 *   - icon.png（仅 Linux deb 引用，本项目不打 Linux）
 *   - ios/ android/ 整个子目录（移动端，本项目不打）
 */
function pruneExtras(): number {
  let removed = 0
  for (const entry of readdirSync(OUT_DIR)) {
    const full = path.join(OUT_DIR, entry)
    const isDir = statSync(full).isDirectory()
    if (isDir) {
      if (!KEEP_DIRS.has(entry)) {
        rmSync(full, { recursive: true, force: true })
        removed += 1
      }
    } else if (!KEEP_FILES.has(entry)) {
      unlinkSync(full)
      removed += 1
    }
  }
  return removed
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

  const pruned = pruneExtras()
  ok(`generated ${REQUIRED_OUTPUTS.length} required icons in ${path.relative(REPO_ROOT, OUT_DIR)}/`)
  ok(`pruned ${pruned} unused files/dirs (Windows MSIX, iOS, Android, Linux)`)
}

main().catch((err) => fail((err as Error).message))
