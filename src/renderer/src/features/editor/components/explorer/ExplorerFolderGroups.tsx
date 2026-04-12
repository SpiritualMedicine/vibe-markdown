import { EditorLocale, t } from '../../settings'

interface ExplorerFolderGroupsProps {
  locale: EditorLocale
  pinnedFolders: string[]
  recentFolders: string[]
  onOpenFolderFromPath: (directoryPath: string) => void
  onTogglePinFolder: (directoryPath: string) => void
}

interface FolderGroupProps {
  title: string
  folders: string[]
  onOpenFolderFromPath: (directoryPath: string) => void
  onRemoveFolder?: (directoryPath: string) => void
}

function FolderGroup(props: FolderGroupProps): React.JSX.Element | null {
  const { title, folders, onOpenFolderFromPath, onRemoveFolder } = props
  if (folders.length === 0) {
    return null
  }

  return (
    <div className="explorer-group">
      <div className="explorer-group-title">{title}</div>
      <div className="explorer-chip-list">
        {folders.map((folder) => (
          <div className="explorer-chip-wrap" key={folder}>
            <button
              className="explorer-chip"
              onClick={() => onOpenFolderFromPath(folder)}
              title={folder}
              type="button"
            >
              <span className="explorer-chip-name">
                {folder.split(/[\\/]/).filter(Boolean).pop() ?? folder}
              </span>
            </button>
            {onRemoveFolder ? (
              <button
                aria-label="Remove"
                className="explorer-chip-remove"
                onClick={() => onRemoveFolder(folder)}
                title={folder}
                type="button"
              >
                x
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ExplorerFolderGroups(props: ExplorerFolderGroupsProps): React.JSX.Element {
  const { locale, pinnedFolders, recentFolders, onOpenFolderFromPath, onTogglePinFolder } = props

  return (
    <>
      <FolderGroup
        folders={pinnedFolders}
        onOpenFolderFromPath={onOpenFolderFromPath}
        onRemoveFolder={onTogglePinFolder}
        title={t(locale, 'toolbar.pinnedFolders')}
      />
      <FolderGroup
        folders={recentFolders}
        onOpenFolderFromPath={onOpenFolderFromPath}
        title={t(locale, 'toolbar.recentFolders')}
      />
    </>
  )
}
