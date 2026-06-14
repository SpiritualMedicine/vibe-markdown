/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from 'vitest'
import type { EditorState } from '../application/commands'
import { DEFAULT_MARKDOWN } from '../features/editor/domain'
import { LOCALE_STORAGE_KEY, THEME_STORAGE_KEY, t as translate } from '../features/editor/settings'
import { createInitialEditorState, editorReducer } from './editorStoreState'

describe('editorStoreState', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('creates an initial state from persisted preferences', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en-US')
    window.localStorage.setItem(THEME_STORAGE_KEY, 'amber')

    const state = createInitialEditorState()

    expect(state.ui.locale).toBe('en-US')
    expect(state.ui.theme).toBe('amber')
    expect(state.ui.status).toEqual({
      tone: 'idle',
      message: translate('en-US', 'status.ready')
    })
    expect(state.tabs).toHaveLength(1)
    expect(state.tabs[0]).toMatchObject({
      filePath: null,
      markdown: DEFAULT_MARKDOWN,
      isDirty: false
    })
    expect(state.activeTabId).toBe(state.tabs[0].id)
    expect(state.workspace).toMatchObject({
      directoryPath: null,
      searchQuery: '',
      searchResults: [],
      backlinks: []
    })
  })

  it('merges workspace updates without replacing the rest of the state', () => {
    const initialState = createInitialEditorState()

    const nextState = editorReducer(initialState, {
      type: 'SET_WORKSPACE',
      payload: {
        directoryPath: '/docs',
        recentFiles: ['/docs/readme.md']
      }
    })

    expect(nextState.workspace.directoryPath).toBe('/docs')
    expect(nextState.workspace.recentFiles).toEqual(['/docs/readme.md'])
    expect(nextState.workspace.searchQuery).toBe('')
    expect(nextState.tabs).toBe(initialState.tabs)
    expect(nextState.ui).toBe(initialState.ui)
  })

  it('updates individual ui flags without mutating sibling fields', () => {
    const initialState = createInitialEditorState()

    const maximizedState = editorReducer(initialState, {
      type: 'SET_WINDOW_MAXIMIZED',
      payload: true
    })
    const hiddenPreviewState = editorReducer(maximizedState, {
      type: 'SET_SHOW_PREVIEW',
      payload: false
    })

    expect(hiddenPreviewState.ui.isWindowMaximized).toBe(true)
    expect(hiddenPreviewState.ui.showPreview).toBe(false)
    expect(hiddenPreviewState.ui.locale).toBe(initialState.ui.locale)
    expect(hiddenPreviewState.workspace).toBe(initialState.workspace)
  })

  it('replaces tabs and active tab consistently through reducer actions', () => {
    const initialState = createInitialEditorState()
    const nextTabs: EditorState['tabs'] = [
      {
        id: 'tab-a',
        filePath: '/docs/a.md',
        markdown: '# A',
        html: '<h1>A</h1>',
        isDirty: false,
        lastSavedAt: null
      },
      {
        id: 'tab-b',
        filePath: '/docs/b.md',
        markdown: '# B',
        html: '<h1>B</h1>',
        isDirty: true,
        lastSavedAt: null
      }
    ]

    const tabsState = editorReducer(initialState, { type: 'SET_TABS', payload: nextTabs })
    const activeState = editorReducer(tabsState, { type: 'SET_ACTIVE_TAB', payload: 'tab-b' })

    expect(activeState.tabs).toEqual(nextTabs)
    expect(activeState.activeTabId).toBe('tab-b')
    expect(activeState.workspace).toBe(initialState.workspace)
  })
})
