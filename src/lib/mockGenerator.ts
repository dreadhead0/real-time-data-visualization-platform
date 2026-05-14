import type { MetricPoint, AlertEvent, StreamPayload, MetricName } from '@/types/domain'

const THRESHOLDS: Record<MetricName, number> = {
  cpu: 85,
  memory: 90,
  network: 80,
  latency: 500,
  throughput: 10,
  errorRate: 5,
}

const ALERT_MESSAGES: Record<MetricName, string[]> = {
  cpu: ['CPU spike detected', 'High CPU utilization', 'CPU throttling active'],
  memory: ['Memory pressure high', 'OOM risk detected', 'Swap usage increasing'],
  network: ['Network saturation', 'Packet loss detected', 'Bandwidth limit reached'],
  latency: ['Latency spike detected', 'P99 latency elevated', 'Response time degraded'],
  throughput: ['Throughput degraded', 'Request queue backing up', 'Low throughput alert'],
  errorRate: ['Error rate elevated', 'Error spike detected', '5xx errors increasing'],
}

const METRIC_NAMES: MetricName[] = ['cpu', 'memory', 'network', 'latency', 'throughput', 'errorRate']

function randomWalk(current: number, min: number, max: number, step: number): number {
  const delta = (Math.random() - 0.48) * step
  return Math.min(max, Math.max(min, current + delta))
}

function uuid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

interface MetricState {
  value: number
  min: number
  max: number
  step: number
}

const STATE: Record<MetricName, MetricState> = {
  cpu:        { value: 42, min: 5,   max: 100, step: 4 },
  memory:     { value: 58, min: 20,  max: 100, step: 2 },
  network:    { value: 35, min: 0,   max: 100, step: 5 },
  latency:    { value: 120, min: 10, max: 800, step: 30 },
  throughput: { value: 45, min: 0,   max: 100, step: 6 },
  errorRate:  { value: 1.2, min: 0,  max: 20,  step: 0.5 },
}

export function generateMetricPoint(metric: MetricName): MetricPoint {
  const s = STATE[metric]
  s.value = randomWalk(s.value, s.min, s.max, s.step)
  return {
    timestamp: Date.now(),
    value: Math.round(s.value * 100) / 100,
    metric,
  }
}

export function generateAlert(metric: MetricName, value: number): AlertEvent {
  const threshold = THRESHOLDS[metric]
  const severity = value > threshold * 1.15 ? 'critical'
    : value > threshold * 1.05 ? 'error'
    : value > threshold ? 'warning'
    : 'info'
  const messages = ALERT_MESSAGES[metric]
  return {
    id: uuid(),
    timestamp: Date.now(),
    severity,
    metric,
    message: messages[Math.floor(Math.random() * messages.length)],
    value: Math.round(value * 100) / 100,
    threshold,
  }
}

export class MockGenerator {
  private timers: ReturnType<typeof setInterval>[] = []
  private metricIndex = 0

  start(onPayload: (p: StreamPayload) => void): void {
    
    const metricTimer = setInterval(() => {
      const metric = METRIC_NAMES[this.metricIndex % METRIC_NAMES.length]
      this.metricIndex++
      const point = generateMetricPoint(metric)
      onPayload({ type: 'metric', data: point, ts: Date.now() })

      const threshold = THRESHOLDS[metric]
      if (point.value > threshold * 0.9 && Math.random() < 0.3) {
        onPayload({ type: 'alert', data: generateAlert(metric, point.value), ts: Date.now() })
      }
    }, 200)

    const heartbeatTimer = setInterval(() => {
      onPayload({ type: 'heartbeat', data: null, ts: Date.now() })
    }, 5000)

    this.timers.push(metricTimer, heartbeatTimer)
  }

  stop(): void {
    this.timers.forEach(clearInterval)
    this.timers = []
  }
}
