import type { EditorCommandContext } from './types'
import { getActiveTab, setStatus, updateTab } from './editorCommandHelpers'

export function parseWikiLinks(
  markdown: string
): Array<{ path: string; text: string; start: number; end: number }> {
  const links: Array<{ path: string; text: string; start: number; end: number }> = []
  const regex = /\[\[([^\]]+)\]\]/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(markdown)) !== null) {
    const reference = match[1].trim()
    links.push({
      path: reference,
      text: reference,
      start: match.index,
      end: match.index + match[0].length
    })
  }

  return links
}

export async function navigateToWikiLink(
  ctx: EditorCommandContext,
  linkPath: string
): Promise<void> {
  const state = ctx.getState()
  const directoryPath = state.workspace.directoryPath

  if (!directoryPath) {
    setStatus(ctx, 'error', ctx.t('status.searchNeedsFolder'))
    return
  }

  let targetPath = linkPath

  if (
    !targetPath.endsWith('.md') &&
    !targetPath.endsWith('.markdown') &&
    !targetPath.endsWith('.txt')
  ) {
    targetPath = `${targetPath}.md`
  }

  if (!targetPath.startsWith(directoryPath)) {
    targetPath = `${directoryPath}/${targetPath}`
  }

  const existing = state.tabs.find((tab) => tab.filePath === targetPath)
  if (existing) {
    ctx.dispatch({ type: 'SET_ACTIVE_TAB', payload: existing.id })
    setStatus(ctx, 'success', ctx.t('status.referenceOpened', { target: linkPath }))
    return
  }

  ctx.dispatch({ type: 'SET_BUSY', payload: true })
  const result = await ctx.desktop.file.openByPath({ filePath: targetPath })
  ctx.dispatch({ type: 'SET_BUSY', payload: false })

  if (result.error) {
    setStatus(ctx, 'error', ctx.t('status.referenceMissing', { target: linkPath }))
    return
  }

  if (result.filePath) {
    getActiveTab(state)
    updateTab(ctx, state.activeTabId, (tab) => ({
      ...tab,
      filePath: result.filePath!,
      isDirty: tab.isDirty,
      lastSavedAt: tab.lastSavedAt
    }))
    setStatus(ctx, 'success', ctx.t('status.referenceOpened', { target: linkPath }))
  }
}

export async function validateWikiLinks(
  ctx: EditorCommandContext
): Promise<Array<{ path: string; exists: boolean }>> {
  const activeTab = getActiveTab(ctx.getState())
  const directoryPath = ctx.getState().workspace.directoryPath

  if (!activeTab.filePath || !directoryPath) {
    return []
  }

  const links = parseWikiLinks(activeTab.markdown)

  const results = await Promise.all(
    links.map(async (link) => {
      let targetPath = link.path
      if (
        !targetPath.endsWith('.md') &&
        !targetPath.endsWith('.markdown') &&
        !targetPath.endsWith('.txt')
      ) {
        targetPath = `${targetPath}.md`
      }
      if (!targetPath.startsWith(directoryPath)) {
        targetPath = `${directoryPath}/${targetPath}`
      }

      try {
        await ctx.desktop.file.openByPath({ filePath: targetPath })
        return { path: link.path, exists: true }
      } catch {
        return { path: link.path, exists: false }
      }
    })
  )

  return results
}
