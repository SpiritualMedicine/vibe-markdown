export const THEME_STORAGE_KEY = 'vibe-markdown-theme'

export const THEME_OPTIONS = [
  { id: 'rose', label: 'Rose' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'sky', label: 'Sky' },
  { id: 'amber', label: 'Amber' },
  { id: 'violet', label: 'Violet' }
] as const

export type EditorThemeId = (typeof THEME_OPTIONS)[number]['id']

type ThemeTransition = {
  ready: Promise<void>
}

type DocumentWithThemeTransition = Document & {
  startViewTransition?: (update: () => void) => ThemeTransition
}

let hasAppliedThemeOnce = false

export function isEditorThemeId(value: string): value is EditorThemeId {
  return THEME_OPTIONS.some((theme) => theme.id === value)
}

export function loadEditorTheme(): EditorThemeId {
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
  return raw && isEditorThemeId(raw) ? raw : 'rose'
}

function setThemeTransitionOrigin(): void {
  const root = document.documentElement
  const trigger = document.querySelector<HTMLElement>('.theme-select')
  const x = trigger ? trigger.getBoundingClientRect().left + trigger.offsetWidth / 2 : window.innerWidth / 2
  const y = trigger ? trigger.getBoundingClientRect().top + trigger.offsetHeight / 2 : window.innerHeight / 2
  const radius = Math.max(
    Math.hypot(x, y),
    Math.hypot(window.innerWidth - x, y),
    Math.hypot(x, window.innerHeight - y),
    Math.hypot(window.innerWidth - x, window.innerHeight - y)
  )

  root.style.setProperty('--theme-transition-x', `${x}px`)
  root.style.setProperty('--theme-transition-y', `${y}px`)
  root.style.setProperty('--theme-transition-radius', `${radius}px`)
}

export function applyEditorTheme(theme: EditorThemeId): void {
  const root = document.documentElement
  const current = root.getAttribute('data-theme')
  if (current === theme) {
    return
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const documentWithTransition = document as DocumentWithThemeTransition
  const canAnimate = hasAppliedThemeOnce && !reduceMotion && typeof documentWithTransition.startViewTransition === 'function'
  hasAppliedThemeOnce = true

  if (!canAnimate) {
    root.setAttribute('data-theme', theme)
    return
  }

  setThemeTransitionOrigin()
  root.classList.add('theme-transition-active')
  const transition = documentWithTransition.startViewTransition(() => {
    root.setAttribute('data-theme', theme)
  })
  transition?.ready
    .catch(() => undefined)
    .finally(() => {
      window.setTimeout(() => {
        root.classList.remove('theme-transition-active')
      }, 460)
    })
}

export function saveEditorTheme(theme: EditorThemeId): void {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}
