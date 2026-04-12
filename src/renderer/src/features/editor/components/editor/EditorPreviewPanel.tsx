interface EditorPreviewPanelProps {
  label: string
  html: string
  previewRef: React.RefObject<HTMLElement | null>
  onOpenDocumentReference?: (reference: string) => void
}

export function EditorPreviewPanel(props: EditorPreviewPanelProps): React.JSX.Element {
  const { label, html, previewRef, onOpenDocumentReference } = props

  return (
    <section className="panel editor-preview-panel">
      <div className="panel-label">{label}</div>
      <article
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(event) => {
          const target = event.target
          if (!(target instanceof Element)) {
            return
          }
          const link = target.closest<HTMLElement>('[data-document-ref]')
          const reference = link?.dataset.documentRef
          if (!reference || !onOpenDocumentReference) {
            return
          }
          event.preventDefault()
          onOpenDocumentReference(decodeURIComponent(reference))
        }}
        ref={previewRef}
      />
    </section>
  )
}
