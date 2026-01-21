import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'electron/electron.ts',
        onstart: (options) => options.startup(),
        vite: { build: { sourcemap: true, minify: false } }
      }
    ]),
    renderer()
  ],
    resolve: {
    alias: {
      // 必须使用绝对路径
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      // 可以添加更多...
    }
  }
})