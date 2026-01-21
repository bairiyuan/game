"use strict";
const electron = require("electron");
const electronAPI = {
  ipcRenderer: {
    send(channel, ...args) {
      electron.ipcRenderer.send(channel, ...args);
    },
    sendTo(webContentsId, channel, ...args) {
      const electronVer = process.versions.electron;
      const electronMajorVer = electronVer ? parseInt(electronVer.split(".")[0]) : 0;
      if (electronMajorVer >= 28) {
        throw new Error('"sendTo" method has been removed since Electron 28.');
      } else {
        electron.ipcRenderer.sendTo(webContentsId, channel, ...args);
      }
    },
    sendSync(channel, ...args) {
      return electron.ipcRenderer.sendSync(channel, ...args);
    },
    sendToHost(channel, ...args) {
      electron.ipcRenderer.sendToHost(channel, ...args);
    },
    postMessage(channel, message, transfer) {
      electron.ipcRenderer.postMessage(channel, message, transfer);
    },
    invoke(channel, ...args) {
      return electron.ipcRenderer.invoke(channel, ...args);
    },
    on(channel, listener) {
      electron.ipcRenderer.on(channel, listener);
      return () => {
        electron.ipcRenderer.removeListener(channel, listener);
      };
    },
    once(channel, listener) {
      electron.ipcRenderer.once(channel, listener);
      return () => {
        electron.ipcRenderer.removeListener(channel, listener);
      };
    },
    removeListener(channel, listener) {
      electron.ipcRenderer.removeListener(channel, listener);
      return this;
    },
    removeAllListeners(channel) {
      electron.ipcRenderer.removeAllListeners(channel);
    }
  },
  webFrame: {
    insertCSS(css) {
      return electron.webFrame.insertCSS(css);
    },
    setZoomFactor(factor) {
      if (typeof factor === "number" && factor > 0) {
        electron.webFrame.setZoomFactor(factor);
      }
    },
    setZoomLevel(level) {
      if (typeof level === "number") {
        electron.webFrame.setZoomLevel(level);
      }
    }
  },
  webUtils: {
    getPathForFile(file) {
      return electron.webUtils.getPathForFile(file);
    }
  },
  process: {
    get platform() {
      return process.platform;
    },
    get versions() {
      return process.versions;
    },
    get env() {
      return { ...process.env };
    }
  }
};
const IPC_CHANNELS = {
  SHOW_GAME_WINDOW: "show-game-window",
  CLOSE_GAME_WINDOW: "close-game-window",
  ROUTE_CHANGE: "route-change",
  SHOW_POPUP_WINDOW: "show-popup-window",
  CLOSE_POPUP_WINDOW: "close-popup-window",
  CLOSE_EXCEPT_MAIN_WINDOW: "close-except-main-window",
  MOUSE_ENTER: "mouse-enter",
  MOUSE_LEAVE: "mouse-leave",
  WINDOW_IGNORE_MOUSE_TOGGLE: "window-ignore-mouse-toggle",
  WINDOW_DRAG_START: "window-drag-start",
  WINDOW_DRAGGING: "window-dragging",
  WINDOW_DRAG_END: "window-drag-end"
};
const windowControls = {
  onRouteChange: (callback) => {
    electron.ipcRenderer.on(IPC_CHANNELS.ROUTE_CHANGE, callback);
  },
  routeChangeAck: (messageId) => {
    electron.ipcRenderer.send(`${IPC_CHANNELS.ROUTE_CHANGE}_ACK`, messageId);
  },
  showPopupWindow: (popupWindowOptions, webPreferences) => {
    electron.ipcRenderer.send(IPC_CHANNELS.SHOW_POPUP_WINDOW, popupWindowOptions, webPreferences);
  },
  closePopupWindow: (name) => {
    electron.ipcRenderer.send(IPC_CHANNELS.CLOSE_POPUP_WINDOW, name);
  },
  showGameWindow: (params) => {
    console.log("[Preload] 发送 show-game-window 请求，参数:", params);
    electron.ipcRenderer.send(IPC_CHANNELS.SHOW_GAME_WINDOW, params);
  },
  closeGameWindow: () => {
    electron.ipcRenderer.send(IPC_CHANNELS.CLOSE_GAME_WINDOW);
  },
  closeAllExceptMainWindow: () => {
    electron.ipcRenderer.send(IPC_CHANNELS.CLOSE_EXCEPT_MAIN_WINDOW);
  },
  mouseEnter: () => {
    electron.ipcRenderer.send(IPC_CHANNELS.MOUSE_ENTER);
  },
  mouseLeave: () => {
    electron.ipcRenderer.send(IPC_CHANNELS.MOUSE_LEAVE);
  },
  setWindowIgnoreMouseToggle: (ignore) => {
    electron.ipcRenderer.send(IPC_CHANNELS.WINDOW_IGNORE_MOUSE_TOGGLE, ignore);
  },
  windowDragStart: (screenX, screenY) => {
    electron.ipcRenderer.send(IPC_CHANNELS.WINDOW_DRAG_START, screenX, screenY);
  },
  windowDragging: (screenX, screenY) => {
    electron.ipcRenderer.send(IPC_CHANNELS.WINDOW_DRAGGING, screenX, screenY);
  },
  windowDragEnd: (screenX, screenY) => {
    electron.ipcRenderer.send(IPC_CHANNELS.WINDOW_DRAG_END, screenX, screenY);
  }
};
const api = {
  windowControls
};
if (process.contextIsolated) {
  try {
    console.log("🔄 预加载脚本开始暴露 API...");
    electron.contextBridge.exposeInMainWorld("electron", electronAPI);
    console.log("✅ electron API 已暴露");
    electron.contextBridge.exposeInMainWorld("api", api);
    console.log("✅ api 已暴露:", Object.keys(api));
  } catch (error) {
    console.error("❌ 预加载脚本错误:", error);
  }
} else {
  console.warn("⚠️ 上下文隔离已禁用，直接挂载到 window");
  window.electron = electronAPI;
  window.api = api;
}
