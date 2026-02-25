import {
  AppLaunchState,
  DirectoryOpenResult,
  ExportHtmlRequest,
  FileOpenResult,
  FileSaveResult,
  OpenByPathRequest,
  SaveFileRequest
} from '../../../../shared/editor-ipc'

export interface DesktopClient {
  file: {
    open: () => Promise<FileOpenResult>
    openDirectory: () => Promise<DirectoryOpenResult>
    openByPath: (request: OpenByPathRequest) => Promise<FileOpenResult>
    recentList: () => Promise<string[]>
    save: (request: SaveFileRequest) => Promise<FileSaveResult>
    saveAs: (request: SaveFileRequest) => Promise<FileSaveResult>
    exportHtml: (request: ExportHtmlRequest) => Promise<FileSaveResult>
  }
  app: {
    setDirtyState: (isDirty: boolean) => void
    getLaunchState: () => Promise<AppLaunchState>
    minimizeWindow: () => Promise<void>
    toggleMaximizeWindow: () => Promise<void>
    closeWindow: () => Promise<void>
    isWindowMaximized: () => Promise<boolean>
  }
}

export function createDesktopClient(): DesktopClient {
  return window.api
}
