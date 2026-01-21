<template>
  <input type="checkbox" class="base-checkbox" :class="[`${type}`]" :checked="modelValue" @change="handleChange"></input>
</template>

<script setup lang="ts">












interface Props{
  modelValue: boolean
  type?: 'normal'|'agree'
}

withDefaults(defineProps<Props>(), {
  type:'normal'
})


const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()





















const handleChange = (e) => {
  const target = e.target as HTMLInputElement
  const value = target.checked
  emit('update:modelValue', value)
  emit('change',value)
}
</script>

<style scoped>
.base-checkbox{
  width: 18px;
  height: 18px;
  margin-top: 2px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 3px;
}

.normal{
  accent-color:var(--cornflowerBlue)
}

.agree{
  accent-color: var(--green);
}
</style>
