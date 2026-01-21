<template>
  <button
    :type="type"
    :disabled="disabled"
    class="base-button"
    :class="[
      { [`${animate}`]: animate },
      { 'base-button-loading': loading },
      { [`base-button-${variant}`]: variant },
      { shadow: shadow }
    ]"
    :style="commonStyle"
    @click="handleClick"
  >
    <template v-if="loading">
      <span class="loading-spinner"></span>
      <span>{{ loadingText }}</span>
      <base-text :size="fontSize" :weight="fontWeight" :color="color">{{ loadingText }}</base-text>
    </template>
    <template v-else>
      <template v-if="$slots.icon">
        <slot name="icon"></slot>
      </template>
      <template v-if="$slots.checkBox">
        <slot name="checkBox"></slot>
      </template>
      <base-text :size="fontSize" :weight="fontWeight" :color="color">
        <slot></slot>
      </base-text>
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseText from '@components/base/BaseText.vue'

interface Props {
  name?: string
  width?: string
  minWidth?: string | null
  height?: string
  margin?: string | null
  padding?: string | null
  round?: string
  border?: string | null
  color?: string
  fontSize?: string
  fontWeight?: string | number
  type?: 'submit' | 'reset' | 'button'
  variant?: string | null
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  animate?: 'scale' | 'lift' | null
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'null',
  width: 'auto',
  minWidth: null,
  height: 'auto',
  margin: null,
  padding: null,
  round: '10px',
  color: 'white',
  fontSize: 'm',
  fontWeight: '500',
  type: 'submit',
  variant: null,
  disabled: false,
  loading: false,
  loadingText: '加载中',
  animate: null,
  shadow: false
})

const emit = defineEmits<{
  (e: 'click', value: string): void
}>()

const commonStyle = computed(() => {
  return `
        width:${props.width};
        height:${props.height};
        border-radius:${props.round};
        min-width:${props.minWidth};
        margin:${props.margin};
        padding:${props.padding};
    `
})

const handleClick = (): void => {
  if (!props.disabled && !props.loading) {
    emit('click', props?.name)
  }
}
</script>

<style scoped lang="scss">
.base-button {
  cursor: pointer;

  transition: all 0.3s ease;

  &:disabled {
    opacity: var(--button-opacity-disabled);
    border: var(--button-border-disabled);
    cursor: not-allowed;
    transform: none;
  }

  &-primary {
    background: #3b82f6;
    color: white;

    &:hover:not(:disabled) {
      background: #2563eb;
    }
  }

  &-secondary {
    background: #6b7280;
    color: white;

    &:hover:not(:disabled) {
      background: #4b5563;
    }
  }

  &-danger {
    background: #ef4444;
    color: white;

    &:hover:not(:disabled) {
      background: #dc2626;
    }
  }

  &-success {
    background: #10b981;
    color: white;

    &:hover:not(:disabled) {
      background: #059669;
    }
  }

  &:disabled,
  &-loading {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.shadow {
  box-shadow: var(--button-shadow);
  &:hover:not(:disabled) {
    box-shadow: var(--button-shadow-hover);
  }
  &:active:not(:disabled) {
    box-shadow: var(--button-shadow-active);
  }
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
