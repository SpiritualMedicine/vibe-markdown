/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest'
import {
  LOCALE_OPTIONS,
  applyEditorLocale,
  isEditorLocale,
  loadEditorLocale,
  saveEditorLocale,
  t
} from './locale'

describe('locale', () => {
  it('exposes readable locale options', () => {
    expect(LOCALE_OPTIONS).toEqual([
      { id: 'zh-CN', label: '中文' },
      { id: 'en-US', label: 'English' }
    ])
  })

  it('loads and saves supported locales from localStorage', () => {
    window.localStorage.clear()

    expect(loadEditorLocale()).toBe('zh-CN')

    saveEditorLocale('en-US')

    expect(loadEditorLocale()).toBe('en-US')
    expect(isEditorLocale('zh-CN')).toBe(true)
    expect(isEditorLocale('invalid')).toBe(false)
  })

  it('applies the document language and resolves translated messages', () => {
    applyEditorLocale('en-US')

    expect(document.documentElement.getAttribute('lang')).toBe('en-US')
    expect(t('zh-CN', 'toolbar.templates')).toBe('模板')
    expect(t('en-US', 'status.referenceOpened', { target: 'README' })).toBe(
      'Opened referenced document README'
    )
  })
})
