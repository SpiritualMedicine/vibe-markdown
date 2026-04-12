import type { DirectorySearchResult, DirectoryTreeEntry } from '../../../../../../shared'
import { EditorLocale, t } from '../../settings'
import { ExplorerDirectoryTree } from './ExplorerDirectoryTree'
import { ExplorerFolderGroups } from './ExplorerFolderGroups'
import { ExplorerSearchResults } from './ExplorerSearchResults'

interface FileExplorerProps {
  className?: string
  style?: React.CSSProperties
  locale: EditorLocale
  directoryPath: string | null
  directoryEntries: DirectoryTreeEntry[]
  recentFiles: string[]
  recentFolders?: string[]
  pinnedFolders?: string[]
  searchQuery?: string
  searchResults?: DirectorySearchResult[]
  activeSearchResultKey?: string | null
  currentFilePath: string | null
  isBusy: boolean
  isSearchBusy?: boolean
  onOpenFolder: () => void
  onOpenFolderFromPath?: (directoryPath: string) => void
  onTogglePinFolder?: (directoryPath: string) => void
  onSearchChange?: (query: string) => void
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onOpenFile: (filePath: string) => void
  onOpenSearchResult?: (result: DirectorySearchResult) => void
  onOpenRecent: (filePath: string) => void
}

export function FileExplorer(props: FileExplorerProps): React.JSX.Element {
  const {
    className,
    style,
    locale,
    directoryPath,
    directoryEntries,
    recentFiles,
    recentFolders = [],
    pinnedFolders = [],
    searchQuery = '',
    searchResults = [],
    activeSearchResultKey = null,
    currentFilePath,
    isBusy,
    isSearchBusy = false,
    onOpenFolder,
    onOpenFolderFromPath = () => undefined,
    onTogglePinFolder = () => undefined,
    onSearchChange = () => undefined,
    onSearchKeyDown = () => undefined,
    onOpenFile,
    onOpenSearchResult,
    onOpenRecent
  } = props
  const isPinned = directoryPath ? pinnedFolders.includes(directoryPath) : false

  return (
    <section className={`panel explorer-panel ${className ?? ''}`.trim()} style={style}>
      <div className="panel-label explorer-header">
        <span>{t(locale, 'panel.directory')}</span>
        <div className="explorer-header-actions">
          {directoryPath ? (
            <button
              disabled={isBusy}
              onClick={() => onTogglePinFolder(directoryPath)}
              type="button"
            >
              {isPinned ? t(locale, 'directory.unpin') : t(locale, 'directory.pin')}
            </button>
          ) : null}
          <button disabled={isBusy} onClick={onOpenFolder} type="button">
            {directoryPath ? t(locale, 'directory.change') : t(locale, 'directory.open')}
          </button>
        </div>
      </div>
      <div className="explorer-content">
        <div className="explorer-path">{directoryPath ?? t(locale, 'directory.noFolder')}</div>
        <ExplorerFolderGroups
          locale={locale}
          onOpenFolderFromPath={onOpenFolderFromPath}
          onTogglePinFolder={onTogglePinFolder}
          pinnedFolders={pinnedFolders}
          recentFolders={recentFolders}
        />
        <input
          className="explorer-search-input"
          disabled={isBusy || !directoryPath}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder={t(locale, 'search.placeholder')}
          type="search"
          value={searchQuery}
        />
        <ExplorerSearchResults
          activeSearchResultKey={activeSearchResultKey}
          isSearchBusy={isSearchBusy}
          locale={locale}
          onOpenFile={onOpenFile}
          onOpenSearchResult={onOpenSearchResult}
          searchQuery={searchQuery}
          searchResults={searchResults}
        />
        <select
          className="recent-select explorer-recent-select"
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
          <option value="">{t(locale, 'toolbar.recentFiles')}</option>
          {recentFiles.map((filePath) => (
            <option key={filePath} value={filePath}>
              {filePath}
            </option>
          ))}
        </select>
        <ExplorerDirectoryTree
          currentFilePath={currentFilePath}
          directoryEntries={directoryEntries}
          locale={locale}
          onOpenFile={onOpenFile}
        />
      </div>
    </section>
  )
}
