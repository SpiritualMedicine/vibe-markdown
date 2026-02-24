import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  DesktopApi,
  IPC_CHANNELS,
  SaveFileRequest,
  OpenByPathRequest,
  ExportHtmlRequest
} from '../shared/editor-ipc'

// Custom APIs for renderer
const api: DesktopApi = {
  file: {
    open: () => ipcRenderer.invoke(IPC_CHANNELS.fileOpen),
    openDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.folderOpen),
    openByPath: (request: OpenByPathRequest) => ipcRenderer.invoke(IPC_CHANNELS.fileOpenByPath, request),
    recentList: () => ipcRenderer.invoke(IPC_CHANNELS.fileRecentList),
    save: (request: SaveFileRequest) => ipcRenderer.invoke(IPC_CHANNELS.fileSave, request),
    saveAs: (request: SaveFileRequest) => ipcRenderer.invoke(IPC_CHANNELS.fileSaveAs, request),
    exportHtml: (request: ExportHtmlRequest) => ipcRenderer.invoke(IPC_CHANNELS.exportHtml, request)
  },
  app: {
    setDirtyState: (isDirty: boolean) => ipcRenderer.send(IPC_CHANNELS.appSetDirtyState, isDirty),
    getLaunchState: () => ipcRenderer.invoke(IPC_CHANNELS.appLaunchState),
    minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.windowMinimize),
    toggleMaximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.windowToggleMaximize),
    closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.windowClose),
    isWindowMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.windowIsMaximized)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
