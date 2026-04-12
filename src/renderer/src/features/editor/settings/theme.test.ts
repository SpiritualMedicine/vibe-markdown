/** @vitest-environment jsdom */

import { describe, expect, it, vi } from 'vitest'
import {
  THEME_OPTIONS,
  applyEditorTheme,
  isEditorThemeId,
  loadEditorTheme,
  saveEditorTheme
} from './theme'

describe('theme', () => {
  it('exposes supported theme options', () => {
    expect(THEME_OPTIONS.map((theme) => theme.id)).toEqual([
      'rose',
      'emerald',
      'sky',
      'amber',
      'violet'
    ])
  })

  it('loads and saves theme preferences', () => {
    window.localStorage.clear()

    expect(loadEditorTheme()).toBe('rose')

    saveEditorTheme('violet')

    expect(loadEditorTheme()).toBe('violet')
    expect(isEditorThemeId('emerald')).toBe(true)
    expect(isEditorThemeId('unknown')).toBe(false)
  })

  it('applies theme without animation when transitions are unavailable', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('window', { ...window, matchMedia })

    applyEditorTheme('amber')

    expect(document.documentElement.getAttribute('data-theme')).toBe('amber')
  })
})
