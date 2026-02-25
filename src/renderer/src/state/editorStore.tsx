import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import {
  exportHtml,
  newDoc,
  openDoc,
  openFolder,
  openFromPath,
  refreshRecentList,
  refreshWindowMaximized,
  restoreLaunchFile,
  saveAs,
  saveDoc,
  setEditorHtml,
  setEditorMarkdown,
  toggleAutoSave,
  togglePreview
} from '../application/commands/editorCommands'
import { EditorAction, EditorCommandContext, EditorState } from '../application/commands/types'
import { htmlToMarkdown, markdownToHtml } from '../core/editor/markdownCodec'
import { createDesktopClient } from '../infra/desktop/desktopClient'

const initialMarkdown = '# Welcome\n\nStart writing your markdown document.'

const initialState: EditorState = {
  document: {
    filePath: null,
    markdown: initialMarkdown,
    html: markdownToHtml(initialMarkdown),
    isDirty: false
  },
  workspace: {
    recentFiles: [],
    directoryPath: null,
    directoryEntries: []
  },
  ui: {
    isBusy: false,
    isDirectoryBusy: false,
    autoSaveEnabled: true,
    isWindowMaximized: false,
    showPreview: true,
    status: { tone: 'idle', message: 'Ready' }
  }
}

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_BUSY':
      return { ...state, ui: { ...state.ui, isBusy: action.payload } }
    case 'SET_DIRECTORY_BUSY':
      return { ...state, ui: { ...state.ui, isDirectoryBusy: action.payload } }
    case 'SET_STATUS':
      return { ...state, ui: { ...state.ui, status: action.payload } }
    case 'SET_DOCUMENT':
      return { ...state, document: { ...state.document, ...action.payload } }
    case 'SET_WORKSPACE':
      return { ...state, workspace: { ...state.workspace, ...action.payload } }
    case 'SET_AUTO_SAVE':
      return { ...state, ui: { ...state.ui, autoSaveEnabled: action.payload } }
    case 'SET_WINDOW_MAXIMIZED':
      return { ...state, ui: { ...state.ui, isWindowMaximized: action.payload } }
    case 'SET_SHOW_PREVIEW':
      return { ...state, ui: { ...state.ui, showPreview: action.payload } }
    default:
      return state
  }
}

interface EditorStoreValue {
  state: EditorState
  commands: {
    newDoc: () => Promise<void>
    openDoc: () => Promise<void>
    openFromPath: (filePath: string, skipDirtyGuard?: boolean) => Promise<void>
    openFolder: () => Promise<void>
    saveDoc: () => Promise<void>
    saveAs: () => Promise<void>
    exportHtml: () => Promise<void>
    toggleAutoSave: (enabled: boolean) => Promise<void>
    togglePreview: () => Promise<void>
    setEditorHtml: (html: string) => Promise<void>
    setEditorMarkdown: (markdown: string) => Promise<void>
    minimizeWindow: () => Promise<void>
    toggleMaximizeWindow: () => Promise<void>
    closeWindow: () => Promise<void>
    refreshWindowMaximized: () => Promise<void>
  }
}

const EditorStoreContext = createContext<EditorStoreValue | null>(null)

export function EditorStoreProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  const desktop = useMemo(() => createDesktopClient(), [])

  stateRef.current = state

  const ctx: EditorCommandContext = useMemo(
    () => ({
      desktop,
      dispatch,
      getState: () => stateRef.current,
      markdownToHtml,
      htmlToMarkdown
    }),
    [desktop]
  )

  const run = useCallback(async (effect: (commandCtx: EditorCommandContext) => Promise<void>) => {
    await effect(ctx)
  }, [ctx])

  const commands = useMemo(
    () => ({
      newDoc: () => run(newDoc),
      openDoc: () => run(openDoc),
      openFromPath: (filePath: string, skipDirtyGuard?: boolean) =>
        run((commandCtx) => openFromPath(commandCtx, { filePath, skipDirtyGuard })),
      openFolder: () => run(openFolder),
      saveDoc: () => run(saveDoc),
      saveAs: () => run(saveAs),
      exportHtml: () => run(exportHtml),
      toggleAutoSave: (enabled: boolean) => run((commandCtx) => toggleAutoSave(commandCtx, enabled)),
      togglePreview: () => run(togglePreview),
      setEditorHtml: (html: string) => run((commandCtx) => setEditorHtml(commandCtx, html)),
      setEditorMarkdown: (markdown: string) =>
        run((commandCtx) => setEditorMarkdown(commandCtx, markdown)),
      minimizeWindow: () => desktop.app.minimizeWindow(),
      toggleMaximizeWindow: async () => {
        await desktop.app.toggleMaximizeWindow()
        await run(refreshWindowMaximized)
      },
      closeWindow: () => desktop.app.closeWindow(),
      refreshWindowMaximized: () => run(refreshWindowMaximized)
    }),
    [desktop, run]
  )

  useEffect(() => {
    void run(refreshRecentList)
    void run(refreshWindowMaximized)
    void run(restoreLaunchFile)
  }, [run])

  useEffect(() => {
    desktop.app.setDirtyState(state.document.isDirty)
  }, [desktop, state.document.isDirty])

  useEffect(() => {
    if (!state.ui.autoSaveEnabled || !state.document.filePath || !state.document.isDirty) {
      return
    }
    const timer = window.setTimeout(() => {
      void run(saveDoc)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [run, state.document.filePath, state.document.isDirty, state.document.html, state.ui.autoSaveEnabled])

  const value = useMemo(() => ({ state, commands }), [state, commands])
  return <EditorStoreContext.Provider value={value}>{children}</EditorStoreContext.Provider>
}

export function useEditorStore(): EditorStoreValue {
  const ctx = useContext(EditorStoreContext)
  if (!ctx) {
    throw new Error('useEditorStore must be used within EditorStoreProvider')
  }
  return ctx
}
