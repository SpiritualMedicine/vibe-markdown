import type { EditorTab } from '../../../application/commands'

export const RECOVERY_DRAFTS_STORAGE_KEY = 'vibe-markdown-recovery-drafts'

export interface RecoveryDraft {
  id: string
  filePath: string | null
  markdown: string
  updatedAt: number
}

function isRecoveryDraft(value: unknown): value is RecoveryDraft {
  if (!value || typeof value !== 'object') {
    return false
  }
  const draft = value as Partial<RecoveryDraft>
  return (
    typeof draft.id === 'string' &&
    (typeof draft.filePath === 'string' || draft.filePath === null) &&
    typeof draft.markdown === 'string' &&
    typeof draft.updatedAt === 'number'
  )
}

export function loadRecoveryDrafts(): RecoveryDraft[] {
  try {
    const raw = window.localStorage.getItem(RECOVERY_DRAFTS_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(isRecoveryDraft)
  } catch {
    return []
  }
}

export function saveRecoveryDrafts(drafts: RecoveryDraft[]): void {
  if (drafts.length === 0) {
    window.localStorage.removeItem(RECOVERY_DRAFTS_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(RECOVERY_DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
}

export function createRecoveryDraftsFromTabs(
  tabs: EditorTab[],
  updatedAt: number
): RecoveryDraft[] {
  return tabs
    .filter((tab) => tab.isDirty)
    .map((tab) => ({
      id: tab.id,
      filePath: tab.filePath,
      markdown: tab.markdown,
      updatedAt
    }))
}

export function mergeRecoveryDrafts(
  pendingDrafts: RecoveryDraft[],
  activeDrafts: RecoveryDraft[]
): RecoveryDraft[] {
  const activeIds = new Set(activeDrafts.map((draft) => draft.id))
  return [...activeDrafts, ...pendingDrafts.filter((draft) => !activeIds.has(draft.id))].sort(
    (a, b) => b.updatedAt - a.updatedAt
  )
}

export function formatRecoveryTimestamp(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp))
}
