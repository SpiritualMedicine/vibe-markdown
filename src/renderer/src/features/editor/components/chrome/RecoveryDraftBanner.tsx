import type { RecoveryDraft } from '../../domain'
import { formatRecoveryTimestamp } from '../../domain'
import { t, type EditorLocale } from '../../settings'

interface RecoveryDraftBannerProps {
  drafts: RecoveryDraft[]
  locale: EditorLocale
  onDiscardAll: () => void
  onDiscardDraft: (draftId: string) => void
  onRestoreDraft: (draftId: string) => void
}

function getDraftLabel(draft: RecoveryDraft, locale: EditorLocale): string {
  const fileName = draft.filePath?.split(/[\\/]/).pop() ?? t(locale, 'tabs.untitled')
  return `${fileName} · ${formatRecoveryTimestamp(draft.updatedAt, locale)}`
}

export function RecoveryDraftBanner({
  drafts,
  locale,
  onDiscardAll,
  onDiscardDraft,
  onRestoreDraft
}: RecoveryDraftBannerProps): React.JSX.Element | null {
  if (drafts.length === 0) {
    return null
  }

  return (
    <section className="recovery-banner" aria-label={t(locale, 'recovery.title')}>
      <div className="recovery-banner-copy">
        <strong>{t(locale, 'recovery.title')}</strong>
        <span>{t(locale, 'recovery.description', { count: drafts.length })}</span>
      </div>
      <div className="recovery-draft-list">
        {drafts.map((draft) => (
          <div className="recovery-draft-item" key={draft.id}>
            <span>{getDraftLabel(draft, locale)}</span>
            <div className="recovery-draft-actions">
              <button type="button" onClick={() => onRestoreDraft(draft.id)}>
                {t(locale, 'recovery.restore')}
              </button>
              <button type="button" onClick={() => onDiscardDraft(draft.id)}>
                {t(locale, 'recovery.discard')}
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="recovery-discard-all" type="button" onClick={onDiscardAll}>
        {t(locale, 'recovery.discardAll')}
      </button>
    </section>
  )
}
