import { ref } from 'vue'

export enum ACTION {
  POWER_ON = 'power-on',
  STANDBY = 'standby',
  STANDBY_SIDE_RIGHT_START = 'standby-side-right-start',
  STANDBY_SIDE_RIGHT = 'standby-side-right',
  STANDBY_SIDE_LEFT_START = 'standby-side-left-start',
  STANDBY_SIDE_LEFT = 'standby-side-left',
  DRAGGING_START = 'dragging-start',
  DRAGGING = 'dragging',
  DRAGGING_END = 'dragging-end',
  POWER_OFF = 'power-off',
  TALK = 'talk',
  INTERACT_STAR = 'interact-star',
  GREET = 'greet',
  FEEDBACK = 'feedback',
  VOICE_INPUT_START = 'voice-input-start',
  VOICE_INPUT = 'voice-input',
  VOICE_INPUT_END = 'voice-input-end',
  TODO_REMIND_START = 'todo-remind-start',
  TODO_REMIND = 'todo-remind',
  TODO_REMIND_END = 'todo-remind-end',
  CHASE_FOOD_LEFT_START = 'chase-food-left-start',
  CHASE_FOOD_LEFT = 'chase-food-left',
  CHASE_FOOD_LEFT_END = 'chase-food-left-end',
  CHASE_FOOD_RIGHT_START = 'chase-food-right-start',
  CHASE_FOOD_RIGHT = 'chase-food-right',
  CHASE_FOOD_RIGHT_END = 'chase-food-right-end',
  CHASE_FOOD_END = 'chase-food-end',
  OFFLINE_START = 'offline-start',
  OFFLINE = 'offline',
  OFFLINE_END = 'offline-end',
  SLEEP_START = 'sleep-start',
  SLEEP = 'sleep',
  SLEEP_END = 'sleep-end',
  SICK_START = 'sick-start',
  SICK = 'sick',
  HUNGRY_START = 'hungry-start',
  HUNGRY = 'hungry',
  SHOW_TOMATO = 'show-tomato',
  TOMATO_END = 'tomato-end',
  THINK_START = 'think-start',
  THINK = 'think',
  THINK_END = 'think-end',
  LEVEL_UP = 'level-up',
  REMIND_NEW_EMAIL = 'remind-new-email',
  GET_ACHIEVEMENT_REMIND = 'get-achievement-remind',
  BURROW_INTO_THE_GROUND = 'burrow-into-the-ground',
  EMERGE_FROM_THE_GROUND = 'emerge-from-the-ground'
}

export enum STATE {
  NORMAL = 'normal',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export interface ActionMetadata {
  name: ACTION
  isLoop: boolean
  mustComplete: boolean
  priority: number
  perAction?: ACTION[]
  selfPending?: boolean
  audio?: string
  hideToolBar?: boolean
  interval?: number
  frameCount?: number
  bloodAB?: boolean //可以被所有动作打断(参考血型)
  bloodO?: boolean //可以打断所有动作
  onFinish?: () => void
}

interface AnimateData {
  meta: Map<ACTION, ActionMetadata>
  base: ACTION[]
  allActions: ACTION[]
  actionPool: Record<STATE, ACTION[]>
}

const ACTION_META = ref<Map<ACTION, any>>(new Map())

const DATA = ref<AnimateData>()

const BASE_ACTIONS = ref<ACTION[]>([])

const ACTION_POOL = ref<Record<STATE, ACTION[]>>({
  [STATE.NORMAL]: [],
  [STATE.BUSY]: [],
  [STATE.OFFLINE]: []
})

const NOW_ALL_ACTIONS = ref<ACTION[]>([])

const initActionMeta = async (petId: number, path?: string) => {
  const response = await fetch(`zj-file://0.0.0.0${path}/pets/${petId}/actions/meta.json`)
  const data = await response.json()
  DATA.value = data
  ACTION_META.value = new Map(Object.entries(data.meta)) as Map<ACTION, any>
  BASE_ACTIONS.value = data.base
  ACTION_POOL.value = data.action_pool
  NOW_ALL_ACTIONS.value = Array.from(ACTION_META.value.keys())
}

export const getActionData = async (petId: number, path?: string): Promise<AnimateData> => {
  if (!DATA.value) {
    await initActionMeta(petId, path)
  }
  if (!DATA.value) return {} as AnimateData
  DATA.value.allActions = NOW_ALL_ACTIONS.value
  return DATA.value as AnimateData
}
