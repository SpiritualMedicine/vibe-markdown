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
        lastSavedAt={null}
        locale="en-US"
        onToggleAutoSave={() => undefined}
        statusMessage="Ready"
        statusTone="success"
        title="README.md"
      />
    )

    expect(screen.getByText('README.md')).toBeTruthy()
    expect(screen.getByText('Ready')).toBeTruthy()
  })

  it('toggles auto save from the switch', () => {
    const onToggleAutoSave = vi.fn()

    render(
      <EditorStatusBar
        autoSaveEnabled={false}
        lastSavedAt={null}
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

  it('renders the last saved time when available', () => {
    render(
      <EditorStatusBar
        autoSaveEnabled
        lastSavedAt={new Date('2026-06-14T08:30:00Z').getTime()}
        locale="en-US"
        onToggleAutoSave={() => undefined}
        statusMessage="Ready"
        statusTone="success"
        title="README.md"
      />
    )

    expect(screen.getByText(/^Saved /)).toBeTruthy()
  })
})
