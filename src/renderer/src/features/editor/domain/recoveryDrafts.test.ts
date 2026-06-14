import { beforeEach, describe, expect, it } from 'vitest'
import type { EditorTab } from '../../../application/commands'
import {
  RECOVERY_DRAFTS_STORAGE_KEY,
  createRecoveryDraftsFromTabs,
  loadRecoveryDrafts,
  mergeRecoveryDrafts,
  saveRecoveryDrafts
} from './recoveryDrafts'

describe('recoveryDrafts', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('creates drafts only for dirty tabs', () => {
    const tabs: EditorTab[] = [
      {
        id: 'clean',
        filePath: '/docs/clean.md',
        markdown: 'clean',
        html: '<p>clean</p>',
        isDirty: false,
        lastSavedAt: 100
      },
      {
        id: 'dirty',
        filePath: '/docs/dirty.md',
        markdown: 'dirty',
        html: '<p>dirty</p>',
        isDirty: true,
        lastSavedAt: 100
      }
    ]

    expect(createRecoveryDraftsFromTabs(tabs, 200)).toEqual([
      {
        id: 'dirty',
        filePath: '/docs/dirty.md',
        markdown: 'dirty',
        updatedAt: 200
      }
    ])
  })

  it('loads only valid persisted drafts', () => {
    window.localStorage.setItem(
      RECOVERY_DRAFTS_STORAGE_KEY,
      JSON.stringify([
        { id: 'valid', filePath: null, markdown: '# Draft', updatedAt: 100 },
        { id: 'invalid', markdown: '# Missing timestamp' }
      ])
    )

    expect(loadRecoveryDrafts()).toEqual([
      { id: 'valid', filePath: null, markdown: '# Draft', updatedAt: 100 }
    ])
  })

  it('removes the storage key when all drafts are cleared', () => {
    saveRecoveryDrafts([{ id: 'draft', filePath: null, markdown: 'draft', updatedAt: 100 }])
    saveRecoveryDrafts([])

    expect(window.localStorage.getItem(RECOVERY_DRAFTS_STORAGE_KEY)).toBeNull()
  })

  it('prioritizes active dirty tab drafts over pending recovery drafts', () => {
    expect(
      mergeRecoveryDrafts(
        [{ id: 'same', filePath: null, markdown: 'old', updatedAt: 100 }],
        [{ id: 'same', filePath: null, markdown: 'new', updatedAt: 200 }]
      )
    ).toEqual([{ id: 'same', filePath: null, markdown: 'new', updatedAt: 200 }])
  })
})
