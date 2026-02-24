import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { readFile, writeFile, access, readdir } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  IPC_CHANNELS,
  SaveFileRequest,
  FileOpenResult,
  FileSaveResult,
  ExportHtmlRequest,
  OpenByPathRequest,
  AppLaunchState,
  DirectoryOpenResult,
  DirectoryTreeEntry
} from '../shared/editor-ipc'

const markdownFilters = [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
const htmlFilters = [{ name: 'HTML', extensions: ['html', 'htm'] }]
const markdownExtensions = new Set(['.md', '.markdown', '.txt'])
const MAX_RECENT_FILES = 10
const windowDirtyState = new Map<number, boolean>()
const windowForceClose = new Set<number>()

interface EditorSettings {
  lastOpenedFilePath: string | null
}

function getEditorSettingsPath(): string {
  return join(app.getPath('userData'), 'editor-settings.json')
}

async function readEditorSettings(): Promise<EditorSettings> {
  try {
    const content = await readFile(getEditorSettingsPath(), 'utf8')
    const parsed = JSON.parse(content)
    return {
      lastOpenedFilePath:
        typeof parsed?.lastOpenedFilePath === 'string' ? parsed.lastOpenedFilePath : null
    }
  } catch {
    return { lastOpenedFilePath: null }
  }
}

async function writeEditorSettings(next: EditorSettings): Promise<void> {
  await writeFile(getEditorSettingsPath(), JSON.stringify(next, null, 2), 'utf8')
}

async function setLastOpenedFilePath(filePath: string | null): Promise<void> {
  const settings = await readEditorSettings()
  settings.lastOpenedFilePath = filePath
  await writeEditorSettings(settings)
}

function getRecentFilesStorePath(): string {
  return join(app.getPath('userData'), 'recent-files.json')
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function readRecentFiles(): Promise<string[]> {
  try {
    const content = await readFile(getRecentFilesStorePath(), 'utf8')
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

async function writeRecentFiles(filePaths: string[]): Promise<void> {
  await writeFile(getRecentFilesStorePath(), JSON.stringify(filePaths, null, 2), 'utf8')
}

async function getCleanRecentFiles(): Promise<string[]> {
  const recent = await readRecentFiles()
  const checked = await Promise.all(
    recent.map(async (filePath) => ({ filePath, exists: await pathExists(filePath) }))
  )
  const clean = checked.filter((item) => item.exists).map((item) => item.filePath)
  if (clean.length !== recent.length) {
    await writeRecentFiles(clean)
  }
  return clean
}

async function removeRecentFile(filePath: string): Promise<void> {
  const recent = await readRecentFiles()
  const next = recent.filter((item) => item !== filePath)
  if (next.length !== recent.length) {
    await writeRecentFiles(next)
  }
}

async function pushRecentFile(filePath: string | null): Promise<void> {
  if (!filePath) {
    return
  }

  const existing = await getCleanRecentFiles()
  const next = [filePath, ...existing.filter((path) => path !== filePath)].slice(
    0,
    MAX_RECENT_FILES
  )
  await writeRecentFiles(next)
  await setLastOpenedFilePath(filePath)
}

async function handleOpenFile(filePathFromRequest?: string): Promise<FileOpenResult> {
  try {
    let filePath: string | undefined = filePathFromRequest

    if (!filePath) {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: markdownFilters
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true, filePath: null, content: '' }
      }

      filePath = result.filePaths[0]
    }

    const content = await readFile(filePath, 'utf8')
    await pushRecentFile(filePath)
    return { canceled: false, filePath, content }
  } catch (error) {
    if (filePathFromRequest) {
      await removeRecentFile(filePathFromRequest)
    }
    const message = error instanceof Error ? error.message : 'Failed to open file.'
    return { canceled: false, filePath: null, content: '', error: message }
  }
}

function hasMarkdownExtension(filePath: string): boolean {
  const normalized = filePath.toLowerCase()
  for (const extension of markdownExtensions) {
    if (normalized.endsWith(extension)) {
      return true
    }
  }
  return false
}

async function readDirectoryTree(directoryPath: string): Promise<DirectoryTreeEntry[]> {
  const items = await readdir(directoryPath, { withFileTypes: true })
  const sorted = items.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) {
      return -1
    }
    if (!a.isDirectory() && b.isDirectory()) {
      return 1
    }
    return a.name.localeCompare(b.name)
  })

  const entries: DirectoryTreeEntry[] = []
  for (const item of sorted) {
    if (item.name.startsWith('.')) {
      continue
    }

    const fullPath = join(directoryPath, item.name)
    if (item.isDirectory()) {
      try {
        const children = await readDirectoryTree(fullPath)
        if (children.length > 0) {
          entries.push({ name: item.name, path: fullPath, type: 'directory', children })
        }
      } catch {
        continue
      }
      continue
    }

    if (item.isFile() && hasMarkdownExtension(item.name)) {
      entries.push({ name: item.name, path: fullPath, type: 'file' })
    }
  }

  return entries
}

async function handleOpenDirectory(): Promise<DirectoryOpenResult> {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, directoryPath: null, entries: [] }
    }

    const directoryPath = result.filePaths[0]
    const entries = await readDirectoryTree(directoryPath)
    return { canceled: false, directoryPath, entries }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to open directory.'
    return { canceled: false, directoryPath: null, entries: [], error: message }
  }
}

async function handleSaveFile(
  request: SaveFileRequest,
  forceDialog: boolean
): Promise<FileSaveResult> {
  try {
    let targetPath = request.filePath

    if (forceDialog || !targetPath) {
      const saveResult = await dialog.showSaveDialog({
        defaultPath: targetPath ?? 'untitled.md',
        filters: markdownFilters
      })

      if (saveResult.canceled || !saveResult.filePath) {
        return { canceled: true, filePath: request.filePath }
      }

      targetPath = saveResult.filePath
    }

    await writeFile(targetPath, request.content, 'utf8')
    await pushRecentFile(targetPath)
    return { canceled: false, filePath: targetPath }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save file.'
    return { canceled: false, filePath: request.filePath, error: message }
  }
}

async function handleExportHtml(request: ExportHtmlRequest): Promise<FileSaveResult> {
  try {
    const suggestedName = request.suggestedName.endsWith('.html')
      ? request.suggestedName
      : `${request.suggestedName}.html`
    const result = await dialog.showSaveDialog({
      defaultPath: suggestedName,
      filters: htmlFilters
    })

    if (result.canceled || !result.filePath) {
      return { canceled: true, filePath: null }
    }

    await writeFile(result.filePath, request.html, 'utf8')
    return { canceled: false, filePath: result.filePath }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export HTML.'
    return { canceled: false, filePath: null, error: message }
  }
}

async function handleLaunchState(): Promise<AppLaunchState> {
  const settings = await readEditorSettings()
  if (!settings.lastOpenedFilePath) {
    return { lastOpenedFilePath: null }
  }
  if (!(await pathExists(settings.lastOpenedFilePath))) {
    await setLastOpenedFilePath(null)
    return { lastOpenedFilePath: null }
  }
  return { lastOpenedFilePath: settings.lastOpenedFilePath }
}

function createWindow(): void {
  // Create the browser window.
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
    if (!windowDirtyState.get(mainWindow.id) || windowForceClose.has(mainWindow.id)) {
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
      windowForceClose.add(mainWindow.id)
      mainWindow.close()
    }
  })

  mainWindow.on('closed', () => {
    windowDirtyState.delete(mainWindow.id)
    windowForceClose.delete(mainWindow.id)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle(IPC_CHANNELS.fileOpen, () => handleOpenFile())
  ipcMain.handle(IPC_CHANNELS.folderOpen, () => handleOpenDirectory())
  ipcMain.handle(IPC_CHANNELS.fileOpenByPath, (_event, request: OpenByPathRequest) =>
    handleOpenFile(request.filePath)
  )
  ipcMain.handle(IPC_CHANNELS.fileRecentList, () => getCleanRecentFiles())
  ipcMain.handle(IPC_CHANNELS.fileSave, (_event, request: SaveFileRequest) =>
    handleSaveFile(request, false)
  )
  ipcMain.handle(IPC_CHANNELS.fileSaveAs, (_event, request: SaveFileRequest) =>
    handleSaveFile(request, true)
  )
  ipcMain.handle(IPC_CHANNELS.exportHtml, (_event, request: ExportHtmlRequest) =>
    handleExportHtml(request)
  )
  ipcMain.on(IPC_CHANNELS.appSetDirtyState, (event, isDirty: boolean) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      return
    }
    windowDirtyState.set(window.id, Boolean(isDirty))
  })
  ipcMain.handle(IPC_CHANNELS.appLaunchState, () => handleLaunchState())
  ipcMain.handle(IPC_CHANNELS.windowMinimize, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      return
    }
    window.minimize()
  })
  ipcMain.handle(IPC_CHANNELS.windowToggleMaximize, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      return
    }
    if (window.isMaximized()) {
      window.unmaximize()
      return
    }
    window.maximize()
  })
  ipcMain.handle(IPC_CHANNELS.windowClose, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      return
    }
    window.close()
  })
  ipcMain.handle(IPC_CHANNELS.windowIsMaximized, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    return window ? window.isMaximized() : false
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  ipcMain.removeHandler(IPC_CHANNELS.fileOpen)
  ipcMain.removeHandler(IPC_CHANNELS.folderOpen)
  ipcMain.removeHandler(IPC_CHANNELS.fileOpenByPath)
  ipcMain.removeHandler(IPC_CHANNELS.fileRecentList)
  ipcMain.removeHandler(IPC_CHANNELS.fileSave)
  ipcMain.removeHandler(IPC_CHANNELS.fileSaveAs)
  ipcMain.removeHandler(IPC_CHANNELS.exportHtml)
  ipcMain.removeAllListeners(IPC_CHANNELS.appSetDirtyState)
  ipcMain.removeHandler(IPC_CHANNELS.appLaunchState)
  ipcMain.removeHandler(IPC_CHANNELS.windowMinimize)
  ipcMain.removeHandler(IPC_CHANNELS.windowToggleMaximize)
  ipcMain.removeHandler(IPC_CHANNELS.windowClose)
  ipcMain.removeHandler(IPC_CHANNELS.windowIsMaximized)
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
