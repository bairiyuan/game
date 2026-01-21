// electron.vite.config.ts
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron',
      rollupOptions: {
        input: {
          main: resolve('electron/electron.ts')
        },
        output: {
          entryFileNames: 'electron.js'
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      outDir: 'dist-electron/preload',
      rollupOptions: {
        input: {
          index: resolve('electron/preload/index.ts')
        },
        output: {
          entryFileNames: 'index.js',  // 修复这里
          format: 'cjs'  // 明确指定格式
        },
        // external: []
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: resolve(),
    plugins: [vue()],
    resolve: {
      alias: {
        '@renderer': resolve('src'),
        '@assets': resolve('src/assets')
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve('index.html')
            },
          external: []
        },
      outDir: 'dist',
      emptyOutDir: true
    }
  }
})