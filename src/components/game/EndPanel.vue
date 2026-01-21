<template>
  <div class="end-panel-container">
    <base-img :src="currentPetImg" class="pet-img"></base-img>
    <div class="score-panel">
      <p class="score-label">得分</p>
      <p class="score-label">{{ getPoints }}</p>
      <p class="high-score-label" v-if="lastHighPoints !== undefined">
        历史最高分：{{ lastHighPoints }}
      </p>
    </div>
    <div class="button-group" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <button class="home-button" @click="emit('goHome')"></button>
      <button class="ranking-button" @click="emit('showRanking')"></button>
      <button class="restart-button" @click="emit('restartGame')"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseImg from '@renderer/components/base/BaseImg.vue'
import Celebrate from '@renderer/assets/app/img/png/game/Celebrate.png'
import { ref } from 'vue'
import { onMouseEnter, onMouseLeave } from '@renderer/utils/mouse'

interface Props {
  getPoints: number
  lastHighPoints?: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'restartGame'): void
  (e: 'goHome'): void
  (e: 'showRanking'): void
}>()

const currentPetImg = ref<string>(Celebrate)
</script>

<style scoped lang="scss">
.end-panel-container {
  background-color: transparent;
  width: 525px;
  height: 750px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .pet-img {
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translateX(-50%);
  }

  .score-panel {
    background-image: url('../../assets/app/img/png/game/EndPanel.png');
    background-repeat: no-repeat;
    margin-top: 300px;
    width: 100%;
    height: 300px;
    text-align: center;
    color: #ffffff;
    font-size: 70px;
    z-index: 2;
    font-family: 'ZiKuJiangHu GuoFeng', sans-serif;
    padding-top: 40px;

    .score-label,
    .high-score-label {
      display: block;
    }

    .high-score-label {
      font-size: 40px;
    }
  }

  .button-group {
    width: 100%;
    display: flex;
    justify-content: space-around;
    z-index: 2;

    .home-button,
    .ranking-button,
    .restart-button {
      width: 125px;
      height: 125px;
      border: none;
      border-radius: 35px;
      background-color: transparent;
      cursor: pointer;
      background-repeat: no-repeat;
    }

    .home-button {
      background-image: url('../../assets/app/img/png/game/HomeButton.svg');
    }

    .ranking-button {
      background-image: url('../../assets/app/img/png/game/RankingButton.svg');
    }

    .restart-button {
      background-image: url('../../assets/app/img/png/game/RestartButton.svg');
    }
  }
}
</style>
