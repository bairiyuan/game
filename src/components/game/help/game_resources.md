# 游戏美术资源引用指南

本文档整理了 `game-module-windows` 项目中两个核心游戏（接食物 `CatchFood` 和 跑酷 `Parkour`）的静态与动态美术资源引用情况。

## 目录
1. [资源路径规范](#资源路径规范)
2. [接食物 (CatchFood)](#接食物-catchfood)
3. [跑酷 (Parkour)](#跑酷-parkour)
4. [注意事项与建议](#注意事项与建议)

---

## 资源路径规范

*   **静态资源**（图片、图标）：`src/assets/app/img/png/game/`
    *   引用别名：`@assets/app/img/png/game/...`
*   **动态资源**（序列帧动画、音频）：`resources/dlcs/{gameName}/`
    *   引用协议：`pet://` (动画) 和 `audio://` (音频)

---

## 接食物 (CatchFood)

**代码位置**: [CatchFood.vue](file:///d:/桌面/前端/game-module-windows/src/components/game/catchFood/CatchFood.vue)

### 1. 静态资源 (Static Assets)

| 资源名 | 描述 | 代码引用路径 | 备注 |
| :--- | :--- | :--- | :--- |
| **Boom** | 炸弹 | `@assets/app/img/png/game/Boom.png` | 扣命道具 |
| **Trash** | 垃圾 | `@assets/app/img/png/game/Trash.png` | 扣命道具 |
| **Stone** | 石头 | `@assets/app/img/png/game/Stone.png` | 扣命道具 (注意与跑酷游戏的石头区分) |
| **Ground** | 地面 | `@assets/app/img/png/game/Ground.png` | **共用资源** |
| **Gifts** | 礼物图标 | `@renderer/utils/giftSrc` (动态生成) | 随机获取的白色图标 |

### 2. 动态资源 (Dynamic Assets)

**基础路径**: `resources/dlcs/catchfood/`

#### 音频 (Audios)
| 用途 | 文件名 | 描述 |
| :--- | :--- | :--- |
| **BGM** | `catchfood-bgm.techybuddy` | 背景音乐 |
| **GetFood** | `catchfood-get-food.techybuddy` | 接到食物音效 |
| **GameOver** | `game-over.techybuddy` | 游戏结束音效 |

#### 动作序列帧 (Action Frames)
**路径**: `pets/{petId}/actions/`

| 动作名 (ActionName) | 描述 | 触发时机 |
| :--- | :--- | :--- |
| `game-standby` | 待机 | 游戏开始前、结束后 |
| `catchfood-game-start` | 开始 | 点击开始游戏时 |
| `catchfood-game-move-left` | 向左跑 | 鼠标左移拖拽 |
| `catchfood-game-move-right` | 向右跑 | 鼠标右移拖拽 |
| `catchfood-game-pause-left` | 向左急停 | 松开鼠标（面朝左） |
| `catchfood-game-pause-right` | 向右急停 | 松开鼠标（面朝右） |
| `catchfood-game-died-left` | 向左死亡 | 碰到炸弹/石头/垃圾（面朝左） |
| `catchfood-game-died-right` | 向右死亡 | 碰到炸弹/石头/垃圾（面朝右） |
| `emerge-from-the-ground` | 出场 | 游戏初始化 |
| `game-end` | 退场 | 退出游戏 |

---

## 跑酷 (Parkour)

**代码位置**: 
*   逻辑定义: [parkour.ts](file:///d:/桌面/前端/game-module-windows/src/components/game/parkour/parkour.ts)
*   渲染引擎: [Parkour.vue](file:///d:/桌面/前端/game-module-windows/src/components/game/parkour/Parkour.vue)

### 1. 静态资源 (Static Assets)

| 资源名 | 描述 | 代码引用路径 | 备注 |
| :--- | :--- | :--- | :--- |
| **Ground** | 地面 | `@assets/app/img/png/game/Ground.png` | **共用资源** |
| **Background** | 远景背景 | `@assets/app/img/png/game/Background.png` | 跑酷专属背景 |
| **Coin** | 金币 | `@assets/app/img/png/game/Coin.png` | 奖励物品 |
| **Cactus** | 仙人掌 | `@assets/app/img/png/game/obstacle/Cactus.png` | 障碍物 |
| **Stone** | 石头 | `@assets/app/img/png/game/obstacle/Stone.png` | **注意路径**：在 `obstacle` 子目录下 |
| **Thicket** | 灌木丛 | `@assets/app/img/png/game/obstacle/Thicket.png` | 障碍物 |
| **Hole** | 坑洞 | `@assets/app/img/png/game/obstacle/Hole.png` | 陷阱 |
| **GreenTree** | 绿树 | `@assets/app/img/png/game/obstacle/GreenTree.png` | 障碍物 |
| **PinkTree** | 粉树 | `@assets/app/img/png/game/obstacle/PinkTree.png` | 障碍物 |
| **BigCactus** | 大仙人掌 | `@assets/app/img/png/game/obstacle/BigCactus.png` | 障碍物 |

### 2. 动态资源 (Dynamic Assets)

**基础路径**: `resources/dlcs/parkour/`

#### 音频 (Audios)
| 用途 | 文件名 | 描述 |
| :--- | :--- | :--- |
| **BGM** | `parkour-bgm.techybuddy` | 背景音乐 |
| **Jump** | `parkour-jump.techybuddy` | 跳跃音效 |
| **GameOver** | `game-over.techybuddy` | 游戏结束音效 |

#### 动作序列帧 (Action Frames)
**路径**: `pets/{petId}/actions/`

| 动作名 (ActionName) | 描述 | 触发时机 |
| :--- | :--- | :--- |
| `game-standby` | 待机 | 游戏未开始 |
| `parkour-game-start` | 准备起跑 | 点击开始 |
| `parkour-game-playing` | 奔跑中 | 游戏进行中（常态） |
| `parkour-game-first-jump` | 一段跳 | 按下空格/点击 |
| `parkour-game-second-jump` | 二段跳 | 空中再次按下空格/点击 |
| `parkour-game-run-fall` | 跌倒 | 掉入坑洞 |
| `parkour-game-died` | 死亡 | 撞到障碍物 |
| `emerge-from-the-ground` | 出场 | 游戏初始化 |
| `game-end` | 退场 | 退出游戏 |

---

## 注意事项与建议

1.  **同名文件混淆风险**：
    *   接食物游戏使用 `game/Stone.png`
    *   跑酷游戏使用 `game/obstacle/Stone.png`
    *   **建议**：后续维护或添加新游戏时，请严格按照 `game/{游戏名}/{资源名}.png` 结构存放，避免在根目录堆积文件。

2.  **资源共用**：
    *   `Ground.png` 是目前唯一的跨游戏共用静态资源。修改它会同时影响两个游戏。

3.  **动态资源格式**：
    *   所有动态资源（音频、动画）均为 `.techybuddy` 加密格式，由 Electron 主进程通过 `pet://` 和 `audio://` 协议拦截解密。
