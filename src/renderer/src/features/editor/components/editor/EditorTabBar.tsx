import type { EditorTab } from '../../../../application/commands'
import { getDocumentBasename } from '../../domain'
import type { EditorLocale } from '../../settings'
import { t } from '../../settings'

interface TabMenuState {
  tabId: string
  x: number
  y: number
}

interface EditorTabBarProps {
  tabs: EditorTab[]
  activeTabId: string
  draggingTabId: string | null
  locale: EditorLocale
  tabMenu: TabMenuState | null
  onCreateTab: () => void
  onActivateTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
  onCloseOtherTabs: (tabId: string) => void
  onCloseTabsToRight: (tabId: string) => void
  onOpenTabMenu: (tabId: string, x: number, y: number) => void
  onCloseTabMenu: () => void
  onDragStart: (tabId: string, event: React.DragEvent<HTMLButtonElement>) => void
  onDragEnd: () => void
  onDropTab: (targetTabId: string, sourceTabId: string | null) => void
}

export function EditorTabBar(props: EditorTabBarProps): React.JSX.Element {
  const {
    tabs,
    activeTabId,
    draggingTabId,
    locale,
    tabMenu,
    onCreateTab,
    onActivateTab,
    onCloseTab,
    onCloseOtherTabs,
    onCloseTabsToRight,
    onOpenTabMenu,
    onCloseTabMenu,
    onDragStart,
    onDragEnd,
    onDropTab
  } = props

  return (
    <>
      <div className="editor-tabs">
        {tabs.map((tab) => {
          const tabName = getDocumentBasename(tab.filePath, t(locale, 'tabs.untitled'))
          return (
            <button
              className={`editor-tab ${tab.id === activeTabId ? 'is-active' : ''} ${
                tab.id === draggingTabId ? 'is-dragging' : ''
              }`}
              draggable
              key={tab.id}
              onClick={() => onActivateTab(tab.id)}
              onContextMenu={(event) => {
                event.preventDefault()
                onOpenTabMenu(tab.id, event.clientX, event.clientY)
              }}
              onDragEnd={onDragEnd}
              onDragOver={(event) => {
                event.preventDefault()
                if (draggingTabId && draggingTabId !== tab.id) {
                  event.dataTransfer.dropEffect = 'move'
                }
              }}
              onDragStart={(event) => onDragStart(tab.id, event)}
              onDrop={(event) => {
                event.preventDefault()
                const sourceTabId = event.dataTransfer.getData('text/plain') || draggingTabId
                onDropTab(tab.id, sourceTabId)
              }}
              type="button"
            >
              <span className="editor-tab-label">
                {tabName}
                {tab.isDirty ? ' *' : ''}
              </span>
              <span
                className="editor-tab-close"
                onClick={(event) => {
                  event.stopPropagation()
                  onCloseTab(tab.id)
                }}
                role="button"
              >
                x
              </span>
            </button>
          )
        })}
        <button className="editor-tab-add" onClick={onCreateTab} type="button">
          +
        </button>
      </div>

      {tabMenu ? (
        <div
          className="tab-context-menu"
          onPointerDown={(event) => event.stopPropagation()}
          style={{ left: `${tabMenu.x}px`, top: `${tabMenu.y}px` }}
        >
          <button
            onClick={() => {
              onCloseTab(tabMenu.tabId)
              onCloseTabMenu()
            }}
            type="button"
          >
            {t(locale, 'tabs.menu.close')}
          </button>
          <button
            onClick={() => {
              onCloseOtherTabs(tabMenu.tabId)
              onCloseTabMenu()
            }}
            type="button"
          >
            {t(locale, 'tabs.menu.closeOthers')}
          </button>
          <button
            onClick={() => {
              onCloseTabsToRight(tabMenu.tabId)
              onCloseTabMenu()
            }}
            type="button"
          >
            {t(locale, 'tabs.menu.closeRight')}
          </button>
        </div>
      ) : null}
    </>
  )
}
