import { ElectronAPI } from '@electron-toolkit/preload'
import { DesktopApi } from '../shared/editor-ipc'

declare global {
  interface Window {
    electron: ElectronAPI
    api: DesktopApi
  }
}
