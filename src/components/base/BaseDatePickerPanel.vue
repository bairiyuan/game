<template>
  <!-- <div class="picker-popup"> -->
  <!-- 日期面板 -->
  <div class="panel">
    <div class="slectede-date" v-if="selectedDate && showSelectedDataTitle">
      {{ formatDateChina(selectedDate) }}
    </div>
    <div class="picker-panel">
      <!-- 头部 -->
      <div class="picker-header">
        <!-- 年份切换 -->
        <div class="btn-container">
          <button @click="prevYear" class="nav-btn year-btn">
            <img :src="prevYearIcon" class="year-month-button" draggable="false" />
          </button>
          <button @click="prevMonth" class="nav-btn month-btn">
            <img :src="prevMonthIcon" class="year-month-button" draggable="false" />
          </button>
        </div>

        <span class="month-year" @click="toggleYearMode">
          {{ monthYearDisplay }}
        </span>
        <div class="btn-container">
          <button @click="nextMonth" class="nav-btn month-btn">
            <img :src="nextMonthIcon" class="year-month-button" draggable="false" />
          </button>
          <button @click="nextYear" class="nav-btn year-btn">
            <img :src="nextYearIcon" class="year-month-button" draggable="false" />
          </button>
        </div>
      </div>

      <!-- 年份选择模式 -->
      <div v-if="yearMode" class="year-selector">
        <div class="year-row" v-for="row in yearRows" :key="row[0]">
          <span
            v-for="year in row"
            :key="year"
            :class="['year-item', { 'current-year': year === currentYear }]"
            @click.stop="selectYear(year)"
          >
            {{ year }}
          </span>
        </div>
      </div>

      <!-- 月份和日期选择模式 -->
      <div v-else class="picker-body">
        <div class="week-days">
          <span v-for="day in weekDays" :key="day" class="day-label">{{ day }}</span>
        </div>
        <div class="date-grid">
          <span
            v-for="date in dateList"
            :key="date.date"
            :class="[
              'date-item',
              { selected: date.selected },
              {
                'selected-range-key-day':
                  date.date === props.timeRang?.startTime || date.date === props.timeRang?.endTime
              },
              { today: date.isToday },
              { disabled: date.disabled }
            ]"
            @click="selectDate(date)"
          >
            {{ date.day }}
          </span>
        </div>
      </div>
      <div class="button-tab" v-if="showConfirmButton">
        <button v-if="timeRang" @click="confirmButton">确定</button>
        <button v-else @click="confirmButton">确定</button>
      </div>
    </div>
  </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import prevMonthIcon from '@assets/app/img/svg/base/prevMonth.svg'
import prevYearIcon from '@assets/app/img/svg/base/prevYear.svg'
import nextYearIcon from '@assets/app/img/svg/base/nextYear.svg'
import nextMonthIcon from '@assets/app/img/svg/base/nextMonth.svg'
// import BaseImg from './BaseImg.vue'

interface timeRang {
  startTime: string
  endTime: string
}

interface DateItem {
  day: number
  date: string
  selected: boolean
  isToday: boolean
  disabled: boolean
}

interface Props {
  modelValue?: string | null
  timeRang?: timeRang
  canSelectFuture?: boolean
  dateToday?: string
  showSelectedDataTitle?: boolean
  showConfirmButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  timeRang: undefined, // 或者提供一个合适的默认值
  canSelectFuture: true, // 设置默认值为 true
  dateToday: '',
  showSelectedDataTitle: false,
  showConfirmButton: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'close'): void

  (
    e: 'confirm',
    payload: {
      type: 'single' | 'range'
      date?: string // 单选时
      range?: { startTime: string; endTime: string } // 范围时
    }
  ): void
}>()

const currentDate = ref(new Date(props.modelValue || Date.now()))
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null)
const yearMode = ref(false)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const monthYearDisplay = computed(() => `${currentYear.value}年${currentMonth.value + 1}月`)

const yearRows = computed(() => {
  const start = Math.floor(currentYear.value / 12) * 12
  const years = Array.from({ length: 12 }, (_, i) => start + i)
  return [years.slice(0, 4), years.slice(4, 8), years.slice(8, 12)]
})

const dateList = computed<DateItem[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)

  const start = new Date(first)
  start.setDate(start.getDate() - first.getDay())

  const end = new Date(last)
  end.setDate(end.getDate() + (6 - last.getDay()))

  const result: DateItem[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  //选择时间段
  const { startTime, endTime } = props.timeRang || {}
  const rangeStart = startTime ? new Date(startTime) : null
  const rangeEnd = endTime ? new Date(endTime) : null
  if (rangeStart && rangeEnd) {
    rangeStart.setHours(0, 0, 0, 0)
    rangeEnd.setHours(0, 0, 0, 0)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const current = new Date(d)
      const dateStr = formatDate(d)
      // const isFuture = current > today
      const belongsCurrentMonth = d.getMonth() === month
      const isdisabled = ref(false)
      if (props.canSelectFuture) {
        isdisabled.value = !belongsCurrentMonth
      } else {
        isdisabled.value = current > today
      }
      result.push({
        day: d.getDate(),
        date: dateStr,
        selected: current >= rangeStart && current <= rangeEnd,
        isToday: d.toDateString() === today.toDateString(),
        disabled: isdisabled.value
      })
    }
  }
  //选择时间点
  else {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const current = new Date(d)
      const dateStr = formatDate(d)
      // const isFuture = current > today
      const belongsCurrentMonth = d.getMonth() === month
      const isdisabled = ref(false)
      if (props.canSelectFuture) {
        isdisabled.value = !belongsCurrentMonth
      } else {
        isdisabled.value = current > today
      }
      result.push({
        day: d.getDate(),
        date: dateStr,
        selected: selectedDate.value?.toDateString() === d.toDateString(),
        isToday: d.toDateString() === today.toDateString(),
        disabled: isdisabled.value
      })
    }
  }

  return result
})

const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
//格式化日期 xx年xx月xx日
const formatDateChina = (dateStr) => {
  let formatted = ''
  if (dateStr) {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      formatted = `${year}年${month}月${day}日`
    }
  }
  return formatted
}

const prevYear = () => {
  const newDate = new Date(currentDate.value)
  newDate.setFullYear(newDate.getFullYear() - 1)
  currentDate.value = newDate
}

const nextYear = () => {
  const newDate = new Date(currentDate.value)
  newDate.setFullYear(newDate.getFullYear() + 1)
  currentDate.value = newDate
}

const prevMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}
const toggleYearMode = () => (yearMode.value = !yearMode.value)
const selectYear = (year: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setFullYear(year)
  currentDate.value = newDate
  yearMode.value = false
}
const selectDate = (item: DateItem) => {
  selectedDate.value = new Date(item.date)
  emit('update:modelValue', item.date)
  close()
}

const close = () => emit('close')
//确定按钮，向父组件传值
const confirmButton = () => {
  if (props.timeRang) {
    // 范围模式：直接返回传入的 timeRang（因为面板只用于展示/确认）
    emit('confirm', {
      type: 'range',
      range: props.timeRang
    })
  } else {
    // 单选模式：返回当前选中的日期
    const selected = selectedDate.value ? formatDate(selectedDate.value) : props.modelValue
    emit('confirm', {
      type: 'single',
      date: selected || ''
    })
  }
}
watch(
  () => props.modelValue,
  (val) => {
    selectedDate.value = val ? new Date(val) : null
    currentDate.value = val ? new Date(val) : new Date()
  }
)

onMounted(() => {
  const handler = (e: MouseEvent) => {
    const panel = (e.target as HTMLElement).closest('.picker-panel')
    if (!panel) close()
  }
  document.addEventListener('click', handler)

  onUnmounted(() => document.removeEventListener('click', handler))
})
</script>

<style scoped>
.panel {
  position: relative;
  -webkit-app-region: no-drag;
}
.slectede-date {
  background-color: #000;
  color: #fff;
  text-align: left;
  border-radius: 5px;
}
.picker-panel {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 其余样式与 BaseDateSelect 保持一致 */
.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn.year-btn {
  font-size: 16px;
  font-weight: bold;
}

.nav-btn.month-btn {
  font-size: 18px;
}

.nav-btn:hover {
  background-color: #f5f5f5;
}
.year-month-button {
  height: 14px;
  width: 14px;
  object-fit: contain;
}
.month-year {
  font-weight: bold;
  font-size: 18px;
  color: #333;
  padding: 0 8px;
  cursor: pointer;
}

.month-year:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
}

.picker-body {
  padding: 12px;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.day-label {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  padding: 4px 0;
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.date-item:hover:not(.disabled) {
  background-color: #f0f0f0;
  color: #333;
}

.date-item.selected {
  background-color: black;
  color: white !important;
}

.date-item.selected:hover {
  background-color: black;
}
.date-item.selected-range-key-day {
  border: 1px solid #4e5cde;
}
.date-item.today {
  position: relative;
}

.date-item.today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  border-radius: 5px;
  width: 36px;
  height: 6px;
  background-color: #a7e5ff;
}

.date-item.disabled {
  color: #ccc;
  cursor: pointer;
  opacity: 0.6;
  pointer-events: auto;
  /* cursor: not-allowed; */
  /* pointer-events: none; */
  /* 可选：彻底禁用交互 */
}

.svg-container {
  display: flex;
  justify-self: center;
  align-items: center;
  padding: 0px 15px;
}

.btn-container {
  display: flex;
}

/* 年份选择器样式 */
.year-selector {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.year-row {
  display: contents;
}

.year-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.year-item:hover {
  background-color: #f0f0f0;
}

.year-item.current-year {
  background-color: black;
  color: white;
  font-weight: 500;
}

span {
  user-select: none;
}

.button-tab {
  position: absolute;
  bottom: 0;
  height: 43px;
  width: 316px;
  padding: 0 10px 0;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(153, 153, 153, 0.5);
  button {
    margin-left: auto;
    width: 50px;
    height: 23px;
    border: 1px solid #666666;
    border-radius: 5px;
    background-color: #e2d9f1;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
  }
}
</style>
