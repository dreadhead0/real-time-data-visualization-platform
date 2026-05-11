import type {
  GeoTrafficPoint,
  HeatmapCell,
  MarketTick,
  RadarHealthProfile,
  SecurityEvent,
  SecurityEventType,
  SecuritySeverity,
  ServiceEdge,
  ServiceNode,
  SystemLog,
} from '@/types/analytics'

function uuid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const value = min + Math.random() * (max - min)
  return Number(value.toFixed(decimals))
}

const LOCATIONS = [
  { country: 'United States', city: 'New York', lat: 40.7128, lon: -74.006 },
  { country: 'United Kingdom', city: 'London', lat: 51.5072, lon: -0.1276 },
  { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { country: 'Germany', city: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
  { country: 'Japan', city: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { country: 'Brazil', city: 'São Paulo', lat: -23.5558, lon: -46.6396 },
  { country: 'India', city: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { country: 'Singapore', city: 'Singapore', lat: 1.3521, lon: 103.8198 },
]

const SECURITY_TYPES: SecurityEventType[] = [
  'brute_force',
  'malware',
  'ddos',
  'port_scan',
  'data_exfiltration',
  'auth_failure',
]

const SECURITY_SEVERITIES: SecuritySeverity[] = ['low', 'medium', 'high', 'critical']

const LOG_MESSAGES = [
  'Request completed successfully',
  'Cache miss detected',
  'Database query exceeded latency budget',
  'Authentication token refreshed',
  'Worker queue depth increased',
  'Rate limit threshold approaching',
  'Suspicious payload blocked',
  'External dependency recovered',
]

const SYMBOLS = ['AAPL', 'NVDA', 'BTC-USD', 'ETH-USD', 'TSLA', 'MSFT']

const marketState: Record<string, number> = {
  AAPL: 196,
  NVDA: 920,
  'BTC-USD': 68200,
  'ETH-USD': 3550,
  TSLA: 185,
  MSFT: 420,
}

export function generateSecurityEvent(): SecurityEvent {
  const location = pick(LOCATIONS)
  const severity = pick(SECURITY_SEVERITIES)
  const type = pick(SECURITY_TYPES)

  const scoreBase = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 92,
  } satisfies Record<SecuritySeverity, number>

  return {
    id: uuid('sec'),
    timestamp: Date.now(),
    severity,
    type,
    sourceIp: `${randomInt(13, 223)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`,
    country: location.country,
    city: location.city,
    message: `${type.replace(/_/g, ' ')} detected from ${location.city}`,
    riskScore: clamp(scoreBase[severity] + randomFloat(-8, 8), 0, 100),
  }
}

export function generateGeoTrafficPoint(): GeoTrafficPoint {
  const location = pick(LOCATIONS)

  return {
    id: uuid('geo'),
    timestamp: Date.now(),
    country: location.country,
    city: location.city,
    lat: location.lat,
    lon: location.lon,
    requests: randomInt(120, 9800),
    threats: Math.random() > 0.72 ? randomInt(1, 34) : randomInt(0, 5),
    latency: randomInt(30, 420),
  }
}

export function generateMarketTick(): MarketTick {
  const symbol = pick(SYMBOLS)
  const previous = marketState[symbol]
  const drift = previous * randomFloat(-0.012, 0.012, 5)

  const open = previous
  const close = Math.max(0.01, previous + drift)
  const high = Math.max(open, close) + Math.abs(previous * randomFloat(0, 0.006, 5))
  const low = Math.min(open, close) - Math.abs(previous * randomFloat(0, 0.006, 5))

  marketState[symbol] = close

  return {
    id: uuid('tick'),
    timestamp: Date.now(),
    symbol,
    price: Number(close.toFixed(symbol.includes('USD') ? 2 : 2)),
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2)),
    volume: randomInt(10_000, 2_500_000),
    changePercent: Number((((close - open) / open) * 100).toFixed(2)),
  }
}

export function generateSystemLog(): SystemLog {
  const severity = pick(['debug', 'info', 'warning', 'error', 'critical'] as const)

  return {
    id: uuid('log'),
    timestamp: Date.now(),
    severity,
    source: pick(['api', 'worker', 'database', 'gateway', 'auth', 'scheduler'] as const),
    message: pick(LOG_MESSAGES),
    durationMs: randomInt(12, 1300),
  }
}

export function generateServiceGraph(): { nodes: ServiceNode[]; edges: ServiceEdge[] } {
  const nodes: ServiceNode[] = [
    { id: 'web', name: 'Web Client', category: 'frontend', health: randomInt(85, 100), requests: randomInt(200, 900), errorRate: randomFloat(0, 1.8) },
    { id: 'gateway', name: 'API Gateway', category: 'api', health: randomInt(75, 100), requests: randomInt(600, 2400), errorRate: randomFloat(0, 3) },
    { id: 'auth', name: 'Auth Service', category: 'api', health: randomInt(78, 100), requests: randomInt(120, 700), errorRate: randomFloat(0, 4) },
    { id: 'worker', name: 'Worker Pool', category: 'worker', health: randomInt(70, 100), requests: randomInt(80, 600), errorRate: randomFloat(0, 5) },
    { id: 'queue', name: 'Message Queue', category: 'queue', health: randomInt(72, 100), requests: randomInt(200, 1300), errorRate: randomFloat(0, 2) },
    { id: 'redis', name: 'Redis Cache', category: 'cache', health: randomInt(80, 100), requests: randomInt(900, 5000), errorRate: randomFloat(0, 1) },
    { id: 'postgres', name: 'Postgres', category: 'database', health: randomInt(70, 98), requests: randomInt(300, 2200), errorRate: randomFloat(0, 3.5) },
    { id: 'stripe', name: 'External API', category: 'external', health: randomInt(65, 99), requests: randomInt(30, 260), errorRate: randomFloat(0, 6) },
  ]

  const edges: ServiceEdge[] = [
    { source: 'web', target: 'gateway', traffic: randomInt(300, 1300), latency: randomInt(20, 90) },
    { source: 'gateway', target: 'auth', traffic: randomInt(80, 500), latency: randomInt(25, 120) },
    { source: 'gateway', target: 'worker', traffic: randomInt(90, 650), latency: randomInt(40, 180) },
    { source: 'gateway', target: 'redis', traffic: randomInt(500, 4000), latency: randomInt(5, 30) },
    { source: 'gateway', target: 'postgres', traffic: randomInt(250, 2000), latency: randomInt(35, 220) },
    { source: 'worker', target: 'queue', traffic: randomInt(200, 1600), latency: randomInt(15, 70) },
    { source: 'worker', target: 'stripe', traffic: randomInt(30, 280), latency: randomInt(100, 580) },
  ]

  return { nodes, edges }
}

export function generateRadarHealthProfile(): RadarHealthProfile {
  return {
    performance: randomInt(62, 98),
    reliability: randomInt(68, 99),
    security: randomInt(58, 96),
    network: randomInt(60, 98),
    throughput: randomInt(64, 99),
    stability: randomInt(70, 100),
  }
}

export function generateHeatmapCells(): HeatmapCell[] {
  const now = Date.now()
  const buckets = ['CPU', 'Memory', 'Network', 'Security', 'Logs', 'Markets']

  return buckets.map((bucket) => ({
    timestamp: now,
    bucket,
    value: randomInt(5, 100),
  }))
}