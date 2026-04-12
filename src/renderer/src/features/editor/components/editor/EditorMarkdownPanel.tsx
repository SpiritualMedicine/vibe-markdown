type FileWithPath = File & { path?: string }

interface EditorMarkdownPanelProps {
  panelLabel: string
  dropLabel: string
  value: string
  isImageDropActive: boolean
  panelWidth: number | null
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onChange: (markdown: string) => void
  onDragStateChange: (active: boolean) => void
  onDropImage: (selectionStart: number, selectionEnd: number, sourcePath: string) => void
}

export function EditorMarkdownPanel(props: EditorMarkdownPanelProps): React.JSX.Element {
  const {
    panelLabel,
    dropLabel,
    value,
    isImageDropActive,
    panelWidth,
    textareaRef,
    onChange,
    onDragStateChange,
    onDropImage
  } = props

  return (
    <section
      className="panel editor-input-panel"
      style={panelWidth === null ? undefined : { width: `${panelWidth}px` }}
    >
      <div className="panel-label">{panelLabel}</div>
      <textarea
        className={`editor-textarea ${isImageDropActive ? 'is-drop-target' : ''}`}
        onChange={(event) => onChange(event.target.value)}
        onDragLeave={() => onDragStateChange(false)}
        onDragOver={(event) => {
          if (Array.from(event.dataTransfer.items).some((item) => item.type.startsWith('image/'))) {
            event.preventDefault()
            onDragStateChange(true)
          }
        }}
        onDrop={(event) => {
          const files = Array.from(event.dataTransfer.files ?? [])
          const imageFile = files.find((file) => file.type.startsWith('image/'))
          const sourcePath = (imageFile as FileWithPath | undefined)?.path
          if (!imageFile || !sourcePath) {
            onDragStateChange(false)
            return
          }

          event.preventDefault()
          onDragStateChange(false)
          const textarea = textareaRef.current
          const selectionStart = textarea?.selectionStart ?? value.length
          const selectionEnd = textarea?.selectionEnd ?? selectionStart
          onDropImage(selectionStart, selectionEnd, sourcePath)
        }}
        ref={textareaRef}
        spellCheck={false}
        value={value}
      />
      {isImageDropActive ? <div className="editor-drop-overlay">{dropLabel}</div> : null}
    </section>
  )
}
