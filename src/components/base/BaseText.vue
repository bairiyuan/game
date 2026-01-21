<template>
  <span
    class="base-text"
    :class="[{ [`item-${position}`]: position }, { 'can-pointer': pointer }]"
    :style="textStyle"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: string | number | null
  color?: string
  weight?: string | number | null
  opacity?: number | string
  position?: string
  textShadow?: string
  pointer?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  size: '24px',
  color: 'white'
})

const textStyle = computed(() => {
  const style: Record<string, string | number> = {}
  if (props.textShadow) {
    style['text-shadow'] = props.textShadow
  }
  if (props.opacity) {
    style['opacity'] = props.opacity
  }
  if (props.weight) {
    style['font-weight'] = props.weight
  }
  if (props.size) {
    style['font-size'] = props.size
  }
  if (props.color) {
    style['color'] = props.color
  }
  return style
})
</script>

<style scoped>
.base-text {
  user-select: none;
  font-family: 'Alibaba PuHuiTi', sans-serif;
}

.base-text.dont-select {
  cursor: default;
}

.base-text.can-pointer {
  cursor: pointer;
}

.item-start {
  align-self: self-start;
}

.item-end {
  align-self: self-end;
}
</style>
