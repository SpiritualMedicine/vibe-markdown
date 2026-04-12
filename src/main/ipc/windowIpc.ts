import { BrowserWindow, ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared'
import { clearWindowState, setWindowDirtyState } from '../windowState'

function withSenderWindow(
  sender: Electron.WebContents,
  action: (window: BrowserWindow) => void
): void {
  const window = BrowserWindow.fromWebContents(sender)
  if (!window) {
    return
  }
  action(window)
}

export function registerWindowIpcHandlers(): void {
  ipcMain.on(IPC_CHANNELS.appSetDirtyState, (event, isDirty: boolean) => {
    withSenderWindow(event.sender, (window) => {
      setWindowDirtyState(window.id, isDirty)
    })
  })

  ipcMain.handle(IPC_CHANNELS.windowMinimize, (event) => {
    withSenderWindow(event.sender, (window) => {
      window.minimize()
    })
  })

  ipcMain.handle(IPC_CHANNELS.windowToggleMaximize, (event) => {
    withSenderWindow(event.sender, (window) => {
      if (window.isMaximized()) {
        window.unmaximize()
        return
      }
      window.maximize()
    })
  })

  ipcMain.handle(IPC_CHANNELS.windowClose, (event) => {
    withSenderWindow(event.sender, (window) => {
      window.close()
    })
  })

  ipcMain.handle(IPC_CHANNELS.windowIsMaximized, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    return window ? window.isMaximized() : false
  })
}

export function unregisterWindowIpcHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.appSetDirtyState)
  ipcMain.removeHandler(IPC_CHANNELS.windowMinimize)
  ipcMain.removeHandler(IPC_CHANNELS.windowToggleMaximize)
  ipcMain.removeHandler(IPC_CHANNELS.windowClose)
  ipcMain.removeHandler(IPC_CHANNELS.windowIsMaximized)
}

export function clearClosedWindowState(windowId: number): void {
  clearWindowState(windowId)
}
