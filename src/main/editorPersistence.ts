import { app } from 'electron'
import { access, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const MAX_RECENT_FILES = 10
const MAX_RECENT_FOLDERS = 10

interface EditorSettings {
  lastOpenedFilePath: string | null
}

function getEditorSettingsPath(): string {
  return join(app.getPath('userData'), 'editor-settings.json')
}

function getRecentFilesStorePath(): string {
  return join(app.getPath('userData'), 'recent-files.json')
}

function getRecentFoldersStorePath(): string {
  return join(app.getPath('userData'), 'recent-folders.json')
}

function getPinnedFoldersStorePath(): string {
  return join(app.getPath('userData'), 'pinned-folders.json')
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function readPathList(storePath: string): Promise<string[]> {
  try {
    const content = await readFile(storePath, 'utf8')
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

async function writePathList(storePath: string, filePaths: string[]): Promise<void> {
  await writeFile(storePath, JSON.stringify(filePaths, null, 2), 'utf8')
}

async function getCleanPathList(storePath: string): Promise<string[]> {
  const paths = await readPathList(storePath)
  const checked = await Promise.all(
    paths.map(async (filePath) => ({ filePath, exists: await pathExists(filePath) }))
  )
  const clean = checked.filter((item) => item.exists).map((item) => item.filePath)
  if (clean.length !== paths.length) {
    await writePathList(storePath, clean)
  }
  return clean
}

async function readEditorSettings(): Promise<EditorSettings> {
  try {
    const content = await readFile(getEditorSettingsPath(), 'utf8')
    const parsed = JSON.parse(content)
    return {
      lastOpenedFilePath:
        typeof parsed?.lastOpenedFilePath === 'string' ? parsed.lastOpenedFilePath : null
    }
  } catch {
    return { lastOpenedFilePath: null }
  }
}

async function writeEditorSettings(next: EditorSettings): Promise<void> {
  await writeFile(getEditorSettingsPath(), JSON.stringify(next, null, 2), 'utf8')
}

export async function getLaunchState(): Promise<{ lastOpenedFilePath: string | null }> {
  const settings = await readEditorSettings()
  if (!settings.lastOpenedFilePath) {
    return { lastOpenedFilePath: null }
  }
  if (!(await pathExists(settings.lastOpenedFilePath))) {
    await setLastOpenedFilePath(null)
    return { lastOpenedFilePath: null }
  }
  return { lastOpenedFilePath: settings.lastOpenedFilePath }
}

export async function setLastOpenedFilePath(filePath: string | null): Promise<void> {
  const settings = await readEditorSettings()
  settings.lastOpenedFilePath = filePath
  await writeEditorSettings(settings)
}

export async function getCleanRecentFiles(): Promise<string[]> {
  return getCleanPathList(getRecentFilesStorePath())
}

export async function getCleanRecentFolders(): Promise<string[]> {
  return getCleanPathList(getRecentFoldersStorePath())
}

export async function getCleanPinnedFolders(): Promise<string[]> {
  return getCleanPathList(getPinnedFoldersStorePath())
}

export async function pushRecentFile(filePath: string | null): Promise<void> {
  if (!filePath) {
    return
  }

  const existing = await getCleanRecentFiles()
  const next = [filePath, ...existing.filter((path) => path !== filePath)].slice(
    0,
    MAX_RECENT_FILES
  )
  await writePathList(getRecentFilesStorePath(), next)
  await setLastOpenedFilePath(filePath)
}

export async function removeRecentFile(filePath: string): Promise<void> {
  const recent = await getCleanRecentFiles()
  const next = recent.filter((item) => item !== filePath)
  if (next.length !== recent.length) {
    await writePathList(getRecentFilesStorePath(), next)
  }
}

export async function pushRecentFolder(directoryPath: string | null): Promise<void> {
  if (!directoryPath) {
    return
  }

  const existing = await getCleanRecentFolders()
  const next = [directoryPath, ...existing.filter((path) => path !== directoryPath)].slice(
    0,
    MAX_RECENT_FOLDERS
  )
  await writePathList(getRecentFoldersStorePath(), next)
}

export async function pinFolder(directoryPath: string): Promise<string[]> {
  const existing = await getCleanPinnedFolders()
  if (existing.includes(directoryPath)) {
    return existing
  }
  const next = [directoryPath, ...existing]
  await writePathList(getPinnedFoldersStorePath(), next)
  return next
}

export async function unpinFolder(directoryPath: string): Promise<string[]> {
  const existing = await getCleanPinnedFolders()
  const next = existing.filter((item) => item !== directoryPath)
  if (next.length !== existing.length) {
    await writePathList(getPinnedFoldersStorePath(), next)
  }
  return next
}
