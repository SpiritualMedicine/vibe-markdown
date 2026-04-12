import type { AppLaunchState } from './editor-ipc-app'
import type {
  DirectoryOpenResult,
  DirectorySearchResult,
  DocumentBacklink,
  ExportHtmlRequest,
  FindBacklinksRequest,
  FileOpenResult,
  FileSaveResult,
  ImportImageRequest,
  ImportImageResult,
  OpenByPathRequest,
  OpenDirectoryByPathRequest,
  SaveFileRequest,
  SearchDirectoryRequest,
  TemplateListResult,
  TemplateSaveRequest,
  TemplateSaveResult,
  TemplateDeleteRequest,
  TemplateDeleteResult
} from './editor-ipc-file'

export interface DesktopApi {
  file: {
    open: () => Promise<FileOpenResult>
    openDirectory: () => Promise<DirectoryOpenResult>
    openDirectoryByPath: (request: OpenDirectoryByPathRequest) => Promise<DirectoryOpenResult>
    recentFolders: () => Promise<string[]>
    pinnedFolders: () => Promise<string[]>
    pinFolder: (request: OpenDirectoryByPathRequest) => Promise<string[]>
    unpinFolder: (request: OpenDirectoryByPathRequest) => Promise<string[]>
    searchDirectory: (request: SearchDirectoryRequest) => Promise<DirectorySearchResult[]>
    findBacklinks: (request: FindBacklinksRequest) => Promise<DocumentBacklink[]>
    openByPath: (request: OpenByPathRequest) => Promise<FileOpenResult>
    recentList: () => Promise<string[]>
    save: (request: SaveFileRequest) => Promise<FileSaveResult>
    saveAs: (request: SaveFileRequest) => Promise<FileSaveResult>
    importImage: (request: ImportImageRequest) => Promise<ImportImageResult>
    exportHtml: (request: ExportHtmlRequest) => Promise<FileSaveResult>
    listTemplates: () => Promise<TemplateListResult>
    saveTemplate: (request: TemplateSaveRequest) => Promise<TemplateSaveResult>
    deleteTemplate: (request: TemplateDeleteRequest) => Promise<TemplateDeleteResult>
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
