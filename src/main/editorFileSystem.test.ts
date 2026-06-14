import { mkdtemp, mkdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readDirectoryTree, searchDirectory } from './editorFileSystem'

vi.mock('electron', () => ({
  app: {
    getPath: () => tmpdir()
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn()
  }
}))

describe('editorFileSystem', () => {
  let workspacePath: string

  beforeEach(async () => {
    workspacePath = await mkdtemp(join(tmpdir(), 'markdown-leo-'))
  })

  afterEach(async () => {
    await rm(workspacePath, { recursive: true, force: true })
  })

  it('omits dependency and build output directories from the workspace tree', async () => {
    await writeFile(join(workspacePath, 'root.md'), '# Root', 'utf8')
    await mkdir(join(workspacePath, 'notes'))
    await writeFile(join(workspacePath, 'notes', 'daily.md'), '# Daily', 'utf8')
    await mkdir(join(workspacePath, 'node_modules'))
    await writeFile(join(workspacePath, 'node_modules', 'package.md'), '# Package', 'utf8')
    await mkdir(join(workspacePath, 'dist'))
    await writeFile(join(workspacePath, 'dist', 'bundle.md'), '# Bundle', 'utf8')

    const tree = await readDirectoryTree(workspacePath)

    expect(tree.map((entry) => entry.name)).toEqual(['notes', 'root.md'])
  })

  it('does not search ignored output directories', async () => {
    await writeFile(join(workspacePath, 'visible.md'), 'needle', 'utf8')
    await mkdir(join(workspacePath, 'out'))
    await writeFile(join(workspacePath, 'out', 'hidden.md'), 'needle', 'utf8')

    const results = await searchDirectory({ directoryPath: workspacePath, query: 'needle' })

    expect(results).toHaveLength(1)
    expect(results[0].fileName).toBe('visible.md')
  })
})
