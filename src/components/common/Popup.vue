<template>
  <!-- 移除 Teleport，直接渲染 -->
  <template v-if="visible">
    <!-- 遮罩层 -->
    <div
      v-if="mask"
      class="mask"
      :class="{ transparent: transparentMask }"
      @click="handleMaskClick"
    ></div>

    <!-- 弹窗内容 -->
    <div ref="popupRef" class="popup-container" @click.stop>
      <slot></slot>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  mask?: boolean
  transparentMask?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mask: false,
  transparentMask: false
})

const visible = ref(false)
const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleMaskClick = () => {
  if (props.mask) {
    hide()
    emit('close')
  }
}

const showWithMask = () => {
  visible.value = true
}

const showWithMaskTransparent = () => {
  visible.value = true
}

const show = () => {
  visible.value = true
}

const hide = () => {
  visible.value = false
}

const isVisible = () => visible.value

defineExpose({
  show,
  showWithMask,
  showWithMaskTransparent,
  hide,
  isVisible
})
</script>

<style scoped lang="scss">
.popup-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: auto;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  pointer-events: auto;
}

.mask.transparent {
  background: transparent;
}
</style>