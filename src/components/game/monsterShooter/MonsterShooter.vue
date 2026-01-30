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
  | 'emerge-from-the-ground' // 爬出
  | 'game-end' // 爬走
  | 'game-standby'
  | 'monster-shooter-idle'
  | 'monster-shooter-transform' // 战斗转换
  | 'monster-shooter-move-left'
  | 'monster-shooter-move-right'
  | 'monster-shooter-shoot'
  | 'monster-shooter-fail' // 失败状态

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
  hitTime: number // 受击时间，用于显示受击状态
}

interface Effect extends Entity {
  type: 'hit' | 'explosion'
  frameIndex: number
  maxFrames: number
  frameDuration: number
  accumulatedTime: number
  active: boolean
  target?: Monster // 绑定的目标怪兽 (用于跟随)
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
    width: 200, // px(100) -> 200 跟随 CatchFood/Parkour 统一大小
    height: 200, // px(100) -> 200 跟随 CatchFood/Parkour 统一大小
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

// 角色图片留白配置 (参考 Parkour)
const blankSize = {
  top: 70,
  right: 60,
  bottom: 55,
  left: 60
}

// --- 资源路径定义 ---
const basePath = '/dlcs/monstershooter' // 假设的DLC路径
const resourcePaths = {
  background: `${basePath}/background.png`,
  bullet: `${basePath}/bullet.png`,
  monster: {
    small: `${basePath}/monster-small.png`,
    medium: {
      normal: `${basePath}/monster-medium.png`,
      hit: `${basePath}/monster-medium-hit.png`
    },
    large: {
      normal: `${basePath}/monster-large.png`,
      damaged1: `${basePath}/monster-large-damaged-1.png`, // 轻微受损
      damaged2: `${basePath}/monster-large-damaged-2.png`  // 严重受损
    }
  },
  effects: {
    hit: `${basePath}/effects/hit`, // 目录，假设 hit_0.png, hit_1.png ...
    explosion: `${basePath}/effects/explosion` // 目录
  }
}

const audioLoop = {
  BGM: 'monstershooter-bgm.techybuddy',
  Shoot: 'shoot.techybuddy',
  Hit: 'hit.techybuddy', // 击打音效
  Explosion: 'explosion.techybuddy', // 怪兽死亡/爆炸音效
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
  y: canvasHeight - CONFIG.pet.height - 20 + blankSize.bottom, // 修正 Y 坐标，考虑底部留白
  width: CONFIG.pet.width,
  height: CONFIG.pet.height,
  color: CONFIG.pet.color,
  actionName: 'game-standby', // 默认待机动作
  frameIndex: 0
})

const bullets = ref<Bullet[]>([])
const monsters = ref<Monster[]>([])
const effects = ref<Effect[]>([])

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
      'emerge-from-the-ground',
      'game-end',
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
  await getCachedImage(resourcePaths.monster.medium.normal)
  await getCachedImage(resourcePaths.monster.medium.hit)
  await getCachedImage(resourcePaths.monster.large.normal)
  await getCachedImage(resourcePaths.monster.large.damaged1)
  await getCachedImage(resourcePaths.monster.large.damaged2)
  
  // 预加载特效 (假设各3帧)
  for (let i = 0; i < 3; i++) await getCachedImage(`${resourcePaths.effects.hit}/hit_${i}.png`)
  for (let i = 0; i < 5; i++) await getCachedImage(`${resourcePaths.effects.explosion}/explosion_${i}.png`)
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

  // 动作回调逻辑
  switch (actionName) {
    case 'emerge-from-the-ground':
      currentActionCallback = () => {
        // 爬出后进入待机
        playAction('game-standby')
      }
      break
    case 'game-end':
      currentActionCallback = () => {
        // 爬走后关闭游戏
        gameStatus.value = 'ended'
        emit('close')
      }
      break
    case 'monster-shooter-shoot':
      // 射击动作通常短促，结束后切回 idle (在 update 中有简单处理，这里强化)
      // 注意：update 中的逻辑可能会覆盖这里的 callback，需要协调
      // 这里暂不处理，保留 update 中的逻辑
      break
    default:
      currentActionCallback = null
      break
  }

  // 安全检查：如果动作元数据不存在，使用定时器兜底触发回调，防止游戏流程卡死
  if (!animateMeta.value || !animateMeta.value[actionName]) {
    // console.warn(`Action metadata for ${actionName} not found, using fallback timer`)
    if (currentActionCallback) {
      const cb = currentActionCallback
      currentActionCallback = null
      setTimeout(cb, 500) // 0.5秒后强制执行回调
    }
  }
}

// --- 生命周期 ---
onMounted(async () => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    await preheat()
    // 初始化画面
    draw()
    
    // 播放爬出动画
    nextTick(() => {
      // 聚焦 canvas
      canvas.value?.focus()
      playAction('emerge-from-the-ground')
      // 开启循环以支持动画更新 (即使在 beforeStart 状态)
      lastTimePetFrame = new Date().getTime()
      looping = true
      // 启动一个仅渲染的循环，不进行游戏逻辑 update
      renderLoop()
    })
  }
})

function renderLoop() {
  if (!looping) return
  
  // 如果在游戏进行中，交由 gameLoop 接管
  if (gameStatus.value === 'playing') return

  const timestamp = performance.now()
  // 仅更新动画相关 (accumulatedTime 在 drawPet 中更新)
  // 这里需要手动触发 draw
  draw()
  
  // 如果是 beforeStart, gameOver, ended 状态，继续渲染动画
  if (['beforeStart', 'gameOver', 'ended'].includes(gameStatus.value)) {
    animationId.value = requestAnimationFrame(renderLoop)
  }
}

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
  pet.value.y = canvasHeight - CONFIG.pet.height - 20 + blankSize.bottom
  
  lastTime = performance.now()
  lastTimePetFrame = new Date().getTime() // 初始化动画时间
  looping = true
  
  playBgm(`audio://0.0.0.0${basePath}/audios/${audioLoop.BGM}`)
  
  // 播放战斗转换动画，结束后进入 Idle/Shoot
  playAction('monster-shooter-transform')
  currentActionCallback = () => {
    playAction('monster-shooter-idle')
  }

  gameLoop(lastTime)
}

function stopGame() {
  gameStatus.value = 'gameOver'
  // 保持 looping 为 true 以播放失败动画，但切换到 renderLoop
  looping = true
  lastTimePetFrame = new Date().getTime()
  
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  // 启动渲染循环
  renderLoop()

  stopBgm()
  playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.GameOver}`)
  playAction('monster-shooter-fail') // 播放失败状态
  emit('game-died', score.value)
}

function close() {
  // 1. 停止游戏逻辑更新
  gameStatus.value = 'ended'
  
  // 2. 确保开启渲染循环，以便播放爬走动画
  looping = true
  lastTimePetFrame = new Date().getTime()
  
  // 切换到 renderLoop
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  renderLoop()

  // 3. 播放爬走动画
  playAction('game-end')
  // 动画结束后会触发 emit('close')
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
    if (checkCollision(m, getPetHitBox())) {
      stopGame()
    }
  })
  monsters.value = monsters.value.filter(m => m.active)

  // 6. 更新特效
  effects.value.forEach(e => {
    // 如果绑定了目标且目标存活，更新特效位置 (跟随目标)
    if (e.target && e.target.active) {
      e.x = e.target.x + e.target.width / 2 - e.width / 2
      e.y = e.target.y + e.target.height / 2 - e.height / 2
    }

    e.accumulatedTime += deltaTime
    if (e.accumulatedTime >= e.frameDuration) {
      e.accumulatedTime -= e.frameDuration
      e.frameIndex++
      if (e.frameIndex >= e.maxFrames) {
        e.active = false
      }
    }
  })
  effects.value = effects.value.filter(e => e.active)

  // 7. 子弹 vs 怪兽 碰撞检测
  bullets.value.forEach(b => {
    monsters.value.forEach(m => {
      if (b.active && m.active && checkCollision(b, m)) {
        b.active = false // 子弹消失
        m.hp -= 1
        m.hitTime = timestamp // 记录受击时间
        
        // 播放击打音效
        playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.Hit}`)
        
        // 生成击中特效
        effects.value.push({
          x: m.x + m.width / 2 - 15, // 居中修正 (假设特效30x30)
          y: m.y + m.height / 2 - 15,
          width: 30,
          height: 30,
          color: '#FFFFFF',
          type: 'hit',
          frameIndex: 0,
          maxFrames: 3,
          frameDuration: 50, // 50ms 一帧
          accumulatedTime: 0,
          active: true,
          target: m // 绑定目标怪兽
        })

        if (m.hp <= 0) {
          m.active = false
          score.value += m.score
          playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.Explosion}`)
          
          // 生成爆炸特效
          effects.value.push({
            x: m.x + m.width / 2 - 40,
            y: m.y + m.height / 2 - 40,
            width: 80,
            height: 80,
            color: '#FF4500',
            type: 'explosion',
            frameIndex: 0,
            maxFrames: 5,
            frameDuration: 80,
            accumulatedTime: 0,
            active: true
          })
          
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
    
    if (m.type === 'medium') {
      // 中怪兽：受击状态检测 (最近 200ms 内受击显示受击图)
      const isHit = performance.now() - m.hitTime < 200
      src = isHit ? resourcePaths.monster.medium.hit : resourcePaths.monster.medium.normal
    } else if (m.type === 'large') {
      // 大怪兽：根据血量显示受损状态
      const hpRatio = m.hp / m.maxHp
      if (hpRatio <= 0.33) {
        src = resourcePaths.monster.large.damaged2 // 严重受损
      } else if (hpRatio <= 0.66) {
        src = resourcePaths.monster.large.damaged1 // 轻微受损
      } else {
        src = resourcePaths.monster.large.normal
      }
    }
    
    await drawImageEntity(ctx, m, src)
  }

  // 5. 绘制特效
  for (const e of effects.value) {
    const basePathStr = e.type === 'hit' ? resourcePaths.effects.hit : resourcePaths.effects.explosion
    const frameName = e.type === 'hit' ? 'hit' : 'explosion'
    const src = `${basePathStr}/${frameName}_${e.frameIndex}.png`
    await drawImageEntity(ctx, e, src)
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
    // 回退：如果图片加载失败，绘制绿色方块（显示判定框）
    ctx.fillStyle = petVal.color
    // 仅绘制判定框区域，以便调试
    ctx.fillRect(
      petVal.x + blankSize.left,
      petVal.y + blankSize.top,
      petVal.width - blankSize.left - blankSize.right,
      petVal.height - blankSize.top - blankSize.bottom
    )
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
  
  // 尝试找到一个不重叠的位置
  let x = 0
  let attempts = 0
  let valid = false
  const maxAttempts = 15

  // 临时变量
  const newY = -cfg.height
  const newH = cfg.height
  const newW = cfg.width
  const newSpeedBase = cfg.speedBase

  while (attempts < maxAttempts) {
    x = Math.random() * (canvasWidth - newW)
    
    // 碰撞检测 (包含未来追及检测)
    const isOverlapping = monsters.value.some(m => {
      if (!m.active) return false
      
      // 1. X轴重叠检测
      const xOverlap = (
        x < m.x + m.width &&
        x + newW > m.x
      )
      if (!xOverlap) return false
      
      // 2. Y轴当前重叠检测
      const yOverlap = (
        newY < m.y + m.height &&
        newY + newH > m.y
      )
      if (yOverlap) return true
      
      // 3. 追及碰撞检测 (如果新怪兽速度更快，且在同一列)
      if (newSpeedBase > m.vy) {
        // m 在下方
        const gap = m.y - (newY + newH)
        
        if (gap > 0) {
          const relSpeed = newSpeedBase - m.vy
          const timeToCatch = gap / relSpeed
          
          // 预测追上时的位置
          const mCurrentSpeed = m.vy + globalSpeedBonus
          const catchY = m.y + mCurrentSpeed * timeToCatch
          
          // 如果追上时还在屏幕内
          if (catchY < canvasHeight) {
            return true
          }
        }
      }
      
      return false
    })

    if (!isOverlapping) {
      valid = true
      break
    }
    attempts++
  }

  if (!valid) return // 放弃本次生成

  monsters.value.push({
    x: x,
    y: newY, // 从屏幕上方外开始
    width: cfg.width,
    height: cfg.height,
    color: cfg.color,
    type: type,
    hp: cfg.hp,
    maxHp: cfg.hp,
    score: cfg.score,
    vy: cfg.speedBase,
    active: true,
    hitTime: 0
  })
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

// 简单的 AABB 碰撞检测
function checkCollision(rect1: Rect, rect2: Rect) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
  )
}

function getPetHitBox() {
  const p = pet.value
  return {
    x: p.x + blankSize.left,
    y: p.y + blankSize.top,
    width: p.width - blankSize.left - blankSize.right,
    height: p.height - blankSize.top - blankSize.bottom
  }
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
  let newX = x
  let newY = y
  
  // 边界检查：允许图片超出屏幕，只要判定框（扣除留白后）在屏幕内
  
  // X轴：左侧允许移出 blankSize.left
  if (newX < -blankSize.left) newX = -blankSize.left
  // X轴：右侧允许移出 blankSize.right
  if (newX > canvasWidth - pet.value.width + blankSize.right) newX = canvasWidth - pet.value.width + blankSize.right

  // Y轴：顶部允许移出 blankSize.top
  if (newY < -blankSize.top) newY = -blankSize.top
  // Y轴：底部允许移出 blankSize.bottom
  if (newY > canvasHeight - pet.value.height + blankSize.bottom) newY = canvasHeight - pet.value.height + blankSize.bottom
  
  pet.value.x = newX
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

defineExpose({
  startGame,
  stopGame,
  restartGame: startGame,
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
