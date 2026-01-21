type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'near-pet'

export interface PopupWindowOptions {
  name: string
  url: string
  width: number
  height: number
  maxWidth?: number
  maxHeight?: number
  minWidth?: number
  minHeight?: number
  x?: number
  y?: number
  ignoreMouse?: boolean
  parent?: string
  params?: Record<string, any>
  position?: Position
  alwaysOnTop?: boolean
  resetSize?: boolean
  skipTaskbar?: boolean
}
