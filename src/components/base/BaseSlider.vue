<template>
  <div class="slider-box">
    <base-text size="18px" color="black" v-if="number">{{
      Number(modelValue * (ratio ?? 1)).toFixed(decimalPlaces ?? 0)
    }}</base-text>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="onInput"
      :style="{ '--value-percent': `${percent}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseText from './BaseText.vue'

const props = defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  ratio?: number
  decimalPlaces?: number
  number?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void
  (e: 'change', v: number): void
}>()

const min = props.min ?? 0
const max = props.max ?? 100

const percent = computed(() => {
  return ((props.modelValue - min) / (max - min)) * 100
})

const onInput = (e: Event) => {
  const value = Number((e.target as HTMLInputElement).value)
  emit('update:modelValue', value)
  emit('change', value)
  window.api.systemControls.sendMessage(`change: ${value}`)
}
</script>

<style scoped>
.slider-box {
  display: flex;
  align-items: center;
  gap: 14px;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 14px;
  cursor: pointer;
  background: #ffebbe; /* 轨道底色 */
  border-radius: 8px;
  position: relative;
  border: 1px solid #8e7555;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
}

/* Chrome, Edge, Safari: 使用渐变 */
input[type='range']::-webkit-slider-runnable-track {
  width: var(--value-percent);
  height: 10px;
  background: linear-gradient(
    to right,
    #e8c77a 2%,
    #ebb35d var(--value-percent),
    #ffebbe var(--value-percent),
    #ffebbe 98%
  );
  border-radius: 7px;
}

/* 滑块 */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;

  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 1px solid #8e7555;
  border-radius: 50%;
  margin-top: -1px; /* 垂直居中 */
  cursor: pointer;
  z-index: 1;
}

/* Firefox: 使用 progress */
input[type='range']::-moz-range-track {
  background: white;
  height: 14px;
  border-radius: 7px;
  border: none;
}

input[type='range']::-moz-range-progress {
  background: #909ef0;
  height: 14px;
  border-radius: 7px;
}

input[type='range']::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #e3e7ff;
  border: 1px solid #4e5cde;
  border-radius: 50%;
  cursor: pointer;
}
</style>
