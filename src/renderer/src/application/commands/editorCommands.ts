import type { OpenByPathRequest } from '../../../../shared/editor-ipc'
import type { EditorCommandContext } from './types'

function confirmDiscardIfDirty(ctx: EditorCommandContext, message: string): boolean {
  if (!ctx.getState().document.isDirty) {
    return true
  }
  return window.confirm(message)
}

export async function newDoc(ctx: EditorCommandContext): Promise<void> {
  if (!confirmDiscardIfDirty(ctx, 'Discard unsaved changes?')) {
    return
  }
  const markdown = '# Welcome\n\nStart writing your markdown document.'
  ctx.dispatch({
    type: 'SET_DOCUMENT',
    payload: {
      filePath: null,
      markdown,
      html: ctx.markdownToHtml(markdown),
      isDirty: false
    }
  })
  ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'success', message: 'New document created' } })
}

export async function openDoc(ctx: EditorCommandContext): Promise<void> {
  if (!confirmDiscardIfDirty(ctx, 'Discard unsaved changes and open another file?')) {
    return
  }
  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await ctx.desktop.file.open()
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.canceled) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'idle', message: 'Open canceled' } })
    return
  }
  if (result.error) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'error', message: result.error } })
    return
  }

  const markdown = result.content
  ctx.dispatch({
    type: 'SET_DOCUMENT',
    payload: {
      filePath: result.filePath,
      markdown,
      html: ctx.markdownToHtml(markdown),
      isDirty: false
    }
  })
  ctx.dispatch({
    type: 'SET_STATUS',
    payload: { tone: 'success', message: `Opened ${result.filePath ?? 'document'}` }
  })
}

export async function openFromPath(
  ctx: EditorCommandContext,
  request: OpenByPathRequest & { skipDirtyGuard?: boolean }
): Promise<void> {
  if (
    !request.skipDirtyGuard &&
    !confirmDiscardIfDirty(ctx, 'Discard unsaved changes and open another file?')
  ) {
    return
  }

  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await ctx.desktop.file.openByPath({ filePath: request.filePath })
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.error) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'error', message: result.error } })
    return
  }
  if (result.canceled) {
    return
  }

  const markdown = result.content
  ctx.dispatch({
    type: 'SET_DOCUMENT',
    payload: {
      filePath: result.filePath,
      markdown,
      html: ctx.markdownToHtml(markdown),
      isDirty: false
    }
  })
  ctx.dispatch({
    type: 'SET_STATUS',
    payload: { tone: 'success', message: `Opened ${result.filePath ?? 'document'}` }
  })
}

export async function openFolder(ctx: EditorCommandContext): Promise<void> {
  ctx.dispatch({ type: 'SET_DIRECTORY_BUSY', payload: true })
  const result = await ctx.desktop.file.openDirectory()
  ctx.dispatch({ type: 'SET_DIRECTORY_BUSY', payload: false })

  if (result.canceled) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'idle', message: 'Open folder canceled' } })
    return
  }
  if (result.error) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'error', message: result.error } })
    return
  }

  ctx.dispatch({
    type: 'SET_WORKSPACE',
    payload: {
      directoryPath: result.directoryPath,
      directoryEntries: result.entries
    }
  })
  ctx.dispatch({
    type: 'SET_STATUS',
    payload: { tone: 'success', message: `Loaded folder ${result.directoryPath ?? ''}` }
  })
}

export async function refreshRecentList(ctx: EditorCommandContext): Promise<void> {
  const recentFiles = await ctx.desktop.file.recentList()
  ctx.dispatch({ type: 'SET_WORKSPACE', payload: { recentFiles } })
}

export async function saveDoc(ctx: EditorCommandContext): Promise<void> {
  const state = ctx.getState()
  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const markdown = state.document.markdown
  const result = await ctx.desktop.file.save({
    filePath: state.document.filePath,
    content: markdown
  })
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.canceled) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'idle', message: 'Save canceled' } })
    return
  }
  if (result.error) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'error', message: result.error } })
    return
  }

  ctx.dispatch({
    type: 'SET_DOCUMENT',
    payload: { filePath: result.filePath, markdown, isDirty: false }
  })
  ctx.dispatch({
    type: 'SET_STATUS',
    payload: { tone: 'success', message: `Saved ${result.filePath ?? 'document'}` }
  })
}

export async function saveAs(ctx: EditorCommandContext): Promise<void> {
  const state = ctx.getState()
  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const markdown = state.document.markdown
  const result = await ctx.desktop.file.saveAs({
    filePath: state.document.filePath,
    content: markdown
  })
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.canceled) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'idle', message: 'Save as canceled' } })
    return
  }
  if (result.error) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'error', message: result.error } })
    return
  }

  ctx.dispatch({
    type: 'SET_DOCUMENT',
    payload: { filePath: result.filePath, markdown, isDirty: false }
  })
  ctx.dispatch({
    type: 'SET_STATUS',
    payload: { tone: 'success', message: `Saved as ${result.filePath ?? 'document'}` }
  })
}

export async function exportHtml(ctx: EditorCommandContext): Promise<void> {
  const state = ctx.getState()
  const fileName = state.document.filePath?.split(/[\\/]/).pop() ?? 'untitled.md'
  const suggestedName = fileName.replace(/\.(md|markdown|txt)$/i, '') || 'untitled'
  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await ctx.desktop.file.exportHtml({
    suggestedName,
    html: state.document.html
  })
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.canceled) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'idle', message: 'Export canceled' } })
    return
  }
  if (result.error) {
    ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'error', message: result.error } })
    return
  }
  ctx.dispatch({
    type: 'SET_STATUS',
    payload: { tone: 'success', message: `Exported ${result.filePath ?? 'HTML file'}` }
  })
}

export async function toggleAutoSave(ctx: EditorCommandContext, enabled: boolean): Promise<void> {
  ctx.dispatch({ type: 'SET_AUTO_SAVE', payload: enabled })
}

export async function togglePreview(ctx: EditorCommandContext): Promise<void> {
  const next = !ctx.getState().ui.showPreview
  ctx.dispatch({ type: 'SET_SHOW_PREVIEW', payload: next })
}

export async function setEditorHtml(ctx: EditorCommandContext, html: string): Promise<void> {
  ctx.dispatch({
    type: 'SET_DOCUMENT',
    payload: {
      html,
      isDirty: true
    }
  })
  ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'idle', message: 'Editing...' } })
}

export async function setEditorMarkdown(ctx: EditorCommandContext, markdown: string): Promise<void> {
  ctx.dispatch({
    type: 'SET_DOCUMENT',
    payload: {
      markdown,
      html: ctx.markdownToHtml(markdown),
      isDirty: true
    }
  })
  ctx.dispatch({ type: 'SET_STATUS', payload: { tone: 'idle', message: 'Editing...' } })
}

export async function restoreLaunchFile(ctx: EditorCommandContext): Promise<void> {
  const launchState = await ctx.desktop.app.getLaunchState()
  if (!launchState.lastOpenedFilePath) {
    return
  }
  await openFromPath(ctx, { filePath: launchState.lastOpenedFilePath, skipDirtyGuard: true })
}

export async function refreshWindowMaximized(ctx: EditorCommandContext): Promise<void> {
  const isWindowMaximized = await ctx.desktop.app.isWindowMaximized()
  ctx.dispatch({ type: 'SET_WINDOW_MAXIMIZED', payload: isWindowMaximized })
}
