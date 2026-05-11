export interface BackoffOptions {
  initialDelayMs: number
  maxDelayMs: number
  factor: number
  jitterRatio: number
}

const defaultBackoffOptions: BackoffOptions = {
  initialDelayMs: 500,
  maxDelayMs: 8000,
  factor: 1.8,
  jitterRatio: 0.25,
}

export function getBackoffDelay(attempt: number, options: Partial<BackoffOptions> = {}): number {
  const config = { ...defaultBackoffOptions, ...options }

  const exponentialDelay = Math.min(
    config.maxDelayMs,
    config.initialDelayMs * Math.pow(config.factor, Math.max(0, attempt - 1)),
  )

  const jitter = exponentialDelay * config.jitterRatio * Math.random()

  return Math.round(exponentialDelay + jitter)
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function sanitizeText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback

  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 500)
}