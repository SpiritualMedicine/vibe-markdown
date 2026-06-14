import type React from 'react'
import type {
  DirectorySearchResult,
  DirectoryTreeEntry,
  DocumentBacklink
} from '../../../../shared'
import type { DesktopClient } from '../../infra/desktop/desktopClient'
import type { EditorLocale, EditorThemeId, LocaleKey } from '../../features/editor/settings'
import type { RecoveryDraft } from '../../features/editor/domain'

export interface EditorStatus {
  tone: 'idle' | 'success' | 'error'
  message: string
}

export interface EditorTab {
  id: string
  filePath: string | null
  markdown: string
  html: string
  isDirty: boolean
  lastSavedAt: number | null
}

export interface EditorState {
  tabs: EditorTab[]
  activeTabId: string
  workspace: {
    recentFiles: string[]
    recentFolders: string[]
    pinnedFolders: string[]
    directoryPath: string | null
    directoryEntries: DirectoryTreeEntry[]
    searchQuery: string
    searchResults: DirectorySearchResult[]
    backlinks: DocumentBacklink[]
  }
  ui: {
    isBusy: boolean
    isDirectoryBusy: boolean
    isSearchBusy: boolean
    isBacklinksBusy: boolean
    autoSaveEnabled: boolean
    locale: EditorLocale
    isWindowMaximized: boolean
    showPreview: boolean
    theme: EditorThemeId
    status: EditorStatus
    recoveryDrafts: RecoveryDraft[]
  }
}

export type EditorAction =
  | { type: 'SET_BUSY'; payload: boolean }
  | { type: 'SET_DIRECTORY_BUSY'; payload: boolean }
  | { type: 'SET_SEARCH_BUSY'; payload: boolean }
  | { type: 'SET_BACKLINKS_BUSY'; payload: boolean }
  | { type: 'SET_STATUS'; payload: EditorStatus }
  | { type: 'SET_TABS'; payload: EditorTab[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_WORKSPACE'; payload: Partial<EditorState['workspace']> }
  | { type: 'SET_AUTO_SAVE'; payload: boolean }
  | { type: 'SET_LOCALE'; payload: EditorLocale }
  | { type: 'SET_THEME'; payload: EditorThemeId }
  | { type: 'SET_WINDOW_MAXIMIZED'; payload: boolean }
  | { type: 'SET_SHOW_PREVIEW'; payload: boolean }
  | { type: 'SET_RECOVERY_DRAFTS'; payload: RecoveryDraft[] }

export interface EditorCommandContext {
  desktop: DesktopClient
  getState: () => EditorState
  dispatch: React.Dispatch<EditorAction>
  markdownToHtml: (markdown: string) => string
  htmlToMarkdown: (html: string) => string
  t: (key: LocaleKey, vars?: Record<string, string | number>) => string
}

export type EditorCommand<Payload = void> = Payload extends void
  ? (ctx: EditorCommandContext) => Promise<void>
  : (ctx: EditorCommandContext, payload: Payload) => Promise<void>
