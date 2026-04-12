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

export interface OpenDirectoryByPathRequest {
  directoryPath: string
}

export interface SearchDirectoryRequest {
  directoryPath: string
  query: string
}

export interface DirectorySearchResult {
  filePath: string
  fileName: string
  line: number
  title: string
  snippet: string
}

export interface FindBacklinksRequest {
  directoryPath: string
  targetPath: string
}

export interface DocumentBacklink {
  sourcePath: string
  fileName: string
  line: number
  title: string
  snippet: string
}

export interface ImportImageRequest {
  documentPath: string
  sourcePath?: string
}

export interface ImportImageResult {
  canceled: boolean
  markdownPath: string | null
  absolutePath: string | null
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

export interface UserTemplate {
  id: string
  name: string
  markdown: string
  createdAt: number
  updatedAt: number
}

export interface TemplateListResult {
  templates: UserTemplate[]
  error?: string
}

export interface TemplateSaveRequest {
  name: string
  markdown: string
}

export interface TemplateSaveResult {
  id: string | null
  error?: string
}

export interface TemplateDeleteRequest {
  id: string
}

export interface TemplateDeleteResult {
  success: boolean
  error?: string
}
