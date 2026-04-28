import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import viteCompression from 'vite-plugin-compression'
import { resolve } from 'node:path'

const COMPRESS_FILTER = /\.(js|mjs|css|html|svg|json|wasm)$/i
const COMPRESS_THRESHOLD = 1024

export default defineConfig({
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
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
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
            return undefined
          }
          if (id.includes('/src/modules/bazi/data/')) {
            return 'data-bazi'
          }
          return undefined
        },
      },
    },
  },
})
