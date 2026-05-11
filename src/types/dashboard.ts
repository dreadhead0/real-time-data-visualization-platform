export interface ProcessRow {
  pid: number
  name: string
  status: 'running' | 'sleeping' | 'zombie' | 'stopped' | 'warning'
  cpu: number
  memory: number
  threads: number
  user: string
  priority: number
}

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}
