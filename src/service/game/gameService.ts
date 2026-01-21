// src/service/game/gameService.ts 简化版
export const useGameService = () => {
  return {
    getRankList: async (page: number, pageSize: number, type: string) => {
      console.log(`获取${type}游戏排行榜，第${page}页`)
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 返回模拟数据
      return {
        success: true,
        data: {
          self: {
            rank: Math.floor(Math.random() * 10) + 1,
            points: Math.floor(Math.random() * 1000) + 500
          },
          list: Array.from({ length: 10 }, (_, i) => ({
            rank: i + 1,
            points: 1000 - i * 100,
            name: `玩家${i + 1}`
          })),
          rank_list: Array.from({ length: 10 }, (_, i) => ({  // 添加 rank_list 字段
            rank: i + 1,
            points: 1000 - i * 100,
            name: `玩家${i + 1}`,
            avatar: `https://via.placeholder.com/50?text=玩家${i+1}`,
            level: Math.floor(Math.random() * 10) + 1,
            nickname: `玩家${i + 1}`
          })),
          total: 100,
          page,
          pageSize
        }
      }
    },
    
    submitScore: async (points: number, type: string) => {
      console.log(`提交${type}游戏分数: ${points}`)
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟成功提交
      return {
        success: true,
        data: {
          self: {
            rank: Math.floor(Math.random() * 10) + 1,
            points: points
          },
          rank_list: []  // 提交分数时可能不需要返回完整的 rank_list
        }
      }
    }
  }
}