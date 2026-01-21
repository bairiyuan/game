<template>
  <div class="pause-panel-container" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <base-img :src="CloseButton" class="close-button" @click="emit('pausePanelClose')"></base-img>
    <button class="pause-button-1" @click="emit('restartGame')">新游戏</button>
    <button class="pause-button-2" @click="emit('showRanking')">排行榜</button>
    <button class="pause-button-1" @click="emit('resumeGame')">继续</button>
  </div>
</template>

<script setup lang="ts">
import BaseImg from '@renderer/components/base/BaseImg.vue'
import CloseButton from '@assets/app/img/svg/CloseButton/CloseButtonRed.svg'
import { onMouseEnter, onMouseLeave } from '@renderer/utils/mouse'

const emit = defineEmits<{
  (e: 'pausePanelClose'): void
  (e: 'restartGame'): void
  (e: 'showRanking'): void
  (e: 'resumeGame'): void
}>()
</script>

<style scoped lang="scss">
.pause-panel-container {
  background-image: url('../../assets/app/img/png/game/PausePanel.svg');
  background-repeat: no-repeat;
  width: 330px;
  height: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;

  .close-button {
    position: absolute;
    top: 0px;
    right: 0px;
    background-color: transparent;
    cursor: pointer;
  }

  .pause-button-1,
  .pause-button-2 {
    width: 220px;
    height: 80px;
    border: none;
    border-radius: 8px;
    font-size: 40px;
    color: white;
    cursor: pointer;
    background-repeat: no-repeat;
    background-color: transparent;
  }

  .pause-button-1 {
    background-image: url('../../assets/app/img/png/game/PausePanelButton1.svg');
  }

  .pause-button-2 {
    background-image: url('../../assets/app/img/png/game/PausePanelButton2.svg');
  }
}
</style>
