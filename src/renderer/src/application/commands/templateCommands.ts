import { setStatus } from './editorCommandHelpers'
import type { EditorCommandContext } from './types'
import type { UserTemplate } from '../../../../shared'

export async function useUserTemplate(
  ctx: EditorCommandContext,
  templateId: string
): Promise<void> {
  const templates = await loadUserTemplates(ctx)
  const template = templates.find((t) => t.id === templateId)

  if (!template) {
    setStatus(ctx, 'error', ctx.t('template.deleteFailed'))
    return
  }

  const nextTab = {
    id: Date.now().toString(),
    markdown: template.markdown,
    html: ctx.markdownToHtml(template.markdown),
    isDirty: true,
    filePath: null,
    lastSavedAt: null
  }

  ctx.dispatch({ type: 'SET_TABS', payload: [nextTab] })
  ctx.dispatch({ type: 'SET_ACTIVE_TAB', payload: nextTab.id })
  setStatus(ctx, 'success', ctx.t('status.templateCreated', { target: template.name }))
}

export async function createTemplateFromCurrentDoc(
  ctx: EditorCommandContext,
  name: string
): Promise<void> {
  const activeTab = ctx.getState().tabs.find((tab) => tab.id === ctx.getState().activeTabId)
  if (!activeTab) {
    setStatus(ctx, 'error', ctx.t('status.ready'))
    return
  }

  const result = await ctx.desktop.file.saveTemplate({
    name,
    markdown: activeTab.markdown
  })

  if (result.error) {
    setStatus(ctx, 'error', ctx.t('template.createFailed'))
  } else {
    setStatus(ctx, 'success', ctx.t('template.createSuccess'))
  }
}

export async function deleteUserTemplate(
  ctx: EditorCommandContext,
  templateId: string
): Promise<void> {
  const result = await ctx.desktop.file.deleteTemplate({ id: templateId })

  if (result.error || !result.success) {
    setStatus(ctx, 'error', ctx.t('template.deleteFailed'))
  } else {
    setStatus(ctx, 'success', ctx.t('template.deleteSuccess'))
  }
}

export async function loadUserTemplates(ctx: EditorCommandContext): Promise<UserTemplate[]> {
  const result = await ctx.desktop.file.listTemplates()
  return result.templates
}
