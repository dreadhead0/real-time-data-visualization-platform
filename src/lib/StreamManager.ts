import { validatePayload } from './Validator'
import { MockGenerator } from './mockGenerator'
import type { StreamPayload } from '@/types/domain'

export type StreamMode = 'websocket' | 'mock'
export type StreamStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

type PayloadHandler = (payload: StreamPayload) => void
type StatusHandler = (status: StreamStatus) => void

const BACKOFF_BASE_MS = 1000
const BACKOFF_MAX_MS = 30_000
const BACKOFF_MULTIPLIER = 2

export class StreamManager {
  private mode: StreamMode
  private wsUrl: string | null
  private ws: WebSocket | null = null
  private mock: MockGenerator | null = null
  private payloadHandlers = new Set<PayloadHandler>()
  private statusHandlers = new Set<StatusHandler>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private destroyed = false
  private _status: StreamStatus = 'disconnected'

  constructor(mode: StreamMode = 'mock', wsUrl: string | null = null) {
    this.mode = mode
    this.wsUrl = wsUrl
  }

  get status(): StreamStatus {
    return this._status
  }

  onPayload(handler: PayloadHandler): () => void {
    this.payloadHandlers.add(handler)
    return () => this.payloadHandlers.delete(handler)
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }

  connect(): void {
    if (this.destroyed) return
    this.mode === 'mock' ? this.connectMock() : this.connectWebSocket()
  }

  disconnect(): void {
    this.clearReconnect()
    this.ws?.close()
    this.ws = null
    this.mock?.stop()
    this.mock = null
    this.setStatus('disconnected')
  }

  destroy(): void {
    this.destroyed = true
    this.disconnect()
    this.payloadHandlers.clear()
    this.statusHandlers.clear()
  }

  private connectMock(): void {
    this.setStatus('connecting')
    this.mock = new MockGenerator()
    this.mock.start((payload) => this.emit(payload))
    this.reconnectAttempts = 0
    this.setStatus('connected')
  }

  private connectWebSocket(): void {
    if (!this.wsUrl) return
    this.setStatus('connecting')
    try {
      this.ws = new WebSocket(this.wsUrl)
    } catch {
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.setStatus('connected')
    }

    this.ws.onmessage = (ev) => {
      let raw: unknown
      try { raw = JSON.parse(ev.data as string) } catch { return }
      const payload = validatePayload(raw)
      if (payload) this.emit(payload)
    }

    this.ws.onerror = () => {
      this.setStatus('error')
    }

    this.ws.onclose = () => {
      this.ws = null
      if (!this.destroyed) this.scheduleReconnect()
    }
  }

  private emit(payload: StreamPayload): void {
    this.payloadHandlers.forEach((h) => h(payload))
  }

  private setStatus(s: StreamStatus): void {
    this._status = s
    this.statusHandlers.forEach((h) => h(s))
  }

  private scheduleReconnect(): void {
    this.clearReconnect()
    this.setStatus('disconnected')
    const delay = Math.min(
      BACKOFF_BASE_MS * Math.pow(BACKOFF_MULTIPLIER, this.reconnectAttempts),
      BACKOFF_MAX_MS,
    )
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      if (!this.destroyed) this.connectWebSocket()
    }, delay)
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

// Singleton instance — import and use across the app
export const streamManager = new StreamManager('mock')
