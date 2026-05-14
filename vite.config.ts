/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import viteCompression from 'vite-plugin-compression'
import { resolve } from 'node:path'

const COMPRESS_FILTER = /\.(js|mjs|css|html|svg|json|wasm)$/i
const COMPRESS_THRESHOLD = 1024

/**
 * GitHub Pages 项目仓库部署到 https://<user>.github.io/<repo>/，
 * 资源必须以 /<repo>/ 为前缀。GITHUB_PAGES=true 时启用 /tt-qimen/，
 * 本地 dev/build 默认 /。
 */
const isGithubPages = process.env.GITHUB_PAGES === 'true'

/**
 * Tauri 桌面端构建模式（见 design/2026-05-14-01-Tauri桌面端实现方案.md §5.1）。
 *
 * `@tauri-apps/cli` 启动 `tauri dev` / `tauri build` 时会注入
 * `TAURI_ENV_PLATFORM`（macos / windows / linux）环境变量，浏览器构建无此变量。
 *
 * Tauri 模式下：
 *   - base 必须用相对路径 './'，因为产物加载自 `tauri://localhost` scheme
 *   - dev server 监听 `host: '0.0.0.0'`，否则 webview 无法访问
 *   - HMR 走独立 ws 端口（5181）避免与主 server 端口冲突
 */
const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined

export default defineConfig({
  base: isTauri ? './' : (isGithubPages ? '/tt-qimen/' : '/'),
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@vueuse/core',
        'pinia',
      ],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
    Components({
      dirs: ['src/components/ds', 'src/components/layout'],
      dts: 'src/components.d.ts',
      extensions: ['vue'],
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      filter: COMPRESS_FILTER,
      threshold: COMPRESS_THRESHOLD,
      deleteOriginFile: false,
      verbose: false,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      filter: COMPRESS_FILTER,
      threshold: COMPRESS_THRESHOLD,
      deleteOriginFile: false,
      verbose: false,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    host: isTauri ? '0.0.0.0' : 'localhost',
    hmr: isTauri ? { protocol: 'ws', host: 'localhost', port: 5181 } : undefined,
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['src/stores/**/*.spec.ts', 'happy-dom'],
    ],
    globals: false,
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/composables/ai/**/*.ts', 'src/stores/aiHistory.ts'],
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    /**
     * P6-10：把 AI 相关 chunks 排除出 modulepreload，保证首屏不下载 openai SDK
     * 与 markstream-vue。用户实际点开 AI 侧栏时再 dynamic import。
     */
    modulePreload: {
      polyfill: true,
      resolveDependencies(_filename, deps) {
        return deps.filter(
          (d) =>
            !d.includes('vendor-openai')
            && !d.includes('vendor-markstream')
            && !d.includes('feat-ai'),
        )
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/pinia/')) {
              return 'vendor-vue'
            }
            if (id.includes('/vue-i18n/')) {
              return 'vendor-i18n'
            }
            if (id.includes('@vueuse/')) {
              return 'vendor-vueuse'
            }
            if (
              id.includes('/tyme4ts/')
              || id.includes('/lunisolar/')
              || id.includes('@lunisolar/')
              || id.includes('/chinese-conv/')
            ) {
              return 'engine-bazi'
            }
            if (id.includes('/openai/')) {
              return 'vendor-openai'
            }
            if (id.includes('/markstream-vue/')) {
              return 'vendor-markstream'
            }
            return undefined
          }
          if (id.includes('/src/modules/bazi/data/')) {
            return 'data-bazi'
          }
          if (id.includes('/src/composables/ai/') || id.includes('/src/components/ai/')) {
            return 'feat-ai'
          }
          return undefined
        },
      },
    },
  },
})
