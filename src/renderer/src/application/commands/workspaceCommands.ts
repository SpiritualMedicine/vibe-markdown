import type {
  DirectorySearchResult,
  DocumentBacklink,
  OpenDirectoryByPathRequest
} from '../../../../shared'
import { setStatus, setTabs, confirmDiscard } from './editorCommandHelpers'
import type { EditorCommandContext, EditorTab } from './types'
import { createEditorTab } from '../../features/editor/domain'

let latestDirectorySearchRequestId = 0

async function openDirectoryRequest(
  ctx: EditorCommandContext,
  request?: OpenDirectoryByPathRequest
): Promise<void> {
  ctx.dispatch({ type: 'SET_DIRECTORY_BUSY', payload: true })
  const result = request
    ? await ctx.desktop.file.openDirectoryByPath(request)
    : await ctx.desktop.file.openDirectory()
  ctx.dispatch({ type: 'SET_DIRECTORY_BUSY', payload: false })

  if (result.canceled) {
    setStatus(ctx, 'idle', ctx.t('status.openFolderCanceled'))
    return
  }
  if (result.error) {
    setStatus(ctx, 'error', result.error)
    return
  }

  ctx.dispatch({
    type: 'SET_WORKSPACE',
    payload: {
      directoryPath: result.directoryPath,
      directoryEntries: result.entries,
      searchResults: [],
      searchQuery: '',
      backlinks: []
    }
  })
  await refreshFolderLists(ctx)
  setStatus(ctx, 'success', ctx.t('status.loadedFolder', { target: result.directoryPath ?? '' }))
}

function canCloseTabs(ctx: EditorCommandContext, tabs: EditorTab[]): boolean {
  const dirtyTabs = tabs.filter((tab) => tab.isDirty)
  if (dirtyTabs.length === 0) {
    return true
  }
  if (dirtyTabs.length === 1) {
    return confirmDiscard(dirtyTabs[0], ctx.t('dialog.closeTabDiscard'))
  }
  return window.confirm(ctx.t('dialog.closeTabsDiscard'))
}

export async function openFolder(ctx: EditorCommandContext): Promise<void> {
  await openDirectoryRequest(ctx)
}

export async function openFolderFromPath(
  ctx: EditorCommandContext,
  request: OpenDirectoryByPathRequest
): Promise<void> {
  await openDirectoryRequest(ctx, request)
}

export async function refreshRecentList(ctx: EditorCommandContext): Promise<void> {
  const recentFiles = await ctx.desktop.file.recentList()
  ctx.dispatch({ type: 'SET_WORKSPACE', payload: { recentFiles } })
}

export async function refreshFolderLists(ctx: EditorCommandContext): Promise<void> {
  const [recentFolders, pinnedFolders] = await Promise.all([
    ctx.desktop.file.recentFolders(),
    ctx.desktop.file.pinnedFolders()
  ])
  ctx.dispatch({ type: 'SET_WORKSPACE', payload: { recentFolders, pinnedFolders } })
}

export async function activateTab(ctx: EditorCommandContext, tabId: string): Promise<void> {
  const target = ctx.getState().tabs.find((tab) => tab.id === tabId)
  if (!target) {
    return
  }
  ctx.dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId })
}

export async function reorderTabs(
  ctx: EditorCommandContext,
  payload: { activeTabId: string; targetTabId: string }
): Promise<void> {
  const { activeTabId, targetTabId } = payload
  if (activeTabId === targetTabId) {
    return
  }

  const tabs = [...ctx.getState().tabs]
  const fromIndex = tabs.findIndex((tab) => tab.id === activeTabId)
  const toIndex = tabs.findIndex((tab) => tab.id === targetTabId)
  if (fromIndex < 0 || toIndex < 0) {
    return
  }

  const [moved] = tabs.splice(fromIndex, 1)
  tabs.splice(toIndex, 0, moved)
  ctx.dispatch({ type: 'SET_TABS', payload: tabs })
}

export async function closeTab(ctx: EditorCommandContext, tabId: string): Promise<void> {
  const state = ctx.getState()
  const tab = state.tabs.find((item) => item.id === tabId)
  if (!tab) {
    return
  }
  if (!confirmDiscard(tab, ctx.t('dialog.closeTabDiscard'))) {
    return
  }

  const nextTabs = state.tabs.filter((item) => item.id !== tabId)
  if (nextTabs.length === 0) {
    const fallbackTab = createEditorTab(ctx.markdownToHtml)
    setTabs(ctx, [fallbackTab], fallbackTab.id)
    return
  }

  const nextActiveId =
    state.activeTabId === tabId
      ? nextTabs[Math.max(0, state.tabs.findIndex((item) => item.id === tabId) - 1)].id
      : state.activeTabId
  setTabs(ctx, nextTabs, nextActiveId)
}

export async function closeOtherTabs(ctx: EditorCommandContext, tabId: string): Promise<void> {
  const state = ctx.getState()
  const keepTab = state.tabs.find((tab) => tab.id === tabId)
  if (!keepTab) {
    return
  }
  const removableTabs = state.tabs.filter((tab) => tab.id !== tabId)
  if (!canCloseTabs(ctx, removableTabs)) {
    return
  }
  setTabs(ctx, [keepTab], keepTab.id)
}

export async function closeTabsToRight(ctx: EditorCommandContext, tabId: string): Promise<void> {
  const state = ctx.getState()
  const currentIndex = state.tabs.findIndex((tab) => tab.id === tabId)
  if (currentIndex < 0 || currentIndex === state.tabs.length - 1) {
    return
  }
  const removableTabs = state.tabs.slice(currentIndex + 1)
  if (!canCloseTabs(ctx, removableTabs)) {
    return
  }
  const nextTabs = state.tabs.slice(0, currentIndex + 1)
  const activeTabId = nextTabs.some((tab) => tab.id === state.activeTabId)
    ? state.activeTabId
    : tabId
  setTabs(ctx, nextTabs, activeTabId)
}

export async function runDirectorySearch(ctx: EditorCommandContext, query: string): Promise<void> {
  const requestId = ++latestDirectorySearchRequestId
  ctx.dispatch({ type: 'SET_WORKSPACE', payload: { searchQuery: query } })
  if (!query.trim()) {
    ctx.dispatch({ type: 'SET_SEARCH_BUSY', payload: false })
    ctx.dispatch({ type: 'SET_WORKSPACE', payload: { searchResults: [] } })
    return
  }

  const { directoryPath } = ctx.getState().workspace
  if (!directoryPath) {
    ctx.dispatch({ type: 'SET_SEARCH_BUSY', payload: false })
    setStatus(ctx, 'error', ctx.t('status.searchNeedsFolder'))
    return
  }

  ctx.dispatch({ type: 'SET_SEARCH_BUSY', payload: true })
  const searchResults: DirectorySearchResult[] = await ctx.desktop.file.searchDirectory({
    directoryPath,
    query
  })
  if (requestId !== latestDirectorySearchRequestId) {
    return
  }
  ctx.dispatch({ type: 'SET_SEARCH_BUSY', payload: false })
  ctx.dispatch({ type: 'SET_WORKSPACE', payload: { searchResults } })
}

export async function loadBacklinks(
  ctx: EditorCommandContext,
  targetPath: string | null
): Promise<void> {
  if (!targetPath) {
    ctx.dispatch({ type: 'SET_BACKLINKS_BUSY', payload: false })
    ctx.dispatch({ type: 'SET_WORKSPACE', payload: { backlinks: [] } })
    return
  }

  const { directoryPath } = ctx.getState().workspace
  if (!directoryPath) {
    ctx.dispatch({ type: 'SET_BACKLINKS_BUSY', payload: false })
    ctx.dispatch({ type: 'SET_WORKSPACE', payload: { backlinks: [] } })
    return
  }

  ctx.dispatch({ type: 'SET_BACKLINKS_BUSY', payload: true })
  const backlinks: DocumentBacklink[] = await ctx.desktop.file.findBacklinks({
    directoryPath,
    targetPath
  })
  ctx.dispatch({ type: 'SET_BACKLINKS_BUSY', payload: false })
  ctx.dispatch({ type: 'SET_WORKSPACE', payload: { backlinks } })
}

export async function togglePinnedFolder(
  ctx: EditorCommandContext,
  directoryPath: string
): Promise<void> {
  const pinnedFolders = ctx.getState().workspace.pinnedFolders
  const next = pinnedFolders.includes(directoryPath)
    ? await ctx.desktop.file.unpinFolder({ directoryPath })
    : await ctx.desktop.file.pinFolder({ directoryPath })
  ctx.dispatch({ type: 'SET_WORKSPACE', payload: { pinnedFolders: next } })
}
