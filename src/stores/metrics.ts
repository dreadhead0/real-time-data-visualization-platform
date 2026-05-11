import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CircularBuffer } from '@/lib/CircularBuffer'
import type { MetricPoint, MetricName, TimeRange, DashboardSummary } from '@/types/domain'

const BUFFER_SIZE = 1000
const METRIC_NAMES: MetricName[] = ['cpu', 'memory', 'network', 'latency', 'throughput', 'errorRate']

const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1m':   60_000,
  '5m':   300_000,
  '15m':  900_000,
  '1h':   3_600_000,
  'live': 60_000, // live = rolling 1m window
}

export const useMetricsStore = defineStore('metrics', () => {
  const buffers = Object.fromEntries(
    METRIC_NAMES.map((m) => [m, new CircularBuffer<MetricPoint>(BUFFER_SIZE)]),
  ) as Record<MetricName, CircularBuffer<MetricPoint>>

  const latestValues = ref<Partial<DashboardSummary>>({})
  const timeRange = ref<TimeRange>('5m')

  function pushPoint(point: MetricPoint): void {
    buffers[point.metric].push(point)
    latestValues.value = { ...latestValues.value, [point.metric]: point.value }
  }

  function pushBatch(points: MetricPoint[]): void {
    for (const p of points) pushPoint(p)
  }

  function getSeriesData(metric: MetricName): [number, number][] {
    const sinceMs = Date.now() - TIME_RANGE_MS[timeRange.value]
    return buffers[metric].since(sinceMs).map((p) => [p.timestamp, p.value])
  }

  const summary = computed<DashboardSummary>(() => ({
    cpu:        latestValues.value.cpu        ?? 0,
    memory:     latestValues.value.memory     ?? 0,
    network:    latestValues.value.network    ?? 0,
    latency:    latestValues.value.latency    ?? 0,
    throughput: latestValues.value.throughput ?? 0,
    errorRate:  latestValues.value.errorRate  ?? 0,
  }))

  function setTimeRange(r: TimeRange): void {
    timeRange.value = r
  }

  function reset(): void {
    METRIC_NAMES.forEach((m) => buffers[m].clear())
    latestValues.value = {}
  }

  return { latestValues, timeRange, summary, pushPoint, pushBatch, getSeriesData, setTimeRange, reset }
})
