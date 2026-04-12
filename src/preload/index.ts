import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS } from '../shared'
import type {
  DesktopApi,
  ExportHtmlRequest,
  ImportImageRequest,
  OpenByPathRequest,
  OpenDirectoryByPathRequest,
  SaveFileRequest,
  SearchDirectoryRequest,
  TemplateSaveRequest,
  TemplateDeleteRequest
} from '../shared'

// Custom APIs for renderer
const api: DesktopApi = {
  file: {
    open: () => ipcRenderer.invoke(IPC_CHANNELS.fileOpen),
    openDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.folderOpen),
    openDirectoryByPath: (request: OpenDirectoryByPathRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.folderOpenByPath, request),
    recentFolders: () => ipcRenderer.invoke(IPC_CHANNELS.folderRecentList),
    pinnedFolders: () => ipcRenderer.invoke(IPC_CHANNELS.folderPinnedList),
    pinFolder: (request: OpenDirectoryByPathRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.folderPin, request),
    unpinFolder: (request: OpenDirectoryByPathRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.folderUnpin, request),
    searchDirectory: (request: SearchDirectoryRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.folderSearch, request),
    findBacklinks: (request) => ipcRenderer.invoke(IPC_CHANNELS.folderBacklinks, request),
    openByPath: (request: OpenByPathRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.fileOpenByPath, request),
    recentList: () => ipcRenderer.invoke(IPC_CHANNELS.fileRecentList),
    save: (request: SaveFileRequest) => ipcRenderer.invoke(IPC_CHANNELS.fileSave, request),
    saveAs: (request: SaveFileRequest) => ipcRenderer.invoke(IPC_CHANNELS.fileSaveAs, request),
    importImage: (request: ImportImageRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.imageImport, request),
    exportHtml: (request: ExportHtmlRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.exportHtml, request),
    listTemplates: () => ipcRenderer.invoke(IPC_CHANNELS.templateList),
    saveTemplate: (request: TemplateSaveRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.templateSave, request),
    deleteTemplate: (request: TemplateDeleteRequest) =>
      ipcRenderer.invoke(IPC_CHANNELS.templateDelete, request)
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
