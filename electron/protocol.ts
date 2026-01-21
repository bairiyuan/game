// main-process/custom-protocol.ts
import { protocol, app, net } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import mime from 'mime-types'
import { createDecipheriv } from 'crypto'
import sharp from 'sharp'
// import { globalStateGet } from '../ipc/handler/storeHandler'
import { getExtraResourceBasePath } from './myPath'
import { existCacheFile, readCacheFile, writeCacheFile } from './cacheManager'
import { consoleLogger } from './logger'

const KEY_PARTS = ['7x9Lp2qR', 'mK4nV8sT', 'aB3cD5eF', 'gH6jJ7kL']
const SECRET_KEY = Buffer.from(KEY_PARTS.join('').padEnd(32, 'X').substring(0, 32)) // 32字节
const MAGIC = Buffer.from('ZJATLASv2')
const OUTPUT_EXT = '.techybuddy'
const META_NAME = 'tb-meta.json'

let base = ''

interface FrameInfo {
  x: number
  y: number
  width: number
  height: number
  sourceW?: number
  sourceH?: number
}

interface FrameList {
  [frameName: string]: FrameInfo
}

type AtlasCache = { buffer: Buffer; meta: Record<string, any> }
const atlasCache = new Map<string, AtlasCache>()
const frameCache = new Map<string, Buffer>()

async function decryptBuffer(filePath: string): Promise<Buffer> {
  const encrypted = await fs.readFile(filePath)
  if (!encrypted.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('Invalid magic number')
  const iv = encrypted.subarray(MAGIC.length, MAGIC.length + 12)
  const authTag = encrypted.subarray(MAGIC.length + 12, MAGIC.length + 28)
  const data = encrypted.subarray(MAGIC.length + 28) // 直接取密文
  const decipher = createDecipheriv('aes-256-gcm', SECRET_KEY, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(data), decipher.final()])
}

async function cropFrame(atlasBuf: Buffer, frame: FrameInfo): Promise<Buffer> {
  return sharp(atlasBuf)
    .extract({ left: frame.x, top: frame.y, width: frame.width, height: frame.height })
    .png()
    .toBuffer()
}

async function cropFrames(atlasBuf: Buffer, frameKey: string, frames: FrameList) {
  for (const [fname, finfo] of Object.entries(frames)) {
    if (frameCache.has(`${frameKey}/${fname}`)) continue

    const png = await cropFrame(atlasBuf, finfo)
    frameCache.set(`${frameKey}/${fname}`, png)
  }
}

async function cleanCache(cacheKey: string, meta: FrameList) {
  atlasCache.delete(cacheKey)
  for (const fname of Object.keys(meta)) {
    frameCache.delete(`${cacheKey}/${fname}`)
  }
}

function createResp(data: Buffer, mimeType: string): Response {
  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Length': data.length.toString(),
      'Cache-Control': 'public, max-age=2592000',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

async function handlePet(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const params = url.searchParams
  const petId = params.get('petId') || ''
  const actionName = params.get('action') || ''
  const frameFile = params.get('frame') || ''
  if (!frameFile?.endsWith('.png')) return new Response('Bad path', { status: 400 })

  if (!base) {
    base = getExtraResourceBasePath()
  }
  const actionsDir = path.join(base, url.pathname)
  const metaPath = path.join(actionsDir, META_NAME)

  const meta = JSON.parse((await fs.readFile(metaPath)).toString())
  const frameLength = Object.keys(meta.meta?.[actionName] || {}).length
  if (frameLength === 0) return new Response('No frames in action', { status: 404 })
  const frameInfo = meta.meta?.[actionName]?.[frameFile]
  if (!frameInfo) return new Response('Frame not in meta', { status: 404 })

  const cacheKey = `${petId}/${actionName}`
  let cached = atlasCache.get(cacheKey)
  if (!cached) {
    const actionPath = path.join(actionsDir, actionName + OUTPUT_EXT)
    if (!(await fs.pathExists(actionPath))) {
      return new Response('Atlas file not found', { status: 404 })
    }
    const atlasBuf = await decryptBuffer(actionPath)
    cached = { buffer: atlasBuf, meta: meta.meta[actionName] }
    atlasCache.set(cacheKey, cached)
    cropFrames(atlasBuf, cacheKey, cached.meta)
  }
  const index = parseInt(frameFile.match(/Frame_(\d+)\.png/)?.[1] || '1', 10)
  let png: Buffer | null = null
  if (frameCache.has(`${cacheKey}/${frameFile}`)) {
    png = frameCache.get(`${cacheKey}/${frameFile}`)!
  } else {
    png = await cropFrame(cached.buffer, frameInfo)
    frameCache.set(`${cacheKey}/${frameFile}`, png)
  }
  if (index === frameLength - 1) {
    // 最后一帧，清除缓存
    cleanCache(cacheKey, cached.meta)
  }
  return createResp(png, 'image/png')
}

async function handleStatic(request: Request, allowDir = false): Promise<Response> {
  const url = new URL(request.url)
  const relPath = decodeURIComponent(url.pathname)
  if (!base) {
    base = getExtraResourceBasePath()
  }
  const fullPath = path.join(base, relPath)
  consoleLogger.info(`[Static REQUEST] ${fullPath}`)
  await fs.access(fullPath) // 不存在直接抛错
  console.log(`[Static] Accessing: ${fullPath}`)
  const stat = await fs.stat(fullPath)

  if (stat.isDirectory()) {
    if (!allowDir) return new Response('Not a file', { status: 400 })
    const files = await fs.readdir(fullPath)
    const list = await Promise.all(
      files.map(async (f) => ({
        name: f,
        isDirectory: (await fs.stat(path.join(fullPath, f))).isDirectory()
      }))
    )
    return new Response(
      JSON.stringify({ path: fullPath, isDirectory: true, files: list }, null, 2),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  const ext = path.extname(fullPath)
  const mimeType = mime.lookup(fullPath) || 'application/octet-stream'

  // 若请求的是加密音频（.techybuddy 实体文件）
  if (ext === OUTPUT_EXT || relPath.includes('/audios/')) {
    try {
      consoleLogger.info(`[audio] decrypting audio file: ${fullPath}`)
      const decrypted = await decryptBuffer(fullPath)
      return createResp(decrypted, mimeType)
    } catch (e) {
      consoleLogger.error(`[audio] decrypt failed: ${fullPath}`, e)
      return new Response('Audio decryption error', { status: 500 })
    }
  }
  consoleLogger.info(`[Static] serving normal file: ${fullPath}`)
  // 普通文件直接返回
  return createResp(await fs.readFile(fullPath), mimeType)
}

const pendingRequests = new Map<string, Promise<Response>>()

async function handleCache(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const fileName = decodeURIComponent(url.pathname)
  consoleLogger.info(`[Cache REQUEST] ${fileName}`)

  const cacheKey = request.url // 或 `${url.origin}${url.pathname}`

  if (pendingRequests.has(cacheKey)) {
    consoleLogger.info(`[Dedup] Waiting for pending request: ${cacheKey}`)
    return pendingRequests.get(cacheKey)!
  }

  const { exist, filePath } = existCacheFile(fileName)
  if (exist) {
    consoleLogger.info(`[Cache HIT] ${fileName}`)
    try {
      const buffer = await readCacheFile(filePath)
      if (!buffer) throw new Error('Empty buffer')
      const mimeType = mime.lookup(filePath) || 'application/octet-stream'
      return createResp(buffer, mimeType)
    } catch (err) {
      consoleLogger.warn(`[Cache CORRUPT] ${fileName}, fallback to network`, err)
    }
  }

  const fetchPromise = (async (): Promise<Response> => {
    consoleLogger.info(`[Cache MISS] Fetching: ${request.url}`)
    const originUrl = request.url.replace(/^renderer:\/\//, 'https://')

    try {
      const response = await fetchFromNet(originUrl, filePath)
      return response
    } finally {
      pendingRequests.delete(cacheKey)
    }
  })()

  // 存入 pending 池（关键！）
  pendingRequests.set(cacheKey, fetchPromise)

  return fetchPromise
}

interface FetchOptions {
  maxRetries?: number
  retryDelay?: (attempt: number) => number
  requestTimeout?: number // 单次请求超时（毫秒）
  totalTimeout?: number // 总超时（从第一次开始算）
}

async function fetchFromNet(
  originUrl: string,
  filePath: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    retryDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000),
    requestTimeout = 10_000,
    totalTimeout = 30_000
  } = options

  const startTime = Date.now()
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 检查是否已超总时间
    if (Date.now() - startTime > totalTimeout) {
      throw new Error(`[FETCH] Total timeout exceeded (${totalTimeout}ms) for ${originUrl}`)
    }

    // 非首次尝试时等待
    if (attempt > 0) {
      const delay = retryDelay(attempt - 1)
      consoleLogger.warn(`[FETCH RETRY ${attempt}/${maxRetries}] ${originUrl}, delay=${delay}ms`)
      await new Promise((r) => setTimeout(r, delay))
    }

    try {
      const response = await fetchOnce(originUrl, filePath, requestTimeout)
      return response
    } catch (err) {
      lastError = err as Error
      consoleLogger.error(`[FETCH FAILED ATTEMPT ${attempt + 1}] ${originUrl}`, err)

      // 如果是致命错误（如 URL 格式错），不再重试
      if (isFatalError(err)) {
        break
      }
    }
  }

  throw new Error(`[FETCH] All retries failed for ${originUrl}. Last error: ${lastError?.message}`)
}

function fetchOnce(originUrl: string, filePath: string, timeoutMs: number): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    const req = net.request(originUrl)

    // 设置单次请求超时
    const timeoutId = setTimeout(() => {
      req.abort()
      reject(new Error(`Request timeout after ${timeoutMs}ms for ${originUrl}`))
    }, timeoutMs)

    req.on('response', (res) => {
      clearTimeout(timeoutId)

      const { statusCode, headers } = res

      if (statusCode !== 200) {
        return resolve(new Response('Origin fetch failed', { status: statusCode }))
      }

      const chunks: Buffer[] = []
      let receivedLength = 0

      res.on('data', (chunk) => {
        chunks.push(chunk)
        receivedLength += chunk.length
      })

      res.on('end', async () => {
        const buffer = Buffer.concat(chunks)
        consoleLogger.info(`[Origin FETCHED] ${originUrl}, size=${buffer.length}`)

        // 异步写缓存，不影响主流程
        writeCacheFile(filePath, buffer)
          .then(() => {
            consoleLogger.info(`[Cache WRITE] ${filePath}`)
          })
          .catch((err) => {
            consoleLogger.error(`[Cache WRITE ERROR] ${filePath}`, err)
          })

        const mimeType =
          (headers['content-type'] as string) || mime.lookup(filePath) || 'application/octet-stream'

        resolve(createResp(buffer, mimeType))
      })

      res.on('error', (err) => {
        clearTimeout(timeoutId)
        reject(err)
      })
    })

    req.on('error', (err) => {
      clearTimeout(timeoutId)
      reject(err)
    })

    req.end()
  })
}

// 判断是否为不可重试的错误
function isFatalError(err: unknown): boolean {
  if (typeof err !== 'object' || !err) return false
  const message = (err as Error).message?.toLowerCase() || ''
  // 这些错误通常无法通过重试解决
  return (
    message.includes('invalid url') ||
    message.includes('protocol') ||
    message.includes('unsupported protocol') ||
    message.includes('not a valid url')
  )
}

export function registerProtocol(): void {
  const priv = {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    corsEnabled: true,
    stream: true
  }
  protocol.registerSchemesAsPrivileged([
    { scheme: 'pet', privileges: priv },
    { scheme: 'audio', privileges: priv },
    { scheme: 'zj-file', privileges: priv },
    { scheme: 'renderer', privileges: priv }
  ])
}

export function handleProtocol(): void {
  protocol.handle('pet', handlePet)
  protocol.handle('audio', (r) => handleStatic(r, false))
  protocol.handle('zj-file', (r) => handleStatic(r, true))
  protocol.handle('renderer', handleCache)
}

/* ---------- 预加载高频帧 ---------- */
async function preloadHighFreq(petId: number) {
  const actions = ['power-on', 'standby', 'dragging-start', 'dragging-end', 'dragging']
  for (const act of actions) {
    try {
      await handlePet(new Request(`pet://local/${petId}/actions/${act}/Frame_1.png`))
    } catch {}
  }
}

export function initCustomProtocol(): void {
  registerProtocol()
  app.whenReady().then(() => {
    handleProtocol()
    // preloadHighFreq(globalStateGet('pet', 'id'))
  })
}
