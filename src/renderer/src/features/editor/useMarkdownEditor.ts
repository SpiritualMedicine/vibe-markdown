import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorDocument, EditorStatus } from './types'
import { DirectoryTreeEntry } from '../../../../shared/editor-ipc'

const initialDocument: EditorDocument = {
  filePath: null,
  content: '# Welcome\n\nStart writing your markdown document.',
  isDirty: false
}

export function useMarkdownEditor() {
  const [document, setDocument] = useState<EditorDocument>(initialDocument)
  const [isBusy, setIsBusy] = useState(false)
  const [recentFiles, setRecentFiles] = useState<string[]>([])
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [directoryPath, setDirectoryPath] = useState<string | null>(null)
  const [directoryEntries, setDirectoryEntries] = useState<DirectoryTreeEntry[]>([])
  const [isDirectoryBusy, setIsDirectoryBusy] = useState(false)
  const [status, setStatus] = useState<EditorStatus>({ tone: 'idle', message: 'Ready' })
  const autoSaveTimerRef = useRef<number | null>(null)
  const hasRestoredRef = useRef(false)

  const refreshRecentFiles = useCallback(async () => {
    const files = await window.api.file.recentList()
    setRecentFiles(files)
  }, [])

  const updateContent = useCallback((content: string) => {
    setDocument((previous) => ({ ...previous, content, isDirty: true }))
    setStatus({ tone: 'idle', message: 'Editing...' })
  }, [])

  const createNew = useCallback(() => {
    if (document.isDirty && !window.confirm('Discard unsaved changes?')) {
      return
    }
    setDocument(initialDocument)
    setStatus({ tone: 'success', message: 'New document created' })
  }, [document.isDirty])

  const openDocument = useCallback(async () => {
    if (document.isDirty && !window.confirm('Discard unsaved changes and open another file?')) {
      return
    }

    setIsBusy(true)
    const result = await window.api.file.open()
    setIsBusy(false)

    if (result.canceled) {
      setStatus({ tone: 'idle', message: 'Open canceled' })
      return
    }
    if (result.error) {
      setStatus({ tone: 'error', message: result.error })
      return
    }

    setDocument({ filePath: result.filePath, content: result.content, isDirty: false })
    setStatus({ tone: 'success', message: `Opened ${result.filePath ?? 'document'}` })
    await refreshRecentFiles()
  }, [document.isDirty, refreshRecentFiles])

  const openDirectory = useCallback(async () => {
    setIsDirectoryBusy(true)
    const result = await window.api.file.openDirectory()
    setIsDirectoryBusy(false)

    if (result.canceled) {
      setStatus({ tone: 'idle', message: 'Open folder canceled' })
      return
    }
    if (result.error) {
      setStatus({ tone: 'error', message: result.error })
      return
    }

    setDirectoryPath(result.directoryPath)
    setDirectoryEntries(result.entries)
    const count = result.entries.length
    setStatus({ tone: 'success', message: `Loaded folder (${count} item${count === 1 ? '' : 's'})` })
  }, [])

  const openRecentDocument = useCallback(
    async (filePath: string, skipDirtyGuard = false) => {
      if (!filePath) {
        return
      }
      if (
        !skipDirtyGuard &&
        document.isDirty &&
        !window.confirm('Discard unsaved changes and open another file?')
      ) {
        return
      }

      setIsBusy(true)
      const result = await window.api.file.openByPath({ filePath })
      setIsBusy(false)

      if (result.error) {
        setStatus({ tone: 'error', message: result.error })
        await refreshRecentFiles()
        return
      }

      setDocument({ filePath: result.filePath, content: result.content, isDirty: false })
      setStatus({ tone: 'success', message: `Opened ${result.filePath ?? 'document'}` })
      await refreshRecentFiles()
    },
    [document.isDirty, refreshRecentFiles]
  )

  const restoreLastSession = useCallback(async () => {
    if (hasRestoredRef.current) {
      return
    }
    hasRestoredRef.current = true

    const launchState = await window.api.app.getLaunchState()
    if (!launchState.lastOpenedFilePath) {
      return
    }
    await openRecentDocument(launchState.lastOpenedFilePath, true)
  }, [openRecentDocument])

  const saveDocument = useCallback(async () => {
    setIsBusy(true)
    const result = await window.api.file.save({
      filePath: document.filePath,
      content: document.content
    })
    setIsBusy(false)

    if (result.canceled) {
      setStatus({ tone: 'idle', message: 'Save canceled' })
      return
    }
    if (result.error) {
      setStatus({ tone: 'error', message: result.error })
      return
    }

    setDocument((previous) => ({ ...previous, filePath: result.filePath, isDirty: false }))
    setStatus({ tone: 'success', message: `Saved ${result.filePath ?? 'document'}` })
    await refreshRecentFiles()
  }, [document.content, document.filePath, refreshRecentFiles])

  const saveAsDocument = useCallback(async () => {
    setIsBusy(true)
    const result = await window.api.file.saveAs({
      filePath: document.filePath,
      content: document.content
    })
    setIsBusy(false)

    if (result.canceled) {
      setStatus({ tone: 'idle', message: 'Save as canceled' })
      return
    }
    if (result.error) {
      setStatus({ tone: 'error', message: result.error })
      return
    }

    setDocument((previous) => ({ ...previous, filePath: result.filePath, isDirty: false }))
    setStatus({ tone: 'success', message: `Saved as ${result.filePath ?? 'document'}` })
    await refreshRecentFiles()
  }, [document.content, document.filePath, refreshRecentFiles])

  const exportHtmlDocument = useCallback(
    async (html: string) => {
      setIsBusy(true)
      const fallback = document.filePath ? document.filePath.split(/[\\/]/).pop() || 'untitled' : 'untitled'
      const suggestedName = fallback.replace(/\.(md|markdown|txt)$/i, '') || 'untitled'
      const result = await window.api.file.exportHtml({ suggestedName, html })
      setIsBusy(false)

      if (result.canceled) {
        setStatus({ tone: 'idle', message: 'Export canceled' })
        return
      }
      if (result.error) {
        setStatus({ tone: 'error', message: result.error })
        return
      }

      setStatus({ tone: 'success', message: `Exported ${result.filePath ?? 'HTML file'}` })
    },
    [document.filePath]
  )

  useEffect(() => {
    void refreshRecentFiles()
  }, [refreshRecentFiles])

  useEffect(() => {
    if (!autoSaveEnabled || !document.filePath || !document.isDirty) {
      return
    }
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      void saveDocument()
    }, 1200)

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [autoSaveEnabled, document.filePath, document.isDirty, document.content, saveDocument])

  useEffect(() => {
    window.api.app.setDirtyState(document.isDirty)
  }, [document.isDirty])

  return {
    document,
    isBusy,
    recentFiles,
    autoSaveEnabled,
    directoryPath,
    directoryEntries,
    isDirectoryBusy,
    status,
    createNew,
    openDocument,
    openDirectory,
    openRecentDocument,
    saveDocument,
    saveAsDocument,
    exportHtmlDocument,
    setAutoSaveEnabled,
    updateContent,
    restoreLastSession
  }
}
