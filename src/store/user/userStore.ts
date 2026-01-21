// src/store/user/userStore.ts
import { defineStore } from 'pinia'

// 定义类型
interface Achievement {
  achievement_id: number
  name: string
  description?: string
  icon?: string
}

// 用户状态类型
interface UserState {
  userId: number
  nickname: string
  level: number
  avatar: string
  phone: string
  email: string
  wechatName: string
  password: string
  describe: string
  birthday: string
  gender: number
  token: string
  refreshToken: string
  improvedInfo: boolean
  guideState: boolean
  modelList: Achievement[]
  detail: boolean
}

// 创建用户 store
export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userId: 1,
    nickname: '游戏玩家',
    level: 5,
    avatar: 'https://via.placeholder.com/100',
    phone: '13800138000',
    email: 'player@example.com',
    wechatName: 'GamePlayer',
    password: '',
    describe: '热爱游戏的玩家',
    birthday: '1990-01-01',
    gender: 0,
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    improvedInfo: true,
    guideState: false,
    modelList: [
      { achievement_id: 1, name: '跑酷大师', description: '跑酷游戏高手' },
      { achievement_id: 2, name: '钓鱼高手', description: '钓鱼游戏达人' },
      { achievement_id: 3, name: '游戏达人', description: '全能游戏玩家' }
    ],
    detail: false
  }),

  getters: {
    // 判断是否已登录
    isLoggedIn(): boolean {
      return this.token !== ''
    },
    
    // 获取用户基本信息
    getUserInfo(): { nickname: string; level: number; avatar: string } {
      return {
        nickname: this.nickname,
        level: this.level,
        avatar: this.avatar
      }
    }
  },

  actions: {
    // 初始化 store
    async init() {
      console.log('用户 store 初始化完成')
      return Promise.resolve()
    },

    // 更新用户信息
    updateUser(data: Partial<UserState>) {
      this.$patch(data)
    },

    // 设置详情
    setDetail(detail: boolean) {
      this.detail = detail
    },

    // 设置头像
    setAvatar(avatar: string) {
      this.avatar = avatar
    },

    // 清除用户数据（重置为默认值）
    clearUser() {
      this.$reset()
    },

    // 设置 token（mock 方法）
    setToken(token: string, refreshToken: string) {
      this.token = token
      this.refreshToken = refreshToken
    },

    // 获取 token（mock 方法）
    getToken(): string {
      return this.token
    },

    // 获取 refresh token（mock 方法）
    getRefreshToken(): string {
      return this.refreshToken
    },

    // 监听等级提升
    listenerLevelUp(level: number) {
      if (level > this.level) {
        this.level = level
        console.log(`用户等级提升到 ${level}`)
      }
    },

    // 添加模型
    pushModel(model: Achievement) {
      const exists = this.modelList.find(item => item.achievement_id === model.achievement_id)
      if (exists) return null
      
      const newList = [...this.modelList]
      let popItem = null
      
      if (newList.length >= 3) {
        popItem = newList.shift() || null
      }
      
      newList.push(model)
      this.modelList = newList
      
      return popItem
    },

    // 初始化模型列表
    initModelList(modelList: Achievement[]) {
      this.modelList = modelList
    },

    // 检查是否穿戴模型
    hasWearingModel(id: number): boolean {
      return this.modelList.some(item => item.achievement_id === id)
    }
  }
})

// 创建快捷方式
export const useMockUserStore = () => {
  const store = useUserStore()
  return store
}