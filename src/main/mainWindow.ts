import { BrowserWindow, dialog, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { clearClosedWindowState } from './ipc'
import { isWindowDirty, isWindowForceClosing, markWindowForceClose } from './windowState'

export function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 670,
    minWidth: 1000,
    minHeight: 720,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    resizable: true,
    maximizable: true,
    minimizable: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('close', async (event) => {
    if (!isWindowDirty(mainWindow.id) || isWindowForceClosing(mainWindow.id)) {
      return
    }

    event.preventDefault()
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      message: 'You have unsaved changes.',
      detail: 'Exit without saving?',
      buttons: ['Discard and Exit', 'Cancel'],
      defaultId: 1,
      cancelId: 1
    })

    if (result.response === 0) {
      markWindowForceClose(mainWindow.id)
      mainWindow.close()
    }
  })

  mainWindow.on('closed', () => {
    clearClosedWindowState(mainWindow.id)
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    return
  }

  void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}
