// import { app, BrowserWindow } from 'electron'
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'

// // ES 模块中获取 __dirname 的方式
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// const isDev = process.env.NODE_ENV === 'development'

// console.log('🎯 Electron 主进程开始执行...')
// console.log('当前目录:', __dirname)

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//       preload: path.join(__dirname, 'preload/index.js')
//     }
//   })

//   // win.webContents.openDevTools()

//   if (isDev) {
//     win.loadURL('http://localhost:5173').catch(err => {
//       console.error('加载失败:', err)
//     })
//   } else {
//     win.loadFile(path.join(__dirname, '../dist/index.html'))
//   }
// }

// app.whenReady().then(createWindow)
// electron/electron.ts
import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import {initCustomProtocol} from './protocol'

// ES 模块中获取 __dirname 的方式
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = process.env.NODE_ENV === 'development'

console.log('🎯 Electron 主进程开始执行...')
console.log('当前目录:', __dirname)
console.log('开发模式:', isDev)

// 存储所有窗口的引用
const windows = {
  main: null as BrowserWindow | null,
  games: [] as BrowserWindow[]
}

function createMainWindow() {
  if (windows.main && !windows.main.isDestroyed()) {
    windows.main.focus()
    return windows.main
  }

  console.log('🖥️ 创建主窗口...')
  const preloadPath = path.join(__dirname, 'preload/index.js')
  console.log('🔧 预加载脚本路径:', preloadPath)
  console.log('🔧 文件是否存在:', fs.existsSync(preloadPath))
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    title: '游戏模块 - 主窗口',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload/index.js')
    }
  })

  windows.main = win

  if (isDev) {
    console.log('🔗 加载开发服务器 URL...')
    win.loadURL('http://localhost:5173')
      .then(() => console.log('✅ 主窗口加载成功'))
      .catch(err => {
        console.error('❌ 主窗口加载失败:', err)
        // 如果开发服务器没启动，显示错误页面
        win.loadFile(path.join(__dirname, '../public/error.html')).catch(console.error)
      })
    
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
      .then(() => console.log('✅ 主窗口加载成功'))
      .catch(console.error)
  }

  win.on('closed', () => {
    windows.main = null
    console.log('主窗口已关闭')
  })

  return win
}

function createGameWindow(params?: Record<string, any>) {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
  console.log('🎮 收到创建游戏窗口请求，参数:', params)
  
  const gameType = params?.game || 'parkour'
  const gameTitle = params?.title || `游戏窗口 - ${gameType}`
  console.log(`🕹️ 创建游戏窗口: 类型=${gameType}, 标题="${gameTitle}"`)
  
  // 获取主窗口的位置和大小
  const mainWindow = windows.main
  const mainBounds = mainWindow?.getBounds() || { x: 0, y: 0, width: 800, height: 600 }
  
  // 创建游戏窗口，放在主窗口旁边
  const gameWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: 0,
    y: 0,
    title: gameTitle,
    frame: false, 
    transparent: true, // 使用透明
    hasShadow: false,
    resizable: false,
    show: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload/index.js')
    }
  })

  // 添加到游戏窗口列表
  windows.games.push(gameWindow)

  // 构建游戏页面的 URL
  const queryString = params ? `?game=${gameType}` : ''
  const gameUrl = isDev 
    ? `http://localhost:5173/#/game${queryString}`
    : `file://${path.join(__dirname, '../dist/index.html')}#/game${queryString}`

  console.log('🔄 游戏窗口加载 URL:', gameUrl)
  
  gameWindow.loadURL(gameUrl)
    .then(() => {
      console.log('✅ 游戏窗口加载成功')
      gameWindow.focus()
    })
    .catch(err => {
      console.error('❌ 游戏窗口加载失败:', err)
      gameWindow.loadFile(path.join(__dirname, '../public/error.html')).catch(console.error)
    })

  gameWindow.on('closed', () => {
    const index = windows.games.indexOf(gameWindow)
    if (index > -1) {
      windows.games.splice(index, 1)
    }
    console.log('游戏窗口已关闭，剩余游戏窗口:', windows.games.length)
  })

  return gameWindow
}

// 设置 IPC 处理器
function setupIpcHandlers() {
  console.log('🔌 设置 IPC 处理器...')
  
  // 显示游戏窗口
  ipcMain.on('show-game-window', (event, params) => {
    console.log('📩 收到 show-game-window IPC 消息，参数:', params)
    try {
      const gameWindow = createGameWindow(params)
      console.log('✅ 游戏窗口创建成功，窗口 ID:', gameWindow.id)
      
      // 发送成功响应回渲染进程（如果需要）
      event.sender.send('show-game-window-success', { windowId: gameWindow.id })
    } catch (error) {
      console.error('❌ 创建游戏窗口失败:', error)
      event.sender.send('show-game-window-error', { error: error.message })
    }
  })

  // 关闭游戏窗口
  ipcMain.on('close-game-window', (event) => {
    console.log('📩 收到 close-game-window IPC 消息')
    // 关闭最后一个游戏窗口
    if (windows.games.length > 0) {
      const lastGameWindow = windows.games[windows.games.length - 1]
      lastGameWindow.close()
    }
  })

  // 显示弹出窗口
  ipcMain.on('show-popup-window', (event, options, webPreferences) => {
    console.log('📩 收到 show-popup-window IPC 消息')
    // TODO: 实现弹出窗口逻辑
  })

  // 关闭弹出窗口
  ipcMain.on('close-popup-window', (event, name) => {
    console.log('📩 收到 close-popup-window IPC 消息，窗口名:', name)
    // TODO: 实现关闭弹出窗口逻辑
  })

  console.log('✅ IPC 处理器设置完成')
}

initCustomProtocol()

app.whenReady().then(() => {
  console.log('🚀 Electron 应用已准备就绪')
  
  

  // 设置 IPC 处理器
  setupIpcHandlers()
  
  // 创建主窗口
  const mainWindow = createMainWindow()
  console.log('✅ 主窗口创建完成，窗口 ID:', mainWindow.id)
})

app.on('window-all-closed', () => {
  console.log('所有窗口已关闭，准备退出应用')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  console.log('应用被激活')
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

// // 调试：监听所有窗口状态
// setInterval(() => {
//   const allWindows = BrowserWindow.getAllWindows()
//   console.log(`窗口状态: 总计 ${allWindows.length} 个窗口`)
//   allWindows.forEach((win, i) => {
//     const bounds = win.getBounds()
//     console.log(`  窗口 ${i}: ID=${win.id}, 标题="${win.getTitle()}", 位置=[${bounds.x},${bounds.y}], 大小=${bounds.width}x${bounds.height}`)
//   })
// }, 10000) // 每10秒打印一次窗口状态