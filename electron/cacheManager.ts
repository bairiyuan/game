import { app } from 'electron'
import path from 'path'
import fs from 'fs-extra'

const cacheDir = path.join(app.getPath('userData'), 'cache')
export function getCacheDir(): string {
  return cacheDir
}

// fileName 可以是相对路径
// 例如： "images/avatar.png"
// 则缓存文件路径为 <userData>/cache/images/avatar.png
export function getCacheFilePath(fileName: string): string {
  if (fileName.endsWith('/')) {
    // index.html 特例
    fileName = path.join(fileName, 'index.html')
  }
  return path.join(cacheDir, fileName)
}

async function ensureDirectoryExist(filePath: string): Promise<void> {
  const dir = path.dirname(filePath)
  try {
    await fs.promises.access(dir) // 检查是否存在
  } catch {
    await fs.promises.mkdir(dir, { recursive: true }) // 不存在则创建（含多层）
  }
}

export function clearCache(): void {
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true })
    fs.mkdirSync(cacheDir, { recursive: true })
  }
}

export function deleteCacheFile(fileName: string): void {
  const filePath = getCacheFilePath(fileName)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

export async function writeCacheFile(filePath: string, data: Buffer | string): Promise<void> {
  await ensureDirectoryExist(filePath)
  await fs.writeFile(filePath, data)
}

export async function readCacheFile(filePath: string): Promise<Buffer | null> {
  if (fs.existsSync(filePath)) {
    return await fs.readFile(filePath)
  }
  return null
}

export function existCacheFile(fileName: string): { exist: boolean; filePath: string } {
  const filePath = getCacheFilePath(fileName)
  return {
    exist: fs.existsSync(filePath),
    filePath
  }
}

export function getCacheFile(fileName: string): Buffer | null {
  const filePath = getCacheFilePath(fileName)
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath)
  }
  return null
}
