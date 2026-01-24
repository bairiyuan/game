# 游戏源码深度解析

本文档旨在深入剖析 `CatchFood` (接食物) 和 `Parkour` (跑酷) 两个内置游戏的源码实现，帮助开发者理解其核心逻辑、架构设计以及关键技术点。

## 1. 总体架构

两个游戏均采用 **Vue 3 + HTML5 Canvas** 的技术栈。

*   **Vue 3**: 负责外层容器、UI 状态管理（如分数显示、倒计时、游戏结束弹窗）以及资源的预加载。
*   **Canvas**: 负责核心游戏画面的渲染（60FPS 游戏循环），利用 `requestAnimationFrame` 实现流畅动画。
*   **资源管理**: 统一区分静态资源（内置于包中）和动态资源（通过 `dlcs` 目录加载），并实现了图片预加载机制。

---

## 2. CatchFood (接食物) 源码分析

### 2.1 核心文件
*   **主组件**: `src/components/game/catchFood/CatchFood.vue`
*   **职责**: 包含了游戏的所有逻辑，包括渲染、物理更新、输入处理。

### 2.2 关键数据结构
*   **Pet (宠物)**:
    ```typescript
    interface Pet {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      direction: number; // -1: left, 1: right, 0: stop
      state: 'idle' | 'run';
    }
    ```
*   **Item (掉落物)**:
    包含 `x`, `y`, `type` (食物/炸弹/时钟), `speed` 等属性。

### 2.3 核心逻辑流程

1.  **初始化 (`initGame`)**:
    *   加载背景图、道具图、宠物动作图。
    *   重置分数、时间、游戏状态。
    *   启动 `gameLoop` 和 `startItemSpawn`。

2.  **游戏循环 (`gameLoop`)**:
    这是游戏的心跳，每帧执行：
    *   **清空画布**: `ctx.clearRect`。
    *   **绘制背景**: `ctx.drawImage`。
    *   **更新宠物**: 根据键盘输入更新 x 坐标，处理边界限制。
    *   **更新掉落物**: 遍历 `items` 数组，增加 y 坐标（下落）。
    *   **碰撞检测**: 计算宠物与掉落物的距离（或矩形重叠）。
        *   *吃到食物*: 加分，播放音效。
        *   *吃到炸弹*: 扣分或扣血。
        *   *吃到时钟*: 增加游戏时间。
    *   **绘制**: 绘制宠物（根据状态切换帧动画）和所有掉落物。
    *   **循环调用**: `requestAnimationFrame(gameLoop)`。

3.  **难度控制**:
    *   随着游戏进行，`spawnInterval` (生成间隔) 会逐渐减小，掉落物生成变快。
    *   掉落物的 `speed` 也可以随分数增加而加快。

### 2.4 亮点与细节
*   **帧动画**: 宠物行走通过切换 sprite 图集的不同区域 (`drawImage` 的参数控制) 实现。
*   **状态机**: 清晰的 `gameState` (loading -> playing -> paused -> gameover)。

---

## 3. Parkour (跑酷) 源码分析

### 3.1 核心文件
*   **主组件**: `src/components/game/parkour/Parkour.vue`
*   **数据定义**: `src/components/game/parkour/parkour.ts`
    *   定义了 `Obstacle` (障碍物), `Reward` (奖励), `ObstacleFragment` (关卡片段) 接口。
    *   `obstacleMap`: 预定义了多个关卡片段（如“只有金币”、“低障碍”、“高障碍”等），游戏运行时随机拼接这些片段。

### 3.2 物理系统 (简易版)
跑酷游戏涉及重力和跳跃物理：
*   **跳跃 (`jumpBySpace`)**:
    *   赋予宠物一个向上的初速度 `velocityY = -10` (示例)。
    *   设置 `isJumping = true`。
*   **重力应用 (`updatePhysics`)**:
    *   每帧 `velocityY += gravity` (重力加速度)。
    *   `pet.y += velocityY`。
    *   **地面检测**: 如果 `pet.y > groundLevel`，则重置 `pet.y = groundLevel`，`velocityY = 0`，`isJumping = false`。

### 3.3 地图滚动与生成
不同于通过移动摄像机，跑酷游戏通常通过**移动物体**来模拟跑动：
*   **障碍物移动**: 所有的障碍物和奖励都有一个 `offsetX`，每帧减小（向左移动）。
*   **无限地图**: 当最右边的地图片段即将进入屏幕时，从 `obstacleMap` 中随机选取一个新的片段拼接到右侧。
*   **清理**: 移出屏幕左侧的障碍物会被从数组中移除，防止内存泄漏。

### 3.4 碰撞检测
使用 **AABB (Axis-Aligned Bounding Box)** 轴对齐包围盒碰撞检测：
```typescript
function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
```
*   **障碍物碰撞**: 游戏结束或扣血。
*   **奖励碰撞**: 加分，并标记该奖励为 `caught`（不再绘制）。

---

## 4. 两个游戏的异同点

| 特性 | CatchFood (接食物) | Parkour (跑酷) |
| :--- | :--- | :--- |
| **视角** | 垂直视角 (掉落) | 侧视横版 (卷轴) |
| **玩家操作** | 左右移动 | 跳跃 (可能包含二段跳) |
| **地图生成** | 随机位置生成掉落物 | 预制片段随机拼接 (Chunk-based) |
| **物理** | 无重力，简单的位置更新 | 有重力 (Gravity) 和 速度 (Velocity) |
| **资源加载** | 类似，都依赖 `Image` 对象预加载 | 类似，且使用了 `parkour.ts` 管理复杂的障碍物配置 |

## 5. 开发建议
如果您计划开发新游戏：
1.  **简单起步**: 如果是第一次尝试，建议从类似 `CatchFood` 的机制开始，无需处理复杂的重力物理。
2.  **配置分离**: 像 `Parkour` 一样，将关卡数据（如障碍物位置、类型）分离到单独的 `.ts` 文件中，保持 `.vue` 文件整洁。
3.  **性能优化**: 始终注意在对象移出屏幕后将其销毁或回收，避免数组无限膨胀。
