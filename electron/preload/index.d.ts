// electron/preload/index.d.ts
import { ElectronAPI } from '@electron-toolkit/preload'

/** 窗口控制的预加载脚本 API */
export interface WindowControls {
  onRouteChange: (
    callback: (event: Electron.IpcRendererEvent, id: string, payload: string) => void
  ) => void
  routeChangeAck: (messageId: string) => void
  showPopupWindow: (
    popupWindowOptioins: any,
    webPreferences?: Electron.WebPreferences
  ) => void
  closePopupWindow: (name: string) => void
  showGameWindow: (params?: Record<string, any>) => void
  closeGameWindow: () => void
  closeAllExceptMainWindow: () => void
  mouseEnter: () => void
  mouseLeave: () => void
  setWindowIgnoreMouseToggle(ignore: boolean): void
  windowDragStart: (screenX: number, screenY: number) => void
  windowDragging: (screenX: number, screenY: number) => void
  windowDragEnd: (screenX: number, screenY: number) => void
}

/** 简化版 API 结构 */
export interface SimpleAPI {
  windowControls: WindowControls
}

/** 全局声明：扩展 window 对象 */
declare global {
  interface Window {
    electron: ElectronAPI
    api: SimpleAPI
  }
}

export {}