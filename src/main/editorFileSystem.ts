import { dialog } from 'electron'
import { basename, dirname, extname, join, relative } from 'path'
import { access, copyFile, mkdir, readdir, readFile, writeFile } from 'fs/promises'
import type {
  DirectoryOpenResult,
  DirectorySearchResult,
  DirectoryTreeEntry,
  DocumentBacklink,
  ExportHtmlRequest,
  FindBacklinksRequest,
  FileOpenResult,
  FileSaveResult,
  ImportImageRequest,
  ImportImageResult,
  OpenDirectoryByPathRequest,
  SaveFileRequest,
  SearchDirectoryRequest
} from '../shared'
import { pushRecentFile, pushRecentFolder, removeRecentFile } from './editorPersistence'
import {
  extractWikiReferences,
  getMarkdownDocumentTitle,
  getReferenceCandidates,
  hasMarkdownExtension
} from './workspaceIndex'

const markdownFilters = [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
const htmlFilters = [{ name: 'HTML', extensions: ['html', 'htm'] }]
const imageFilters = [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }]
const ignoredDirectoryNames = new Set([
  '.git',
  '.hg',
  '.svn',
  'node_modules',
  'dist',
  'out',
  'build',
  'coverage'
])

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

export async function openFile(filePathFromRequest?: string): Promise<FileOpenResult> {
  try {
    let filePath: string | undefined = filePathFromRequest

    if (!filePath) {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: markdownFilters
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true, filePath: null, content: '' }
      }

      filePath = result.filePaths[0]
    }

    const content = await readFile(filePath, 'utf8')
    await pushRecentFile(filePath)
    return { canceled: false, filePath, content }
  } catch (error) {
    if (filePathFromRequest) {
      await removeRecentFile(filePathFromRequest)
    }
    const message = error instanceof Error ? error.message : 'Failed to open file.'
    return { canceled: false, filePath: null, content: '', error: message }
  }
}

export async function readDirectoryTree(directoryPath: string): Promise<DirectoryTreeEntry[]> {
  const items = await readdir(directoryPath, { withFileTypes: true })
  const sorted = items.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) {
      return -1
    }
    if (!a.isDirectory() && b.isDirectory()) {
      return 1
    }
    return a.name.localeCompare(b.name)
  })

  const entries: DirectoryTreeEntry[] = []
  for (const item of sorted) {
    if (item.name.startsWith('.') || item.isSymbolicLink()) {
      continue
    }

    const fullPath = join(directoryPath, item.name)
    if (item.isDirectory()) {
      if (ignoredDirectoryNames.has(item.name)) {
        continue
      }
      try {
        const children = await readDirectoryTree(fullPath)
        if (children.length > 0) {
          entries.push({ name: item.name, path: fullPath, type: 'directory', children })
        }
      } catch {
        continue
      }
      continue
    }

    if (item.isFile() && hasMarkdownExtension(item.name)) {
      entries.push({ name: item.name, path: fullPath, type: 'file' })
    }
  }

  return entries
}

export async function openDirectory(): Promise<DirectoryOpenResult> {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, directoryPath: null, entries: [] }
    }

    const directoryPath = result.filePaths[0]
    const entries = await readDirectoryTree(directoryPath)
    await pushRecentFolder(directoryPath)
    return { canceled: false, directoryPath, entries }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to open directory.'
    return { canceled: false, directoryPath: null, entries: [], error: message }
  }
}

export async function openDirectoryByPath(
  request: OpenDirectoryByPathRequest
): Promise<DirectoryOpenResult> {
  try {
    const directoryPath = request.directoryPath
    const entries = await readDirectoryTree(directoryPath)
    await pushRecentFolder(directoryPath)
    return { canceled: false, directoryPath, entries }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to open directory.'
    return { canceled: false, directoryPath: null, entries: [], error: message }
  }
}

export async function saveFile(
  request: SaveFileRequest,
  forceDialog: boolean
): Promise<FileSaveResult> {
  try {
    let targetPath = request.filePath

    if (forceDialog || !targetPath) {
      const saveResult = await dialog.showSaveDialog({
        defaultPath: targetPath ?? 'untitled.md',
        filters: markdownFilters
      })

      if (saveResult.canceled || !saveResult.filePath) {
        return { canceled: true, filePath: request.filePath }
      }

      targetPath = saveResult.filePath
    }

    await writeFile(targetPath, request.content, 'utf8')
    await pushRecentFile(targetPath)
    return { canceled: false, filePath: targetPath }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save file.'
    return { canceled: false, filePath: request.filePath, error: message }
  }
}

export async function exportHtml(request: ExportHtmlRequest): Promise<FileSaveResult> {
  try {
    const suggestedName = request.suggestedName.endsWith('.html')
      ? request.suggestedName
      : `${request.suggestedName}.html`
    const result = await dialog.showSaveDialog({
      defaultPath: suggestedName,
      filters: htmlFilters
    })

    if (result.canceled || !result.filePath) {
      return { canceled: true, filePath: null }
    }

    await writeFile(result.filePath, request.html, 'utf8')
    return { canceled: false, filePath: result.filePath }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export HTML.'
    return { canceled: false, filePath: null, error: message }
  }
}

async function collectMarkdownFiles(directoryPath: string): Promise<string[]> {
  const items = await readdir(directoryPath, { withFileTypes: true })
  const results: string[] = []

  for (const item of items) {
    if (item.name.startsWith('.') || item.isSymbolicLink()) {
      continue
    }
    const fullPath = join(directoryPath, item.name)
    if (item.isDirectory()) {
      if (ignoredDirectoryNames.has(item.name)) {
        continue
      }
      results.push(...(await collectMarkdownFiles(fullPath)))
      continue
    }
    if (item.isFile() && hasMarkdownExtension(item.name)) {
      results.push(fullPath)
    }
  }

  return results
}

export async function searchDirectory(
  request: SearchDirectoryRequest
): Promise<DirectorySearchResult[]> {
  const query = request.query.trim().toLowerCase()
  if (!query) {
    return []
  }

  const filePaths = await collectMarkdownFiles(request.directoryPath)
  const results: DirectorySearchResult[] = []

  for (const filePath of filePaths) {
    try {
      const content = await readFile(filePath, 'utf8')
      const lines = content.split(/\r?\n/)
      const title = getMarkdownDocumentTitle(filePath, lines)

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        if (!line.toLowerCase().includes(query)) {
          continue
        }
        results.push({
          filePath,
          fileName: basename(filePath),
          line: index + 1,
          title,
          snippet: line.trim() || title
        })
        if (results.length >= 100) {
          return results
        }
      }
    } catch {
      continue
    }
  }

  return results
}

export async function findBacklinks(request: FindBacklinksRequest): Promise<DocumentBacklink[]> {
  const filePaths = await collectMarkdownFiles(request.directoryPath)
  const targetCandidates = getReferenceCandidates(request.directoryPath, request.targetPath)
  const results: DocumentBacklink[] = []

  for (const filePath of filePaths) {
    if (filePath === request.targetPath) {
      continue
    }

    try {
      const content = await readFile(filePath, 'utf8')
      const lines = content.split(/\r?\n/)
      const title = getMarkdownDocumentTitle(filePath, lines)

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index]
        const references = extractWikiReferences(line)
        if (!references.some((reference) => targetCandidates.includes(reference))) {
          continue
        }

        results.push({
          sourcePath: filePath,
          fileName: basename(filePath),
          line: index + 1,
          title,
          snippet: line.trim() || title
        })
      }
    } catch {
      continue
    }
  }

  return results
}

async function createUniqueAssetPath(
  assetsDirectory: string,
  sourceFilePath: string
): Promise<string> {
  const extension = extname(sourceFilePath)
  const baseName =
    basename(sourceFilePath, extension)
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .toLowerCase() || 'image'

  const attempt = async (index: number): Promise<string> => {
    const fileName = index === 0 ? `${baseName}${extension}` : `${baseName}-${index}${extension}`
    const targetPath = join(assetsDirectory, fileName)
    if (!(await pathExists(targetPath))) {
      return targetPath
    }
    return attempt(index + 1)
  }

  return attempt(0)
}

export async function importImage(request: ImportImageRequest): Promise<ImportImageResult> {
  try {
    let sourcePath = request.sourcePath
    if (!sourcePath) {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: imageFilters
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true, markdownPath: null, absolutePath: null }
      }
      sourcePath = result.filePaths[0]
    }

    const documentDirectory = dirname(request.documentPath)
    const assetsDirectory = join(documentDirectory, 'assets')
    await mkdir(assetsDirectory, { recursive: true })
    const targetPath = await createUniqueAssetPath(assetsDirectory, sourcePath)
    await copyFile(sourcePath, targetPath)

    return {
      canceled: false,
      markdownPath: relative(documentDirectory, targetPath).replace(/\\/g, '/'),
      absolutePath: targetPath
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import image.'
    return { canceled: false, markdownPath: null, absolutePath: null, error: message }
  }
}
