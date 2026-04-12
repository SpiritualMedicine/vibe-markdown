/** @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { EditorPreviewPanel } from './EditorPreviewPanel'

describe('EditorPreviewPanel', () => {
  it('opens decoded document references from preview links', () => {
    const onOpenDocumentReference = vi.fn()

    render(
      <EditorPreviewPanel
        html='<p><a data-document-ref="Project%20README" href="#document-ref-Project%20README">Project README</a></p>'
        label="Preview"
        onOpenDocumentReference={onOpenDocumentReference}
        previewRef={createRef<HTMLElement>()}
      />
    )

    fireEvent.click(screen.getByText('Project README'))

    expect(onOpenDocumentReference).toHaveBeenCalledWith('Project README')
  })
})
