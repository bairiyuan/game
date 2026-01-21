<template>
  <div class="rank-page" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div class="close-button" @click="emit('closeRanking')">
      <base-img :src="CloseButton" width="32" height="30" />
    </div>
    <div class="contain">
      <div class="title">
        <div class="title_rank">排行</div>
        <div class="title_userinfo">玩家信息</div>
        <div class="title_points">积分</div>
      </div>
      <div class="rank-list">
        <game-rank-item
          v-for="(item, index) in rankList"
          :key="index"
          :item="item"
        ></game-rank-item>
      </div>
      <game-rank-item :self="true" :item="selfItem"></game-rank-item>
    </div>
  </div>
</template>
<script setup lang="ts">
//引入资源
import CloseButton from '@assets/app/img/svg/CloseButton/CloseButtonRed.svg'
import GameRankItem from '@renderer/components/Items/GameRankItem.vue'
//引入组件
import BaseImg from '@renderer/components/base/BaseImg.vue'
//方法函数
import { useUserStore } from '@renderer/store/user/userStore'
import { onMouseEnter, onMouseLeave } from '@renderer/utils/mouse'
import { onMounted, ref } from 'vue'
import { useGameService } from '@renderer/service/game/gameService'
const catchFoodService = useGameService()
const userStore = useUserStore()
interface RankItem {
  rank: number
  avatar_url?: string
  nickname: string
  level: number
  points: number
}

interface Props {
  rank: number
  historyHighPoints: number
  game: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'closeRanking'): void
}>()

const rankList = ref<RankItem[]>([])

const selfItem = ref<RankItem>({
  rank: props.rank,
  avatar_url: userStore.avatar,
  nickname: userStore.nickname || '',
  level: userStore.level || 1,
  points: props.historyHighPoints
})

onMounted(async () => {
  const res = await catchFoodService.getRankList(1, 100, props.game)
  if (!res.success) {
    return
  }
  rankList.value = res.data.rank_list
  selfItem.value.rank = res.data.self?.rank || props.rank
  selfItem.value.points = res.data.self?.points || props.historyHighPoints
})
</script>
<style scoped lang="scss">
.rank-page {
  width: 345px;
  height: 545px;
  background-image: url('../../assets/app/img/png/game/GameRankBackground.png');
  background-repeat: no-repeat;
  background-size: cover;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  padding: 145px 0px 20px 0;
}
.close-button {
  position: absolute;
  top: 102px;
  right: 5px;
  cursor: pointer;
  background: none;
  border: none;
}
.contain {
  width: 100%;
  height: 100%;
  .title {
    height: 22px;
    width: 100%;
    display: flex;
    padding: 0px 20px 0 28px;
    gap: 1px;
    .title_rank,
    .title_userinfo,
    .title_points {
      background: linear-gradient(to bottom, #e3e7ff 0%, #bfc8fa 100%);
      height: 22px;
      font-size: 13px;
      text-align: center;
    }
    .title_rank {
      width: 61px;
    }
    .title_userinfo {
      width: 170px;
    }
    .title_points {
      width: 61px;
    }
  }
  .rank-list {
    height: 316px;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 0px 23px 0 29px;
    /* Firefox */
    &::-webkit-scrollbar {
      display: none;
      /* Chrome / Edge / Safari */
    }
    .rank-list-item {
      display: flex;
      height: 52px;
      margin-top: 5px;
      border-radius: 5px;
      align-items: center;
    }
    .top-three {
      background: linear-gradient(to right, #e3e7ff 0%, #909ef0 100%);
      border: 1px solid #4e5cde;
    }
    .others {
      background: #e3e7ff;
      border: 1px solid #909ef0;
    }
  }
  .user-rank {
    margin-left: 16px;
    width: 321px;
    height: 51px;
    background-image: url('../../assets/app/img/png/game/userRankBackground.png');
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    align-items: center;
    padding: 0 15px 0 10px;
  }
}
.rank-orer {
  width: 60px;
  height: 20px;
  line-height: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .rank-order-num {
    font-size: 13px;
    color: #4e5cde;
  }
}
.user-info-avatar {
  margin-left: -20px;
}
.user-info {
  width: 145px;
  margin-left: -10px;

  .name {
    display: inline-block;
    width: 100%;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .level {
    font-size: 7px;
  }
}
.user-points {
  text-align: center;
  width: 60px;
  color: #4e5cde;
  font-size: 13px;
}
</style>
