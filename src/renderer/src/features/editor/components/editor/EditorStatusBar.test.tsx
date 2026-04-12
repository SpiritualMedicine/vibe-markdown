/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EditorStatusBar } from './EditorStatusBar'

afterEach(() => {
  cleanup()
})

describe('EditorStatusBar', () => {
  it('renders title and status message', () => {
    render(
      <EditorStatusBar
        autoSaveEnabled
        locale="en-US"
        onToggleAutoSave={() => undefined}
        statusMessage="Saved README.md"
        statusTone="success"
        title="README.md"
      />
    )

    expect(screen.getByText('README.md')).toBeTruthy()
    expect(screen.getByText('Saved README.md')).toBeTruthy()
  })

  it('toggles auto save from the switch', () => {
    const onToggleAutoSave = vi.fn()

    render(
      <EditorStatusBar
        autoSaveEnabled={false}
        locale="en-US"
        onToggleAutoSave={onToggleAutoSave}
        statusMessage="Ready"
        statusTone="idle"
        title="README.md"
      />
    )

    fireEvent.click(screen.getByLabelText('Auto Save'))

    expect(onToggleAutoSave).toHaveBeenCalledWith(true)
  })
})
