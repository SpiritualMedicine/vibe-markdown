import type { DirectorySearchResult } from '../../../../../../shared'
import { EditorLocale, t } from '../../settings'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function renderHighlightedText(text: string, query: string): React.ReactNode {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) {
    return text
  }

  const pattern = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'ig')
  const segments = text.split(pattern)
  return segments.map((segment, index) =>
    segment.toLowerCase() === normalizedQuery.toLowerCase() ? (
      <mark className="search-highlight" key={`${segment}-${index}`}>
        {segment}
      </mark>
    ) : (
      <span key={`${segment}-${index}`}>{segment}</span>
    )
  )
}

interface ExplorerSearchResultsProps {
  locale: EditorLocale
  searchQuery: string
  searchResults: DirectorySearchResult[]
  activeSearchResultKey: string | null
  isSearchBusy: boolean
  onOpenFile: (filePath: string) => void
  onOpenSearchResult?: (result: DirectorySearchResult) => void
}

export function ExplorerSearchResults(props: ExplorerSearchResultsProps): React.JSX.Element {
  const {
    locale,
    searchQuery,
    searchResults,
    activeSearchResultKey,
    isSearchBusy,
    onOpenFile,
    onOpenSearchResult
  } = props

  return (
    <div className="explorer-search-results">
      <div className="explorer-section-title">{t(locale, 'panel.search')}</div>
      {searchQuery.trim() ? (
        <div className="explorer-section-hint">{t(locale, 'search.hint')}</div>
      ) : null}
      {!searchQuery.trim() ? (
        <div className="explorer-empty">{t(locale, 'search.empty')}</div>
      ) : isSearchBusy ? (
        <div className="explorer-empty">{t(locale, 'search.searching')}</div>
      ) : searchResults.length > 0 ? (
        <ul className="search-results-list">
          {searchResults.map((result) => {
            const resultKey = `${result.filePath}:${result.line}`
            return (
              <li key={resultKey}>
                <button
                  className={`search-result-button ${
                    activeSearchResultKey === resultKey ? 'is-active' : ''
                  }`}
                  onClick={() =>
                    onOpenSearchResult ? onOpenSearchResult(result) : onOpenFile(result.filePath)
                  }
                  type="button"
                >
                  <span className="search-result-title">
                    {renderHighlightedText(result.title, searchQuery)}
                  </span>
                  <span className="search-result-meta">
                    {result.fileName}:{result.line}
                  </span>
                  <span className="search-result-snippet">
                    {renderHighlightedText(result.snippet, searchQuery)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="explorer-empty">{t(locale, 'search.noResults')}</div>
      )}
    </div>
  )
}
