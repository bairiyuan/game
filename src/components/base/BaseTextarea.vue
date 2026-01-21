<template>
  <textarea
    class="base-textarea"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :maxlength="maxlength"
    @input="onInput"
    @blur="onBlur"
    @focus="onFocus"
  ></textarea>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
  maxlength?: number
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  rows: 3,
  maxlength: 200
})

const emits = defineEmits(['update:modelValue', 'blur', 'focus'])

const onInput = (event: Event) => {
  emits('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

const onBlur = (event: FocusEvent) => {
  emits('blur', event)
}

const onFocus = (event: FocusEvent) => {
  emits('focus', event)
}
</script>

<style scoped>
.base-textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  resize: none; /* 禁止用户调整大小 */
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
  color: #333;
}
.base-textarea:focus {
  border-color: #a0cfff;
}
</style>
