/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EditorToolbar } from './EditorToolbar'

afterEach(() => {
  cleanup()
})

function createProps(): React.ComponentProps<typeof EditorToolbar> {
  return {
    isBusy: false,
    canSave: true,
    isMaximized: false,
    locale: 'en-US' as const,
    theme: 'rose' as const,
    onLocaleChange: vi.fn(),
    onThemeChange: vi.fn(),
    onNew: vi.fn(),
    onNewFromTemplate: vi.fn(),
    onOpen: vi.fn(),
    onOpenFolder: vi.fn(),
    onSave: vi.fn(),
    onSaveAs: vi.fn(),
    onExportHtml: vi.fn(),
    onInsertImage: vi.fn(),
    onTogglePreview: vi.fn(),
    onMinimize: vi.fn(),
    onToggleMaximize: vi.fn(),
    onClose: vi.fn()
  }
}

describe('EditorToolbar', () => {
  it('creates a document from the selected template', () => {
    const props = createProps()

    render(<EditorToolbar {...props} />)

    fireEvent.change(screen.getByLabelText('Templates'), {
      target: { value: 'meeting-notes' }
    })

    expect(props.onNewFromTemplate).toHaveBeenCalledWith('meeting-notes')
  })

  it('toggles locale through the language switch', () => {
    const props = createProps()

    render(<EditorToolbar {...props} />)

    fireEvent.click(screen.getByLabelText('Language'))

    expect(props.onLocaleChange).toHaveBeenCalledWith('zh-CN')
  })
})
