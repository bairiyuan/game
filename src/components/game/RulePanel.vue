<template>
  <div class="rule-panel-bg" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <base-img :src="CloseButton" class="close-button" @click="emit('closeRulePanel')"></base-img>
    <div class="rule-panel">
      <p class="title">游戏规则</p>
      <div class="content-paragraphs">
        <p v-for="(para, index) in formatContentAsParagraphs(ruleContent)" :key="index">
          {{ para }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseImg from '@renderer/components/base/BaseImg.vue'
import CloseButton from '@assets/app/img/svg/CloseButton/CloseButtonRed.svg'
import { onMouseEnter, onMouseLeave } from '@renderer/utils/mouse'

interface Props {
  ruleContent:string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'closeRulePanel'): void
}>()
const formatContentAsParagraphs = (content: string): string[] => {
  if (!content) return []
  return content
    .split('\n')
    .map((par) => (par.trim() !== '' ? '  ' + par : ''))
    .filter(Boolean)
}
</script>

<style scoped lang="scss">
.rule-panel-bg {
  width: 328px;
  height: 436px;
  // 渐变
  background: linear-gradient(#d6deff, #7d98ff);
  padding: 10px;
  position: relative;
  .close-button {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
  }
}

.rule-panel {
  background-color: #fff9df;
  width: 100%;
  height: 100%;
  user-select: none;
  padding: 10px;
  .title {
    color: #d1c08b;
    font-size: 40px;
    text-align: center;
  }
  .content-paragraphs {
    margin-top: 10px;
    p {
      font-size: 24px;
      color: #d1c08b;
      text-indent: 2em;
    }
  }
}
</style>
