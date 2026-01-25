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
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { ActionMetadata, getActionData } from '@renderer/constants/action'
import { usePetStore } from '@renderer/store/pet/petStore'
import { clearAudioFromCache, playAudio, playBgm, stopBgm } from '@renderer/utils/audio'

// --- 类型定义 ---
type GameStatus = 'beforeStart' | 'start' | 'playing' | 'died' | 'paused' | 'gameOver' | 'ended'
type ActionName = 
  | 'game-standby'
  | 'monster-shooter-idle'
  | 'monster-shooter-move-left'
  | 'monster-shooter-move-right'
  | 'monster-shooter-shoot'

interface Entity {
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface Pet extends Entity {
  speed: number
  actionName: ActionName
  frameIndex: number
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

// --- 资源路径定义 ---
const basePath = '/dlcs/monstershooter' // 假设的DLC路径
const resourcePaths = {
  background: `${basePath}/background.png`,
  bullet: `${basePath}/bullet.png`,
  monster: {
    small: `${basePath}/monster-small.png`,
    medium: `${basePath}/monster-medium.png`,
    large: `${basePath}/monster-large.png`
  }
}

const audioLoop = {
  BGM: 'monstershooter-bgm.techybuddy',
  Shoot: 'shoot.techybuddy',
  Explosion: 'explosion.techybuddy',
  GameOver: 'game-over.techybuddy'
}

// --- 状态变量 ---
const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const petStore = usePetStore()
const petId = ref(petStore.id)
const imageCache = new Map<string, HTMLImageElement | null>()
const animateMeta = ref<Map<string, ActionMetadata>>()

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
  speed: 0,
  actionName: 'game-standby',
  frameIndex: 0
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
let dragOffsetX = 0
let dragOffsetY = 0

// 动画控制
let lastTimePetFrame = 0
const accumulatedTime = ref(0)
const frameDuration = ref(100)
let currentActionCallback: (() => void) | null = null

// --- 资源加载与动画函数 ---
const getCachedImage = (src: string): Promise<HTMLImageElement | null> => {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = () => {
      // 资源加载失败时不 reject，而是 resolve null，避免阻塞游戏
      console.warn(`Failed to load image: ${src}`)
      imageCache.set(src, null)
      resolve(null) 
    }
    img.src = src
  })
}

async function initAnimate() {
  const { meta } = await getActionData(petId.value, basePath)
  animateMeta.value = meta
  return animateMeta.value
}

async function preheat() {
  // 预加载 Pet 动作帧
  const meta = await initAnimate()
  if (meta) {
    const actions: ActionName[] = [
      'game-standby', 
      'monster-shooter-idle', 
      'monster-shooter-move-left', 
      'monster-shooter-move-right', 
      'monster-shooter-shoot'
    ]
    for (const action of actions) {
      const actionData = meta[action]
      if (actionData && actionData.frameCount) {
        for (let i = 0; i < actionData.frameCount; i++) {
          const frameSrc = `pet://0.0.0.0${basePath}/pets/${petId.value}/actions?petId=${petId.value}&action=${actionData.name}&frame=Frame_${i}.png`
          await getCachedImage(frameSrc)
        }
      }
    }
  }
  
  // 预加载其他资源
  await getCachedImage(resourcePaths.background)
  await getCachedImage(resourcePaths.bullet)
  await getCachedImage(resourcePaths.monster.small)
  await getCachedImage(resourcePaths.monster.medium)
  await getCachedImage(resourcePaths.monster.large)
}

const playAction = (actionName: ActionName) => {
  if (pet.value.actionName === actionName) return
  pet.value.actionName = actionName
  pet.value.frameIndex = 0
  accumulatedTime.value = 0
  frameDuration.value = animateMeta.value?.[pet.value.actionName]?.interval || 100

  // 播放动作音效 (如果有)
  if (animateMeta.value?.[actionName]?.audio) {
    playAudio(
      `audio://0.0.0.0/dlcs/monstershooter/pets/${petId.value}/audios/${animateMeta.value[actionName].audio}`
    )
  }
}

// --- 生命周期 ---
onMounted(async () => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    await preheat()
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
  lastTimePetFrame = new Date().getTime() // 初始化动画时间
  looping = true
  
  playBgm(`audio://0.0.0.0${basePath}/audios/${audioLoop.BGM}`)
  playAction('monster-shooter-idle') // 初始动作

  gameLoop(lastTime)
}

function stopGame() {
  gameStatus.value = 'gameOver'
  looping = false
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  stopBgm()
  playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.GameOver}`)
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
          playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.Explosion}`)
          emit('update:score', score.value)
        }
      }
    })
  })
}

// --- 渲染逻辑 ---
async function draw() {
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 1. 绘制背景
  // 尝试绘制图片背景，如果失败则回退到颜色
  try {
    const bgImg = await getCachedImage(resourcePaths.background)
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight)
    } else {
      throw new Error('Background image not found')
    }
  } catch (e) {
    if (gameStatus.value !== 'beforeStart') {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    }
  }

  // 2. 绘制桌宠
  await drawPet(pet.value)

  // 3. 绘制子弹
  for (const b of bullets.value) {
    await drawImageEntity(ctx, b, resourcePaths.bullet)
  }

  // 4. 绘制怪兽
  for (const m of monsters.value) {
    let src = resourcePaths.monster.small
    if (m.type === 'medium') src = resourcePaths.monster.medium
    if (m.type === 'large') src = resourcePaths.monster.large
    await drawImageEntity(ctx, m, src)
  }
}

async function drawPet(petVal: Pet) {
  if (!ctx || !petVal) return

  // 如果没有动画元数据，回退到方块绘制
  if (!animateMeta.value || !animateMeta.value[petVal.actionName]) {
    ctx.fillStyle = petVal.color
    ctx.fillRect(petVal.x, petVal.y, petVal.width, petVal.height)
    return
  }

  // 更新动画帧
  const time = new Date().getTime()
  const delta = time - lastTimePetFrame
  lastTimePetFrame = time
  accumulatedTime.value += delta
  
  if (accumulatedTime.value >= frameDuration.value) {
    accumulatedTime.value -= frameDuration.value
    const actionMeta = animateMeta.value[petVal.actionName]
    const frameCount = actionMeta.frameCount || 1
    
    if (petVal.frameIndex + 1 >= frameCount) {
      if (currentActionCallback) {
        currentActionCallback()
        currentActionCallback = null
      }
      if (actionMeta.isLoop) {
        petVal.frameIndex = 0
      }
    } else {
      petVal.frameIndex = (petVal.frameIndex + 1) % frameCount
    }
  }

  const frameSrc = `pet://0.0.0.0${basePath}/pets/${petId.value}/actions?petId=${petId.value}&action=${petVal.actionName}&frame=Frame_${petVal.frameIndex}.png`
  
  try {
    const img = await getCachedImage(frameSrc)
    if (img) {
      ctx.drawImage(img, petVal.x, petVal.y, petVal.width, petVal.height)
    } else {
      throw new Error('Frame image not found')
    }
  } catch (e) {
    // 回退
    ctx.fillStyle = petVal.color
    ctx.fillRect(petVal.x, petVal.y, petVal.width, petVal.height)
  }
}

async function drawImageEntity(ctx: CanvasRenderingContext2D, entity: Entity, imgSrc: string) {
  try {
    const img = await getCachedImage(imgSrc)
    if (img) {
      ctx.drawImage(img, entity.x, entity.y, entity.width, entity.height)
    } else {
      throw new Error('Image not found')
    }
  } catch (e) {
    ctx.fillStyle = entity.color
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height)
  }
}

// --- 辅助函数 ---
function shoot() {
  playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.Shoot}`)
  // 播放射击动作
  playAction('monster-shooter-shoot')
  // 射击后短暂延迟切回 idle/move (实际逻辑可能需要更复杂的动作状态机，这里简化)
  // 如果当前是 shoot，下一帧会自动循环或通过 callback 切回，但这里 update 是按 tick 走的
  // 简单处理：设置 callback 切回
  currentActionCallback = () => {
    // 恢复之前的状态或者 idle
    playAction('monster-shooter-idle')
  }

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
function getMousePos(evt: MouseEvent) {
  if (!canvas.value) return { x: evt.clientX, y: evt.clientY }
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}

function handleMouseDown(e: MouseEvent) {
  if (gameStatus.value === 'gameOver') {
    return
  }
  if (gameStatus.value !== 'playing') return

  const { x: mouseX, y: mouseY } = getMousePos(e)
  const petRect = pet.value

  // console.log('Click:', mouseX, mouseY, 'Pet:', petRect.x, petRect.y, petRect.width, petRect.height)

  if (
    mouseX >= petRect.x &&
    mouseX <= petRect.x + petRect.width &&
    mouseY >= petRect.y &&
    mouseY <= petRect.y + petRect.height
  ) {
    isMouseDown = true
    // 记录点击点相对于 Pet 左上角的偏移量
    dragOffsetX = mouseX - petRect.x
    dragOffsetY = mouseY - petRect.y
  }
}

function handleMouseMove(e: MouseEvent) {
  if (isMouseDown) {
    const { x: mouseX, y: mouseY } = getMousePos(e)
    // 目标位置 = 鼠标位置 - 偏移量
    const targetX = mouseX - dragOffsetX
    const targetY = mouseY - dragOffsetY
    
    if (Math.abs(targetX - pet.value.x) > 1) { // 简单防抖
      if (targetX > pet.value.x) {
        playAction('monster-shooter-move-right')
      } else {
        playAction('monster-shooter-move-left')
      }
    }

    movePetTo(targetX, targetY)
  }
}

function handleMouseUp() {
  isMouseDown = false
  playAction('monster-shooter-idle')
}

function movePetTo(x: number, y: number) {
  // Update X
  let newX = x
  if (newX < 0) newX = 0
  if (newX > canvasWidth - pet.value.width) newX = canvasWidth - pet.value.width
  pet.value.x = newX

  // Update Y
  let newY = y
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
