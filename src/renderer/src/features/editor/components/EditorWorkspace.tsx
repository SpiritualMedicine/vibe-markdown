import { DirectoryTreeEntry } from '../../../../../shared/editor-ipc'
import { FileExplorer } from './FileExplorer'

interface EditorWorkspaceProps {
  content: string
  previewHtml: string
  directoryPath: string | null
  directoryEntries: DirectoryTreeEntry[]
  currentFilePath: string | null
  isDirectoryBusy: boolean
  onOpenFolder: () => void
  onOpenFileFromDirectory: (filePath: string) => void
  onChange: (value: string) => void
}

export function EditorWorkspace(props: EditorWorkspaceProps): React.JSX.Element {
  const {
    content,
    previewHtml,
    directoryPath,
    directoryEntries,
    currentFilePath,
    isDirectoryBusy,
    onOpenFolder,
    onOpenFileFromDirectory,
    onChange
  } = props

  return (
    <main className="editor-workspace">
      <FileExplorer
        currentFilePath={currentFilePath}
        directoryEntries={directoryEntries}
        directoryPath={directoryPath}
        isBusy={isDirectoryBusy}
        onOpenFile={onOpenFileFromDirectory}
        onOpenFolder={onOpenFolder}
      />
      <section className="panel editor-input-panel">
        <div className="panel-label">Markdown</div>
        <textarea
          className="editor-textarea"
          value={content}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
        />
      </section>
      <section className="panel editor-preview-panel">
        <div className="panel-label">Preview</div>
        <article className="preview-content" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </section>
    </main>
  )
}
