import type { DirectoryTreeEntry } from '../../../../../../shared'
import { EditorLocale, t } from '../../settings'

interface ExplorerDirectoryTreeProps {
  locale: EditorLocale
  directoryEntries: DirectoryTreeEntry[]
  currentFilePath: string | null
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

export function ExplorerDirectoryTree(props: ExplorerDirectoryTreeProps): React.JSX.Element {
  const { locale, directoryEntries, currentFilePath, onOpenFile } = props

  if (directoryEntries.length === 0) {
    return <div className="explorer-empty">{t(locale, 'directory.empty')}</div>
  }

  return (
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
  )
}
