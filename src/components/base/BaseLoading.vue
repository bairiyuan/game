<template>
  <!-- 全屏模式 -->
  <div
    v-if="modelValue && fullscreen"
    class="loading-fullscreen"
    :style="{ backgroundColor: maskColor }"
  >
    <div class="loading-wrapper" :style="{ width: size, height: size }">
      <div class="loading-spinner" :style="spinnerStyle"></div>
      <span v-if="showText" class="loading-text">{{ text }}</span>
    </div>
  </div>

  <!-- 内联模式 (作为普通元素使用) -->
  <div
    v-else-if="!fullscreen || !modelValue"
    :class="['loading-wrapper', { inline: !fullscreen }]"
    :style="{ width: size, height: size, display: modelValue ? 'block' : 'none' }"
  >
    <div class="loading-spinner" :style="spinnerStyle"></div>
    <span v-if="showText" class="loading-text" :style="{ color: props.color }">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * 控制加载状态是否显示 (配合 v-model 使用)
   * @default false
   */
  modelValue: boolean
  /**
   * 加载组件的大小 (支持 px, %, em, rem 等单位)
   * @default '40px'
   */
  size?: string
  /**
   * 加载动画的颜色
   * @default 'var(--primary, #007bff)' (使用 CSS 变量，提供默认值)
   */
  color?: string
  /**
   * 是否显示加载文字
   * @default true
   */
  showText?: boolean
  /**
   * 加载文字内容
   * @default '加载中...'
   */
  text?: string
  /**
   * 全屏遮罩模式
   * @default false
   */
  fullscreen?: boolean
  /**
   * 遮罩层背景色 (仅 fullscreen 模式有效)
   * @default 'rgba(0, 0, 0, 0.5)'
   */
  maskColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: '40px',
  color: 'var(--primary, #007bff)',
  showText: true,
  text: '加载中...',
  fullscreen: false,
  maskColor: 'rgba(0, 0, 0, 0.5)'
})

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const spinnerStyle = computed(() => {
  return {
    borderTopColor: props.color,
    borderRightColor: props.color,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent'
  }
})
</script>

<style scoped>
/* 全屏遮罩容器 */
.loading-fullscreen {
  position: fixed;
  inset: 0; /* top: 0; right: 0; bottom: 0; left: 0; */
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 加载内容的外层容器 */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 60px;
  min-height: 60px;
}

/* 内联模式下的样式 (非全屏) */
.loading-wrapper.inline {
  /* 可以根据需要添加内联样式，例如 margin */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 确保它显示在内容之上 */
  z-index: 9999;
}

/* 旋转的圆圈动画 */
.loading-spinner {
  width: 100%;
  height: 100%;
  border: 3px solid; /* 边框宽度 */
  border-radius: 50%; /* 圆形 */
  /* 动画：无限旋转 */
  animation: spin 1s linear infinite;
  /* 初始边框颜色由 JS 计算属性控制 */
}

/* 加载文字 */
.loading-text {
  display: block;
  margin-top: 10px;
  font-size: 14px;
}

/* 旋转动画定义 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
