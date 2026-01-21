import Cactus from '@assets/app/img/png/game/obstacle/Cactus.png'
import Stone from '@assets/app/img/png/game/obstacle/Stone.png'
import Thicket from '@assets/app/img/png/game/obstacle/Thicket.png'
import Hole from '@assets/app/img/png/game/obstacle/Hole.png'
import GreenTree from '@assets/app/img/png/game/obstacle/GreenTree.png'
import PinkTree from '@assets/app/img/png/game/obstacle/PinkTree.png'
import BigCactus from '@assets/app/img/png/game/obstacle/BigCactus.png'
import Coin from '@assets/app/img/png/game/Coin.png'
export interface Obstacle {
  offsetX: number
  offsetY: number
  width: number
  height: number
  caught: boolean
  type: 'high' | 'low' | 'wide' | 'narrow' | 'ground' //高、矮、宽、窄
  isHole?: boolean
  src: string
}

export interface Reward {
  src: string
  score: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  caught?: boolean
}

export interface Pet {
  x: number
  y: number
  width: number
  height: number
  actionName: string
  frameIndex: number
}
export interface Background {
  x: number
  y: number
  width: number
  height: number
  src: string
}

export interface ObstacleFragment {
  width: number
  height: number
  obstacleList: Obstacle[]
  rewards: Reward[]
}

export interface ObstacleFragmentWithPosition extends ObstacleFragment {
  x: number
  y: number
}

const obstacleMap: ObstacleFragment[] = [
  {
    width: 352,
    height: 503,
    obstacleList: [
      {
        offsetX: 126,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 352,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 352,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 352,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 352,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 352,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 352,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 431,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 352,
    height: 503,
    obstacleList: [
      {
        offsetX: 76,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      },
      {
        offsetX: 176,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 486,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 502,
    height: 503,
    obstacleList: [
      {
        offsetX: 151,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      },
      {
        offsetX: 251,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [
      {
        offsetX: 176,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      },
      {
        offsetX: 276,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      },
      {
        offsetX: 376,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [
      {
        offsetX: 246,
        offsetY: 303,
        width: 160,
        height: 200,
        caught: false,
        type: 'high',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [
      {
        offsetX: 126,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      },
      {
        offsetX: 246,
        offsetY: 303,
        width: 160,
        height: 200,
        caught: false,
        type: 'high',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [
      {
        offsetX: 176,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      },
      {
        offsetX: 276,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [
      {
        offsetX: 176,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      },
      {
        offsetX: 276,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      },
      {
        offsetX: 376,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [
      {
        offsetX: 276,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      },
      {
        offsetX: 376,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 151,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 502,
    height: 503,
    obstacleList: [
      {
        offsetX: 151,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      },
      {
        offsetX: 251,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 502,
    height: 503,
    obstacleList: [
      {
        offsetX: 151,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      },
      {
        offsetX: 251,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 502,
    height: 503,
    obstacleList: [
      {
        offsetX: 251,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  },
  {
    width: 652,
    height: 503,
    obstacleList: [
      {
        offsetX: 176,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      },
      {
        offsetX: 276,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        isHole: true,
        src: ''
      },
      {
        offsetX: 376,
        offsetY: 433,
        width: 100,
        height: 70,
        caught: false,
        type: 'low',
        src: ''
      }
    ],
    rewards: [
      {
        src: Coin,
        score: 10,
        offsetX: 1,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 151,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 301,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 451,
        offsetY: 301,
        width: 50,
        height: 50,
        caught: false
      },
      {
        src: Coin,
        score: 10,
        offsetX: 601,
        offsetY: 429,
        width: 50,
        height: 50,
        caught: false
      }
    ]
  }
]

const obstacleImgMap = {
  high: [GreenTree, PinkTree, BigCactus],
  low: [Cactus, Stone, Thicket],
  wide: [],
  narrow: [],
  ground: '',
  hole: Hole
}

export const getRandomObstacleImg = (
  type: 'high' | 'low' | 'wide' | 'narrow' | 'ground'
): string => {
  switch (type) {
    case 'high':
      return obstacleImgMap.high[Math.floor(Math.random() * obstacleImgMap.high.length)]
    case 'low':
      return obstacleImgMap.low[Math.floor(Math.random() * obstacleImgMap.low.length)]
    case 'wide':
      return obstacleImgMap.wide[Math.floor(Math.random() * obstacleImgMap.wide.length)]
    case 'narrow':
      return obstacleImgMap.narrow[Math.floor(Math.random() * obstacleImgMap.narrow.length)]
    case 'ground':
      return obstacleImgMap.ground
    default:
      return ''
  }
}

export const getRandomObstacleFragment = (
  right: number,
  bottom: number
): ObstacleFragmentWithPosition | null => {
  if (Math.random() < 0.1) {
    // 20% 概率返回空障碍片段
    return null
  }
  const obf = JSON.parse(
    JSON.stringify(obstacleMap[Math.floor(Math.random() * obstacleMap.length)])
  ) as ObstacleFragmentWithPosition
  obf.x = right
  obf.y = bottom - obf.height
  const typeImgMap = new Map<string, string>()
  // 相同type使用同一个图片
  obf.obstacleList.map((obstacle) => {
    if (obstacle.type === 'low' && obstacle.isHole === undefined) {
      obstacle.isHole = Math.random() < 0.3 // 30% 概率是坑
    }
    if (!obstacle.isHole) {
      if (typeImgMap.size > 0 && typeImgMap.has(obstacle.type)) {
        obstacle.src = typeImgMap.get(obstacle.type)!
      } else {
        obstacle.src = getRandomObstacleImg(obstacle.type)
      }
    } else {
      obstacle.src = obstacleImgMap.hole
      obstacle.offsetY += obstacle.height
    }
    obstacle.offsetX = obf.x + obstacle.offsetX
    obstacle.offsetY = obf.y + obstacle.offsetY
  })
  obf.rewards.map((reward) => {
    reward.offsetX = obf.x + reward.offsetX
    reward.offsetY = obf.y + reward.offsetY
  })
  return obf
}
