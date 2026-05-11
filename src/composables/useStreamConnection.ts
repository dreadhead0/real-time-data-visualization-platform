import { onMounted, onUnmounted } from 'vue'
import { streamManager } from '@/lib/StreamManager'
import { Throttler } from '@/lib/Throttler'
import { useMetricsStore } from '@/stores/metrics'
import { useAlertsStore } from '@/stores/alerts'
import { useStreamStore } from '@/stores/stream'
import type { MetricPoint, AlertEvent, StreamPayload } from '@/types/domain'

export function useStreamConnection() {
  const metricsStore = useMetricsStore()
  const alertsStore  = useAlertsStore()
  const streamStore  = useStreamStore()

  const metricThrottler = new Throttler<MetricPoint>(
    (batch) => metricsStore.pushBatch(batch),
    100,
    50,
  )

  const alertThrottler = new Throttler<AlertEvent>(
    (batch) => alertsStore.pushBatch(batch),
    200,
    20,
  )

  function handlePayload(payload: StreamPayload): void {
    if (streamStore.paused) return

    streamStore.incrementMessages()

    if (payload.type === 'metric') {
      metricThrottler.push(payload.data as MetricPoint)
    } else if (payload.type === 'alert') {
      alertThrottler.push(payload.data as AlertEvent)
    } else if (payload.type === 'heartbeat') {
      streamStore.recordHeartbeat()
    }
  }

  const unsubPayload = streamManager.onPayload(handlePayload)
  const unsubStatus  = streamManager.onStatus((s) => streamStore.setStatus(s))

  onMounted(() => {
    streamManager.connect()
  })

  onUnmounted(() => {
    unsubPayload()
    unsubStatus()
    metricThrottler.destroy()
    alertThrottler.destroy()
  })

  return { streamManager, streamStore }
}
