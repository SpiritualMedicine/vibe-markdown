import { describe, expect, it } from 'vitest'
import { buildCommandPaletteItems, filterCommandPaletteItems } from './commandPalette'

describe('commandPalette', () => {
  it('builds command, template, recent, and workspace file items', () => {
    const items = buildCommandPaletteItems({
      canSave: false,
      directoryEntries: [
        {
          name: 'docs',
          path: '/workspace/docs',
          type: 'directory',
          children: [{ name: 'README.md', path: '/workspace/docs/README.md', type: 'file' }]
        }
      ],
      locale: 'en-US',
      recentFiles: ['/workspace/notes.md'],
      showPreview: true
    })

    expect(items.some((item) => item.id === 'command:save' && item.disabled)).toBe(true)
    expect(items.some((item) => item.id === 'template:meeting-notes')).toBe(true)
    expect(items.some((item) => item.id === 'recent:/workspace/notes.md')).toBe(true)
    expect(items.some((item) => item.id === 'file:/workspace/docs/README.md')).toBe(true)
  })

  it('filters items by title, subtitle, and keywords', () => {
    const items = buildCommandPaletteItems({
      canSave: true,
      directoryEntries: [{ name: 'Design.md', path: '/workspace/Design.md', type: 'file' }],
      locale: 'en-US',
      recentFiles: [],
      showPreview: false
    })

    expect(filterCommandPaletteItems(items, 'design')).toEqual([
      expect.objectContaining({ id: 'file:/workspace/Design.md' })
    ])
    expect(filterCommandPaletteItems(items, 'preview')[0]).toEqual(
      expect.objectContaining({ id: 'command:togglePreview' })
    )
  })
})
