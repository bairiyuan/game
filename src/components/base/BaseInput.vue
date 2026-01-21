<template>
  <div class="input-container" @click="focus">
    <input
      :key="key"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      class="form-input"
      :class="{ error: errorMessage }"
      @blur="onBlur"
      @change="onChange"
      @input="onInput"
      ref="inputRef"
      :disabled="disabled"
    />
    <!-- 插槽：用于插入按钮等附加内容 -->
    <slot name="right"></slot>
  </div>
</template>

<script setup lang="ts">
import { InputTypeHTMLAttribute, ref } from 'vue'

interface Props {
  modelValue: string | null | undefined
  key?: string
  type?: InputTypeHTMLAttribute
  placeholder?: string
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  autocomplete?: string
  maxlength?: number | undefined
  errorMessage?: string
  validate?: Function
  disabled?: boolean
}
withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '请输入',
  inputmode: 'text'
})

const inputRef = ref<HTMLInputElement | null>(null)

const emit = defineEmits(['update:modelValue', 'blur', 'input', 'change'])
const onBlur = (): void => {
  emit('blur')
}

const onChange = (): void => {
  emit('change')
}

const onInput = (e): void => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  emit('input', value)
}

const __init__ = () => {
  console.log('1')
}
__init__()

const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

defineExpose({
  focus
})
</script>

<style scoped lang="scss">
.input-container {
  --background-color: #000;
  --input-color: #fff;
  --placeholder-color: rgba(255, 255, 255, 0.6);
  background: var(--background-color);
  border-radius: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  height: 100%;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  &.verification-input {
    gap: 12px;
  }
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--input-color);
  font-size: 20px;
  font-weight: 400;
  padding-left: 20px;
  box-sizing: border-box;
  &::placeholder {
    color: var(--placeholder-color);
    font-weight: 400;
    padding-left: 5px;
    font-family: 'Alibaba PuHuiTi', sans-serif;
  }

  &:focus {
    outline: none;
  }
}
</style>
