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
import { ActionMetadata, getActionData } from '@renderer/constants/action'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePetStore } from '@renderer/store/pet/petStore'
import Ground from '@assets/app/img/png/game/Ground.png'
import BackgroundImg from '@assets/app/img/png/game/Background.png'
import { Background, getRandomObstacleFragment, Obstacle, Pet, Reward } from './parkour'
import { clearAudioFromCache, playAudio, playBgm, stopBgm } from '@renderer/utils/audio'
type GameStatus = 'beforeStart' | 'start' | 'playing' | 'died' | 'paused' | 'gameOver' | 'ended'
type ActionName =
  | 'emerge-from-the-ground'
  | 'parkour-game-start'
  | 'parkour-game-playing'
  | 'game-standby'
  | 'parkour-game-first-jump'
  | 'parkour-game-second-jump'
  | 'parkour-game-jump-fall'
  | 'parkour-game-run-fall'
  | 'parkour-game-died'
  | 'game-end'
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'pause'): void
  (e: 'resume'): void
  (e: 'restart'): void
  (e: 'game-died', points: number): void
  (e: 'game-over', points: number): void
  (e: 'update:score', points: number): void
}>()
const basePath = '/dlcs/parkour'
const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const dpr = window.devicePixelRatio || 1
const canvasWidth = window.innerWidth
const canvasHeight = window.innerHeight
const currentGameStatus = ref<GameStatus>('beforeStart')
const onlyPet = ref(false)
const ifDrawPet = ref(true)
const actionLoop: ActionName[] = [
  'emerge-from-the-ground',
  'parkour-game-start',
  'parkour-game-playing',
  'game-standby',
  'parkour-game-first-jump',
  'parkour-game-second-jump',
  'parkour-game-jump-fall',
  'parkour-game-run-fall',
  'parkour-game-died',
  'game-end'
]
const audioLoop = {
  BGM: 'parkour-bgm.techybuddy',
  Jump: 'parkour-jump.techybuddy',
  GameOver: 'game-over.techybuddy'
}
let animationId: number | null = null
let obstacleSpawnIntervalId: NodeJS.Timeout | null = null
let looping = false

const imageCache = new Map<string, HTMLImageElement>()
const animateMeta = ref<Map<string, ActionMetadata>>()
const petStore = usePetStore()
const petId = ref(petStore.id)
const blankSize = {
  top: 70,
  right: 60,
  bottom: 55,
  left: 60
}
const sPetY = canvasHeight - 200 - 44 + blankSize.bottom
const isHole = ref(false) // 是否在坑洞中
const pet = ref<Pet>({
  x: 0,
  y: sPetY,
  width: 200,
  height: 200,
  actionName: 'game-standby',
  frameIndex: 0
})
let jumpStatus: 'up' | 'down' | null = null // 跳跃状态
let jumpCount = 0 // 连续跳跃次数，用于实现双跳
const lives = ref(1)
const score = ref(0)

const obstacles = ref<Obstacle[]>([])
const rewards = ref<Reward[]>([])

// 变量
let k = 1 //难度系数,5分钟内从1增加到2.5
const maxK = 2.5 // 最大难度系数
const kv = 5 // 难度系数增加速度
let g = 1300 * k * k // 重力加速度
let svy = -700 * k // 初始跳跃速度
let vy = 0 // 竖直速度
let vx = 300 * k // 水平速度
let timer: NodeJS.Timeout | null = null // 计时器
let pastTime = 0 // 已经过去的时间（秒）
let generateV = 4000 / k // 障碍物生成间隔

let currentActionCallback: (() => void) | null = null

const groundList = ref<Background[]>([])
const backgroundList = ref<Background[]>([])

function timeKill() {
  timer = setInterval(() => {
    pastTime += 1
    if (k >= maxK) {
      return
    }
    k += kv / 1000
    vx = 300 * k // 水平速度随 k 线性提升
    g = 1300 * k * k // 重力加速度随 k² 增大
    svy = -700 * k
    generateV = 4000 / k
  }, 1000)
}

const updateGameStatus = (status: GameStatus) => {
  if (status === currentGameStatus.value) return
  lastTimeItemFrame = new Date().getTime()
  lastTimePetFrame = new Date().getTime()
  if (status === 'paused') {
    // 暂停游戏逻辑
    if (obstacleSpawnIntervalId) {
      clearInterval(obstacleSpawnIntervalId)
      obstacleSpawnIntervalId = null
    }
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
      looping = false
    }
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  } else if (status === 'playing') {
    // 恢复游戏逻辑
    timeKill()
    startGrenteObstacles()
    if (!looping) {
      gameLoop()
      looping = true
    }
  } else if (status === 'died') {
    // 死亡逻辑
    if (obstacleSpawnIntervalId) {
      clearInterval(obstacleSpawnIntervalId)
      obstacleSpawnIntervalId = null
    }
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
      looping = false
    }
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  } else if (status === 'gameOver') {
    // 游戏结束逻辑
    if (obstacleSpawnIntervalId) {
      clearInterval(obstacleSpawnIntervalId)
      obstacleSpawnIntervalId = null
    }
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
      looping = false
    }
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    gameOver()
  } else if (
    ['paused', 'died', 'gameOver', 'ended'].includes(currentGameStatus.value) &&
    status === 'start'
  ) {
    // 从暂停到开始
    if (!looping) {
      gameLoop()
      looping = true
    }
  }
  currentGameStatus.value = status
}

const initCanvas = () => {
  if (!canvas.value) return
  canvas.value.width = canvasWidth * dpr
  canvas.value.height = canvasHeight * dpr
  ctx.value = canvas.value.getContext('2d', { willReadFrequently: true })
  if (!ctx.value) return
  ctx.value.scale(dpr, dpr)
  if (looping) return
  looping = true
}

const getCachedImage = (src: string): Promise<HTMLImageElement> => {
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
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

const drawImage = async (imgSrc: string, x: number, y: number, width: number, height: number) => {
  const img = await getCachedImage(imgSrc)
  if (!ctx.value) return
  ctx.value.drawImage(img, x, y, width, height)
}

const startGrenteObstacles = () => {
  // 开始游戏循环
  obstacleSpawnIntervalId = setInterval(() => {
    const fragment = getRandomObstacleFragment(canvasWidth, canvasHeight - 44)
    if (!fragment) return
    obstacles.value.push(...fragment.obstacleList)
    rewards.value.push(...fragment.rewards)
  }, generateV)
}

let lastTimePetFrame = new Date().getTime()
let lastTimeItemFrame = new Date().getTime()
const accumulatedTime = ref(0)
const frameDuration = ref(0)
const drawPet = async (petVal: Pet) => {
  if (!ctx.value || !petVal) return

  if (!animateMeta.value) return

  const time = new Date().getTime()
  const delta = time - lastTimePetFrame
  lastTimePetFrame = time
  accumulatedTime.value += delta
  if (accumulatedTime.value >= frameDuration.value) {
    accumulatedTime.value -= frameDuration.value
    if (petVal.frameIndex + 1 >= (animateMeta.value[petVal.actionName].frameCount || 1)) {
      if (currentActionCallback) {
        currentActionCallback()
        currentActionCallback = null
      }
      if (animateMeta.value[petVal.actionName].isLoop) {
        petVal.frameIndex = 0
      }
    } else {
      petVal.frameIndex =
        (petVal.frameIndex + 1) % (animateMeta.value[petVal.actionName].frameCount || 1)
    }
  }
  if (jumpStatus === 'up') {
    vy += g * (delta / 1000)
    petVal.y += vy * (delta / 1000)
    if (vy >= 0) {
      jumpStatus = 'down'
    }
  } else if (jumpStatus === 'down' || isHole.value) {
    vy += g * (delta / 1000)
    petVal.y += vy * (delta / 1000)
    if (!isHole.value && petVal.y >= sPetY) {
      petVal.y = sPetY
      jumpStatus = null
      vy = 0
      jumpCount = 0
    } else if (isHole.value && petVal.y + blankSize.top >= canvasHeight) {
      ifDrawPet.value = false
      petVal.y = sPetY
      isHole.value = false
      jumpStatus = null
      vy = 0
      jumpCount = 0
      lives.value -= 1
    }
  }
  const frameSrc = `pet://0.0.0.0${basePath}/pets/${petId.value}/actions?petId=${petId.value}&action=${petVal.actionName}&frame=Frame_${petVal.frameIndex}.png`
  await drawImage(frameSrc, petVal.x, petVal.y, petVal.width, petVal.height)
  if (process.env.NODE_ENV === 'development') {
    // 调试边框
    ctx.value.strokeStyle = 'red'
    ctx.value.lineWidth = 2
    ctx.value.strokeRect(
      petVal.x + blankSize.left,
      petVal.y + blankSize.top,
      petVal.width - blankSize.left - blankSize.right,
      petVal.height - blankSize.top - blankSize.bottom
    )
  }
}
const playAction = (actionName: ActionName) => {
  if (pet.value.actionName === actionName) return
  pet.value.actionName = actionName
  pet.value.frameIndex = 0
  accumulatedTime.value = 0
  frameDuration.value = animateMeta.value?.[pet.value.actionName].interval || 100

  switch (actionName) {
    case 'emerge-from-the-ground':
      currentActionCallback = () => {
        playAction('game-standby')
      }
      break
    case 'parkour-game-start':
      currentActionCallback = () => {
        updateGameStatus('playing')
        playAction('parkour-game-playing')
      }
      break
    case 'parkour-game-first-jump':
    case 'parkour-game-second-jump':
      currentActionCallback = () => {
        playAction('parkour-game-playing')
      }
      break
    case 'parkour-game-died':
      currentActionCallback = () => {
        updateGameStatus('gameOver')
        playAction('game-standby')
      }
      break
    case 'game-end':
      currentActionCallback = () => {
        updateGameStatus('ended')
        emit('close')
      }
      break
    default:
      currentActionCallback = null
      break
  }
}

const gameLoop = async () => {
  const c = ctx.value
  if (!c) return
  const petVal = pet.value
  // 清屏
  c.clearRect(0, 0, canvasWidth, canvasHeight)
  const time = new Date().getTime()
  const delta = time - lastTimeItemFrame
  lastTimeItemFrame = time
  const movement = (vx * delta) / 1000
  // 更新背景
  backgroundList.value.forEach(async (background) => {
    if (currentGameStatus.value === 'playing' && !onlyPet.value) {
      background.x -= movement / 10
      if (background.x + background.width <= 0) {
        // 放到最后一个背景的右边
        background.x += backgroundList.value.length * background.width
      }
    }
    await drawImage(background.src, background.x, background.y, background.width, background.height)
  })

  // 更新地面
  groundList.value.forEach(async (ground) => {
    if (currentGameStatus.value === 'playing' && !onlyPet.value) {
      ground.x -= movement
      if (ground.x + ground.width <= 0) {
        // 放到最后一个地面的右边
        ground.x += groundList.value.length * ground.width
      }
    }
    await drawImage(ground.src, ground.x, ground.y, ground.width, ground.height)
  })

  obstacles.value.forEach(async (obstacle, index) => {
    if (currentGameStatus.value === 'playing' && !onlyPet.value) {
      obstacle.offsetX -= movement
    }

    // 颜色区分
    // c.fillStyle = getItemColor(item.code)
    // c.beginPath()
    // c.arc(item.x + item.width / 2, item.y + item.width / 2, item.width / 2, 0, Math.PI * 2)
    // c.fill()
    await drawImage(
      obstacle.src,
      obstacle.offsetX,
      obstacle.offsetY,
      obstacle.width,
      obstacle.height
    )

    if (process.env.NODE_ENV === 'development') {
      // 调试边框
      c.strokeStyle = 'green'
      c.lineWidth = 2
      c.strokeRect(obstacle.offsetX, obstacle.offsetY, obstacle.width, obstacle.height)
    }

    if (index !== 0) {
      return
    }

    // 碰撞检测
    const petLeftX = petVal.x + blankSize.left
    const petRightX = petVal.x + petVal.width - blankSize.right
    const petBottomY = petVal.y + petVal.height - blankSize.bottom
    const obstacleX = obstacle.offsetX
    const obstacleY = obstacle.offsetY
    if (
      !obstacle.caught &&
      petBottomY >= obstacleY &&
      ((petRightX > obstacleX && petLeftX < obstacleX) ||
        (petRightX > obstacleX + obstacle.width && petLeftX < obstacleX) ||
        (petLeftX < obstacleX + obstacle.width && petLeftX > obstacleX) ||
        (petLeftX < obstacleX + obstacle.width && petRightX > obstacleX + obstacle.width))
    ) {
      if (obstacle.isHole) {
        isHole.value = true
        obstacle.caught = true
        playAction('parkour-game-run-fall')
        return
      }
      obstacle.caught = true
      lives.value -= 1
      // transactionJudgment(item)
    }

    if (obstacle.offsetX + obstacle.width < 0) {
      obstacles.value.splice(index, 1)
    }
  })

  rewards.value.forEach(async (reward, index) => {
    if (currentGameStatus.value === 'playing' && !onlyPet.value) {
      reward.offsetX -= movement
    }

    await drawImage(reward.src, reward.offsetX, reward.offsetY, reward.width, reward.height)
    if (process.env.NODE_ENV === 'development') {
      // 调试边框
      c.strokeStyle = 'blue'
      c.lineWidth = 2
      c.strokeRect(reward.offsetX, reward.offsetY, reward.width, reward.height)
    }

    if (
      !reward.caught &&
      petVal.x + blankSize.left < reward.offsetX + reward.width &&
      petVal.x + petVal.width - blankSize.right > reward.offsetX &&
      petVal.y + blankSize.top < reward.offsetY + reward.height &&
      petVal.y + petVal.height - blankSize.bottom > reward.offsetY
    ) {
      // 接到奖励
      reward.caught = true
      score.value += reward.score
      emit('update:score', score.value)
      rewards.value.splice(index, 1)
    }

    if (reward.offsetX + 50 < 0 && !reward.caught) {
      rewards.value.splice(index, 1)
    }
  })
  if (ifDrawPet.value) {
    await drawPet(petVal)
  }

  // const now = performance.now()
  // scoreTexts.value = scoreTexts.value.filter((st) => now - st.born < st.life)
  // for (const st of scoreTexts.value) {
  //   const age = now - st.born
  //   const alpha = Math.max(0, 1 - age / st.life) // 1→0
  //   c.save()
  //   c.globalAlpha = alpha
  //   c.font = 'normal 30px sans-serif'
  //   c.fillStyle = '#0D0D0D'
  //   c.textAlign = 'left'
  //   c.fillText(st.text, st.x, st.y - age / 20)
  //   c.restore()
  // }
  // 游戏结束判断
  if (
    lives.value <= 0 &&
    currentGameStatus.value !== 'gameOver' &&
    currentGameStatus.value !== 'died' &&
    currentGameStatus.value !== 'ended'
  ) {
    gameDied()
  }
  if (currentGameStatus.value === 'ended') {
    return
  }
  animationId = requestAnimationFrame(gameLoop)
}

async function initAnimate() {
  const { meta } = await getActionData(petId.value, basePath)
  animateMeta.value = meta
  return animateMeta.value
}

async function preheat() {
  const meta = await initAnimate()
  for (const action of actionLoop) {
    const actionData = meta[action]
    if (actionData && actionData.frameCount) {
      for (let i = 0; i < actionData.frameCount; i++) {
        const frameSrc = `pet://0.0.0.0${basePath}/pets/${petId.value}/actions?petId=${petId.value}&action=${actionData.name}&frame=Frame_${i}.png`
        await getCachedImage(frameSrc)
      }
    }
  }
}

const clearGameData = () => {
  ifDrawPet.value = true
  k = 1
  g = 1300 * k * k
  svy = -700 * k
  vy = 0
  vx = 300 * k
  timer = null
  pastTime = 0
  generateV = 4000 / k
  obstacles.value = []
  rewards.value = []
  score.value = 0
  lives.value = 1
  pet.value.y = sPetY
  isHole.value = false
  jumpStatus = null
  jumpCount = 0
}
const startGame = () => {
  clearGameData()
  updateGameStatus('start')
  playAction('parkour-game-start')
}

const pauseGame = () => {
  updateGameStatus('paused')
}

const resumeGame = () => {
  if (currentGameStatus.value === 'paused') {
    updateGameStatus('playing')
  }
}

const restartGame = () => {
  clearGameData()
  updateGameStatus('start')
  playAction('parkour-game-start')
}

// 结束游戏
const gameDied = () => {
  playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.GameOver}`)
  updateGameStatus('died')
  playAction('parkour-game-died')

  emit('game-died', score.value)
}

const gameOver = () => {}

const close = () => {
  if (ifDrawPet.value === false) {
    updateGameStatus('ended')
    emit('close')
    return
  }
  if (currentGameStatus.value === 'paused') {
    onlyPet.value = true
    updateGameStatus('playing')
  }
  playAction('game-end')
}

const currentStatus = () => {
  return currentGameStatus.value
}

function jumpBySpace(e) {
  if (currentGameStatus.value !== 'playing') return
  if (e.code !== 'Space') return
  if (jumpCount < 2) {
    playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.Jump}`)
    jumpStatus = 'up'
    vy = svy
    jumpCount += 1
    if (isHole.value) {
      isHole.value = false
    }
    if (jumpCount === 1) playAction('parkour-game-first-jump')
    else playAction('parkour-game-second-jump')
  }
}

function jumpByMouse() {
  if (currentGameStatus.value !== 'playing') return
  if (jumpCount < 2) {
    playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.Jump}`)
    jumpStatus = 'up'
    vy = svy
    jumpCount += 1
    if (isHole.value) {
      isHole.value = false
    }
    if (jumpCount === 1) playAction('parkour-game-first-jump')
    else playAction('parkour-game-second-jump')
  }
}

const clear = () => {
  stopBgm()
  for (const audioFile of Object.values(audioLoop)) {
    clearAudioFromCache(`audio://0.0.0.0${basePath}/audios/${audioFile}`)
  }
}

// 组件挂载后初始化
onMounted(async () => {
  initCanvas()
  // 现在 animateMeta.value 已经初始化
  nextTick(() => {
    playAction('emerge-from-the-ground')

    playBgm(`audio://0.0.0.0${basePath}/audios/${audioLoop.BGM}`)
    frameDuration.value = 125
    gameLoop()
    canvas.value?.focus()
  })
  await preheat() // 等待预加载完成
  window.addEventListener('keydown', jumpBySpace)
  window.addEventListener('mousedown', jumpByMouse)
  const c = Math.ceil(window.innerWidth / 2560) + 1
  for (let i = 0; i < c; i++) {
    groundList.value.push({
      x: i * 2560,
      y: canvasHeight - 44,
      width: 2560,
      height: 44,
      src: Ground
    })
    backgroundList.value.push({
      x: i * 2560,
      y: canvasHeight - 340,
      width: 2560,
      height: 340,
      src: BackgroundImg
    })
  }
})

// 清理资源
onBeforeUnmount(() => {
  clear()
  // scoreTexts.value = []
  if (obstacleSpawnIntervalId) {
    clearInterval(obstacleSpawnIntervalId)
    obstacleSpawnIntervalId = null
  }
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  window.removeEventListener('keydown', jumpBySpace)
  window.removeEventListener('mousedown', jumpByMouse)
})

defineExpose({
  startGame,
  pauseGame,
  resumeGame,
  restartGame,
  currentStatus,
  close
})
</script>

<style scoped lang="scss">
.game-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: transparent;

  canvas {
    width: 100%;
    height: 100%;
  }

  .ground-img {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    height: auto;
  }
}
</style>
