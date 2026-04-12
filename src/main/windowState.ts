const windowDirtyState = new Map<number, boolean>()
const windowForceClose = new Set<number>()

export function setWindowDirtyState(windowId: number, isDirty: boolean): void {
  windowDirtyState.set(windowId, Boolean(isDirty))
}

export function isWindowDirty(windowId: number): boolean {
  return windowDirtyState.get(windowId) ?? false
}

export function markWindowForceClose(windowId: number): void {
  windowForceClose.add(windowId)
}

export function isWindowForceClosing(windowId: number): boolean {
  return windowForceClose.has(windowId)
}

export function clearWindowState(windowId: number): void {
  windowDirtyState.delete(windowId)
  windowForceClose.delete(windowId)
}
