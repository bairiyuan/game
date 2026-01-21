<template>
  <img
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :style="{
      objectFit: contain ? 'contain' : 'unset',
      display: full ? 'block' : 'inline-block',
      width: full ? '100%' : width,
      height: full ? '100%' : height
    }"
    draggable="false"
    class="base-img"
    loading="lazy"
    @dragstart.prevent
  />
</template>

<script setup lang="ts">
interface Props {
  src: string | undefined
  alt?: string
  width?: string
  height?: string
  contain?: boolean
  full?: boolean
}

withDefaults(defineProps<Props>(), {
  alt: '图片被宠物吃掉啦'
})
</script>

<style scoped>
.base-img {
  user-select: none;
}
</style>
