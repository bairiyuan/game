// white
import BreadWhite from '@assets/app/img/png/bag/white/BreadWhite.png'
import CakeWhite from '@assets/app/img/png/bag/white/CakeWhite.png'
import ChocolateWhite from '@assets/app/img/png/bag/white/ChocolateWhite.png'
import CookieWhite from '@assets/app/img/png/bag/white/CookieWhite.png'
import DrumstickWhite from '@assets/app/img/png/bag/white/DrumstickWhite.png'
import FishWhite from '@assets/app/img/png/bag/white/FishWhite.png'
import FoodBoxWhite from '@assets/app/img/png/bag/white/FoodBoxWhite.png'
import IceCreamWhite from '@assets/app/img/png/bag/white/IcecreamWhite.png'
import MilkTeaWhite from '@assets/app/img/png/bag/white/MilkteaWhite.png'
import NoodlesWhite from '@assets/app/img/png/bag/white/NoodlesWhite.png'
import PotatoChipsWhite from '@assets/app/img/png/bag/white/PotatoChipsWhite.png'
import ReincarnationPillWhite from '@assets/app/img/png/bag/white/ReincarnationPillWhite.png'
import RiceBallWhite from '@assets/app/img/png/bag/white/RiceBallWhite.png'
import SandwichWhite from '@assets/app/img/png/bag/white/SandwichWhite.png'
import VegetableWhite from '@assets/app/img/png/bag/white/VegetableWhite.png'

import { RewardItem, RewardCode, RewardType } from '@renderer/types/reward'

const giftCodes = [
  'money',
  'diamond',
  'cake',
  'biscuit',
  'kitten_calcium',
  'resurrection_pill',
  'milk_tea',
  'noodles',
  'snack',
  'vegetables',
  'chocolate',
  'sandwich',
  'boiled_fish',
  'rice_ball',
  'ice_cream',
  'bread',
  'potato_chips',
  'french_fries',
  'food_box',
  'prop_box',
  'milk',
  'pure_water',
  'energy_pill',
  'calcium_tablet',
  'mood_supplement',
  'energy_supplement',
  'aura_supplement',
  'rabbit_cookie',
  'makeup_card',
  'achievement',
  'experience'
]

const foodCodes = [
  'food_box',
  'milk_tea',
  'noodles',
  'vegetables',
  'chocolate',
  'sandwich',
  'boiled_fish',
  'rice_ball',
  'ice_cream',
  'french_fries',
  'bread',
  'potato_chips',
  'cake'
]

const propCodes = [
  'prop_box',
  'milk',
  'pure_water',
  'energy_pill',
  'calcium_tablet',
  'mood_supplement',
  'energy_supplement',
  'aura_supplement',
  'rabbit_cookie',
  'makeup_card',
  'kitten_calcium',
  'resurrection_pill',
  'achievement'
]

const whiteIconCodes = [
  'bread',
  'cake',
  'chocolate',
  'cookie',
  'drumstick',
  'fish',
  'food_box',
  'ice_cream',
  'mike_tea',
  'noodles',
  'potato_chips',
  'reincarnation_pill',
  'rice_ball',
  'sandwich',
  'vegetable'
]

export function getWhiteIcon(reward_code: RewardCode): string {
  switch (reward_code) {
    case 'bread':
      return BreadWhite
    case 'cake':
      return CakeWhite
    case 'chocolate':
      return ChocolateWhite
    case 'biscuit':
      return CookieWhite
    case 'drumstick':
      return DrumstickWhite
    case 'boiled_fish':
      return FishWhite
    case 'food_box':
      return FoodBoxWhite
    case 'ice_cream':
      return IceCreamWhite
    case 'milk_tea':
      return MilkTeaWhite
    case 'noodles':
      return NoodlesWhite
    case 'potato_chips':
      return PotatoChipsWhite
    case 'resurrection_pill':
      return ReincarnationPillWhite
    case 'rice_ball':
      return RiceBallWhite
    case 'sandwich':
      return SandwichWhite
    case 'vegetables':
      return VegetableWhite
    default:
      return ''
  }
}

export function isGiftReward(reward_code: RewardCode): 'food' | 'prop' | 'other' | undefined {
  if (isFoodReward(reward_code)) {
    return 'food'
  } else if (isPropReward(reward_code)) {
    return 'prop'
  } else if (giftCodes.includes(reward_code)) {
    return 'other'
  }
  return undefined
}

export function typeofGiftReward(reward_code: RewardCode): RewardType {
  if (isFoodReward(reward_code)) {
    return 'food'
  } else if (isPropReward(reward_code)) {
    return 'prop'
  } else if (giftCodes.includes(reward_code)) {
    return 'experience'
  }
  return 'experience'
}

export function isFoodReward(reward_code: RewardCode): boolean {
  return foodCodes.includes(reward_code)
}

export function isFoodBoxReward(rewards: Array<RewardItem>): boolean {
  return rewards
    .filter((reward) => isFoodReward(reward.reward_code) || isPropReward(reward.reward_code))
    .every((reward) => isFoodReward(reward.reward_code))
}

export function isPropReward(reward_code: RewardCode): boolean {
  return propCodes.includes(reward_code)
}

export function isPropBoxReward(rewards: Array<RewardItem>): boolean {
  return rewards
    .filter((reward) => isFoodReward(reward.reward_code) || isPropReward(reward.reward_code))
    .every((reward) => isPropReward(reward.reward_code))
}

export function sortRewards(rewards: Array<RewardItem>): Array<RewardItem> {
  return rewards.sort((a, b) => {
    const aIsFood = isFoodReward(a.reward_code) ? 1 : 0
    const bIsFood = isFoodReward(b.reward_code) ? 1 : 0
    if (aIsFood !== bIsFood) {
      return bIsFood - aIsFood
    }
    return b.reward_amount - a.reward_amount
  })
}

export function codeToName(reward_code: RewardCode): string {
  switch (reward_code) {
    case 'milk_tea':
      return '奶茶'
    case 'ice_cream':
      return '冰激凌'
    case 'potato_chips':
      return '薯片'
    case 'french_fries':
      return '薯条'
    case 'chocolate':
      return '巧克力'
    case 'biscuit':
      return '饼干'
    case 'bread':
      return '面包'
    case 'rice_ball':
      return '饭团'
    case 'noodles':
      return '面条'
    case 'vegetables':
      return '蔬菜'
    case 'sandwich':
      return '三明治'
    case 'boiled_fish':
      return '水煮鱼'
    case 'cake':
      return '蛋糕'
    case 'milk':
      return '牛奶'
    case 'pure_water':
      return '纯净水'
    case 'energy_pill':
      return '提神药丸'
    case 'calcium_tablet':
      return '营养钙片'
    case 'mood_supplement':
      return '心情补充剂'
    case 'energy_supplement':
      return '精气补充剂'
    case 'aura_supplement':
      return '灵气补充剂'
    case 'kitten_calcium':
      return '小猫营养钙片'
    case 'rabbit_cookie':
      return '小兔饼干'
    case 'resurrection_pill':
      return '还魂丹'
    case 'money':
      return '金币'
    case 'diamond':
      return '钻石'
    case 'food_box':
      return '食物盒'
    case 'prop_box':
      return '道具盒'
    case 'makeup_card':
      return '补签卡'
    case 'achievement':
      return '成就'
    case 'experience':
      return '经验'
    default:
      return ''
  }
}

export function codeToLevel(reward_code: RewardCode): 0 | 1 | 2 | 3 | -1 {
  switch (reward_code) {
    case 'milk_tea':
    case 'ice_cream':
    case 'potato_chips':
    case 'french_fries':
    case 'chocolate':
      return 0
    case 'biscuit':
    case 'bread':
    case 'rice_ball':
    case 'noodles':
    case 'drumstick':
      return 1
    case 'vegetables':
    case 'sandwich':
    case 'boiled_fish':
    case 'cake':
      return 2
    case 'milk':
    case 'pure_water':
      return 0
    case 'energy_pill':
    case 'calcium_tablet':
      return 1
    case 'mood_supplement':
    case 'energy_supplement':
    case 'aura_supplement':
      return 2
    case 'rabbit_cookie':
      return 2
    case 'kitten_calcium':
    case 'resurrection_pill':
      return 3
    default:
      return -1
  }
}

export function codeToColor(reward_code: RewardCode): string {
  const level = codeToLevel(reward_code)
  switch (level) {
    case 0:
      return 'green'
    case 1:
      return 'blue'
    case 2:
      return 'purple'
    case 3:
      return 'gold'
    default:
      return 'green'
  }
}

export function getRandomGiftCode(): RewardCode {
  const randomIndex = Math.floor(Math.random() * giftCodes.length)
  return giftCodes[randomIndex] as RewardCode
}

export function getRandomWhiteIconCode(): RewardCode {
  const randomIndex = Math.floor(Math.random() * whiteIconCodes.length)
  return whiteIconCodes[randomIndex] as RewardCode
}

// 背包排序
export function sortByLevel(item: any[]): any[] {
  return item.sort((a, b) => {
    const aLevel = codeToLevel(a.code)
    const bLevel = codeToLevel(b.code)
    if (aLevel === bLevel) {
      return a.quantity - b.quantity
    }
    return aLevel - bLevel
  })
}
