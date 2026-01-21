export const IPC_CHANNELS = {
  SHOW_GAME_WINDOW: 'show-game-window',
  CLOSE_GAME_WINDOW: 'close-game-window',
  ROUTE_CHANGE: 'route-change',
  SHOW_POPUP_WINDOW: 'show-popup-window',
  CLOSE_POPUP_WINDOW: 'close-popup-window',
  CLOSE_EXCEPT_MAIN_WINDOW: 'close-except-main-window',
  MOUSE_ENTER: 'mouse-enter',
  MOUSE_LEAVE: 'mouse-leave',
  WINDOW_IGNORE_MOUSE_TOGGLE: 'window-ignore-mouse-toggle',
  WINDOW_DRAG_START: 'window-drag-start',
  WINDOW_DRAGGING: 'window-dragging',
  WINDOW_DRAG_END: 'window-drag-end'
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
