/** @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BacklinksPanel } from './BacklinksPanel'

describe('BacklinksPanel', () => {
  it('renders an unsaved empty state', () => {
    render(
      <BacklinksPanel
        backlinks={[]}
        hasDocumentPath={false}
        isBusy={false}
        locale="en-US"
        onOpenBacklink={() => undefined}
      />
    )

    expect(screen.getByText('Save the document to view backlinks')).toBeTruthy()
  })

  it('opens a backlink entry when clicked', () => {
    const onOpenBacklink = vi.fn()

    render(
      <BacklinksPanel
        backlinks={[
          {
            sourcePath: '/docs/notes.md',
            fileName: 'notes.md',
            line: 4,
            title: 'Notes',
            snippet: 'See [[README]]'
          }
        ]}
        hasDocumentPath
        isBusy={false}
        locale="en-US"
        onOpenBacklink={onOpenBacklink}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /notes/i }))

    expect(onOpenBacklink).toHaveBeenCalledWith('/docs/notes.md', 4)
  })
})
