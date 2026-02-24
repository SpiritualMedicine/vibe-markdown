export const IPC_CHANNELS = {
  fileOpen: 'editor:file-open',
  folderOpen: 'editor:folder-open',
  fileSave: 'editor:file-save',
  fileSaveAs: 'editor:file-save-as',
  fileOpenByPath: 'editor:file-open-by-path',
  fileRecentList: 'editor:file-recent-list',
  exportHtml: 'editor:export-html',
  appSetDirtyState: 'editor:app-set-dirty-state',
  appLaunchState: 'editor:app-launch-state',
  windowMinimize: 'editor:window-minimize',
  windowToggleMaximize: 'editor:window-toggle-maximize',
  windowClose: 'editor:window-close',
  windowIsMaximized: 'editor:window-is-maximized'
} as const

export interface DirectoryTreeEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: DirectoryTreeEntry[]
}

export interface DirectoryOpenResult {
  canceled: boolean
  directoryPath: string | null
  entries: DirectoryTreeEntry[]
  error?: string
}

export interface SaveFileRequest {
  filePath: string | null
  content: string
}

export interface FileOpenResult {
  canceled: boolean
  filePath: string | null
  content: string
  error?: string
}

export interface FileSaveResult {
  canceled: boolean
  filePath: string | null
  error?: string
}

export interface OpenByPathRequest {
  filePath: string
}

export interface ExportHtmlRequest {
  suggestedName: string
  html: string
}

export interface AppLaunchState {
  lastOpenedFilePath: string | null
}

export interface DesktopApi {
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
