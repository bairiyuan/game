<!-- App.vue -->
<script setup lang="ts">
import GameStatus from '../components/GameStatus.vue'

// 定义GameItem类型
interface GameItem {
  name: string
  label: string
  iconUrl: string
  description: string
  callback?: () => void
}

// 定义尺寸类型
interface Size {
  width: number
  height: number
}

// 处理游戏项点击事件
const handleGameItemClick = (item: GameItem) => {
  console.log('父组件接收到游戏点击事件:', item)

  // 根据游戏类型传递不同参数到主进程
  const gameParams: Record<string, any> = {
    game: item.label.toLowerCase(), // parkour 或 fishing
    title: item.name,
    timestamp: Date.now()
  };

  // 通知主进程创建游戏窗口
  window.api.windowControls.showGameWindow(gameParams);
  console.log(`已请求打开 ${item.name} 游戏窗口`);
}


// 处理组件尺寸变化
const handleResize = (size: Size) => {
  console.log('GameStatus组件尺寸变化:', size)
}
</script>

<template>
  <div class="app-container">
    <h1>游戏模块窗口</h1>
    
    <!-- 游戏状态组件 -->
    <GameStatus 
      :visible="true"
      @item-click="handleGameItemClick"
      @resize="handleResize"
    />
    
    <!-- 其他内容区域 -->
    <div class="info-section">
      <h2>游戏说明</h2>
      <p>这是一个独立的游戏模块窗口，用于测试游戏模块的内容</p>
      <ul>
        <li>跑酷 - 控制宠物进行跑酷挑战</li>
        <li>钓鱼 - 和宠物一起钓鱼</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.controls {
  text-align: center;
  margin-bottom: 20px;
}

.controls button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.controls button:hover {
  background-color: #45a049;
}

.info-section {
  margin-top: 40px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.info-section h2 {
  color: #333;
  margin-bottom: 15px;
}

.info-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.info-section ul {
  list-style-type: none;
  padding-left: 0;
}

.info-section li {
  padding: 8px 0;
  color: #555;
  position: relative;
  padding-left: 25px;
}

.info-section li:before {
  content: "🎮";
  position: absolute;
  left: 0;
}
</style>