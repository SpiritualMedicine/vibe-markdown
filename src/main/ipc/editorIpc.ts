import { ipcMain } from 'electron'
import type {
  ExportHtmlRequest,
  FindBacklinksRequest,
  ImportImageRequest,
  OpenByPathRequest,
  OpenDirectoryByPathRequest,
  SaveFileRequest,
  SearchDirectoryRequest,
  TemplateSaveRequest,
  TemplateDeleteRequest
} from '../../shared'
import { IPC_CHANNELS } from '../../shared'
import {
  exportHtml,
  importImage,
  findBacklinks,
  openDirectory,
  openDirectoryByPath,
  openFile,
  saveFile,
  searchDirectory
} from '../editorFileSystem'
import {
  getCleanPinnedFolders,
  getCleanRecentFiles,
  getCleanRecentFolders,
  getLaunchState,
  pinFolder,
  unpinFolder
} from '../editorPersistence'
import { listTemplates, saveTemplate, deleteTemplate } from '../templateManager'

export function registerEditorIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.fileOpen, () => openFile())
  ipcMain.handle(IPC_CHANNELS.fileOpenByPath, (_event, request: OpenByPathRequest) =>
    openFile(request.filePath)
  )
  ipcMain.handle(IPC_CHANNELS.fileRecentList, () => getCleanRecentFiles())
  ipcMain.handle(IPC_CHANNELS.fileSave, (_event, request: SaveFileRequest) =>
    saveFile(request, false)
  )
  ipcMain.handle(IPC_CHANNELS.fileSaveAs, (_event, request: SaveFileRequest) =>
    saveFile(request, true)
  )
  ipcMain.handle(IPC_CHANNELS.folderOpen, () => openDirectory())
  ipcMain.handle(IPC_CHANNELS.folderOpenByPath, (_event, request: OpenDirectoryByPathRequest) =>
    openDirectoryByPath(request)
  )
  ipcMain.handle(IPC_CHANNELS.folderRecentList, () => getCleanRecentFolders())
  ipcMain.handle(IPC_CHANNELS.folderPinnedList, () => getCleanPinnedFolders())
  ipcMain.handle(IPC_CHANNELS.folderPin, (_event, request: OpenDirectoryByPathRequest) =>
    pinFolder(request.directoryPath)
  )
  ipcMain.handle(IPC_CHANNELS.folderUnpin, (_event, request: OpenDirectoryByPathRequest) =>
    unpinFolder(request.directoryPath)
  )
  ipcMain.handle(IPC_CHANNELS.folderSearch, (_event, request: SearchDirectoryRequest) =>
    searchDirectory(request)
  )
  ipcMain.handle(IPC_CHANNELS.folderBacklinks, (_event, request: FindBacklinksRequest) =>
    findBacklinks(request)
  )
  ipcMain.handle(IPC_CHANNELS.imageImport, (_event, request: ImportImageRequest) =>
    importImage(request)
  )
  ipcMain.handle(IPC_CHANNELS.exportHtml, (_event, request: ExportHtmlRequest) =>
    exportHtml(request)
  )
  ipcMain.handle(IPC_CHANNELS.templateList, () => listTemplates())
  ipcMain.handle(IPC_CHANNELS.templateSave, (_event, request: TemplateSaveRequest) =>
    saveTemplate(request)
  )
  ipcMain.handle(IPC_CHANNELS.templateDelete, (_event, request: TemplateDeleteRequest) =>
    deleteTemplate(request)
  )
  ipcMain.handle(IPC_CHANNELS.appLaunchState, () => getLaunchState())
}

export function unregisterEditorIpcHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.fileOpen)
  ipcMain.removeHandler(IPC_CHANNELS.fileOpenByPath)
  ipcMain.removeHandler(IPC_CHANNELS.fileRecentList)
  ipcMain.removeHandler(IPC_CHANNELS.fileSave)
  ipcMain.removeHandler(IPC_CHANNELS.fileSaveAs)
  ipcMain.removeHandler(IPC_CHANNELS.folderOpen)
  ipcMain.removeHandler(IPC_CHANNELS.folderOpenByPath)
  ipcMain.removeHandler(IPC_CHANNELS.folderRecentList)
  ipcMain.removeHandler(IPC_CHANNELS.folderPinnedList)
  ipcMain.removeHandler(IPC_CHANNELS.folderPin)
  ipcMain.removeHandler(IPC_CHANNELS.folderUnpin)
  ipcMain.removeHandler(IPC_CHANNELS.folderSearch)
  ipcMain.removeHandler(IPC_CHANNELS.folderBacklinks)
  ipcMain.removeHandler(IPC_CHANNELS.imageImport)
  ipcMain.removeHandler(IPC_CHANNELS.exportHtml)
  ipcMain.removeHandler(IPC_CHANNELS.templateList)
  ipcMain.removeHandler(IPC_CHANNELS.templateSave)
  ipcMain.removeHandler(IPC_CHANNELS.templateDelete)
  ipcMain.removeHandler(IPC_CHANNELS.appLaunchState)
}
