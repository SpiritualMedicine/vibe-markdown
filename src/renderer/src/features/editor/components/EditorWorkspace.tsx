import { type PointerEvent as ReactPointerEvent, useCallback, useRef, useState } from 'react'

interface EditorWorkspaceProps {
  content: string
  previewHtml: string
  onChange: (value: string) => void
}

export function EditorWorkspace(props: EditorWorkspaceProps): React.JSX.Element {
  const { content, previewHtml, onChange } = props
  const workspaceRef = useRef<HTMLElement | null>(null)
  const [editorPaneWidth, setEditorPaneWidth] = useState<number | null>(null)
  const MIN_PANE_WIDTH = 280

  const onStartResize = useCallback((event: ReactPointerEvent<HTMLDivElement>): void => {
    const workspace = workspaceRef.current
    if (!workspace) {
      return
    }

    const editorPanel = workspace.querySelector<HTMLElement>('.editor-input-panel')
    if (!editorPanel) {
      return
    }

    const startX = event.clientX
    const startWidth = editorPaneWidth ?? editorPanel.getBoundingClientRect().width
    const workspaceWidth = workspace.getBoundingClientRect().width
    const maxEditorWidth = Math.max(MIN_PANE_WIDTH, workspaceWidth - MIN_PANE_WIDTH)

    const onPointerMove = (moveEvent: PointerEvent): void => {
      const deltaX = moveEvent.clientX - startX
      const nextWidth = Math.min(maxEditorWidth, Math.max(MIN_PANE_WIDTH, startWidth + deltaX))
      setEditorPaneWidth(nextWidth)
    }

    const onPointerUp = (): void => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.body.classList.remove('is-resizing')
    }

    document.body.classList.add('is-resizing')
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }, [editorPaneWidth])

  return (
    <main className="editor-workspace" ref={workspaceRef}>
      <section
        className="panel editor-input-panel"
        style={editorPaneWidth === null ? undefined : { width: `${editorPaneWidth}px` }}
      >
        <div className="panel-label">Markdown</div>
        <textarea
          className="editor-textarea"
          value={content}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
        />
      </section>
      <div className="editor-resizer" onPointerDown={onStartResize} role="separator" />
      <section className="panel editor-preview-panel">
        <div className="panel-label">Preview</div>
        <article className="preview-content" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </section>
    </main>
  )
}
