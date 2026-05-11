export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'

export type SecurityEventType =
  | 'brute_force'
  | 'malware'
  | 'ddos'
  | 'port_scan'
  | 'data_exfiltration'
  | 'auth_failure'

export interface SecurityEvent {
  id: string
  timestamp: number
  severity: SecuritySeverity
  type: SecurityEventType
  sourceIp: string
  country: string
  city: string
  message: string
  riskScore: number
}

export interface GeoTrafficPoint {
  id: string
  timestamp: number
  country: string
  city: string
  lat: number
  lon: number
  requests: number
  threats: number
  latency: number
}

export interface MarketTick {
  id: string
  timestamp: number
  symbol: string
  price: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  changePercent: number
}

export type LogSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

export interface SystemLog {
  id: string
  timestamp: number
  severity: LogSeverity
  source: 'api' | 'worker' | 'database' | 'gateway' | 'auth' | 'scheduler'
  message: string
  durationMs: number
}

export interface ServiceNode {
  id: string
  name: string
  category: 'frontend' | 'api' | 'database' | 'queue' | 'cache' | 'worker' | 'external'
  health: number
  requests: number
  errorRate: number
}

export interface ServiceEdge {
  source: string
  target: string
  traffic: number
  latency: number
}

export interface RadarHealthProfile {
  performance: number
  reliability: number
  security: number
  network: number
  throughput: number
  stability: number
}

export interface HeatmapCell {
  timestamp: number
  bucket: string
  value: number
}

export interface DatasetVisibility {
  infrastructure: boolean
  security: boolean
  geography: boolean
  markets: boolean
  networkGraph: boolean
  logs: boolean
}

export interface SeverityFilters {
  low: boolean
  medium: boolean
  high: boolean
  critical: boolean
}

export interface LogSeverityFilters {
  debug: boolean
  info: boolean
  warning: boolean
  error: boolean
  critical: boolean
}

export type AdvancedChartMode =
  | 'overview'
  | 'security'
  | 'geography'
  | 'markets'
  | 'network'
  | 'logs'