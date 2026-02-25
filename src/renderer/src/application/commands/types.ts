import type React from 'react'
import type { DirectoryTreeEntry } from '../../../../shared/editor-ipc'
import type { DesktopClient } from '../../infra/desktop/desktopClient'

export interface EditorStatus {
  tone: 'idle' | 'success' | 'error'
  message: string
}

export interface EditorState {
  document: {
    filePath: string | null
    markdown: string
    html: string
    isDirty: boolean
  }
  workspace: {
    recentFiles: string[]
    directoryPath: string | null
    directoryEntries: DirectoryTreeEntry[]
  }
  ui: {
    isBusy: boolean
    isDirectoryBusy: boolean
    autoSaveEnabled: boolean
    isWindowMaximized: boolean
    showPreview: boolean
    status: EditorStatus
  }
}

export type EditorAction =
  | { type: 'SET_BUSY'; payload: boolean }
  | { type: 'SET_DIRECTORY_BUSY'; payload: boolean }
  | { type: 'SET_STATUS'; payload: EditorStatus }
  | { type: 'SET_DOCUMENT'; payload: Partial<EditorState['document']> }
  | {
      type: 'SET_WORKSPACE'
      payload: Partial<EditorState['workspace']>
    }
  | { type: 'SET_AUTO_SAVE'; payload: boolean }
  | { type: 'SET_WINDOW_MAXIMIZED'; payload: boolean }
  | { type: 'SET_SHOW_PREVIEW'; payload: boolean }

export interface EditorCommandContext {
  desktop: DesktopClient
  getState: () => EditorState
  dispatch: React.Dispatch<EditorAction>
  markdownToHtml: (markdown: string) => string
  htmlToMarkdown: (html: string) => string
}

export type EditorCommand<Payload = void> = Payload extends void
  ? (ctx: EditorCommandContext) => Promise<void>
  : (ctx: EditorCommandContext, payload: Payload) => Promise<void>
