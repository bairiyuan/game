<template>
  <div class="game-view-container">
    <div class="game-btn">
      <button
        @click="handleShowExit"
        class="close-button"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      ></button>
      <div class="score-panel">
        <span>积分</span>
        <span>{{ score }}</span>
      </div>
      <button class="rule-btn" @click="handleShowRule"></button>
      <button class="pause-btn" v-if="currentGameStatus === 'playing'" @click="pauseGame"></button>
      <button
        class="start-btn"
        v-if="currentGameStatus === 'beforeStart'"
        @click="currentGameRef?.startGame()"
      ></button>
      <p class="opt-notice" v-if="currentGameStatus === 'beforeStart'">
        {{ optNoticeMap[currentGame] }}
      </p>
    </div>

    <component
      ref="currentGameRef"
      :is="currentGameComponent"
      @close="handleClose"
      @update:score="score = $event"
      @game-died="gameDied"
    ></component>
    <popup ref="popupRef">
      <component
        :is="currentPopup"
        :get-points="score"
        :last-high-points="lastPoints"
        :history-high-points="selfRank.points"
        :rank="selfRank.rank"
        :game="currentGame"
        :rule-content="gameRuleMap[currentGame]"
        @close-rule-panel="resumeGame"
        @pause-panel-close="resumeGame"
        @show-ranking="handleShowRanking"
        @close-ranking="handleCloseRanking"
        @resume-game="resumeGame"
        @go-home="goHome"
        @restart-game="restartGame"
        @exit-confirm="handleConfirmExitGame"
        @exit-cancel="handleCancelExitGame"
      ></component>
    </popup>
  </div>
</template>

<script setup lang="ts">
import CatchFood from '@renderer/components/game/catchFood/CatchFood.vue'
import Parkour from '@renderer/components/game/parkour/Parkour.vue'
import MonsterShooter from '@renderer/components/game/monsterShooter/MonsterShooter.vue'
import PausePanel from '@renderer/components/game/PausePanel.vue'
import EndPanel from '@renderer/components/game/EndPanel.vue'
import Ranking from '@renderer/components/game/Ranking.vue'
import RulePanel from '@renderer/components/game/RulePanel.vue'
import ExitPanel from '@renderer/components/game/ExitPanel.vue'
import Popup from '@renderer/components/common/Popup.vue'

import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { watch } from 'vue'
import { onMouseEnter, onMouseLeave } from '@renderer/utils/mouse'
import { useGameService } from '@renderer/service/game/gameService'
// import { useTaskStore } from '@renderer/store/task/taskStore'
// import { useTaskService } from '@renderer/service/task/task'
// const taskStore = useTaskStore()
// const taskService = useTaskService()
const gameService = useGameService()
type Panel =
  | typeof PausePanel
  | typeof EndPanel
  | typeof Ranking
  | typeof RulePanel
  | typeof ExitPanel
type Game =  typeof CatchFood | typeof Parkour | typeof MonsterShooter
const route = useRoute()
const catchFoodRef = ref<InstanceType<typeof CatchFood> | null>(null)
const parkourRef = ref<InstanceType<typeof Parkour> | null>(null)
const monsterShooterRef = ref<InstanceType<typeof MonsterShooter> | null>(null)
const currentGame = ref<string>('')
let gameRuleMap: Record<string, string> = {}
gameRuleMap = {
    catchfood:
    ' 鼠标左右移动控制宠物行动方向，接到食物增加积分。接到炸弹等其他物品立刻结束游戏。\n游戏开始时，食物从界面顶部随机位置下落。随着游戏时间增加，下落速度会逐渐加快，物体出现频率提升。',
    parkour:
    ' 操控桌宠自动前进，通过鼠标左键或者空格控制其跳跃，收集食物与金币，触碰障碍则游戏终止。\n游戏开始后，障碍、食物、金币从前方随机生成并靠近;随着距离增加，移动速度与障碍密度逐步提升。',
    monstershooter:
    ' 拖动桌宠左右移动，自动射击上方掉落的怪兽。怪兽分为小、中、大三种，击败可得分。\n怪兽碰到桌宠则游戏结束。随着时间推移，怪兽下落速度和生成频率会逐渐增加。'
}
let optNoticeMap: Record<string, string> = {}
optNoticeMap = {
  catchfood:'操作鼠标左右移动接食物',
  parkour: '通过鼠标左键或者空格键跳跃',
  monstershooter: '拖动鼠标控制移动，自动射击'
}
const currentGameComponent = ref<typeof CatchFood | typeof Parkour | typeof MonsterShooter | null>(null)
const currentGameRef = ref<InstanceType<Game> | null>(null)
const currentGameStatus = computed(() => {
  return currentGameRef.value?.currentStatus() || 'beforeStart'
})
const selfRank = ref<{ rank: number; points: number }>({
  rank: 0,
  points: 0
})
const lastPoints = ref(0)
const score = ref(0)
const popupRef = ref<InstanceType<typeof Popup> | null>(null)

let lastPopup: Panel | null = null
const currentPopup = ref<Panel | null>(null)
const showPanel = ref(false)

watch(
  () => currentPopup.value,
  (newVal, oldVal) => {
    lastPopup = oldVal
    if (newVal) {
      popupRef.value?.showWithMask()
    } else {
      popupRef.value?.hide()
    }
  }
)

const handleClose = () => {
  currentGameComponent.value = null

  window.api.windowControls.closeGameWindow()
}

const handleMouseEnter = () => {
  if (!showPanel.value) return
  onMouseEnter()
}

const handleMouseLeave = () => {
  if (!showPanel.value) return
  onMouseLeave()
}

const handleShowExit = () => {
  if (['beforeStart', 'died', 'ended', 'gameOver'].includes(currentGameStatus.value)) {
    currentGameRef.value?.close()
    return
  }
  if (currentGameStatus.value === 'playing') {
    currentGameRef.value?.pauseGame()
  }
  lastPopup = currentPopup.value
  popupRef.value?.show()
  currentPopup.value = ExitPanel
}

const handleConfirmExitGame = () => {
  currentGameRef.value?.close()
}

const handleCancelExitGame = () => {
  if (currentGameStatus.value === 'paused') {
    currentGameRef.value?.resumeGame()
  }
  handleClosePanel()
}

const handleClosePanel = () => {
  popupRef.value?.hide()
  showPanel.value = false
  currentPopup.value = null
  window.api.windowControls.setWindowIgnoreMouseToggle(false)
}

const handleShowRanking = () => {
  lastPopup = currentPopup.value
  popupRef.value?.show()
  currentPopup.value = Ranking
}

const handleShowRule = () => {
  if (currentGameStatus.value === 'playing') {
    currentGameRef.value?.pauseGame()
  }
  popupRef.value?.show()
  currentPopup.value = RulePanel
  window.api.windowControls.setWindowIgnoreMouseToggle(true)
  showPanel.value = true
}

const handleCloseRanking = () => {
  if (!lastPopup) {
    popupRef.value?.hide()
    currentPopup.value = null
    lastPopup = null
    window.api.windowControls.setWindowIgnoreMouseToggle(false)
    return
  }
  if (lastPopup === EndPanel) {
    popupRef.value?.showWithMask()
  } else {
    popupRef.value?.show()
  }
  currentPopup.value = lastPopup
}

const pauseGame = () => {
  currentGameRef.value?.pauseGame()
  currentPopup.value = PausePanel
  popupRef.value?.show()
  window.api.windowControls.setWindowIgnoreMouseToggle(true)
  showPanel.value = true
}

const resumeGame = () => {
  currentGameRef.value?.resumeGame()
  handleClosePanel()
}

const restartGame = () => {
  score.value = 0
  currentGameRef.value?.restartGame()
  handleClosePanel()
  lastPoints.value = selfRank.value.points
}

// 结束游戏
const gameDied = (score: number) => {
  popupRef.value?.showWithMask()
  currentPopup.value = EndPanel
  showPanel.value = true
  window.api.windowControls.setWindowIgnoreMouseToggle(true)
  // taskStore.addTaskProgressByCode(
  //   [
  //     { type: 'daily', taskCode: 'game_complete_once' },
  //     { type: 'weekly', taskCode: 'game_complete_10' }
  //   ],
  //   taskService
  // )
  if (score > selfRank.value.points) {
    // return
    gameService.submitScore(score, currentGame.value).then((res) => {
      if (!res.success) return
      selfRank.value = res.data.self || {
        rank: 0,
        points: 0
      }
    })
  }
}

const goHome = () => {
  currentGameRef.value?.close()
}
const getData = async (gameName: string) => {
  const res = await gameService.getRankList(1, 0, gameName)
  if (!res.success) {
    return
  }
  selfRank.value = res.data.self || {
    rank: 0,
    points: 0
  }
  lastPoints.value = res.data.self?.points || 0
}
onMounted(() => {
  const query = route.query
  if (query.game && typeof query.game === 'string') {
    // 可以根据 query 参数动态加载不同的游戏组件
    // 这里只是一个示例，实际应用中可能需要更多的逻辑
    if (query.game === 'catchfood') {
      currentGameComponent.value = CatchFood
      currentGameRef.value = catchFoodRef.value
    } else if (query.game === 'parkour') {
      currentGameComponent.value = Parkour
      currentGameRef.value = parkourRef.value
    } else if (query.game === 'monstershooter') {
      currentGameComponent.value = MonsterShooter
      currentGameRef.value = monsterShooterRef.value
    } else {
      currentGameComponent.value = null
    }
    // 可以添加更多游戏的条件判断
    currentGame.value = query.game
  }
  getData(currentGame.value)
})
</script>

<style lang="scss" scoped>
.game-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  position: relative;
  .game-btn {
    background-color: transparent;
    button {
      border: none;
      background-color: transparent;
      cursor: pointer;
      outline: none;
    }

    .close-button {
      position: absolute;
      width: 100px;
      height: 100px;
      background-image: url('../../assets/app/img/png/game/CloseButton.svg');
      top: 20px;
      right: 20px;
      z-index: 1001;
      color: white;
      border: none;
      cursor: pointer;
    }

    .score-panel {
      position: absolute;
      background-image: url('../../assets/app/img/png/game/ScorePanelBackGround.png');
      background-repeat: no-repeat;
      top: 20px;
      left: 20px;
      width: 230px;
      height: 100px;
      display: flex;
      align-items: center;
      font-size: 30px;

      & > :nth-child(1) {
        margin-left: 25px;
        color: white;
      }

      & > :nth-child(2) {
        margin-top: 5px;
        margin-left: 25px;
        color: black;
      }
    }

    .rule-btn {
      position: absolute;
      background-image: url('../../assets/app/img/png/game/RuleButton.svg');
      background-repeat: no-repeat;
      top: 150px;
      left: 20px;
      width: 100px;
      height: 100px;
    }

    .pause-btn {
      position: absolute;
      background-image: url('../../assets/app/img/png/game/PauseButton.svg');
      background-repeat: no-repeat;
      top: 150px;
      right: 20px;
      width: 100px;
      height: 100px;
    }

    .continue-btn {
      position: absolute;
      background-repeat: no-repeat;
      width: 300px;
      height: 165px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
    }

    .start-btn {
      position: absolute;
      background-image: url('../../assets/app/img/png/game/StartButton.png');
      background-repeat: no-repeat;
      width: 300px;
      height: 165px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
    }
    .opt-notice {
      position: absolute;
      top: 62%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      color: rgb(0, 0, 0);
    }
  }
}
</style>
