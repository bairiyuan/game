// src/store/petStore.ts 超简化版
import { defineStore } from 'pinia'

export const usePetStore = defineStore('pet', {
  state: () => ({
    id : 1,
    name: '小可爱',
    level: 5,
    likability: 85,
    satiety: 90,
    energy: 75,
    exp: 65
  }),

  getters: {
    petStatus: (state) => ({
      name: state.name,
      level: state.level,
      likability: state.likability,
      satiety: state.satiety,
      energy: state.energy,
      exp: state.exp
    })
  },

  actions: {
    init() {
      return Promise.resolve()
    },
    
    addExperience(amount: number) {
      this.exp += amount
      // 简单升级逻辑：每100经验升一级
      if (this.exp >= 100) {
        this.level += Math.floor(this.exp / 100)
        this.exp = this.exp % 100
      }
    },
    
    feedPet() {
      this.satiety = Math.min(100, this.satiety + 20)
      this.likability += 5
    },
    
    playWithPet() {
      this.likability += 10
      this.energy = Math.max(0, this.energy - 15)
      this.addExperience(15)
    }
  }
})