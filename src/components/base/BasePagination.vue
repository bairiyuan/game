<template>
  <div class="pagination-container">
    <!-- 总条数 -->
    <div class="pagination-total" v-if="showTotal">共 {{ total }} 条</div>

    <!-- 首页按钮 -->
    <button
      class="pagination-btn base-paginaton-btn"
      :disabled="currentPage === 1"
      @click="gotoPage(1)"
      v-if="showFirstLast"
    >
      首页
    </button>

    <!-- 上一页 -->
    <button
      class="pagination-btn prev base-paginaton-btn"
      :disabled="currentPage === 1"
      @click="prevPage"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M7.20426 11.2018L15.6675 3.32928C16.0111 3.02246 16.537 3.04686 16.8508 3.38415C17.1646 3.72146 17.1511 4.2477 16.8202 4.56837L9.00857 11.8349L16.8329 19.4214C16.9394 19.5248 17.017 19.6544 17.0576 19.7973C17.0982 19.9401 17.1005 20.0911 17.0643 20.2351C17.028 20.3791 16.9545 20.5111 16.851 20.6176C16.7476 20.7242 16.618 20.8017 16.4751 20.8423C16.3323 20.8829 16.1813 20.8852 16.0373 20.849C15.8932 20.8127 15.7613 20.7392 15.6547 20.6358L7.19146 12.4298C7.10895 12.35 7.04357 12.2542 6.99932 12.1482C6.95507 12.0423 6.93288 11.9284 6.9341 11.8136C6.93526 11.6987 6.95981 11.5854 7.00626 11.4803C7.05271 11.3753 7.12008 11.2808 7.20426 11.2027"
          fill="#666666"
        />
      </svg>
    </button>

    <!-- 页码列表 -->
    <div class="pagination-pages">
      <template v-for="page in pageList" :key="page">
        <button
          v-if="page !== '...'"
          :class="['pagination-number base-paginaton-btn', { active: page === currentPage }]"
          @click="gotoPage(page)"
        >
          {{ page }}
        </button>
        <span v-else class="pagination-ellipsis">...</span>
      </template>
    </div>
    <slot name="suffix" />
    <!-- 下一页 -->
    <button
      class="pagination-btn next base-paginaton-btn"
      :disabled="currentPage === totalPages"
      @click="nextPage"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M16.7957 11.2018L8.33251 3.32928C7.98889 3.02246 7.46304 3.04686 7.14919 3.38415C6.83539 3.72146 6.84894 4.2477 7.1798 4.56837L14.9914 11.8349L7.16715 19.4214C7.06055 19.5248 6.98305 19.6544 6.94243 19.7973C6.9018 19.9401 6.89949 20.0911 6.93572 20.2351C6.97199 20.3791 7.04553 20.5111 7.14895 20.6176C7.25237 20.7242 7.38202 20.8017 7.52487 20.8423C7.66771 20.8829 7.81873 20.8852 7.96274 20.849C8.10675 20.8127 8.23869 20.7392 8.34528 20.6358L16.8085 12.4298C16.8911 12.35 16.9564 12.2542 17.0007 12.1482C17.0449 12.0423 17.0671 11.9284 17.0659 11.8136C17.0647 11.6987 17.0402 11.5854 16.9937 11.4803C16.9473 11.3753 16.8799 11.2808 16.7957 11.2027"
          fill="#666666"
        />
      </svg>
    </button>

    <!-- 尾页按钮 -->
    <button
      class="pagination-btn base-paginaton-btn"
      :disabled="currentPage === totalPages"
      @click="gotoPage(totalPages)"
      v-if="showFirstLast"
    >
      尾页
    </button>

    <!-- 跳转到指定页 -->
    <div class="pagination-jump" v-if="showJump">
      跳至
      <input
        type="text"
        v-model="jumpPage"
        @input="handleInput"
        @blur="handleBlur"
        @wheel.prevent
        :min="1"
        :max="totalPages"
        class="pagination-input base-paginaton-btn"
      />
      页
      <button class="pagination-go base-paginaton-btn" @click="jumpToPage">Go</button>
    </div>

    <!-- 每页条数选择（可选） -->
    <div class="pagination-size" v-if="showPageSize">
      <select
        v-model="pageSizeLocal"
        class="pagination-select base-paginaton-btn"
        @change="onPageSizeChange"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} 条/页</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PaginationProps } from '@renderer/types/props'
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<PaginationProps>(), {
  currentPage: 1,
  total: 0,
  pageSize: 10,
  pageSizeOptions: () => [10, 20, 30, 50, 100],
  showTotal: false,
  showFirstLast: false,
  showJump: false,
  showPageSize: false,
  maxButtons: 7
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'change', payload: { currentPage: number; pageSize: number }): void
}>()

const jumpPage = ref<number | string>('')
const pageSizeLocal = ref(props.pageSize)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.total / props.pageSize))
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  const newValue = value.replace(/[^0-9]/g, '')

  jumpPage.value = newValue === '' ? '' : Number(newValue)
}

const handleBlur = () => {
  let value = Number(jumpPage.value)
  if (!value) {
    return
  }

  if (isNaN(value) || value < 1) {
    value = 1
  } else if (value > totalPages.value) {
    value = totalPages.value
  }

  jumpPage.value = value
  emit('update:currentPage', value)
}

const pageList = computed(() => {
  const current = props.currentPage
  const total = totalPages.value
  const max = props.maxButtons
  const list: (number | '...')[] = []

  if (total <= max) {
    for (let i = 1; i <= total; i++) list.push(i)
  } else {
    const leftThreshold = Math.ceil(max / 2)
    const rightThreshold = total - Math.floor(max / 2) + 1

    if (current <= leftThreshold) {
      for (let i = 1; i <= max - 1; i++) list.push(i)
      list.push('...')
      list.push(total)
    } else if (current >= rightThreshold) {
      list.push(1)
      list.push('...')
      for (let i = total - (max - 2); i <= total; i++) list.push(i)
    } else {
      list.push(1)
      list.push('...')
      const start = Math.max(2, current - Math.floor((max - 3) / 2))
      const end = Math.min(total - 1, start + (max - 3))

      for (let i = start; i <= end; i++) list.push(i)
      list.push('...')
      list.push(total)
    }
  }

  return list
})

const prevPage = () => {
  if (props.currentPage > 1) {
    gotoPage(props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    gotoPage(props.currentPage + 1)
  }
}

const gotoPage = (page: number) => {
  const p = Math.max(1, Math.min(page, totalPages.value))
  if (p !== props.currentPage) {
    emit('update:currentPage', p)
    emit('change', { currentPage: p, pageSize: props.pageSize })
  }
}

const jumpToPage = () => {
  const page = Number(jumpPage.value)
  if (page >= 1 && page <= totalPages.value) {
    gotoPage(page)
    jumpPage.value = ''
  }
}

const onPageSizeChange = () => {
  emit('update:pageSize', pageSizeLocal.value)

  if (props.currentPage !== 1) {
    emit('update:currentPage', 1)
  }
  emit('change', { currentPage: 1, pageSize: pageSizeLocal.value })
}

watch(
  () => props.pageSize,
  (val) => {
    pageSizeLocal.value = val
  }
)
</script>

<style scoped>
.pagination-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  padding: 10px 0;
  user-select: none;
}

.base-paginaton-btn {
  height: 40px;
  border: 1.5px solid white;
  background: transparent;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  cursor: pointer;
}

.pagination-total {
  color: #666;
}

.pagination-btn {
  padding: 4px 10px;
  font-size: 14px;
  transition: all 0.2s;
}

/* .page-btn {
  width: 40px;
  height: 40px;
  padding: 0;
} */

.pagination-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #999;
}

.pagination-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  border-color: #eee;
}

.pagination-pages {
  display: flex;
  gap: 4px;
  align-items: center;
}

.pagination-number {
  width: 40px;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-number:hover:not(.active) {
  background: #f0f0f0;
  border-color: #999;
}

.pagination-number.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.pagination-ellipsis {
  color: #999;
  padding: 0 6px;
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.pagination-input {
  width: 50px;
  text-align: center;
  border-radius: 4px;
  font-size: 14px;
}
/* .pagination-input::-webkit-outer-spin-button,
.pagination-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pagination-input[type='number'] {
  -moz-appearance: textfield;
} */

.pagination-go {
  padding: 4px 8px;
  font-size: 12px;
}

.pagination-go:hover {
  background: #e0e0e0;
}

.pagination-select {
  padding: 0 8px;
  font-size: 14px;
}

/* 响应式：小屏幕堆叠 */
@media (max-width: 576px) {
  .pagination-container {
    justify-content: center;
    font-size: 13px;
  }

  .pagination-total,
  .pagination-size {
    order: 1;
  }

  .pagination-btn,
  .pagination-pages,
  .pagination-jump {
    order: 2;
  }

  .pagination-jump {
    margin-top: 8px;
  }
}
</style>
