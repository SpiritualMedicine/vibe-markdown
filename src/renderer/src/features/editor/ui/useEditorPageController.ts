import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DirectorySearchResult } from '../../../../../shared'
import type { EditorStoreCommands } from '../../../state/editorStoreTypes'
import type { EditorState } from '../../../application/commands'
import {
  extractMarkdownOutline,
  findDocumentPathByReference,
  getDocumentBasename,
  getLineOffset,
  getSearchResultKey
} from '../domain'
import { t } from '../settings'
import { usePaneResizers } from './usePaneResizers'
import { usePreviewScrollSync } from './usePreviewScrollSync'
import { useSearchNavigation } from './useSearchNavigation'

interface UseEditorPageControllerOptions {
  state: EditorState
  commands: EditorStoreCommands
}

interface TabMenuState {
  tabId: string
  x: number
  y: number
}

interface UseEditorPageControllerResult {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  previewRef: React.RefObject<HTMLElement | null>
  bodyRef: React.RefObject<HTMLDivElement | null>
  workspaceRef: React.RefObject<HTMLElement | null>
  activeTab: EditorState['tabs'][number]
  title: string
  outline: ReturnType<typeof extractMarkdownOutline>
  searchInput: string
  setSearchInput: React.Dispatch<React.SetStateAction<string>>
  isImageDropActive: boolean
  setIsImageDropActive: React.Dispatch<React.SetStateAction<boolean>>
  draggingTabId: string | null
  setDraggingTabId: React.Dispatch<React.SetStateAction<string | null>>
  tabMenu: TabMenuState | null
  setTabMenu: React.Dispatch<React.SetStateAction<TabMenuState | null>>
  activeSearchResultKey: string | null
  directoryPaneWidth: number | null
  editorPaneWidth: number | null
  onStartDirectoryResize: (event: React.PointerEvent<HTMLDivElement>) => void
  onStartEditorResize: (event: React.PointerEvent<HTMLDivElement>) => void
  focusHeading: (headingId: string, lineNumber: number) => void
  handleOpenSearchResult: (result: DirectorySearchResult) => Promise<void>
  handleOpenBacklink: (filePath: string, lineNumber: number) => Promise<void>
  handleInsertImage: () => void
  handleOpenDocumentReference: (reference: string) => Promise<void>
  handleSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  handleDropImage: (selectionStart: number, selectionEnd: number, sourcePath: string) => void
  handleOpenFolder: () => Promise<void>
  handleOpenFolderFromPath: (directoryPath: string) => Promise<void>
  handleTabDrop: (targetTabId: string, sourceTabId: string | null) => void
}

export function useEditorPageController(
  options: UseEditorPageControllerOptions
): UseEditorPageControllerResult {
  const { state, commands } = options
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const previewRef = useRef<HTMLElement | null>(null)
  const [draggingTabId, setDraggingTabId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState<string>(state.workspace.searchQuery)
  const [isImageDropActive, setIsImageDropActive] = useState(false)
  const [tabMenu, setTabMenu] = useState<TabMenuState | null>(null)
  const {
    bodyRef,
    workspaceRef,
    directoryPaneWidth,
    editorPaneWidth,
    onStartDirectoryResize,
    onStartEditorResize
  } = usePaneResizers({ showPreview: state.ui.showPreview })

  const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0]
  const fileName = getDocumentBasename(
    activeTab?.filePath ?? null,
    t(state.ui.locale, 'tabs.untitled')
  )
  const title = `${fileName}${activeTab?.isDirty ? ' *' : ''}`
  const outline = useMemo(
    () => extractMarkdownOutline(activeTab?.markdown ?? ''),
    [activeTab?.markdown]
  )

  const {
    searchFocusKey,
    selectedSearchResult,
    focusResult,
    moveSelectionDown,
    moveSelectionUp,
    getDefaultEnterTarget
  } = useSearchNavigation({
    searchQuery: state.workspace.searchQuery,
    searchResults: state.workspace.searchResults
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void commands.searchDirectory(searchInput)
    }, 220)
    return () => window.clearTimeout(timer)
  }, [commands, searchInput])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }
      const key = event.key.toLowerCase()
      if (key === 's') {
        event.preventDefault()
        void commands.saveDoc()
      } else if (key === 'o') {
        event.preventDefault()
        void commands.openDoc()
      } else if (key === 'n') {
        event.preventDefault()
        void commands.newDoc()
      } else if (key === 'w') {
        event.preventDefault()
        void commands.closeTab(state.activeTabId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commands, state.activeTabId])

  usePreviewScrollSync({
    activeTabId: activeTab?.id,
    editorRef: textareaRef,
    previewRef,
    showPreview: state.ui.showPreview
  })

  const focusLine = useCallback(
    (lineNumber: number): void => {
      const textarea = textareaRef.current
      if (!textarea || !activeTab) {
        return
      }
      const offset = getLineOffset(activeTab.markdown, lineNumber)
      textarea.focus()
      textarea.setSelectionRange(offset, offset)
      textarea.scrollTop = Math.max(0, (lineNumber - 2) * 24)
    },
    [activeTab]
  )

  const focusHeading = useCallback(
    (headingId: string, lineNumber: number): void => {
      const preview = previewRef.current
      const target = preview?.querySelector<HTMLElement>(`#${CSS.escape(headingId)}`)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      focusLine(lineNumber)
    },
    [focusLine]
  )

  const handleOpenSearchResult = useCallback(
    async (result: DirectorySearchResult): Promise<void> => {
      await commands.openFromPath(result.filePath)
      window.setTimeout(() => {
        focusLine(result.line)
        focusResult(result)
      }, 0)
    },
    [commands, focusLine, focusResult]
  )

  const handleOpenBacklink = useCallback(
    async (filePath: string, lineNumber: number): Promise<void> => {
      await commands.openFromPath(filePath)
      window.setTimeout(() => {
        focusLine(lineNumber)
      }, 0)
    },
    [commands, focusLine]
  )

  const handleOpenDocumentReference = useCallback(
    async (reference: string): Promise<void> => {
      const resolvedPath = findDocumentPathByReference(state.workspace.directoryEntries, reference)
      if (!resolvedPath) {
        await commands.showStatus(
          'error',
          t(state.ui.locale, 'status.referenceMissing', { target: reference })
        )
        return
      }

      await commands.openFromPath(resolvedPath)
      await commands.showStatus(
        'success',
        t(state.ui.locale, 'status.referenceOpened', { target: reference })
      )
    },
    [commands, state.ui.locale, state.workspace.directoryEntries]
  )

  useEffect(() => {
    if (!tabMenu) {
      return
    }
    const handlePointerDown = (): void => setTabMenu(null)
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setTabMenu(null)
      }
    }
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [tabMenu])

  const handleInsertImage = useCallback(() => {
    const textarea = textareaRef.current
    const selectionStart = textarea?.selectionStart ?? activeTab?.markdown.length ?? 0
    const selectionEnd = textarea?.selectionEnd ?? selectionStart
    void commands.importImageAtSelection(selectionStart, selectionEnd)
  }, [activeTab?.markdown.length, commands])

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (state.workspace.searchResults.length === 0) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        moveSelectionDown()
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        moveSelectionUp()
        return
      }

      if (event.key === 'Enter') {
        const target = getDefaultEnterTarget()
        if (!target) {
          return
        }
        event.preventDefault()
        void handleOpenSearchResult(target)
      }
    },
    [
      getDefaultEnterTarget,
      handleOpenSearchResult,
      moveSelectionDown,
      moveSelectionUp,
      state.workspace.searchResults.length
    ]
  )

  const handleDropImage = useCallback(
    (selectionStart: number, selectionEnd: number, sourcePath: string): void => {
      void commands.importImageAtSelection(selectionStart, selectionEnd, sourcePath)
    },
    [commands]
  )

  const handleOpenFolder = useCallback(async (): Promise<void> => {
    await commands.openFolder()
    setSearchInput('')
  }, [commands])

  const handleOpenFolderFromPath = useCallback(
    async (directoryPath: string): Promise<void> => {
      await commands.openFolderFromPath(directoryPath)
      setSearchInput('')
    },
    [commands]
  )

  const handleTabDrop = useCallback(
    (targetTabId: string, sourceTabId: string | null): void => {
      setDraggingTabId(null)
      if (sourceTabId && sourceTabId !== targetTabId) {
        void commands.reorderTabs(sourceTabId, targetTabId)
      }
    },
    [commands]
  )

  return {
    textareaRef,
    previewRef,
    bodyRef,
    workspaceRef,
    activeTab,
    title,
    outline,
    searchInput,
    setSearchInput,
    isImageDropActive,
    setIsImageDropActive,
    draggingTabId,
    setDraggingTabId,
    tabMenu,
    setTabMenu,
    activeSearchResultKey: selectedSearchResult
      ? getSearchResultKey(selectedSearchResult)
      : searchFocusKey,
    directoryPaneWidth,
    editorPaneWidth,
    onStartDirectoryResize,
    onStartEditorResize,
    focusHeading,
    handleOpenSearchResult,
    handleOpenBacklink,
    handleOpenDocumentReference,
    handleInsertImage,
    handleSearchKeyDown,
    handleDropImage,
    handleOpenFolder,
    handleOpenFolderFromPath,
    handleTabDrop
  }
}
