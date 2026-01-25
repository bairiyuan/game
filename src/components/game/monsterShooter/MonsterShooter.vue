<template>
  <div 
    class="game-container" 
    :style="{
      width: '100%', 
      height: '100%', 
      overflow: 'hidden', 
      background: 'transparent',
      pointerEvents: gameStatus === 'beforeStart' ? 'none' : 'auto'
    }"
  >
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      tabindex="0"
      style="display: block; cursor: default;"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

// --- 类型定义 ---
type GameStatus = 'beforeStart' | 'start' | 'playing' | 'died' | 'paused' | 'gameOver' | 'ended'

interface Entity {
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface Pet extends Entity {
  speed: number // 虽然是鼠标控制，但保留属性以便扩展
}

interface Bullet extends Entity {
  active: boolean
  vy: number // 向上速度
}

type MonsterType = 'small' | 'medium' | 'large'

interface Monster extends Entity {
  type: MonsterType
  hp: number
  maxHp: number
  vy: number // 向下速度
  score: number
  active: boolean
}

// --- Emits ---
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'game-died', points: number): void
  (e: 'update:score', points: number): void
}>()

// --- 游戏配置常量 (基于参考宽度 2560px) ---
const REF_WIDTH = 2560
const canvasWidth = window.innerWidth
const canvasHeight = window.innerHeight
const scale = canvasWidth / REF_WIDTH // 缩放比例

// 转换工具函数
const px = (val: number) => val * scale

const CONFIG = {
  pet: {
    width: px(100),
    height: px(100),
    color: '#00FF00', // 绿色代表主角
    shootInterval: 200, // 射击间隔 (ms)
  },
  bullet: {
    width: px(10),
    height: px(30),
    speed: px(1500), // 这里的速度单位是 px/s
    color: '#FFFF00' // 黄色子弹
  },
  monster: {
    small: { width: px(60), height: px(60), hp: 1, score: 5, color: '#FF0000', speedBase: px(400) }, // 红色
    medium: { width: px(100), height: px(100), hp: 3, score: 20, color: '#FF00FF', speedBase: px(250) }, // 紫色
    large: { width: px(180), height: px(180), hp: 5, score: 40, color: '#0000FF', speedBase: px(150) }, // 蓝色
  },
  game: {
    spawnIntervalInitial: 1000, // 初始生成间隔 (ms)
    spawnIntervalMin: 200, // 最小生成间隔
    speedIncreaseInterval: 30000, // 速度增加间隔 (ms)
    speedIncreaseAmount: px(50), // 每次增加的速度
    maxSpeedCap: px(800) // 速度上限
  }
}

// --- 状态变量 ---
const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const gameStatus = ref<GameStatus>('beforeStart')
const score = ref(0)
const animationId = ref<number | null>(null)

// 实体状态
const pet = ref<Pet>({
  x: canvasWidth / 2 - CONFIG.pet.width / 2,
  y: canvasHeight - CONFIG.pet.height - 20,
  width: CONFIG.pet.width,
  height: CONFIG.pet.height,
  color: CONFIG.pet.color,
  speed: 0
})

const bullets = ref<Bullet[]>([])
const monsters = ref<Monster[]>([])

// 游戏逻辑控制变量
let lastTime = 0
let lastShootTime = 0
let lastSpawnTime = 0
let gameTime = 0 // 游戏进行总时长
let currentSpawnInterval = CONFIG.game.spawnIntervalInitial
let globalSpeedBonus = 0 // 全局速度加成
let looping = false

// 鼠标控制
let isMouseDown = false

// --- 生命周期 ---
onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    // startGame() // 不再自动开始
    // 初始化画面
    draw()
  }
})

onBeforeUnmount(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})

// --- 游戏控制 ---
function startGame() {
  gameStatus.value = 'playing'
  score.value = 0
  bullets.value = []
  monsters.value = []
  gameTime = 0
  globalSpeedBonus = 0
  currentSpawnInterval = CONFIG.game.spawnIntervalInitial
  
  // 重置Pet位置
  pet.value.x = canvasWidth / 2 - pet.value.width / 2
  pet.value.y = canvasHeight - CONFIG.pet.height - 20
  
  lastTime = performance.now()
  looping = true
  gameLoop(lastTime)
}

function stopGame() {
  gameStatus.value = 'gameOver'
  looping = false
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  emit('game-died', score.value)
}

// --- 游戏主循环 ---
function gameLoop(timestamp: number) {
  if (!looping) return
  if (gameStatus.value !== 'playing') return

  const deltaTime = timestamp - lastTime
  lastTime = timestamp
  gameTime += deltaTime

  update(deltaTime, timestamp)
  draw()

  animationId.value = requestAnimationFrame(gameLoop)
}

// --- 更新逻辑 ---
function update(deltaTime: number, timestamp: number) {
  const dtSeconds = deltaTime / 1000

  // 1. 难度调整 (每30秒增加速度)
  const difficultyLevel = Math.floor(gameTime / CONFIG.game.speedIncreaseInterval)
  globalSpeedBonus = Math.min(difficultyLevel * CONFIG.game.speedIncreaseAmount, CONFIG.game.maxSpeedCap - 150) // 简单封顶逻辑
  
  // 增加生成频率 (每30秒增加上限 -> 减少间隔)
  // 简单模拟: 初始1000ms, 每级减少100ms, 最低200ms
  currentSpawnInterval = Math.max(CONFIG.game.spawnIntervalMin, CONFIG.game.spawnIntervalInitial - difficultyLevel * 150)

  // 2. 自动射击
  if (timestamp - lastShootTime > CONFIG.pet.shootInterval) {
    shoot()
    lastShootTime = timestamp
  }

  // 3. 生成怪兽
  if (timestamp - lastSpawnTime > currentSpawnInterval) {
    spawnMonster()
    lastSpawnTime = timestamp
  }

  // 4. 更新子弹
  bullets.value.forEach(b => {
    b.y -= b.vy * dtSeconds
    if (b.y + b.height < 0) b.active = false
  })
  bullets.value = bullets.value.filter(b => b.active)

  // 5. 更新怪兽
  monsters.value.forEach(m => {
    // 速度 = 基础速度 + 全局加成
    const currentSpeed = m.vy + globalSpeedBonus
    m.y += currentSpeed * dtSeconds
    
    // 移除超出屏幕的怪兽 (可选: 扣分?)
    if (m.y > canvasHeight) m.active = false
    
    // 碰撞检测: 怪兽 vs 桌宠 (游戏结束)
    if (checkCollision(m, pet.value)) {
      stopGame()
    }
  })
  monsters.value = monsters.value.filter(m => m.active)

  // 6. 子弹 vs 怪兽 碰撞检测
  bullets.value.forEach(b => {
    monsters.value.forEach(m => {
      if (b.active && m.active && checkCollision(b, m)) {
        b.active = false // 子弹消失
        m.hp -= 1
        if (m.hp <= 0) {
          m.active = false
          score.value += m.score
          emit('update:score', score.value)
        }
      }
    })
  })
}

// --- 渲染逻辑 ---
function draw() {
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 仅在游戏进行中或结束时绘制黑色背景，避免在 beforeStart 遮挡开始按钮
  // 或者如果需要一直显示背景，确保 GameView 的按钮 z-index 足够高（但我们不改 GameView）
  // 折中方案：beforeStart 时透明，playing/paused/gameOver 时黑色
  if (gameStatus.value !== 'beforeStart') {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }

  // 绘制桌宠 (绿色方块)
  drawEntity(ctx, pet.value)

  // 绘制子弹 (黄色小方块)
  bullets.value.forEach(b => drawEntity(ctx!, b))

  // 绘制怪兽 (不同颜色方块 + 血量显示)
  monsters.value.forEach(m => {
    drawEntity(ctx!, m)
  })
}

function drawEntity(ctx: CanvasRenderingContext2D, entity: Entity) {
  ctx.fillStyle = entity.color
  ctx.fillRect(entity.x, entity.y, entity.width, entity.height)
}

// --- 辅助函数 ---
function shoot() {
  bullets.value.push({
    x: pet.value.x + pet.value.width / 2 - CONFIG.bullet.width / 2,
    y: pet.value.y,
    width: CONFIG.bullet.width,
    height: CONFIG.bullet.height,
    color: CONFIG.bullet.color,
    vy: CONFIG.bullet.speed,
    active: true
  })
}

function spawnMonster() {
  const rand = Math.random()
  let type: MonsterType = 'small'
  
  if (rand < 0.6) type = 'small'
  else if (rand < 0.9) type = 'medium'
  else type = 'large'

  const cfg = CONFIG.monster[type]
  
  // 随机X坐标，确保不超出屏幕
  const x = Math.random() * (canvasWidth - cfg.width)

  monsters.value.push({
    x: x,
    y: -cfg.height, // 从屏幕上方外开始
    width: cfg.width,
    height: cfg.height,
    color: cfg.color,
    type: type,
    hp: cfg.hp,
    maxHp: cfg.hp,
    score: cfg.score,
    vy: cfg.speedBase,
    active: true
  })
}

function checkCollision(rect1: Entity, rect2: Entity) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
  )
}

// --- 交互事件 ---
function handleMouseDown(e: MouseEvent) {
  if (gameStatus.value === 'gameOver') {
    // 游戏结束状态点击不直接开始，防止误触，由UI控制
    return
  }
  if (gameStatus.value !== 'playing') return // 只有游戏中才响应鼠标
  isMouseDown = true
  updatePetPosition(e.clientX, e.clientY)
}

function handleMouseMove(e: MouseEvent) {
  if (isMouseDown) {
    updatePetPosition(e.clientX, e.clientY)
  }
}

function handleMouseUp() {
  isMouseDown = false
}

function updatePetPosition(mouseX: number, mouseY: number) {
  // Update X
  let newX = mouseX - pet.value.width / 2
  if (newX < 0) newX = 0
  if (newX > canvasWidth - pet.value.width) newX = canvasWidth - pet.value.width
  pet.value.x = newX

  // Update Y
  let newY = mouseY - pet.value.height / 2
  if (newY < 0) newY = 0
  if (newY > canvasHeight - pet.value.height) newY = canvasHeight - pet.value.height
  pet.value.y = newY
}

// --- 暴露给父组件的方法 ---
function currentStatus() {
  return gameStatus.value
}

function pauseGame() {
  if (gameStatus.value === 'playing') {
    gameStatus.value = 'paused'
    looping = false
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
      animationId.value = null
    }
  }
}

function resumeGame() {
  if (gameStatus.value === 'paused') {
    gameStatus.value = 'playing'
    looping = true
    lastTime = performance.now()
    gameLoop(lastTime)
  }
}

function close() {
  gameStatus.value = 'ended'
  looping = false
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  emit('close')
}

defineExpose({
   startGame,
   restartGame: startGame, // 别名
   pauseGame,
   resumeGame,
   close,
   currentStatus
 })
</script>

<style scoped>
.game-container {
  /* position: relative; Removed to allow absolute UI elements from GameView to show on top */
  user-select: none; /* 防止拖动选中文本 */
}
</style>
