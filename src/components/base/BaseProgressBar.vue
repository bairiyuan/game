<template>
  <div class="progress-bar-container" @mouseenter="hover = true" @mouseleave="hover = false">
    <slot name="label"> </slot>
    <div class="progress-bar" :style="containerStyle">
      <div class="progress-bar-fill" :style="progressStyle"></div>
      <base-text
        v-if="showText || hover"
        class="progress-text"
        :style="textBottom"
        size="14px"
        color="black"
        opacity="0.4"
      >
        {{ Math.round(current) }}/{{ Math.round(max) }}
      </base-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseText from './BaseText.vue'

interface Props {
  current: number
  max: number
  color?: string
  background?: string
  height?: number
  rounded?: boolean
  showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 6,
  rounded: true,
  showText: true,
  current: 0,
  max: 100
})

const hover = ref(false)

const percentage = computed(() => {
  if (props.max === 0) return 0
  return Math.min(100, Math.max(0, (props.current / props.max) * 100))
})

const containerStyle = computed(() => ({
  height: `${props.height}px`,
  backgroundColor: '#f5f5f5',
  borderRadius: props.rounded ? `${props.height / 2}px` : '0'
}))

const progressStyle = computed(() => ({
  width: `${percentage.value}%`,
  background: props.background ? props.background : props.color,
  height: '100%',
  borderRadius: props.rounded ? `${props.height / 2}px` : '0',
  transition: 'width 0.3s ease'
}))

const textBottom = computed(() => ({
  bottom: `${props.height - 4}px`
}))

const current = computed(() => props.current)
const max = computed(() => props.max)
</script>

<style scoped>
.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.progress-bar {
  flex: 1;
  position: relative;
  background: #fff;
  /* 白色外圈 */
  padding: 1px;
  border-radius: 1px;
}

.progress-text {
  min-width: 40px;
  text-align: right;
  position: absolute;
  right: 6px;
}
</style>
