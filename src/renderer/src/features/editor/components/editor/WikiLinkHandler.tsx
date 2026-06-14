import type { JSX } from 'react'

export interface WikiLinkTooltipState {
  visible: boolean
  x: number
  y: number
  linkText: string
  exists: boolean
}

export function WikiLinkTooltip({
  tooltip
}: {
  tooltip: WikiLinkTooltipState | null
}): JSX.Element | null {
  if (!tooltip || !tooltip.visible) return null

  return (
    <div
      className="preview-document-link-tooltip"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        opacity: tooltip.visible ? 1 : 0
      }}
    >
      <div className="preview-document-link-tooltip-title">{tooltip.linkText}</div>
      <div className="preview-document-link-tooltip-path">
        {tooltip.exists ? 'Click to open' : 'Document not found'}
      </div>
    </div>
  )
}
