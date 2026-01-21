/**
 * 函数功能描述：播放和停止音频文件
 * @param filePath 要播放的音频文件路径
 */
let bgmAudio: HTMLAudioElement | null = null
let currentAudio: HTMLAudioElement | null = null

const audioCache: Map<string, HTMLAudioElement> = new Map()

export function playAudio(filePath: string | undefined): void {
  if (!filePath) {
    console.warn('音频路径为空，无法播放')
    return
  }

  // 停止当前音效
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }

  let audio = audioCache.get(filePath)
  if (!audio) {
    audio = new Audio(filePath)
    audioCache.set(filePath, audio)
  } else {
    // 重置状态
    audio.currentTime = 0
  }

  currentAudio = audio

  // 直接播放，不再等待 onloadeddata
  audio.play().catch((e) => {
    console.error('播放失败:', e)
    // 可选：如果失败，尝试重新加载
    audio.load()
    audio.onloadeddata = () => {
      audio.play().catch((e2) => console.error('重试播放失败:', e2))
    }
  })

  audio.onerror = () => {
    console.error('音频错误，请检查路径或格式:', filePath)
  }
}

export function playBgm(filePath: string | undefined, loop: boolean = true): void {
  if (!filePath) {
    console.warn('背景音乐路径为空，无法播放')
    return
  }
  if (bgmAudio) {
    bgmAudio.pause()
    bgmAudio.currentTime = 0
    bgmAudio = null
  }
  let audio = audioCache.get(filePath)

  if (!audio) {
    // 创建新 Audio 并缓存
    audio = new Audio()
    audio.src = filePath // 注意：filePath 应为有效的 URL（如 file:// 或 public 路径）
    audio.load()
    audioCache.set(filePath, audio)
  }
  bgmAudio = audio
  audio.currentTime = 0
  audio.loop = loop
  audio.onloadeddata = () => {
    audio.play().catch((e) => {
      console.error('播放失败:', e)
    })
  }

  audio.onerror = () => {
    console.error('音频错误，请检查路径或格式:', filePath)
  }
}

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
}

export function pauseBgm(): void {
  if (bgmAudio) {
    bgmAudio.pause()
  }
}

export function resumeBgm(): void {
  if (bgmAudio) {
    bgmAudio.play().catch((e) => {
      console.error('播放失败:', e)
    })
  }
}

export function stopBgm(): void {
  if (bgmAudio) {
    bgmAudio.pause()
    bgmAudio.currentTime = 0
    bgmAudio = null
  }
}

export function clearAudioFromCache(filePath: string): void {
  const audio = audioCache.get(filePath)
  if (audio) {
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
    audioCache.delete(filePath)
  }
}

export function clearAudioCache(): void {
  audioCache.forEach((audio) => {
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
  })
  audioCache.clear()
}
