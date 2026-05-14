import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CircularBuffer } from '@/lib/CircularBuffer'
import type {
  MetricPoint,
  MetricName,
  TimeRange,
  DashboardSummary,
} from '@/types/domain'

const BUFFER_SIZE = 1000

const METRIC_NAMES: MetricName[] = [
  'cpu',
  'memory',
  'network',
  'latency',
  'throughput',
  'errorRate',
]

const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1h': 3_600_000,
  live: 60_000,
}

export const useMetricsStore = defineStore('metrics', () => {
  const buffers = Object.fromEntries(
    METRIC_NAMES.map((metric) => [
      metric,
      new CircularBuffer<MetricPoint>(BUFFER_SIZE),
    ]),
  ) as Record<MetricName, CircularBuffer<MetricPoint>>

  const latestValues = ref<Partial<DashboardSummary>>({})
  const timeRange = ref<TimeRange>('5m')

  const seriesVersion = ref(0)

  function pushPoint(point: MetricPoint): void {
    buffers[point.metric].push(point)

    latestValues.value = {
      ...latestValues.value,
      [point.metric]: point.value,
    }

    seriesVersion.value += 1
  }

  function pushBatch(points: MetricPoint[]): void {
    if (points.length === 0) return

    const nextLatest = {
      ...latestValues.value,
    }

    for (const point of points) {
      buffers[point.metric].push(point)
      nextLatest[point.metric] = point.value
    }

    latestValues.value = nextLatest
    seriesVersion.value += 1
  }

  function getSeriesData(metric: MetricName): [number, number][] {
    // Touch this ref so computed chart series rerun whenever data enters the buffer.
    seriesVersion.value

    const sinceMs = Date.now() - TIME_RANGE_MS[timeRange.value]

    return buffers[metric]
      .since(sinceMs)
      .map((point) => [point.timestamp, point.value])
  }

  const summary = computed<DashboardSummary>(() => ({
    cpu: latestValues.value.cpu ?? 0,
    memory: latestValues.value.memory ?? 0,
    network: latestValues.value.network ?? 0,
    latency: latestValues.value.latency ?? 0,
    throughput: latestValues.value.throughput ?? 0,
    errorRate: latestValues.value.errorRate ?? 0,
  }))

  function setTimeRange(range: TimeRange): void {
    timeRange.value = range
    seriesVersion.value += 1
  }

  function reset(): void {
    METRIC_NAMES.forEach((metric) => buffers[metric].clear())
    latestValues.value = {}
    seriesVersion.value += 1
  }

  return {
    latestValues,
    timeRange,
    summary,
    seriesVersion,
    pushPoint,
    pushBatch,
    getSeriesData,
    setTimeRange,
    reset,
  }
})