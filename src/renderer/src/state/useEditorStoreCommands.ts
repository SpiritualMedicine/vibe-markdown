import { useMemo } from 'react'
import {
  activateTab,
  closeOtherTabs,
  closeTab,
  closeTabsToRight,
  exportHtml,
  importImageAtSelection,
  newDoc,
  newDocFromTemplate,
  openDoc,
  openFolder,
  openFolderFromPath,
  openFromPath,
  refreshWindowMaximized,
  reorderTabs,
  runDirectorySearch,
  saveAs,
  saveDoc,
  setEditorHtml,
  setEditorMarkdown,
  setLocale,
  setTheme,
  showStatus,
  toggleAutoSave,
  togglePinnedFolder,
  togglePreview
} from '../application/commands'
import type { EditorCommandContext } from '../application/commands'
import type { DesktopClient } from '../infra/desktop/desktopClient'
import type { EditorStoreCommands } from './editorStoreTypes'

interface UseEditorStoreCommandsOptions {
  desktop: DesktopClient
  runCommand: (effect: (commandCtx: EditorCommandContext) => Promise<void>) => Promise<void>
}

export function useEditorStoreCommands(
  options: UseEditorStoreCommandsOptions
): EditorStoreCommands {
  const { desktop, runCommand } = options

  return useMemo(
    () => ({
      newDoc: () => runCommand(newDoc),
      newDocFromTemplate: (templateId) =>
        runCommand((commandCtx) => newDocFromTemplate(commandCtx, templateId)),
      openDoc: () => runCommand(openDoc),
      openFromPath: (filePath: string) =>
        runCommand((commandCtx) => openFromPath(commandCtx, { filePath })),
      openFolder: () => runCommand(openFolder),
      openFolderFromPath: (directoryPath: string) =>
        runCommand((commandCtx) => openFolderFromPath(commandCtx, { directoryPath })),
      saveDoc: () => runCommand(saveDoc),
      saveAs: () => runCommand(saveAs),
      exportHtml: () => runCommand(exportHtml),
      toggleAutoSave: (enabled: boolean) =>
        runCommand((commandCtx) => toggleAutoSave(commandCtx, enabled)),
      setLocale: (locale) => runCommand((commandCtx) => setLocale(commandCtx, locale)),
      togglePreview: () => runCommand(togglePreview),
      setEditorHtml: (html: string) => runCommand((commandCtx) => setEditorHtml(commandCtx, html)),
      setEditorMarkdown: (markdown: string) =>
        runCommand((commandCtx) => setEditorMarkdown(commandCtx, markdown)),
      setTheme: (theme) => runCommand((commandCtx) => setTheme(commandCtx, theme)),
      showStatus: (tone, message) =>
        runCommand((commandCtx) => showStatus(commandCtx, { tone, message })),
      minimizeWindow: () => desktop.app.minimizeWindow(),
      toggleMaximizeWindow: async () => {
        await desktop.app.toggleMaximizeWindow()
        await runCommand(refreshWindowMaximized)
      },
      closeWindow: () => desktop.app.closeWindow(),
      refreshWindowMaximized: () => runCommand(refreshWindowMaximized),
      activateTab: (tabId: string) => runCommand((commandCtx) => activateTab(commandCtx, tabId)),
      reorderTabs: (activeTabId: string, targetTabId: string) =>
        runCommand((commandCtx) => reorderTabs(commandCtx, { activeTabId, targetTabId })),
      closeTab: (tabId: string) => runCommand((commandCtx) => closeTab(commandCtx, tabId)),
      closeOtherTabs: (tabId: string) =>
        runCommand((commandCtx) => closeOtherTabs(commandCtx, tabId)),
      closeTabsToRight: (tabId: string) =>
        runCommand((commandCtx) => closeTabsToRight(commandCtx, tabId)),
      searchDirectory: (query: string) =>
        runCommand((commandCtx) => runDirectorySearch(commandCtx, query)),
      togglePinnedFolder: (directoryPath: string) =>
        runCommand((commandCtx) => togglePinnedFolder(commandCtx, directoryPath)),
      importImageAtSelection: (selectionStart: number, selectionEnd: number, sourcePath?: string) =>
        runCommand((commandCtx) =>
          importImageAtSelection(commandCtx, { selectionStart, selectionEnd, sourcePath })
        )
    }),
    [desktop, runCommand]
  )
}
