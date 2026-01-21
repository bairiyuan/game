<template>
  <Teleport :to="teleportTo" v-if="teleportTo">
    <!-- 遮罩层（仅当 mask=true 且 visible=true 时渲染） -->
    <div
      v-if="mask && visible"
      class="mask"
      :class="{ transparent: transparentMask }"
      @click="handleMaskClick"
    ></div>

    <!-- 弹窗内容 -->
    <div v-if="visible" ref="popupRef" class="popup-container" @click.stop>
      <slot></slot>
    </div>
  </Teleport>
  <template v-else>
    <!-- 遮罩层（仅当 mask=true 且 visible=true 时渲染） -->
    <div
      v-if="mask && visible"
      class="mask"
      :class="{ transparent: transparentMask }"
      @click="handleMaskClick"
    ></div>

    <!-- 弹窗内容 -->
    <div v-if="visible" ref="popupRef" class="popup-container" @click.stop>
      <slot></slot>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  mask?: boolean // 是否显示遮罩，默认 false
  teleportTo?: string // Teleport 目标，默认 body
  transparentMask?: boolean // 遮罩是否透明，默认 false
}

const props = withDefaults(defineProps<Props>(), {
  mask: false,
  teleportTo: undefined,
  transparentMask: false
})

let _mask: boolean | undefined = undefined
let _transparentMask: boolean | undefined = undefined

const mask = computed(() => {
  return _mask !== undefined ? _mask : props.mask
})

const teleportTo = computed(() => {
  return props.teleportTo
})

// 修复：使用不同的变量名或直接返回值
const transparentMask = computed(() => {
  // 直接返回，不使用同名的变量
  return _transparentMask !== undefined ? _transparentMask : props.transparentMask
})

const visible = ref(false)
const emit = defineEmits<{
  (e: 'close'): void
}>()

// 仅当有遮罩时，点击遮罩才关闭
const handleMaskClick = () => {
  console.log('handleMaskClick')
  if (props.mask) {
    handleClose()
  }
}

const handleClose = () => {
  emit('close')
  hide()
}

const showWithMask = () => {
  visible.value = true
  _mask = true
  if (_transparentMask) {
    _transparentMask = false
  }
}

const showWithMaskTransparent = () => {
  visible.value = true
  _mask = true
  _transparentMask = true
}

const show = () => {
  visible.value = true
  if (_mask) {
    _mask = undefined
  }
  if (_transparentMask) {
    _transparentMask = undefined
  }
}

const hide = () => {
  visible.value = false
  console.log('pop hide')
  if (_mask) {
    _mask = undefined
  }
  if (_transparentMask) {
    _transparentMask = undefined
  }
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
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  /* 确保在遮罩之上 */
  pointer-events: auto;
  /* 允许交互 */
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  /* 必须低于 popup-container */
  pointer-events: auto;
  -webkit-app-region: no-drag;
}

.mask.transparent {
  background: transparent;
}
</style>
