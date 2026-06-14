import { useEffect } from 'react'
import {
  loadBacklinks,
  refreshFolderLists,
  refreshRecentList,
  refreshWindowMaximized,
  restoreLaunchFile
} from '../application/commands'
import type { EditorCommandContext, EditorState } from '../application/commands'
import {
  createRecoveryDraftsFromTabs,
  mergeRecoveryDrafts,
  saveRecoveryDrafts
} from '../features/editor/domain'
import {
  applyEditorLocale,
  applyEditorTheme,
  saveEditorLocale,
  saveEditorTheme
} from '../features/editor/settings'
import type { EditorStoreCommands } from './editorStoreTypes'

interface UseEditorStoreEffectsOptions {
  commands: EditorStoreCommands
  desktopSetDirtyState: (isDirty: boolean) => void
  runCommand: (effect: (commandCtx: EditorCommandContext) => Promise<void>) => Promise<void>
  state: EditorState
}

export function useEditorStoreEffects(options: UseEditorStoreEffectsOptions): void {
  const { commands, desktopSetDirtyState, runCommand, state } = options

  useEffect(() => {
    void runCommand(refreshRecentList)
    void runCommand(refreshFolderLists)
    void runCommand(refreshWindowMaximized)
    void runCommand(restoreLaunchFile)
  }, [runCommand])

  useEffect(() => {
    const hasDirtyTabs = state.tabs.some((tab) => tab.isDirty)
    desktopSetDirtyState(hasDirtyTabs)
  }, [desktopSetDirtyState, state.tabs])

  useEffect(() => {
    applyEditorTheme(state.ui.theme)
    saveEditorTheme(state.ui.theme)
  }, [state.ui.theme])

  useEffect(() => {
    applyEditorLocale(state.ui.locale)
    saveEditorLocale(state.ui.locale)
  }, [state.ui.locale])

  useEffect(() => {
    if (!state.ui.autoSaveEnabled) {
      return
    }
    const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId)
    if (!activeTab?.filePath || !activeTab.isDirty) {
      return
    }
    const timer = window.setTimeout(() => {
      void commands.saveDoc()
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [commands, state.activeTabId, state.tabs, state.ui.autoSaveEnabled])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const activeDrafts = createRecoveryDraftsFromTabs(state.tabs, Date.now())
      saveRecoveryDrafts(mergeRecoveryDrafts(state.ui.recoveryDrafts, activeDrafts))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [state.tabs, state.ui.recoveryDrafts])

  useEffect(() => {
    const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId)
    void runCommand((commandCtx) => loadBacklinks(commandCtx, activeTab?.filePath ?? null))
  }, [runCommand, state.activeTabId, state.tabs])
}
