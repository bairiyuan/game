import path from 'path'

export function replaceIllegalCharacters(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, '')
}

export function getResourceBasePath(): string {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'resources')
  }
  return path.join(process.resourcesPath)
}

export function getParentDirectory(filePath: string): string {
  return path.dirname(filePath)
}
