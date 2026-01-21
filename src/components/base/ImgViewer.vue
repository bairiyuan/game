<template>
  <div class="image-viewer-overlay" @click="close">
    <div class="image-viewer-container" ref="containerRef" @click.stop>
      <img
        :src="imageUrl"
        ref="imageRef"
        class="image-viewer-image"
        :style="{ transform: imageTransform }"
      />
      <div class="controls">
        <button @click="zoomOut">-</button>
        <button @click="zoomIn">+</button>
        <span class="zoom-percent">{{ zoom }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

defineProps<{
  imageUrl: string
}>()

const emit = defineEmits(['close'])

const zoom = ref(100)
// 动态计算 transform 样式
const imageTransform = computed(() => {
  return `scale(${zoom.value / 100})`
})

const zoomIn = () => {
  if (zoom.value < 300) {
    zoom.value += 10
  }
}

const zoomOut = () => {
  if (zoom.value > 50) {
    zoom.value -= 10
  }
}

// 滚轮缩放

const wheelHandler: EventListener = (e) => {
  if (e instanceof WheelEvent) {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }
}

const containerRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('wheel', wheelHandler, { passive: false })
  }
})

onBeforeUnmount(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('wheel', wheelHandler)
  }
})
const close = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: pointer;
}

.image-viewer-container {
  position: relative;
  width: 80%;
  max-width: 800px;
  height: 80%;
  max-height: 600px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  cursor: grab;
}
.image-viewer-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  display: block;
  margin: auto;
  transform-origin: center;
  transition: transform 0.2s ease;
}
.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  color: white;
  font-size: 14px;
}

.controls button {
  background: rgba(255, 255, 255, 0.7);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}
.zoom-percent {
  background-color: aquamarine;
}
</style>
