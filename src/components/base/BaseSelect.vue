<template>
  <div class="my-select" :class="{ open }" @click="toggle" @mousedown.prevent>
    <div class="selected" :class="{ padding: padding }">
      <base-text :size="fontSize || '18px'" :color="color || 'black'">
        {{ modelValue || placeholder }}
      </base-text>
      <svg
        data-v-58697b5c=""
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 1024"
        width="12px"
        height="12px"
      >
        <path fill="currentColor" d="m192 384 320 384 320-384z"></path>
      </svg>
    </div>
    <ul v-show="open" class="options">
      <li
        v-for="item in options"
        :key="item"
        :class="{ active: item === modelValue }"
        @click.stop="select(item)"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseText from './BaseText.vue'
defineProps<{
  modelValue?: string | number
  options: (string | number)[]
  placeholder?: string
  color?: string
  fontSize?: string
  padding?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number): void
}>()

const open = ref(false)

const toggle = () => (open.value = !open.value)
const select = (v: string | number) => {
  emit('update:modelValue', v)
  window.api.systemControls.sendMessage(`select item: ${v}`)
  setTimeout(() => (open.value = false), 100)
}

const onClickOutside = (e: Event) => {
  if (!(e.target as HTMLElement).closest('.my-select')) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.my-select {
  position: relative;
  max-width: 240px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.selected {
  display: flex;
  align-items: center;
  justify-content: center;
  /* border: 1px solid #909ef0; */
  border-radius: 8px;
  background: transparent;
}

.selected svg {
  width: 20px;
  height: 20px;
}

.selected .padding {
  padding: 10px 0px 10px 16px;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background: #bfc8fa;
  z-index: 10;
}

li {
  padding: 8px 12px;
}
li:hover,
li.active {
  background: #909ef0;
}

.language-svg {
  margin-left: auto;
  margin-right: 10px;
}
</style>
