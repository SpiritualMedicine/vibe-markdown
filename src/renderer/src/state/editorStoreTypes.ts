import type { EditorLocale, EditorThemeId } from '../features/editor/settings'
import type { DocumentTemplateId } from '../features/editor/domain'

export interface EditorStoreCommands {
  newDoc: () => Promise<void>
  newDocFromTemplate: (templateId: DocumentTemplateId) => Promise<void>
  openDoc: () => Promise<void>
  openFromPath: (filePath: string) => Promise<void>
  openFolder: () => Promise<void>
  openFolderFromPath: (directoryPath: string) => Promise<void>
  saveDoc: () => Promise<void>
  saveAs: () => Promise<void>
  restoreRecoveryDraft: (draftId: string) => Promise<void>
  discardRecoveryDraft: (draftId: string) => Promise<void>
  discardAllRecoveryDrafts: () => Promise<void>
  exportHtml: () => Promise<void>
  toggleAutoSave: (enabled: boolean) => Promise<void>
  setLocale: (locale: EditorLocale) => Promise<void>
  togglePreview: () => Promise<void>
  setEditorHtml: (html: string) => Promise<void>
  setEditorMarkdown: (markdown: string) => Promise<void>
  setTheme: (theme: EditorThemeId) => Promise<void>
  showStatus: (tone: 'idle' | 'success' | 'error', message: string) => Promise<void>
  minimizeWindow: () => Promise<void>
  toggleMaximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  refreshWindowMaximized: () => Promise<void>
  activateTab: (tabId: string) => Promise<void>
  reorderTabs: (activeTabId: string, targetTabId: string) => Promise<void>
  closeTab: (tabId: string) => Promise<void>
  closeOtherTabs: (tabId: string) => Promise<void>
  closeTabsToRight: (tabId: string) => Promise<void>
  searchDirectory: (query: string) => Promise<void>
  togglePinnedFolder: (directoryPath: string) => Promise<void>
  importImageAtSelection: (
    selectionStart: number,
    selectionEnd: number,
    sourcePath?: string
  ) => Promise<void>
}
