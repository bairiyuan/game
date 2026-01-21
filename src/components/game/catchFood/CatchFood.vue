<template>
  <div class="game-container">
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown.left="handleLeftDown"
      tabindex="0"
      style="display: block; margin: 0 auto; outline: none"
    ></canvas>

    <div class="game-content">
      <base-img :src="Ground" class="ground-img"></base-img>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RewardCode } from '@renderer/types/reward'
import { getRandomWhiteIconCode, getWhiteIcon } from '@renderer/utils/giftSrc'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Boom from '@assets/app/img/png/game/Boom.png'
import Trash from '@assets/app/img/png/game/Trash.png'
import Stone from '@assets/app/img/png/game/Stone.png'
import Ground from '@assets/app/img/png/game/Ground.png'
import { ActionMetadata, getActionData } from '@renderer/constants/action'
import { usePetStore } from '@renderer/store/pet/petStore'
import BaseImg from '@renderer/components/base/BaseImg.vue'
import { clearAudioFromCache, playAudio, playBgm, stopBgm } from '@renderer/utils/audio'
const petStore = usePetStore()
const petId = ref(petStore.id)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'pause'): void
  (e: 'resume'): void
  (e: 'restart'): void
  (e: 'game-died', points: number): void
  (e: 'game-over', points: number): void
  (e: 'update:score', points: number): void
}>()

type ItemCode = RewardCode | 'boom' | 'trash' | 'stone'
type ItemType = 0 | 1 | 2 | 3 | 4 | 5
type GameStatus = 'beforeStart' | 'start' | 'playing' | 'died' | 'paused' | 'gameOver' | 'ended'
type ActionName =
  | 'emerge-from-the-ground'
  | 'catchfood-game-start'
  | 'catchfood-game-move-left'
  | 'catchfood-game-move-right'
  | 'game-standby'
  | 'catchfood-game-pause-left'
  | 'catchfood-game-pause-right'
  | 'catchfood-game-died-left'
  | 'catchfood-game-died-right'
  | 'game-end'
interface Item {
  x: number
  y: number
  width: number
  height: number
  score: number
  caught: boolean
  code: ItemCode
  type: ItemType
}

interface Pet {
  x: number
  y: number
  width: number
  height: number
  speed: number
  frameIndex: number
  actionName: ActionName
  direction: number
}

interface DifficultySetting {
  itemMaxNum: number
  generateSpeed: number
  itemWeight: number[]
}

let pastTime = 0
let timer: NodeJS.Timeout | null = null

const basePath = '/dlcs/catchfood'

// 画布尺寸
const canvasWidth = window.innerWidth
const canvasHeight = window.innerHeight

// 游戏状态
const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
let dpr = window.devicePixelRatio || 1
const petSize = 200
const blankSize = 50
const actionLoop: ActionName[] = [
  'emerge-from-the-ground',
  'catchfood-game-start',
  'catchfood-game-move-left',
  'catchfood-game-move-right',
  'game-standby',
  'catchfood-game-pause-left',
  'catchfood-game-pause-right',
  'catchfood-game-died-left',
  'catchfood-game-died-right',
  'game-end'
]

const audioLoop = {
  BGM: 'catchfood-bgm.techybuddy',
  GetFood: 'catchfood-get-food.techybuddy',
  GameOver: 'game-over.techybuddy'
}
const pet = ref<Pet>({
  x: canvasWidth / 2 - petSize / 2,
  y: canvasHeight - petSize - 44 + blankSize,
  width: petSize,
  height: petSize,
  speed: 8,
  frameIndex: 0,
  actionName: 'game-standby',
  direction: 0
})

let currentActionCallback: (() => void) | null = null

const items = ref<Item[]>([])
const itemWidth = 70
const scoreValues = [10, 20, 30]
const animateMeta = ref<Map<string, ActionMetadata>>()
let itemMap = new Map<ItemType, number>()

let difficulty = 0

const difficultySettings: DifficultySetting[] = [
  {
    itemMaxNum: 30,
    generateSpeed: 1000,
    itemWeight: [16, 40, 24, 10, 10, 0]
  },
  {
    itemMaxNum: 50,
    generateSpeed: 800,
    itemWeight: [14, 35, 21, 15, 15, 0]
  },
  {
    itemMaxNum: 70,
    generateSpeed: 600,
    itemWeight: [13, 32.5, 19.5, 15, 20, 0]
  },
  {
    itemMaxNum: 90,
    generateSpeed: 500,
    itemWeight: [12, 30, 18, 15, 15, 10]
  },
  {
    itemMaxNum: 120,
    generateSpeed: 400,
    itemWeight: [10, 25, 15, 20, 20, 10]
  },
  {
    itemMaxNum: 150,
    generateSpeed: 300,
    itemWeight: [8, 20, 12, 20, 20, 20]
  }
]
// 物品占比
let itemWeight = difficultySettings[difficulty].itemWeight
// 下落速度
let itemSpeed = 300
// 最大物品数
let itemMaxNum = difficultySettings[difficulty].itemMaxNum
// 生成速度（毫秒）
let generateSpeed = difficultySettings[difficulty].generateSpeed
let foodSpawnTimer: NodeJS.Timeout | null = null

let petX: number | null = null
let direction = 0 // -1 左 1 右 0 静止

const currentGameStatus = ref<GameStatus>('beforeStart')
const onlyPet = ref<boolean>(false)

const score = ref(0)
const lives = ref(1)

let animationId: number | null = null
let looping = false

const imageCache = new Map<string, HTMLImageElement>()

function getItemIcon(code: ItemCode): string {
  if (code === 'boom') {
    return Boom
  } else if (code === 'trash') {
    return Trash
  } else if (code === 'stone') {
    return Stone
  } else {
    return getWhiteIcon(code)
  }
}

// function getItemColor(code: ItemCode): string {
//   if (code === 'boom') {
//     return '#FF4500'
//   } else if (code === 'trash') {
//     return '#808080'
//   } else if (code === 'stone') {
//     return '#A9A9A9'
//   } else {
//     return codeToColor(code)
//   }
// }

function updateItemMap(type: ItemType, increment: number = 1) {
  if (itemMap.has(type)) {
    itemMap.set(type, itemMap.get(type)! + increment)
  } else {
    if (increment < 0) return
    itemMap.set(type, increment)
  }
}

function getItemCount(type: ItemType): number {
  return itemMap.get(type) || 0
}

function getNotFullType(): ItemType[] {
  let notFullTypeList = [] as ItemType[]
  for (let i = 0; i < itemWeight.length; i++) {
    const currentCount = getItemCount(i as ItemType)
    if (currentCount < (itemWeight[i] / 100) * itemMaxNum) {
      notFullTypeList.push(i as ItemType)
    }
  }
  return notFullTypeList
}
// 得分飘字
interface ScoreText {
  text: string
  x: number
  y: number
  born: number // 创建时 performance.now()
  life: number // 存活时长 ms
}
const scoreTexts = ref<ScoreText[]>([])
function transactionJudgment(item: Item): void {
  if (item.code === 'boom' || item.code === 'trash' || item.code === 'stone') {
    // 游戏结束
    lives.value -= 1
  } else {
    // 普通食物，加分
    playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.GetFood}`)
    score.value += item.score
    emit('update:score', score.value)

    scoreTexts.value.push({
      text: `+${item.score}`,
      x: pet.value.x + pet.value.width / 2, // 宠物中心
      y: pet.value.y + 50, // 头顶一点
      born: performance.now(),
      life: 3000
    })
  }
}

function timeKill() {
  timer = setInterval(() => {
    pastTime += 1
    let newDifficulty = difficulty
    if (pastTime > 30 && pastTime <= 60) {
      newDifficulty = 1
    } else if (pastTime > 60 && pastTime <= 120) {
      newDifficulty = 2
    } else if (pastTime > 120 && pastTime <= 180) {
      newDifficulty = 3
    } else if (pastTime > 180 && pastTime <= 300) {
      newDifficulty = 4
    } else if (pastTime > 300) {
      newDifficulty = 5
    }

    if (newDifficulty !== difficulty) {
      difficulty = newDifficulty
      itemWeight = difficultySettings[difficulty].itemWeight
      itemMaxNum = difficultySettings[difficulty].itemMaxNum
      generateSpeed = difficultySettings[difficulty].generateSpeed
      if (foodSpawnTimer) {
        clearInterval(foodSpawnTimer)
        foodSpawnTimer = null
      }
      startItemSpawn()
    }
  }, 1000)
}

const updateGameStatus = (status: GameStatus) => {
  if (status === currentGameStatus.value) return
  lastTimeItemFrame = new Date().getTime()
  lastTimePetFrame = new Date().getTime()
  if (status === 'paused') {
    // 暂停游戏逻辑
    if (foodSpawnTimer) {
      clearInterval(foodSpawnTimer)
      foodSpawnTimer = null
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
    startItemSpawn()
    timeKill()
    if (!looping) {
      gameLoop()
      looping = true
    }
  } else if (status === 'gameOver') {
    // 游戏结束逻辑
    if (foodSpawnTimer) {
      clearInterval(foodSpawnTimer)
      foodSpawnTimer = null
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

// 初始化画布
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

// 开始游戏循环
const startItemSpawn = () => {
  // 每 1.2 秒生成一个食物
  foodSpawnTimer = setInterval(() => {
    if (lives.value > 0 && items.value.length < itemMaxNum) {
      const notFullTypes = getNotFullType()
      if (notFullTypes.length === 0) return
      const randomIndex = Math.floor(Math.random() * notFullTypes.length)
      const selectedType = notFullTypes[randomIndex]
      updateItemMap(selectedType)
      if (selectedType >= 0 && selectedType <= 2) {
        // 生成普通食物
        const code = getRandomWhiteIconCode()
        items.value.push({
          x: Math.random() * (canvasWidth - itemWidth),
          y: -itemWidth,
          width: itemWidth,
          height: itemWidth,
          caught: false,
          score: scoreValues[selectedType],
          code: code,
          type: selectedType
        })
      } else if (selectedType === 3) {
        // 生成炸弹
        items.value.push({
          x: Math.random() * (canvasWidth - itemWidth),
          y: -itemWidth,
          width: itemWidth,
          height: itemWidth,
          caught: false,
          score: 0,
          code: 'trash',
          type: 3
        })
      } else if (selectedType === 4) {
        // 生成垃圾
        items.value.push({
          x: Math.random() * (canvasWidth - itemWidth),
          y: -itemWidth,
          width: itemWidth,
          height: itemWidth,
          caught: false,
          score: 0,
          code: 'boom',
          type: 4
        })
      } else if (selectedType === 5) {
        // 生成石头
        items.value.push({
          x: Math.random() * (canvasWidth - itemWidth),
          y: -itemWidth,
          width: itemWidth,
          height: itemWidth,
          caught: false,
          score: 0,
          code: 'stone',
          type: 5
        })
      }
    }
  }, generateSpeed)
}

let lastTimePetFrame = new Date().getTime()
let lastTimeItemFrame = new Date().getTime()
const accumulatedTime = ref(0)
const frameDuration = ref(0)
const drawPet = async (petVal: Pet) => {
  if (!ctx.value || !petVal) return

  if (petX !== null) {
    petVal.x =
      petX < -blankSize
        ? -blankSize
        : petX > canvasWidth - petVal.width + blankSize
          ? canvasWidth - petVal.width + blankSize
          : petX
  }
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

  const frameSrc = `pet://0.0.0.0${basePath}/pets/${petId.value}/actions?petId=${petId.value}&action=${petVal.actionName}&frame=Frame_${petVal.frameIndex}.png`
  await drawImage(frameSrc, petVal.x, petVal.y, petVal.width, petVal.height)
}

const playAction = (actionName: ActionName) => {
  if (pet.value.actionName === actionName) return
  pet.value.actionName = actionName
  pet.value.frameIndex = 0
  accumulatedTime.value = 0
  frameDuration.value = animateMeta.value?.[pet.value.actionName].interval || 100

  if (animateMeta.value?.[actionName].audio) {
    playAudio(
      `audio://0.0.0.0/dlcs/catchfood/pets/${petId.value}/audios/${animateMeta.value[actionName].audio}`
    )
  }

  switch (actionName) {
    case 'emerge-from-the-ground':
      currentActionCallback = () => {
        playAction('game-standby')
      }
      break
    case 'catchfood-game-start':
      currentActionCallback = () => {
        updateGameStatus('playing')
        playAction('catchfood-game-pause-left')
      }
      break
    case 'catchfood-game-died-left':
    case 'catchfood-game-died-right':
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

// 主循环
const gameLoop = async () => {
  const c = ctx.value
  if (!c) return
  const petVal = pet.value
  // 清屏
  c.clearRect(0, 0, canvasWidth, canvasHeight)
  await drawPet(petVal)
  const time = new Date().getTime()
  const delta = time - lastTimeItemFrame
  lastTimeItemFrame = time
  // 绘制并更新食物
  items.value.forEach(async (item, index) => {
    if (currentGameStatus.value === 'playing' && !onlyPet.value) {
      item.y += (itemSpeed * delta) / 1000
    }

    // 颜色区分
    // c.fillStyle = getItemColor(item.code)
    // c.beginPath()
    // c.arc(item.x + item.width / 2, item.y + item.width / 2, item.width / 2, 0, Math.PI * 2)
    // c.fill()

    await drawImage(getItemIcon(item.code), item.x, item.y, item.width, item.height)

    // 碰撞检测
    if (
      !item.caught &&
      petVal.x + blankSize < item.x + item.width &&
      petVal.x + petVal.width - blankSize > item.x &&
      petVal.y + blankSize < item.y + item.height &&
      petVal.y + petVal.height - blankSize > item.y
    ) {
      item.caught = true
      items.value.splice(index, 1)
      updateItemMap(item.type, -1)
      transactionJudgment(item)
    }

    // 超出底部，没接到
    if (item.y > canvasHeight && !item.caught) {
      updateItemMap(item.type, -1)
      items.value.splice(index, 1)
    }
  })
  const now = performance.now()
  scoreTexts.value = scoreTexts.value.filter((st) => now - st.born < st.life)
  for (const st of scoreTexts.value) {
    const age = now - st.born
    const alpha = Math.max(0, 1 - age / st.life) // 1→0
    c.save()
    c.globalAlpha = alpha
    c.font = 'normal 30px sans-serif'
    c.fillStyle = '#0D0D0D'
    c.textAlign = 'left'
    c.fillText(st.text, st.x, st.y - age / 20)
    c.restore()
  }
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

const handleLeftDown = (e: MouseEvent) => {
  if (currentGameStatus.value !== 'playing') return
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect || !pet.value || !ctx.value) return
  const x = e.clientX - rect.left
  const dprX = (e.clientX - rect.left) * dpr
  const dprY = (e.clientY - rect.top) * dpr

  const pixelData = ctx.value.getImageData(dprX, dprY, 1, 1).data

  if (pixelData[3] === 0) {
    return
  }
  if (x >= pet.value.x && x <= pet.value.x + pet.value.width) {
    const offsetX = x - pet.value.x
    let oldX = x
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (currentGameStatus.value !== 'playing') return
      const newMouseX = moveEvent.clientX - rect.left
      petX = newMouseX - offsetX
      if (!pet.value) return
      direction = newMouseX - oldX > 0 ? 1 : -1
      if (direction === 1) {
        playAction('catchfood-game-move-right')
        pet.value.direction = 1
      } else {
        playAction('catchfood-game-move-left')
        pet.value.direction = -1
      }
      oldX = newMouseX
    }
    const handleMouseUp = () => {
      if (currentGameStatus.value !== 'playing') {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        return
      }
      if (direction === 1) {
        playAction('catchfood-game-pause-right')
      } else {
        playAction('catchfood-game-pause-left')
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      direction = 0
      petX = null
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }
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
  items.value = []
  score.value = 0
  lives.value = 1
  pastTime = 0
  difficulty = 0
  itemWeight = difficultySettings[difficulty].itemWeight
  itemMaxNum = difficultySettings[difficulty].itemMaxNum
  generateSpeed = difficultySettings[difficulty].generateSpeed
  itemMap = new Map<ItemType, number>()
  pet.value.x = canvasWidth / 2 - petSize / 2
}
const startGame = () => {
  clearGameData()
  updateGameStatus('start')
  playAction('catchfood-game-start')
  console.log('catchfood')
}

const pauseGame = () => {
  if (direction === 1) {
    playAction('catchfood-game-pause-right')
  } else if (direction === -1) {
    playAction('catchfood-game-pause-left')
  }
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
  playAction('catchfood-game-start')
  console.log('catchfood')
}

// 结束游戏
const gameDied = () => {
  playAudio(`audio://0.0.0.0${basePath}/audios/${audioLoop.GameOver}`)
  if (foodSpawnTimer) {
    clearInterval(foodSpawnTimer)
    foodSpawnTimer = null
  }
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  updateGameStatus('died')
  if (direction === 1) {
    playAction('catchfood-game-died-right')
  } else {
    playAction('catchfood-game-died-left')
  }
  emit('game-died', score.value)
}

const gameOver = () => {}

const close = () => {
  if (currentGameStatus.value === 'paused') {
    onlyPet.value = true
    updateGameStatus('playing')
  }
  playAction('game-end')
}

const currentStatus = () => {
  return currentGameStatus.value
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

  nextTick(() => {
    // 打卡窗口即聚焦
    frameDuration.value = 125
    playAction('emerge-from-the-ground')
    playBgm(`audio://0.0.0.0${basePath}/audios/${audioLoop.BGM}`)
    gameLoop()
    canvas.value?.focus()
  })
  await preheat()
})

// 清理资源
onBeforeUnmount(() => {
  clear()
  scoreTexts.value = []
  if (foodSpawnTimer) {
    clearInterval(foodSpawnTimer)
    foodSpawnTimer = null
  }
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
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
