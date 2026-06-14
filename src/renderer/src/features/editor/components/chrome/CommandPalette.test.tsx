/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CommandPaletteItem } from '../../domain'
import { CommandPalette } from './CommandPalette'

const items: CommandPaletteItem[] = [
  {
    id: 'command:new',
    kind: 'command',
    title: 'New',
    subtitle: 'Command',
    keywords: ['new']
  },
  {
    id: 'file:/workspace/README.md',
    kind: 'file',
    title: 'README.md',
    subtitle: '/workspace/README.md',
    keywords: ['readme']
  }
]

afterEach(() => {
  cleanup()
})

describe('CommandPalette', () => {
  it('filters and selects an item with Enter', () => {
    const onSelectItem = vi.fn()

    render(
      <CommandPalette
        isOpen
        items={items}
        locale="en-US"
        onClose={() => undefined}
        onSelectItem={onSelectItem}
      />
    )

    const input = screen.getByPlaceholderText('Search commands, files, or templates')
    fireEvent.change(input, { target: { value: 'readme' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelectItem).toHaveBeenCalledWith(items[1])
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()

    render(
      <CommandPalette
        isOpen
        items={items}
        locale="en-US"
        onClose={onClose}
        onSelectItem={() => undefined}
      />
    )

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })
})
