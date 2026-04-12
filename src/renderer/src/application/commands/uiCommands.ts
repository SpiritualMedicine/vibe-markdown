import type { EditorCommandContext } from './types'
import type { EditorStatus } from './types'
import type { EditorLocale, EditorThemeId } from '../../features/editor/settings'

export async function toggleAutoSave(ctx: EditorCommandContext, enabled: boolean): Promise<void> {
  ctx.dispatch({ type: 'SET_AUTO_SAVE', payload: enabled })
}

export async function setLocale(ctx: EditorCommandContext, locale: EditorLocale): Promise<void> {
  ctx.dispatch({ type: 'SET_LOCALE', payload: locale })
}

export async function setTheme(ctx: EditorCommandContext, theme: EditorThemeId): Promise<void> {
  ctx.dispatch({ type: 'SET_THEME', payload: theme })
}

export async function togglePreview(ctx: EditorCommandContext): Promise<void> {
  const next = !ctx.getState().ui.showPreview
  ctx.dispatch({ type: 'SET_SHOW_PREVIEW', payload: next })
}

export async function refreshWindowMaximized(ctx: EditorCommandContext): Promise<void> {
  const isWindowMaximized = await ctx.desktop.app.isWindowMaximized()
  ctx.dispatch({ type: 'SET_WINDOW_MAXIMIZED', payload: isWindowMaximized })
}

export async function showStatus(ctx: EditorCommandContext, payload: EditorStatus): Promise<void> {
  ctx.dispatch({ type: 'SET_STATUS', payload })
}
