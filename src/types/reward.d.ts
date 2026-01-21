export type RewardCode =
  | 'money'
  | 'diamond'
  | 'cake'
  | 'biscuit'
  | 'kitten_calcium'
  | 'drumstick'
  | 'resurrection_pill'
  | 'milk_tea'
  | 'noodles'
  | 'snack'
  | 'vegetables'
  | 'chocolate'
  | 'sandwich'
  | 'boiled_fish'
  | 'rice_ball'
  | 'ice_cream'
  | 'bread'
  | 'potato_chips'
  | 'french_fries'
  | 'food_box'
  | 'prop_box'
  | 'milk'
  | 'pure_water'
  | 'energy_pill'
  | 'calcium_tablet'
  | 'mood_supplement'
  | 'energy_supplement'
  | 'aura_supplement'
  | 'rabbit_cookie'
  | 'makeup_card'
  | 'achievement'
  | 'experience'
  | 'likability'
  | 'INTERACT_INVITE_3'

export type RewardType =
  | 'food'
  | 'prop'
  | 'experience'
  | 'likability'
  | 'money'
  | 'diamond'
  | 'achievement'
  | 'skin'
  | 'pet'
  | 'skill'
// task|activity|invitation|online|mail
type SourceType = 'task' | 'activity' | 'invitation' | 'online' | 'mail' | 'taskv2'

export interface GenalRewardRequest {
  sourceType: SourceType
  sourceId?: string
  args?: {
    period_type?: 'daily' | 'weekly'
    reward_level?: number
    reward_day?: number
    duration?: number
    is_all?: boolean
  }
}

export interface RewardItem {
  reward_code: RewardCode
  reward_type: RewardType
  reward_amount: number
}
