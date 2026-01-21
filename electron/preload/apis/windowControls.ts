import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../../ipcChannels'
import { PopupWindowOptions } from '../../windowOption'

/** * 函数功能描述：窗口控制的预加载脚本 API
 */
export const windowControls = {
  onRouteChange: (
    callback: (event: Electron.IpcRendererEvent, id: string, payload: string) => void
  ) => {
    ipcRenderer.on(IPC_CHANNELS.ROUTE_CHANGE, callback)
  },

  routeChangeAck: (messageId) => {
    ipcRenderer.send(`${IPC_CHANNELS.ROUTE_CHANGE}_ACK`, messageId)
  },
  showPopupWindow: (
    popupWindowOptions: PopupWindowOptions,
    webPreferences?: Electron.WebPreferences
  ) => {
    ipcRenderer.send(IPC_CHANNELS.SHOW_POPUP_WINDOW, popupWindowOptions, webPreferences)
  },
  closePopupWindow: (name: string) => {
    ipcRenderer.send(IPC_CHANNELS.CLOSE_POPUP_WINDOW, name)
  },
  showGameWindow: (params?: Record<string, any>) => {
    console.log('[Preload] 发送 show-game-window 请求，参数:', params)
    ipcRenderer.send(IPC_CHANNELS.SHOW_GAME_WINDOW, params)
  },
  closeGameWindow: () => {
    ipcRenderer.send(IPC_CHANNELS.CLOSE_GAME_WINDOW)
  },
  closeAllExceptMainWindow: () => {
    ipcRenderer.send(IPC_CHANNELS.CLOSE_EXCEPT_MAIN_WINDOW)
  },
  mouseEnter: () => {
    ipcRenderer.send(IPC_CHANNELS.MOUSE_ENTER)
  },
  mouseLeave: () => {
    ipcRenderer.send(IPC_CHANNELS.MOUSE_LEAVE)
  },
  setWindowIgnoreMouseToggle: (ignore: boolean) => {
    ipcRenderer.send(IPC_CHANNELS.WINDOW_IGNORE_MOUSE_TOGGLE, ignore)
  },
  windowDragStart: (screenX: number, screenY: number) => {
    ipcRenderer.send(IPC_CHANNELS.WINDOW_DRAG_START, screenX, screenY)
  },
  windowDragging: (screenX: number, screenY: number) => {
    ipcRenderer.send(IPC_CHANNELS.WINDOW_DRAGGING, screenX, screenY)
  },
  windowDragEnd: (screenX: number, screenY: number) => {
    ipcRenderer.send(IPC_CHANNELS.WINDOW_DRAG_END, screenX, screenY)
  }
}

export default windowControls
