import { useState, useRef, useEffect } from 'react'
import type { EditorLocale } from '../../settings'
import type { WikiLinkTooltipState } from './WikiLinkHandler'

interface WikiLinkHandlerProps {
  previewContainerRef: React.RefObject<HTMLElement | null>
  onOpenLink: (linkPath: string) => void
  locale: EditorLocale
}

export function useWikiLinkHandler({
  previewContainerRef,
  onOpenLink,
  locale
}: WikiLinkHandlerProps): WikiLinkTooltipState | null {
  const [tooltip, setTooltip] = useState<WikiLinkTooltipState | null>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const handleMouseOver = (event: MouseEvent): void => {
      const target = event.target as Element
      const link = target.closest<HTMLElement>('[data-document-ref]')
      if (!link) return

      const linkPath = decodeURIComponent(link.dataset.documentRef || '')

      const rect = link.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      setTooltip({
        visible: true,
        x: rect.left - containerRect.left,
        y: rect.bottom - containerRect.top + 8,
        linkText: linkPath,
        exists: true
      })

      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }

      tooltipTimeoutRef.current = setTimeout(() => {
        setTooltip(null)
      }, 3000)
    }

    const handleMouseOut = (): void => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      setTooltip(null)
    }

    const handleClick = (event: MouseEvent): void => {
      const target = event.target as Element
      const link = target.closest<HTMLElement>('[data-document-ref]')
      if (!link) return

      event.preventDefault()
      const linkPath = decodeURIComponent(link.dataset.documentRef || '')
      onOpenLink(linkPath)
    }

    container.addEventListener('mouseover', handleMouseOver)
    container.addEventListener('mouseout', handleMouseOut)
    container.addEventListener('click', handleClick)

    return () => {
      container.removeEventListener('mouseover', handleMouseOver)
      container.removeEventListener('mouseout', handleMouseOut)
      container.removeEventListener('click', handleClick)
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [previewContainerRef, onOpenLink, locale])

  return tooltip
}
