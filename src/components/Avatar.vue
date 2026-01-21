<template>
  <base-card
    width="68px"
    height="68px"
    :background="background"
    round="16px"
    class="avatar"
    @click="handleClick"
  >
    <base-img :src="VectorPng" width="100%" height="100%" class="avatar-frame" />
  </base-card>
</template>

<script setup lang="ts">
import BaseCard from '@renderer/components/base/BaseCard.vue'
import BaseImg from '@renderer/components/base/BaseImg.vue'
import VectorPng from '@assets/app/icons/png/Vector.png'
import { ref } from 'vue'

interface Props {
  src?: string
  background?: string
}
const props = withDefaults(defineProps<Props>(), {
  background: 'radial-gradient(circle at center, #70D4FF, #FFFFFF)',
  src: '',
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const background = ref('')

const __init__ = () => {
  if (props.background) {
    background.value = props.background
  }
}
__init__()

const handleClick = () => {
  console.log('click')
  emit('click')
}
</script>

<style scoped>
.avatar {
  position: relative;
  overflow: hidden;
}

.avatar-frame {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
