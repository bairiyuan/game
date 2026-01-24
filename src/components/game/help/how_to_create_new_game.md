# 如何创建一个新的内置游戏

本文档基于 `CatchFood.vue` 和 `Parkour.vue` 的实现模式，指导如何在本项目中添加一个新的内置游戏。

## 1. 目录结构

在 [src/components/game](file:///d:/桌面/前端/game-module-windows/src/components/game) 目录下创建一个新的文件夹，以游戏英文名命名（例如 `fishing`）。

建议结构：
```
src/components/game/fishing/
├── Fishing.vue      # 游戏主逻辑组件（必须）
├── fishing.ts       # 游戏相关的类型定义、常量、辅助函数（可选）
└── assets/          # 游戏独有的静态资源（可选）
```

## 2. 游戏组件开发规范

所有游戏组件都基于 **Vue 3 + Canvas** 开发，并需要遵循统一的接口规范以便被 `GameView` 容器调用。

### 2.1 基础模板

新建游戏组件（如 `Fishing.vue`）时，请使用以下基础结构：

```vue
<template>
  <div class="game-container">
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      tabindex="0"
      style="display: block; margin: 0 auto; outline: none"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// 1. 定义事件
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'pause'): void
  (e: 'resume'): void
  (e: 'restart'): void
  (e: 'game-died', points: number): void
  (e: 'game-over', points: number): void
  (e: 'update:score', points: number): void
}>()

// 2. 必须暴露给父组件的方法 (API 契约)
const startGame = () => { /* 初始化数据，状态转为 start */ }
const pauseGame = () => { /* 暂停循环，状态转为 paused */ }
const resumeGame = () => { /* 恢复循环，状态转为 playing */ }
const restartGame = () => { /* 重置数据，重新开始 */ }
const currentStatus = () => { return 'playing' /* 返回当前状态 */ }
const close = () => { /* 清理资源，触发 emit('close') */ }

defineExpose({
  startGame,
  pauseGame,
  resumeGame,
  restartGame,
  currentStatus,
  close
})

// 3. 游戏循环与 Canvas
const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

const gameLoop = () => {
  // 清屏 -> 绘制背景 -> 绘制实体 -> 碰撞检测 -> 请求下一帧
  requestAnimationFrame(gameLoop)
}

onMounted(() => {
  // 初始化 Canvas 上下文
  // 预加载资源
})
</script>
```

### 2.2 核心实现要点

#### (1) 资源加载
*   **静态资源**（UI图标、固定道具）：直接使用 `import` 导入。
    ```typescript
    import FishImg from '@assets/app/img/png/game/fishing/fish.png'
    ```
*   **动态资源**（桌宠动画）：使用 `pet://` 协议。
    *   参考 [CatchFood.vue:494](file:///d:/桌面/前端/game-module-windows/src/components/game/catchFood/CatchFood.vue#L494)
    *   需要配合 `animateMeta` 数据来控制动画帧率。

#### (2) 游戏循环 (Game Loop)
*   使用 `requestAnimationFrame` 驱动。
*   利用 `delta` 时间（当前帧时间 - 上一帧时间）来计算移动距离，保证不同刷新率屏幕下的速度一致性。
    ```typescript
    const time = new Date().getTime()
    const delta = time - lastTime
    // x += speed * delta / 1000
    ```

#### (3) 状态管理
*   定义 `GameStatus` 类型：`'beforeStart' | 'start' | 'playing' | 'died' | 'paused' | 'gameOver' | 'ended'`。
*   编写 `updateGameStatus` 函数集中处理状态流转（如暂停时清除定时器，恢复时重启循环）。

#### (4) 音效
*   使用 `@renderer/utils/audio` 提供的 `playAudio`, `playBgm`。
*   路径协议：`audio://...`。

## 3. 注册新游戏

开发完组件后，需要修改以下两个文件才能让游戏在应用中生效。

### 步骤 1：添加入口图标
修改 [src/components/GameStatus.vue](file:///d:/桌面/前端/game-module-windows/src/components/GameStatus.vue)：

1.  导入你的游戏图标。
2.  在 `gameList` 数组中添加配置对象：
    ```typescript
    {
      name: '钓鱼',           // 显示名称
      label: 'Fishing',       // 唯一标识 (关键！将作为路由参数)
      iconUrl: FishingIcon,   // 图标资源
      description: '...',
      callback: () => { console.log('钓鱼开始') }
    }
    ```

### 步骤 2：配置路由映射
修改 [src/views/game/GameView.vue](file:///d:/桌面/前端/game-module-windows/src/views/game/GameView.vue)：

1.  **引入组件**：
    ```typescript
    import Fishing from '@renderer/components/game/fishing/Fishing.vue'
    ```

2.  **配置说明文案**：
    *   在 `gameRuleMap` 添加游戏规则说明。
    *   在 `optNoticeMap` 添加简短操作提示。

3.  **挂载组件**：
    在 `onMounted` 钩子中，根据 `route.query.game` 的值（即上面定义的 `label` 小写）来决定加载哪个组件：
    ```typescript
    if (query.game === 'fishing') {
      currentGameComponent.value = Fishing
      // ...
    }
    ```

## 4. 调试与测试

1.  运行 `npm run dev` 启动应用。
2.  在主窗口点击新添加的游戏图标。
3.  检查是否成功打开新窗口并加载游戏画面。
4.  测试“暂停”、“规则”、“退出”等按钮是否能正常控制游戏（这依赖于你是否正确实现了 `defineExpose` 接口）。

## 参考代码
*   接食物游戏实现：[CatchFood.vue](file:///d:/桌面/前端/game-module-windows/src/components/game/catchFood/CatchFood.vue)
*   跑酷游戏实现：[Parkour.vue](file:///d:/桌面/前端/game-module-windows/src/components/game/parkour/Parkour.vue)
