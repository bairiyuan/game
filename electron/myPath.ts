import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export function getExtraResourceBasePath(): string {
  if (!app.isPackaged) {
    return path.join(process.cwd(), 'resources')
  }
  if (!fs.existsSync(path.join(app.getPath('userData'), 'resources'))) {
    fs.mkdirSync(path.join(app.getPath('userData'), 'resources'))
  }
  return app.getPath('userData') + '/resources'
}

export function getResourceBasePath(): string {
  if (!app.isPackaged) {
    return path.join(process.cwd(), 'resources')
  }
  return path.join(process.resourcesPath)
}

export function getParentDirectory(filePath: string, n: number): string {
  let dir = path.resolve(filePath)
  for (let i = 0; i < n; i++) {
    dir = path.dirname(dir)
  }
  return dir
}
