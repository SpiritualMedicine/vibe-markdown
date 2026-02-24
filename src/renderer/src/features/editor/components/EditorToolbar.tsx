interface EditorToolbarProps {
  isBusy: boolean
  canSave: boolean
  isMaximized: boolean
  recentFiles: string[]
  autoSaveEnabled: boolean
  onToggleAutoSave: (enabled: boolean) => void
  onOpenRecent: (filePath: string) => void
  onNew: () => void
  onOpen: () => void
  onOpenFolder: () => void
  onSave: () => void
  onSaveAs: () => void
  onExportHtml: () => void
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
}

export function EditorToolbar(props: EditorToolbarProps): React.JSX.Element {
  const {
    isBusy,
    canSave,
    isMaximized,
    recentFiles,
    autoSaveEnabled,
    onToggleAutoSave,
    onOpenRecent,
    onNew,
    onOpen,
    onOpenFolder,
    onSave,
    onSaveAs,
    onExportHtml,
    onMinimize,
    onToggleMaximize,
    onClose
  } = props

  return (
    <header className="editor-toolbar">
      <div className="editor-actions">
        <button aria-label="New file" disabled={isBusy} onClick={onNew} title="New" type="button">
          <span aria-hidden="true" className="action-icon action-icon-new" />
        </button>
        <button aria-label="Open file" disabled={isBusy} onClick={onOpen} title="Open" type="button">
          <span aria-hidden="true" className="action-icon action-icon-open" />
        </button>
        <button
          aria-label="Open folder"
          disabled={isBusy}
          onClick={onOpenFolder}
          title="Open Folder"
          type="button"
        >
          <span aria-hidden="true" className="action-icon action-icon-folder" />
        </button>
        <button aria-label="Save file" disabled={isBusy || !canSave} onClick={onSave} title="Save" type="button">
          <span aria-hidden="true" className="action-icon action-icon-save" />
        </button>
        <button aria-label="Save as" disabled={isBusy} onClick={onSaveAs} title="Save As" type="button">
          <span aria-hidden="true" className="action-icon action-icon-save-as" />
        </button>
        <button
          aria-label="Export HTML"
          disabled={isBusy}
          onClick={onExportHtml}
          title="Export HTML"
          type="button"
        >
          <span aria-hidden="true" className="action-icon action-icon-export" />
        </button>
        <select
          className="recent-select"
          disabled={isBusy || recentFiles.length === 0}
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value
            if (!value) {
              return
            }
            onOpenRecent(value)
            event.target.value = ''
          }}
        >
          <option value="">Recent Files</option>
          {recentFiles.map((filePath) => (
            <option key={filePath} value={filePath}>
              {filePath}
            </option>
          ))}
        </select>
        <label className="autosave-toggle">
          <input
            checked={autoSaveEnabled}
            disabled={isBusy}
            onChange={(event) => onToggleAutoSave(event.target.checked)}
            type="checkbox"
          />
          Auto Save
        </label>
      </div>
      <div className="window-controls">
        <button
          aria-label="Minimize window"
          className="window-control"
          disabled={isBusy}
          onClick={onMinimize}
          title="Minimize"
          type="button"
        >
          <span aria-hidden="true" className="window-icon window-icon-minimize" />
        </button>
        <button
          aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          className="window-control"
          disabled={isBusy}
          onClick={onToggleMaximize}
          title={isMaximized ? 'Restore' : 'Maximize'}
          type="button"
        >
          <span
            aria-hidden="true"
            className={`window-icon ${isMaximized ? 'window-icon-restore' : 'window-icon-maximize'}`}
          />
        </button>
        <button
          aria-label="Close window"
          className="window-control window-control-danger"
          disabled={isBusy}
          onClick={onClose}
          title="Close"
          type="button"
        >
          <span aria-hidden="true" className="window-icon window-icon-close" />
        </button>
      </div>
    </header>
  )
}
