<template>
  <div class="exit-panel-container">
    <base-img :src="currentPetImg" class="pet-img"></base-img>
    <div class="content-panel">
      <p>直接退出将不保存本次成绩，是否退出？</p>
    </div>
    <div class="button-group" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <button class="cancel-button" @click="emit('exitCancel')">取消</button>
      <button class="confirm-button" @click="emit('exitConfirm')">确认退出</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseImg from '@renderer/components/base/BaseImg.vue'
import Listen from '@renderer/assets/app/img/png/game/Listen.png'
import { ref } from 'vue'
import { onMouseEnter, onMouseLeave } from '@renderer/utils/mouse'
const emit = defineEmits<{
  (e: 'exitConfirm'): void
  (e: 'exitCancel'): void
}>()

const currentPetImg = ref<string>(Listen)
</script>

<style scoped lang="scss">
.exit-panel-container {
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

  .content-panel {
    background-image: url('../../assets/app/img/png/game/EndPanel.png');
    background-repeat: no-repeat;
    margin-top: 200px;
    width: 100%;
    height: 300px;
    text-align: center;
    color: #ffffff;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    p {
      font-size: 40px;
      text-align: center;
      margin: 0 auto;
    }
  }

  .button-group {
    width: 100%;
    display: flex;
    justify-content: space-around;
    z-index: 2;

    .cancel-button,
    .confirm-button {
      width: 172px;
      height: 56px;
      border: none;
      border-radius: 28px;
      cursor: pointer;
      text-align: center;
      color: #8e4416;
      box-shadow: 2px 2px 4px #8e4416;
      font-size: 32px;
    }

    .cancel-button {
      background-color: #fdce92;
    }

    .confirm-button {
      background-color: #ed9e39;
    }
  }
}
</style>
