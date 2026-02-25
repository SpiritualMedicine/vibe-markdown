export const THEME_STORAGE_KEY = 'vibe-markdown-theme'

export const THEME_OPTIONS = [
  { id: 'rose', label: 'Rose' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'sky', label: 'Sky' },
  { id: 'amber', label: 'Amber' },
  { id: 'violet', label: 'Violet' }
] as const

export type EditorThemeId = (typeof THEME_OPTIONS)[number]['id']

export function isEditorThemeId(value: string): value is EditorThemeId {
  return THEME_OPTIONS.some((theme) => theme.id === value)
}

export function loadEditorTheme(): EditorThemeId {
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
  return raw && isEditorThemeId(raw) ? raw : 'rose'
}

export function applyEditorTheme(theme: EditorThemeId): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export function saveEditorTheme(theme: EditorThemeId): void {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}
