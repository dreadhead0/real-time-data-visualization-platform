type FlushCallback<T> = (batch: T[]) => void

export class Throttler<T> {
  private queue: T[] = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private readonly intervalMs: number
  private readonly maxBatch: number
  private readonly onFlush: FlushCallback<T>

  constructor(onFlush: FlushCallback<T>, intervalMs = 100, maxBatch = 50) {
    this.onFlush = onFlush
    this.intervalMs = intervalMs
    this.maxBatch = maxBatch
  }

  push(item: T): void {
    this.queue.push(item)
    if (this.queue.length >= this.maxBatch) {
      this.flush()
      return
    }
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.intervalMs)
    }
  }

  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.queue.length === 0) return
    const batch = this.queue.splice(0)
    this.onFlush(batch)
  }

  destroy(): void {
    if (this.timer) clearTimeout(this.timer)
    this.queue = []
    this.timer = null
  }
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, wait)
  }
}
