import { useEffect, useMemo, useState } from 'react'
import type { DirectorySearchResult } from '../../../../../shared'
import { getSearchResultKey } from '../domain'

interface UseSearchNavigationOptions {
  searchQuery: string
  searchResults: DirectorySearchResult[]
}

interface UseSearchNavigationResult {
  searchFocusKey: string | null
  searchSelectionIndex: number
  selectedSearchResult: DirectorySearchResult | undefined
  focusResult: (result: DirectorySearchResult) => void
  clearFocusedResult: () => void
  moveSelectionDown: () => void
  moveSelectionUp: () => void
  getDefaultEnterTarget: () => DirectorySearchResult | undefined
}

export function useSearchNavigation(
  options: UseSearchNavigationOptions
): UseSearchNavigationResult {
  const { searchQuery, searchResults } = options
  const [searchFocusKey, setSearchFocusKey] = useState<string | null>(null)
  const [preferredSelectionIndex, setPreferredSelectionIndex] = useState<number>(0)

  const searchSelectionIndex = useMemo(() => {
    if (!searchQuery.trim() || searchResults.length === 0) {
      return -1
    }
    if (preferredSelectionIndex < 0 || preferredSelectionIndex >= searchResults.length) {
      return 0
    }
    return preferredSelectionIndex
  }, [preferredSelectionIndex, searchQuery, searchResults])

  const selectedSearchResult = useMemo(() => {
    return searchSelectionIndex >= 0 ? searchResults[searchSelectionIndex] : undefined
  }, [searchResults, searchSelectionIndex])

  useEffect(() => {
    if (!searchFocusKey) {
      return
    }

    const timer = window.setTimeout(() => {
      setSearchFocusKey(null)
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [searchFocusKey])

  return {
    searchFocusKey,
    searchSelectionIndex,
    selectedSearchResult,
    focusResult: (result) => setSearchFocusKey(getSearchResultKey(result)),
    clearFocusedResult: () => setSearchFocusKey(null),
    moveSelectionDown: () => {
      setPreferredSelectionIndex((current) => (current + 1) % searchResults.length)
    },
    moveSelectionUp: () => {
      setPreferredSelectionIndex((current) =>
        current <= 0 ? searchResults.length - 1 : current - 1
      )
    },
    getDefaultEnterTarget: () => searchResults[searchSelectionIndex >= 0 ? searchSelectionIndex : 0]
  }
}
