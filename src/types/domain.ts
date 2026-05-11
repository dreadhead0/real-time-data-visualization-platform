export type MetricName = 'cpu' | 'memory' | 'network' | 'latency' | 'throughput' | 'errorRate'

export interface MetricPoint {
  timestamp: number
  value: number
  metric: MetricName
}

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface AlertEvent {
  id: string
  timestamp: number
  severity: AlertSeverity
  metric: MetricName
  message: string
  value: number
  threshold: number
}

export interface StreamPayload {
  type: 'metric' | 'alert' | 'heartbeat'
  data: MetricPoint | AlertEvent | null
  ts: number
}

export type TimeRange = '1m' | '5m' | '15m' | '1h' | 'live'

export interface ChartSeries {
  name: string
  data: [number, number][]
  color?: string
}

export interface DashboardSummary {
  cpu: number
  memory: number
  network: number
  latency: number
  throughput: number
  errorRate: number
}
