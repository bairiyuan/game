<template>
  <div
    :class="[
      self ? 'user-rank' : 'rank-list-item',
      self ? '' : item.rank <= 3 ? 'top-three' : 'others'
    ]"
  >
    <base-img v-if="item.rank === 1" :src="RandOrderOne" width="24" height="24" class="rank-orer" />
    <base-img
      v-else-if="item.rank === 2"
      :src="RandOrderTwo"
      width="24"
      height="24"
      class="rank-orer"
    />
    <base-img
      v-else-if="item.rank === 3"
      :src="RandOrderThree"
      width="24"
      height="24"
      class="rank-orer"
    />
    <div v-else class="rank-orer">
      <div class="rank-order-num">{{ item.rank !== 0 ? item.rank : '...' }}</div>
      <div class="rank-order-icon">
        <base-img :src="RankOrderNormal" width="14" height="7" />
      </div>
    </div>
    <avatar :src="item.avatar_url" style="scale: 0.5" class="user-info-avatar"></avatar>
    <div class="user-info">
      <p class="name">{{ item.nickname }}</p>
      <!-- <p class="level">Lv.{{ item.level }}</p> -->
    </div>
    <div class="user-points">{{ item.points }}</div>
  </div>
</template>

<script setup lang="ts">
import RankOrderNormal from '@assets/app/img/svg/game/RankOrderNormal.svg'
import RandOrderOne from '@assets/app/img/svg/game/RandOrderOne.svg'
import RandOrderTwo from '@assets/app/img/svg/game/RandOrderTwo.svg'
import RandOrderThree from '@assets/app/img/svg/game/RandOrderThree.svg'
//引入组件
import BaseImg from '@renderer/components/base/BaseImg.vue'
import Avatar from '@renderer/components/Avatar.vue'
interface RankItem {
  rank: number
  avatar_url?: string
  nickname: string
  level: number
  points: number
}
interface props {
  self?: boolean
  item: RankItem
}

const props = defineProps<props>()
</script>

<style scoped lang="scss">
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
.user-rank {
  width: 321px;
  height: 51px;
  background-image: url('../../assets/app/img/png/game/userRankBackground.png');
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  padding: 0 15px 0 10px;
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
    font-size: 9px;
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
