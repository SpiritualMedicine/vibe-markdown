import type { EditorAction, EditorState } from '../application/commands'
import { createEditorTab, DEFAULT_MARKDOWN } from '../features/editor/domain'
import { loadEditorLocale, loadEditorTheme, t as translate } from '../features/editor/settings'
import { markdownToHtml } from '../core/editor/markdownCodec'

export function createInitialEditorState(): EditorState {
  const initialLocale = loadEditorLocale()
  const initialTheme = loadEditorTheme()
  const initialTab = createEditorTab(markdownToHtml, DEFAULT_MARKDOWN)

  return {
    tabs: [initialTab],
    activeTabId: initialTab.id,
    workspace: {
      recentFiles: [],
      recentFolders: [],
      pinnedFolders: [],
      directoryPath: null,
      directoryEntries: [],
      searchQuery: '',
      searchResults: [],
      backlinks: []
    },
    ui: {
      isBusy: false,
      isDirectoryBusy: false,
      isSearchBusy: false,
      isBacklinksBusy: false,
      autoSaveEnabled: true,
      locale: initialLocale,
      isWindowMaximized: false,
      showPreview: true,
      theme: initialTheme,
      status: { tone: 'idle', message: translate(initialLocale, 'status.ready') }
    }
  }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_BUSY':
      return { ...state, ui: { ...state.ui, isBusy: action.payload } }
    case 'SET_DIRECTORY_BUSY':
      return { ...state, ui: { ...state.ui, isDirectoryBusy: action.payload } }
    case 'SET_SEARCH_BUSY':
      return { ...state, ui: { ...state.ui, isSearchBusy: action.payload } }
    case 'SET_BACKLINKS_BUSY':
      return { ...state, ui: { ...state.ui, isBacklinksBusy: action.payload } }
    case 'SET_STATUS':
      return { ...state, ui: { ...state.ui, status: action.payload } }
    case 'SET_TABS':
      return { ...state, tabs: action.payload }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload }
    case 'SET_WORKSPACE':
      return { ...state, workspace: { ...state.workspace, ...action.payload } }
    case 'SET_AUTO_SAVE':
      return { ...state, ui: { ...state.ui, autoSaveEnabled: action.payload } }
    case 'SET_LOCALE':
      return { ...state, ui: { ...state.ui, locale: action.payload } }
    case 'SET_THEME':
      return { ...state, ui: { ...state.ui, theme: action.payload } }
    case 'SET_WINDOW_MAXIMIZED':
      return { ...state, ui: { ...state.ui, isWindowMaximized: action.payload } }
    case 'SET_SHOW_PREVIEW':
      return { ...state, ui: { ...state.ui, showPreview: action.payload } }
    default:
      return state
  }
}
