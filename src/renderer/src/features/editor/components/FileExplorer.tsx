import { DirectoryTreeEntry } from '../../../../../shared/editor-ipc'
import { EditorLocale, t } from '../locale'

interface FileExplorerProps {
  className?: string
  style?: React.CSSProperties
  locale: EditorLocale
  directoryPath: string | null
  directoryEntries: DirectoryTreeEntry[]
  currentFilePath: string | null
  isBusy: boolean
  onOpenFolder: () => void
  onOpenFile: (filePath: string) => void
}

interface TreeNodeProps {
  entry: DirectoryTreeEntry
  currentFilePath: string | null
  onOpenFile: (filePath: string) => void
}

function TreeNode(props: TreeNodeProps): React.JSX.Element {
  const { entry, currentFilePath, onOpenFile } = props
  if (entry.type === 'file') {
    const isActive = currentFilePath === entry.path
    return (
      <li className="explorer-item">
        <button
          className={`explorer-file ${isActive ? 'is-active' : ''}`}
          onClick={() => onOpenFile(entry.path)}
          type="button"
        >
          {entry.name}
        </button>
      </li>
    )
  }

  return (
    <li className="explorer-item">
      <details className="explorer-directory" open>
        <summary>{entry.name}</summary>
        <ul className="explorer-tree">
          {entry.children?.map((child) => (
            <TreeNode
              currentFilePath={currentFilePath}
              entry={child}
              key={child.path}
              onOpenFile={onOpenFile}
            />
          ))}
        </ul>
      </details>
    </li>
  )
}

export function FileExplorer(props: FileExplorerProps): React.JSX.Element {
  const { className, style, locale, directoryPath, directoryEntries, currentFilePath, isBusy, onOpenFolder, onOpenFile } = props
  return (
    <section className={`panel explorer-panel ${className ?? ''}`.trim()} style={style}>
      <div className="panel-label explorer-header">
        <span>{t(locale, 'panel.directory')}</span>
        <button disabled={isBusy} onClick={onOpenFolder} type="button">
          {directoryPath ? t(locale, 'directory.change') : t(locale, 'directory.open')}
        </button>
      </div>
      <div className="explorer-content">
        <div className="explorer-path">{directoryPath ?? t(locale, 'directory.noFolder')}</div>
        {directoryEntries.length > 0 ? (
          <ul className="explorer-tree">
            {directoryEntries.map((entry) => (
              <TreeNode
                currentFilePath={currentFilePath}
                entry={entry}
                key={entry.path}
                onOpenFile={onOpenFile}
              />
            ))}
          </ul>
        ) : (
          <div className="explorer-empty">{t(locale, 'directory.empty')}</div>
        )}
      </div>
    </section>
  )
}
