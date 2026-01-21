<template>
  <div class="mask" @click="closeByMask" v-if="modelVisible && mask"></div>
  <div class="model-container" v-if="modelVisible">
    <div class="draggable" v-if="draggable"></div>
    <button class="control-button close-button" @click="close" title="关闭">
      <!-- 关闭图标：X形状 -->
      <svg width="20px" height="20px" viewBox="0 0 12 12">
        <path
          d="M2 2L10 10M10 2L2 10"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
    <base-text size="24px" color="white" v-if="title" class="model-title">
      {{ title }}
    </base-text>
    <base-card :width="width" :height="height" :background="background" round="20px" padding="40px">
      <div class="model-main-container">
        <slot></slot>
      </div>
    </base-card>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '@components/base/BaseCard.vue'
import BaseText from '@components/base/BaseText.vue'

interface Props {
  width?: string
  height?: string
  modelVisible: boolean
  title?: string
  canClose?: boolean
  mask?: boolean
  background?: string
  draggable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '400px',
  height: '400px',
  canClose: true,
  mask: true,
  background: 'rgba(51,51,51,0.95)'
})

const emit = defineEmits<{
  (e: 'update:modelVisible', value: boolean): void
  (e: 'close'): void
}>()

const closeByMask = () => {
  if (props.canClose) {
    console.log('close')
    emit('update:modelVisible', false)
    emit('close')
  }
}

const close = () => {
  console.log('close')
  emit('update:modelVisible', false)
  emit('close')
}
</script>

<style scoped>
.mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 999;
  opacity: 0;
}

.draggable {
  -webkit-app-region: drag;
  position: absolute;
  width: 100%;
  height: 80px;
  top: 0;
  left: 0;
  z-index: 1001;
}
.model-container {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: transparent;
  /* opacity: 0.8; */
  z-index: 1000;
}

.model-main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 40px 0 0 0;
}

.model-title {
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
}

.control-button {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1002;
  -webkit-app-region: no-drag;
}

.control-button:hover {
  background: rgba(0, 0, 0, 0.2);
}

.close-button:hover {
  background: rgba(220, 53, 69, 0.8);
  color: #dc3545;
}
</style>
