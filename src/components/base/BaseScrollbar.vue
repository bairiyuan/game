<template>
  <div class="custom-scrollbar" :class="{ padding: padding }" ref="containerRef">
    <!-- 滚动区域 -->
    <div
      class="scroll-view"
      ref="scrollRef"
      @scroll="onScroll"
      :style="{ 'max-height': autoHeight ? `${containerHeight}px` : 'none' }"
    >
      <slot />
    </div>

    <!-- 自定义竖向滚动条 -->
    <div
      v-if="showVerticalScrollbar"
      class="scrollbar-track vertical"
      :class="{ 'scrollbar-track-out': out }"
      @mousedown="startDrag($event, 'vertical')"
      :style="trackStyle"
    >
      <div
        class="scrollbar-thumb"
        :style="{
          height: thumbVerticalHeight + 'px',
          transform: `translateY(${thumbVerticalTop}px)`,
          ...thumbStyle
        }"
        ref="thumbVerticalRef"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, onBeforeUnmount, onActivated } from 'vue'

interface Props {
  autoHeight?: boolean

  height?: number

  scrollbarSize?: number

  scrollbarColor?: string

  scrollbarTrackColor?: string
  padding?: boolean
  out?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoHeight: true,
  height: 200,
  scrollbarSize: 6,
  scrollbarColor: '#888',
  scrollbarTrackColor: 'transparent'
})

const containerRef = ref<HTMLElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)
// const thumbVerticalRef = ref<HTMLElement | null>(null)

const containerHeight = ref(props.height)
const isDragging = ref(false)
const dragStart = ref({ y: 0, scrollTop: 0 })
const thumbVerticalHeight = ref(0)
const thumbVerticalTop = ref(0)

const savedScrollTop = ref(0)

const showVerticalScrollbar = computed(() => {
  const el = scrollRef.value

  if (!el) return false
  console.log('el.scrollHeight', el.scrollHeight)
  console.log('el.clientHeight', el.clientHeight)
  console.log('containerHeight', containerHeight.value)
  const clientHeight = Math.max(el.clientHeight, containerHeight.value)
  return el.scrollHeight > clientHeight - 20
})

const scrollRatio = computed(() => {
  const el = scrollRef.value
  if (!el || !showVerticalScrollbar.value) return 0
  return el.clientHeight / el.scrollHeight
})

const trackStyle = computed(() => ({
  width: `${props.scrollbarSize}px`,
  background: props.scrollbarTrackColor
}))

const thumbStyle = computed(() => ({
  background: props.scrollbarColor
}))

let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null
onMounted(() => {
  const el = scrollRef.value
  if (el) {
    console.log('[onMounted] clientHeight:', el.clientHeight)
  }

  console.log('offsetHeight:', el?.offsetHeight)
  console.log('clientHeight:', el?.clientHeight)
  console.log('scrollHeight:', el?.scrollHeight)
  console.log('style.maxHeight:', el?.style.maxHeight)
  console.log(
    'scrollRef.value === document.querySelector(".scroll-view")',
    scrollRef.value === document.querySelector('.scroll-view')
  )
  nextTick(() => {
    const el = scrollRef.value
    if (el) {
      console.log('[onMounted nextTick] clientHeight:', el.clientHeight)
    }
    if (props.autoHeight && containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
      console.log(containerHeight.value)
    }
    updateThumb()
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        nextTick(() => {
          if (props.autoHeight && containerRef.value) {
            containerHeight.value = containerRef.value.clientHeight
            console.log(containerHeight.value)
          }
          updateThumb()
        })
      })
      resizeObserver.observe(containerRef.value)

      mutationObserver = new MutationObserver(() => {
        nextTick(updateThumb)
      })
      mutationObserver.observe(scrollRef.value as Node, { childList: true, subtree: true })
    }
    window.addEventListener('transitionend', (e) => {
      if (
        e.propertyName === 'width' ||
        e.propertyName === 'height' ||
        e.target === document.documentElement
      ) {
        nextTick(updateThumb)
      }
    })
    window.addEventListener('resize', updateThumb)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateThumb)
  window.removeEventListener('transitionend', (e) => {
    if (
      e.propertyName === 'width' ||
      e.propertyName === 'height' ||
      e.target === document.documentElement
    ) {
      nextTick(updateThumb)
    }
  })
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (mutationObserver) {
    mutationObserver.disconnect()
  }
})

onActivated(() => {
  nextTick(() => {
    const el = scrollRef.value
    if (el && savedScrollTop.value !== undefined) {
      el.scrollTop = savedScrollTop.value

      updateThumb()
    }
  })
})

const onScroll = () => {
  const el = scrollRef.value
  if (el) {
    savedScrollTop.value = el.scrollTop
  }
  updateThumb()
}

const updateThumb = () => {
  nextTick(() => {
    const el = scrollRef.value
    if (!el || !showVerticalScrollbar.value) return

    const trackHeight = containerHeight.value * 0.97
    const thumbHeight = Math.max(scrollRatio.value * trackHeight, 20)

    thumbVerticalHeight.value = thumbHeight

    const thumbRange = trackHeight - thumbHeight

    const scrollTopRatio = el.scrollTop / (el.scrollHeight - el.clientHeight)
    thumbVerticalTop.value = scrollTopRatio * thumbRange
  })
}
// @ts-ignore
const startDrag = (e: MouseEvent, direction: 'vertical' | 'horizontal') => {
  if (isDragging.value) return
  e.preventDefault()
  isDragging.value = true
  dragStart.value = {
    y: e.clientY,
    scrollTop: scrollRef.value?.scrollTop || 0
  }

  const moveHandler = (e: MouseEvent) => {
    if (!isDragging.value) return
    e.preventDefault()
    const deltaY = e.clientY - dragStart.value.y
    const el = scrollRef.value
    if (!el) return

    const scrollRange = el.scrollHeight - el.clientHeight
    const thumbRange = el.clientHeight - thumbVerticalHeight.value
    const newScrollTop = (deltaY / thumbRange) * scrollRange + dragStart.value.scrollTop

    el.scrollTop = Math.max(0, Math.min(newScrollTop, scrollRange))
  }

  const upHandler = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
  }

  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', upHandler)
}
</script>

<style scoped>
.custom-scrollbar {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}

.custom-scrollbar.padding {
  padding: 10px 0px;
}

.scroll-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-view:hover .scrollbar-track {
  opacity: 0.6;
}

.scroll-view::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* 滚动条轨道 */
.scrollbar-track {
  position: absolute;
  top: 50%;
  /* top: 0; */
  right: 2px;
  height: 97%;
  border-radius: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
  transform: translateY(-50%);
}

.scrollbar-track-out {
  right: -10px;
}

.scrollbar-track:hover {
  opacity: 0.9;
}

/* 滚动条滑块 */
.scrollbar-thumb {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  border-radius: 4px;
  transition: background 0.2s;
  user-select: none;
  cursor: pointer;
}

/* 横向滚动条示例（未启用） */
/* .scrollbar-track.horizontal {
  top: auto;
  bottom: 2px;
  left: 0;
  width: 100%;
  height: v-bind('props.scrollbarSize + "px"');
  right: auto;
} */
</style>
