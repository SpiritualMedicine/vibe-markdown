import { describe, expect, it, vi, beforeAll, beforeEach, afterAll } from 'vitest'
import {
  closeTab,
  loadBacklinks,
  openFromPath,
  runDirectorySearch,
  saveDoc,
  setEditorHtml,
  setEditorMarkdown
} from './editorCommands'
import type { EditorAction, EditorCommandContext, EditorState } from './types'
import type { DirectorySearchResult } from '../../../../shared'

function createDeferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error?: unknown) => void
} {
  let resolve!: (value: T) => void
  let reject!: (error?: unknown) => void
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve
    reject = nextReject
  })

  return { promise, resolve, reject }
}

function createSearchResult(filePath: string, line: number, title: string): DirectorySearchResult {
  return {
    filePath,
    fileName: filePath.split('/').pop() ?? 'doc.md',
    line,
    title,
    snippet: `${title} snippet`
  }
}

function createEditorCommandHarness(
  overrides?: Partial<EditorState> & {
    searchDirectory?: (query: string) => Promise<DirectorySearchResult[]>
    htmlToMarkdown?: (html: string) => string
    markdownToHtml?: (markdown: string) => string
  }
): {
  ctx: EditorCommandContext
  getState: () => EditorState
  dispatch: ReturnType<typeof vi.fn<(action: EditorAction) => void>>
} {
  const workspaceOverrides = overrides?.workspace
  const uiOverrides = overrides?.ui
  const stateOverrides = { ...(overrides ?? {}) }
  delete stateOverrides.workspace
  delete stateOverrides.ui

  const state: EditorState = {
    tabs: [
      {
        id: 'tab-1',
        filePath: '/docs/example.md',
        markdown: '# Title',
        html: '<h1>Title</h1>',
        isDirty: false
      }
    ],
    activeTabId: 'tab-1',
    workspace: {
      recentFiles: [],
      recentFolders: [],
      pinnedFolders: [],
      directoryPath: '/docs',
      directoryEntries: [],
      searchQuery: '',
      searchResults: [],
      backlinks: [],
      ...workspaceOverrides
    },
    ui: {
      isBusy: false,
      isDirectoryBusy: false,
      isSearchBusy: false,
      isBacklinksBusy: false,
      autoSaveEnabled: true,
      locale: 'zh-CN',
      isWindowMaximized: false,
      showPreview: true,
      theme: 'rose',
      status: { tone: 'idle', message: 'Ready' },
      ...uiOverrides
    },
    ...stateOverrides
  }

  const dispatch = vi.fn<(action: EditorAction) => void>((action) => {
    switch (action.type) {
      case 'SET_TABS':
        state.tabs = action.payload
        break
      case 'SET_ACTIVE_TAB':
        state.activeTabId = action.payload
        break
      case 'SET_WORKSPACE':
        state.workspace = { ...state.workspace, ...action.payload }
        break
      case 'SET_BUSY':
        state.ui = { ...state.ui, isBusy: action.payload }
        break
      case 'SET_DIRECTORY_BUSY':
        state.ui = { ...state.ui, isDirectoryBusy: action.payload }
        break
      case 'SET_SEARCH_BUSY':
        state.ui = { ...state.ui, isSearchBusy: action.payload }
        break
      case 'SET_STATUS':
        state.ui = { ...state.ui, status: action.payload }
        break
      case 'SET_AUTO_SAVE':
        state.ui = { ...state.ui, autoSaveEnabled: action.payload }
        break
      case 'SET_LOCALE':
        state.ui = { ...state.ui, locale: action.payload }
        break
      case 'SET_THEME':
        state.ui = { ...state.ui, theme: action.payload }
        break
      case 'SET_WINDOW_MAXIMIZED':
        state.ui = { ...state.ui, isWindowMaximized: action.payload }
        break
      case 'SET_SHOW_PREVIEW':
        state.ui = { ...state.ui, showPreview: action.payload }
        break
    }
  })

  const ctx: EditorCommandContext = {
    desktop: {
      file: {
        open: vi.fn(),
        openDirectory: vi.fn(),
        openDirectoryByPath: vi.fn(),
        recentFolders: vi.fn().mockResolvedValue([]),
        pinnedFolders: vi.fn().mockResolvedValue([]),
        pinFolder: vi.fn().mockResolvedValue([]),
        unpinFolder: vi.fn().mockResolvedValue([]),
        searchDirectory: vi.fn((request: { query: string }) => {
          if (overrides?.searchDirectory) {
            return overrides.searchDirectory(request.query)
          }
          return Promise.resolve([])
        }),
        findBacklinks: vi.fn().mockResolvedValue([]),
        openByPath: vi.fn(),
        recentList: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
        saveAs: vi.fn(),
        importImage: vi.fn(),
        exportHtml: vi.fn()
      },
      app: {
        setDirtyState: vi.fn(),
        getLaunchState: vi.fn(),
        minimizeWindow: vi.fn(),
        toggleMaximizeWindow: vi.fn(),
        closeWindow: vi.fn(),
        isWindowMaximized: vi.fn()
      }
    },
    getState: () => state,
    dispatch,
    markdownToHtml: overrides?.markdownToHtml ?? ((markdown) => `<p>${markdown}</p>`),
    htmlToMarkdown: overrides?.htmlToMarkdown ?? ((html) => `md:${html}`),
    t: (key, vars) => `${key}${vars ? JSON.stringify(vars) : ''}`
  }

  return { ctx, getState: () => state, dispatch }
}

describe('editorCommands', () => {
  const originalWindow = globalThis.window

  beforeAll(() => {
    vi.stubGlobal('window', {
      confirm: vi.fn(() => true)
    })
  })

  beforeEach(() => {
    window.confirm = vi.fn(() => true)
  })

  afterAll(() => {
    if (originalWindow) {
      vi.stubGlobal('window', originalWindow)
      return
    }
    vi.unstubAllGlobals()
  })

  it('setEditorHtml keeps markdown and html in sync for later saves', async () => {
    const { ctx, getState } = createEditorCommandHarness({
      htmlToMarkdown: (html) => `markdown-from:${html}`
    })

    await setEditorHtml(ctx, '<h2>Synced</h2>')

    expect(getState().tabs[0]).toMatchObject({
      html: '<h2>Synced</h2>',
      markdown: 'markdown-from:<h2>Synced</h2>',
      isDirty: true
    })
  })

  it('setEditorMarkdown updates rendered html for preview', async () => {
    const { ctx, getState } = createEditorCommandHarness({
      markdownToHtml: (markdown) => `<article>${markdown}</article>`
    })

    await setEditorMarkdown(ctx, '## Updated')

    expect(getState().tabs[0]).toMatchObject({
      markdown: '## Updated',
      html: '<article>## Updated</article>',
      isDirty: true
    })
  })

  it('ignores stale directory search results when newer queries finish later', async () => {
    const alpha = createDeferred<DirectorySearchResult[]>()
    const beta = createDeferred<DirectorySearchResult[]>()

    const { ctx, getState } = createEditorCommandHarness({
      searchDirectory: (query) => {
        if (query === 'alpha') {
          return alpha.promise
        }
        if (query === 'beta') {
          return beta.promise
        }
        return Promise.resolve([])
      }
    })

    const alphaPromise = runDirectorySearch(ctx, 'alpha')
    const betaPromise = runDirectorySearch(ctx, 'beta')

    beta.resolve([createSearchResult('/docs/beta.md', 8, 'Beta')])
    await betaPromise

    alpha.resolve([createSearchResult('/docs/alpha.md', 3, 'Alpha')])
    await alphaPromise

    expect(getState().workspace.searchQuery).toBe('beta')
    expect(getState().workspace.searchResults).toEqual([
      createSearchResult('/docs/beta.md', 8, 'Beta')
    ])
    expect(getState().ui.isSearchBusy).toBe(false)
  })

  it('saveDoc persists markdown and clears dirty state', async () => {
    const { ctx, getState } = createEditorCommandHarness({
      tabs: [
        {
          id: 'tab-1',
          filePath: '/docs/example.md',
          markdown: '## Persisted',
          html: '<h2>Persisted</h2>',
          isDirty: true
        }
      ]
    })

    const saveMock = vi
      .mocked(ctx.desktop.file.save)
      .mockResolvedValue({ canceled: false, filePath: '/docs/example.md' })

    await saveDoc(ctx)

    expect(saveMock).toHaveBeenCalledWith({
      filePath: '/docs/example.md',
      content: '## Persisted'
    })
    expect(getState().tabs[0].isDirty).toBe(false)
    expect(getState().ui.status.tone).toBe('success')
  })

  it('closeTab keeps the current tab when the user cancels discard', async () => {
    vi.mocked(window.confirm).mockReturnValue(false)

    const { ctx, getState } = createEditorCommandHarness({
      tabs: [
        {
          id: 'tab-1',
          filePath: '/docs/example.md',
          markdown: '# Dirty',
          html: '<h1>Dirty</h1>',
          isDirty: true
        },
        {
          id: 'tab-2',
          filePath: '/docs/other.md',
          markdown: '# Other',
          html: '<h1>Other</h1>',
          isDirty: false
        }
      ]
    })

    await closeTab(ctx, 'tab-1')

    expect(getState().tabs).toHaveLength(2)
    expect(getState().activeTabId).toBe('tab-1')
  })

  it('openFromPath activates an existing tab without reopening the file', async () => {
    const { ctx, getState } = createEditorCommandHarness({
      tabs: [
        {
          id: 'tab-1',
          filePath: '/docs/example.md',
          markdown: '# One',
          html: '<h1>One</h1>',
          isDirty: false
        },
        {
          id: 'tab-2',
          filePath: '/docs/other.md',
          markdown: '# Two',
          html: '<h1>Two</h1>',
          isDirty: false
        }
      ],
      activeTabId: 'tab-1'
    })

    await openFromPath(ctx, { filePath: '/docs/other.md' })

    expect(ctx.desktop.file.openByPath).not.toHaveBeenCalled()
    expect(getState().activeTabId).toBe('tab-2')
    expect(getState().tabs).toHaveLength(2)
  })

  it('loadBacklinks stores folder backlink results for the active file', async () => {
    const { ctx, getState } = createEditorCommandHarness()
    vi.mocked(ctx.desktop.file.findBacklinks).mockResolvedValue([
      {
        sourcePath: '/docs/notes.md',
        fileName: 'notes.md',
        line: 9,
        title: 'Notes',
        snippet: 'See [[example]]'
      }
    ])

    await loadBacklinks(ctx, '/docs/example.md')

    expect(ctx.desktop.file.findBacklinks).toHaveBeenCalledWith({
      directoryPath: '/docs',
      targetPath: '/docs/example.md'
    })
    expect(getState().workspace.backlinks).toEqual([
      {
        sourcePath: '/docs/notes.md',
        fileName: 'notes.md',
        line: 9,
        title: 'Notes',
        snippet: 'See [[example]]'
      }
    ])
    expect(getState().ui.isBacklinksBusy).toBe(false)
  })
})
