// electron/preload/index.ts
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { windowControls } from './apis/windowControls'

// 创建 API 结构
const api = {
  windowControls
}

// 安全地将 API 暴露给渲染进程
if (process.contextIsolated) {
  try {
    console.log('🔄 预加载脚本开始暴露 API...')
    
    // 暴露 electron API
    contextBridge.exposeInMainWorld('electron', electronAPI)
    console.log('✅ electron API 已暴露')
    
    // 暴露自定义 API
    contextBridge.exposeInMainWorld('api', api)
    console.log('✅ api 已暴露:', Object.keys(api))
    
  } catch (error) {
    console.error('❌ 预加载脚本错误:', error)
  }
} else {
  console.warn('⚠️ 上下文隔离已禁用，直接挂载到 window')
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}