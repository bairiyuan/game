<template>
  <div class="img-icon-container">
    <base-img :src="src" :class="[`icon-${size}`]"></base-img>
    <template v-if="label">
      <base-text :size="fontSize" :weight="fontWeight" :color="color">
        {{ label }}
      </base-text>
    </template>
  </div>
</template>

<script setup lang="ts">
import BaseImg from '@components/base/BaseImg.vue'
import BaseText from '@components/base/BaseText.vue'
interface Props {
  src: string | undefined
  alt?: string
  size?: 'xxl' | 'xl' | 'l' | 'm' | 's' | 'xs'
  color?: string
  fontSize?: string
  fontWeight?: string | number
  label?: string
}
withDefaults(defineProps<Props>(), {
  size: 's',
  color: 'lightBlack',
  fontSize: 'xs'
})

const __init__ = () => {}

__init__()
</script>

<style scoped>
.img-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-xxl {
  width: 60px;
  height: 60px;
}

.icon-xl {
  width: 50px;
  height: 50px;
}
.icon-l {
  width: 40px;
  height: 40px;
}
.icon-m {
  width: 36px;
  height: 36px;
}
.icon-s {
  width: 23px;
  height: 23px;
}
.icon-xs {
  width: 14px;
  height: 14px;
}
</style>
