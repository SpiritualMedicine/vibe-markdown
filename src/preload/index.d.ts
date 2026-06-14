import type { DesktopApi } from '../shared'

declare global {
  interface Window {
    api: DesktopApi
  }
}
