import type { FileSaveResult, OpenByPathRequest } from '../../../../shared'
import {
  createEditorTab,
  getDocumentTemplate,
  getDocumentTemplateLabel,
  type DocumentTemplateId
} from '../../features/editor/domain'
import { refreshRecentList } from './workspaceCommands'
import type { EditorCommandContext, EditorTab } from './types'
import {
  getActiveTab,
  setStatus,
  setTabs,
  updateTab,
  upsertOpenedTab
} from './editorCommandHelpers'

async function saveSpecificTab(
  ctx: EditorCommandContext,
  tab: EditorTab,
  forceDialog: boolean
): Promise<FileSaveResult> {
  const result = forceDialog
    ? await ctx.desktop.file.saveAs({ filePath: tab.filePath, content: tab.markdown })
    : await ctx.desktop.file.save({ filePath: tab.filePath, content: tab.markdown })

  if (!result.canceled && !result.error) {
    updateTab(ctx, tab.id, (current) => ({
      ...current,
      filePath: result.filePath,
      isDirty: false
    }))
    await refreshRecentList(ctx)
  }

  return result
}

export async function newDoc(ctx: EditorCommandContext): Promise<void> {
  const nextTab = createEditorTab(ctx.markdownToHtml)
  setTabs(ctx, [...ctx.getState().tabs, nextTab], nextTab.id)
  setStatus(ctx, 'success', ctx.t('status.newCreated'))
}

export async function newDocFromTemplate(
  ctx: EditorCommandContext,
  templateId: DocumentTemplateId
): Promise<void> {
  const template = getDocumentTemplate(templateId)
  const nextTab = createEditorTab(ctx.markdownToHtml, template.markdown)
  setTabs(ctx, [...ctx.getState().tabs, nextTab], nextTab.id)
  setStatus(
    ctx,
    'success',
    ctx.t('status.templateCreated', {
      target: getDocumentTemplateLabel(ctx.getState().ui.locale, template)
    })
  )
}

export async function openDoc(ctx: EditorCommandContext): Promise<void> {
  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await ctx.desktop.file.open()
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.canceled) {
    setStatus(ctx, 'idle', ctx.t('status.openCanceled'))
    return
  }
  if (result.error) {
    setStatus(ctx, 'error', result.error)
    return
  }

  upsertOpenedTab(ctx, result)
  await refreshRecentList(ctx)
  setStatus(ctx, 'success', ctx.t('status.opened', { target: result.filePath ?? 'document' }))
}

export async function openFromPath(
  ctx: EditorCommandContext,
  request: OpenByPathRequest & { skipDirtyGuard?: boolean }
): Promise<void> {
  const existing = ctx.getState().tabs.find((tab) => tab.filePath === request.filePath)
  if (existing) {
    ctx.dispatch({ type: 'SET_ACTIVE_TAB', payload: existing.id })
    setStatus(ctx, 'success', ctx.t('status.opened', { target: request.filePath }))
    return
  }

  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await ctx.desktop.file.openByPath({ filePath: request.filePath })
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.error) {
    setStatus(ctx, 'error', result.error)
    return
  }
  if (result.canceled) {
    return
  }

  upsertOpenedTab(ctx, result)
  await refreshRecentList(ctx)
  setStatus(ctx, 'success', ctx.t('status.opened', { target: result.filePath ?? 'document' }))
}

export async function saveDoc(ctx: EditorCommandContext): Promise<void> {
  const tab = getActiveTab(ctx.getState())
  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await saveSpecificTab(ctx, tab, false)
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.canceled) {
    setStatus(ctx, 'idle', ctx.t('status.saveCanceled'))
    return
  }
  if (result.error) {
    setStatus(ctx, 'error', result.error)
    return
  }

  setStatus(ctx, 'success', ctx.t('status.saved', { target: result.filePath ?? 'document' }))
}

export async function saveAs(ctx: EditorCommandContext): Promise<void> {
  const tab = getActiveTab(ctx.getState())
  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await saveSpecificTab(ctx, tab, true)
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.canceled) {
    setStatus(ctx, 'idle', ctx.t('status.saveAsCanceled'))
    return
  }
  if (result.error) {
    setStatus(ctx, 'error', result.error)
    return
  }

  setStatus(ctx, 'success', ctx.t('status.savedAs', { target: result.filePath ?? 'document' }))
}

export async function exportHtml(ctx: EditorCommandContext): Promise<void> {
  const tab = getActiveTab(ctx.getState())
  const fileName = tab.filePath?.split(/[\\/]/).pop() ?? 'untitled.md'
  const suggestedName = fileName.replace(/\.(md|markdown|txt)$/i, '') || 'untitled'
  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await ctx.desktop.file.exportHtml({
    suggestedName,
    html: tab.html
  })
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.canceled) {
    setStatus(ctx, 'idle', ctx.t('status.exportCanceled'))
    return
  }
  if (result.error) {
    setStatus(ctx, 'error', result.error)
    return
  }
  setStatus(ctx, 'success', ctx.t('status.exported', { target: result.filePath ?? 'HTML file' }))
}

export async function setEditorHtml(ctx: EditorCommandContext, html: string): Promise<void> {
  const state = ctx.getState()
  const markdown = ctx.htmlToMarkdown(html)
  updateTab(ctx, state.activeTabId, (tab) => ({
    ...tab,
    markdown,
    html,
    isDirty: true
  }))
  setStatus(ctx, 'idle', ctx.t('status.editing'))
}

export async function setEditorMarkdown(
  ctx: EditorCommandContext,
  markdown: string
): Promise<void> {
  const state = ctx.getState()
  updateTab(ctx, state.activeTabId, (tab) => ({
    ...tab,
    markdown,
    html: ctx.markdownToHtml(markdown),
    isDirty: true
  }))
  setStatus(ctx, 'idle', ctx.t('status.editing'))
}

export async function restoreLaunchFile(ctx: EditorCommandContext): Promise<void> {
  const launchState = await ctx.desktop.app.getLaunchState()
  if (!launchState.lastOpenedFilePath) {
    return
  }
  await openFromPath(ctx, { filePath: launchState.lastOpenedFilePath, skipDirtyGuard: true })
}

export async function importImageAtSelection(
  ctx: EditorCommandContext,
  payload: { selectionStart: number; selectionEnd: number; sourcePath?: string }
): Promise<void> {
  const activeTab = getActiveTab(ctx.getState())
  if (!activeTab.filePath) {
    setStatus(ctx, 'error', ctx.t('status.saveBeforeImage'))
    return
  }

  const result = await ctx.desktop.file.importImage({
    documentPath: activeTab.filePath,
    sourcePath: payload.sourcePath
  })
  if (result.canceled) {
    return
  }
  if (result.error || !result.markdownPath) {
    setStatus(ctx, 'error', result.error ?? ctx.t('status.imageImportFailed'))
    return
  }

  const fileName = result.markdownPath.split('/').pop() ?? 'image'
  const altText = fileName.replace(/\.[^.]+$/, '')
  const snippet = `![${altText}](${result.markdownPath})`
  const { selectionStart, selectionEnd } = payload
  const nextMarkdown =
    activeTab.markdown.slice(0, selectionStart) + snippet + activeTab.markdown.slice(selectionEnd)

  updateTab(ctx, activeTab.id, (tab) => ({
    ...tab,
    markdown: nextMarkdown,
    html: ctx.markdownToHtml(nextMarkdown),
    isDirty: true
  }))
  setStatus(ctx, 'success', ctx.t('status.imageImported', { target: result.markdownPath }))
}
