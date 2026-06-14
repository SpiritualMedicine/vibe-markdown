import { useEffect, useMemo, useRef, useState } from 'react'
import type { CommandPaletteItem } from '../../domain'
import { filterCommandPaletteItems } from '../../domain'
import type { EditorLocale } from '../../settings'
import { t } from '../../settings'

interface CommandPaletteProps {
  isOpen: boolean
  items: CommandPaletteItem[]
  locale: EditorLocale
  onClose: () => void
  onSelectItem: (item: CommandPaletteItem) => void
}

const KIND_LABEL_KEYS = {
  command: 'commandPalette.group.command',
  file: 'commandPalette.group.file',
  recent: 'commandPalette.group.recent',
  template: 'commandPalette.group.template'
} as const

export function CommandPalette(props: CommandPaletteProps): React.JSX.Element | null {
  const { isOpen, items, locale, onClose, onSelectItem } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const filteredItems = useMemo(() => filterCommandPaletteItems(items, query), [items, query])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const boundedSelectedIndex = Math.min(selectedIndex, Math.max(0, filteredItems.length - 1))
  const selectedItem = filteredItems[boundedSelectedIndex]

  function closePalette(): void {
    setQuery('')
    setSelectedIndex(0)
    onClose()
  }

  function selectItem(item: CommandPaletteItem): void {
    if (item.disabled) {
      return
    }
    setQuery('')
    setSelectedIndex(0)
    onSelectItem(item)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault()
      closePalette()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((current) => Math.min(filteredItems.length - 1, current + 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((current) => Math.max(0, current - 1))
      return
    }

    if (event.key === 'Enter' && selectedItem) {
      event.preventDefault()
      selectItem(selectedItem)
    }
  }

  return (
    <div
      aria-modal="true"
      className="command-palette-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closePalette()
        }
      }}
      role="dialog"
    >
      <section className="command-palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-palette-header">
          <label htmlFor="command-palette-input">{t(locale, 'commandPalette.title')}</label>
          <span>{t(locale, 'commandPalette.shortcut')}</span>
        </div>
        <input
          aria-activedescendant={selectedItem ? `command-palette-${selectedItem.id}` : undefined}
          aria-autocomplete="list"
          aria-controls="command-palette-list"
          className="command-palette-input"
          id="command-palette-input"
          onChange={(event) => {
            setQuery(event.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          placeholder={t(locale, 'commandPalette.placeholder')}
          ref={inputRef}
          role="combobox"
          type="search"
          value={query}
        />
        <div className="command-palette-list" id="command-palette-list" role="listbox">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <button
                aria-selected={index === boundedSelectedIndex}
                className={`command-palette-item ${
                  index === boundedSelectedIndex ? 'is-selected' : ''
                }`}
                disabled={item.disabled}
                id={`command-palette-${item.id}`}
                key={item.id}
                onClick={() => selectItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                type="button"
              >
                <span className="command-palette-kind">
                  {t(locale, KIND_LABEL_KEYS[item.kind])}
                </span>
                <span className="command-palette-title">{item.title}</span>
                <span className="command-palette-subtitle">{item.subtitle}</span>
              </button>
            ))
          ) : (
            <div className="command-palette-empty">{t(locale, 'commandPalette.empty')}</div>
          )}
        </div>
      </section>
    </div>
  )
}
