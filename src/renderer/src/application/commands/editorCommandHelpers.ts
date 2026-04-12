import type { FileOpenResult } from '../../../../shared'
import { createEditorTab, getActiveEditorTab } from '../../features/editor/domain'
import type { EditorCommandContext, EditorState, EditorStatus, EditorTab } from './types'

export function getActiveTab(state: EditorState): EditorTab {
  return getActiveEditorTab(state.tabs, state.activeTabId)
}

export function setTabs(ctx: EditorCommandContext, tabs: EditorTab[], activeTabId?: string): void {
  ctx.dispatch({ type: 'SET_TABS', payload: tabs })
  if (activeTabId) {
    ctx.dispatch({ type: 'SET_ACTIVE_TAB', payload: activeTabId })
    return
  }
  if (!tabs.some((tab) => tab.id === ctx.getState().activeTabId)) {
    ctx.dispatch({ type: 'SET_ACTIVE_TAB', payload: tabs[0]?.id ?? '' })
  }
}

export function updateTab(
  ctx: EditorCommandContext,
  tabId: string,
  updater: (tab: EditorTab) => EditorTab
): EditorTab | null {
  let updatedTab: EditorTab | null = null
  const tabs = ctx.getState().tabs.map((tab) => {
    if (tab.id !== tabId) {
      return tab
    }
    updatedTab = updater(tab)
    return updatedTab
  })
  ctx.dispatch({ type: 'SET_TABS', payload: tabs })
  return updatedTab
}

export function setStatus(
  ctx: EditorCommandContext,
  tone: EditorStatus['tone'],
  message: string
): void {
  ctx.dispatch({ type: 'SET_STATUS', payload: { tone, message } })
}

export function upsertOpenedTab(ctx: EditorCommandContext, result: FileOpenResult): void {
  if (!result.filePath) {
    return
  }

  const state = ctx.getState()
  const existing = state.tabs.find((tab) => tab.filePath === result.filePath)
  if (existing) {
    setTabs(
      ctx,
      state.tabs.map((tab) =>
        tab.id === existing.id
          ? {
              ...tab,
              markdown: tab.isDirty ? tab.markdown : result.content,
              html: tab.isDirty ? tab.html : ctx.markdownToHtml(result.content),
              isDirty: tab.isDirty
            }
          : tab
      ),
      existing.id
    )
    return
  }

  const nextTab: EditorTab = {
    ...createEditorTab(ctx.markdownToHtml, result.content),
    filePath: result.filePath
  }
  setTabs(ctx, [...state.tabs, nextTab], nextTab.id)
}

export function confirmDiscard(tab: EditorTab, message: string): boolean {
  if (!tab.isDirty) {
    return true
  }
  return window.confirm(message)
}
