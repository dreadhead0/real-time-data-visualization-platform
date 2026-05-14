export class CircularBuffer<T> {
  private buf: (T | undefined)[]
  private head = 0
  private _size = 0
  readonly capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
    this.buf = new Array(capacity)
  }

  push(item: T): void {
    this.buf[this.head] = item
    this.head = (this.head + 1) % this.capacity
    if (this._size < this.capacity) this._size++
  }

  get size(): number {
    return this._size
  }

  toArray(): T[] {
    if (this._size === 0) return []
    if (this._size < this.capacity) {
      return this.buf.slice(0, this._size) as T[]
    }
    const tail = this.buf.slice(this.head) as T[]
    const front = this.buf.slice(0, this.head) as T[]
    return [...tail, ...front]
  }

  since(sinceMs: number): T[] {
    return this.toArray().filter(
      (item) => (item as unknown as { timestamp: number }).timestamp >= sinceMs,
    )
  }

  clear(): void {
    this.buf = new Array(this.capacity)
    this.head = 0
    this._size = 0
  }
}
