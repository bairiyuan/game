<!-- GameStatus.vue -->
<template>
  <div
    class="container"
    v-if="visible"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    id="game-container"
  >
    <!-- 左箭头 -->
    <img :src="ToLeftArrow" class="arrow-svg" @click="handleArrowClick(0)" />

    <!-- 游戏内容 -->
    <div class="content">
      <div class="item-container">
        <div class="item-grid" v-for="(item, index) in displayList" :key="index">
          <img
            :src="item.iconUrl"
            @click="handleClick(item)"
            class="item-img"
            width="70"
            height="70"
          />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- 右箭头 -->
    <img :src="ToRightArrow" class="arrow-svg" @click="handleArrowClick(1)" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ToLeftArrow from '../assets/app/img/svg/CloseButton/ToLeftArrow.svg'
import ToRightArrow from '../assets/app/img/svg/CloseButton/ToRightArrow.svg'
import ParkourIcon from '../assets/app/img/png/game/ParkourIcon.png'
import TakeFoodIcon from '@assets/app/img/png/game/TakeFoodIcon.png'

interface GameItem {
  name: string
  label: string
  iconUrl: string
  description: string
  callback?: () => void
}

// 组件props和emits
const props = defineProps<{
  visible?: boolean
}>()

const emit = defineEmits<{
  (e: 'itemClick', item: GameItem): void
  (e: 'resize', size: { width: number; height: number }): void
}>()

const visible = ref(props.visible || false)
const currentPage = ref(1)
const pageSize = ref(5)

const gameList = ref<GameItem[]>([
    {
    name: '接食物',
    label: 'CatchFood',
    iconUrl: TakeFoodIcon,
    description: '帮助宠物接食物小游戏',
    callback: () => {
      console.log('接食物游戏开始')
    }
  },
  {
    name: '跑酷',
    label: 'Parkour',
    iconUrl: ParkourIcon,
    description: '帮助宠物接食物小游戏',
    callback: () => {
      console.log('跑酷游戏开始')
    }
  },
  {
    name: '打小怪',
    label: 'monstershooter',
    iconUrl: ParkourIcon, // 暂时复用跑酷图标
    description: '控制桌宠左右移动射击小怪兽',
    callback: () => {
      console.log('打小怪游戏开始')
    }
  }
])

// 计算属性：计算总页数
const allPage = computed(() => {
  return Math.ceil(gameList.value.length / pageSize.value)
})

// 计算属性：当前页显示的游戏列表
const displayList = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  return gameList.value.slice(startIndex, startIndex + pageSize.value)
})

// 鼠标事件处理
const onMouseEnter = () => {
  console.log('鼠标进入游戏状态组件')
}

const onMouseLeave = () => {
  console.log('鼠标离开游戏状态组件')
}

// 箭头点击处理
const handleArrowClick = (direction: number) => {
  if (direction === 0) {
    // 左箭头
    if (currentPage.value > 1) {
      currentPage.value -= 1
    }
  } else if (direction === 1) {
    // 右箭头
    if (currentPage.value < allPage.value) {
      currentPage.value += 1
    }
  }
}

// 游戏项点击处理
const handleClick = (item: GameItem) => {
  console.log(`点击了游戏: ${item.name}`)
  emit('itemClick', item)
  
  if (item.callback) {
    item.callback()
  }
}

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal || true
    if (newVal) {
      currentPage.value = 1
    }
  }
)

// 暴露给父组件的方法
const show = () => {
  visible.value = true
}

const hide = () => {
  visible.value = false
}

const isVisible = () => {
  return visible.value
}

const size = (): { width: number; height: number } => {
  const el = document.getElementById('game-container')
  if (el) {
    return { width: el.offsetWidth, height: el.offsetHeight }
  }
  return { width: 0, height: 0 }
}

defineExpose({
  show,
  hide,
  isVisible,
  size
})
</script>

<style scoped lang="scss">
.container {
  width: auto;
  min-width: 520px;
  height: 130px;
  background: radial-gradient(circle at center, #afbdff, #d8e0ff);
  border-radius: 10px;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
}

.arrow-svg {
  cursor: pointer;
  width: 30px;
  height: 30px;
  margin: 0 10px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
}

.item-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  overflow: hidden;
  padding-bottom: 5px;
}

.item-grid {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 96px;
  height: 110px;
  position: relative;
  margin-top: 10px;
  
  .item-img {
    cursor: pointer;
    border-radius: 10px;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  span {
    margin-top: 8px;
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
}
</style>