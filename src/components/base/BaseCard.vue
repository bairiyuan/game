<template>
  <div class="base-card" :style="commonStyle" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  width: string
  height: string
  background?: string
  margin?: string
  padding?: string
  round?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const commonStyle = computed(() => {
  let styleText = `
        width:${props.width};
        height:${props.height};
    `
  if (props.round) {
    styleText += `
        border-radius:${props.round};
    `
  }
  if (props.margin) {
    styleText += `
        margin:${props.margin};
    `
  }
  if (props.padding) {
    styleText += `
        padding:${props.padding};
    `
  }

  if (props.background) {
    styleText += `
        background:${props.background};
    `
  }

  return styleText
})

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.base-card {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
