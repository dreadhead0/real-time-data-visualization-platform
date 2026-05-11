import { onMounted, onUnmounted } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useStreamStore } from '@/stores/stream'
import {
  generateGeoTrafficPoint,
  generateHeatmapCells,
  generateMarketTick,
  generateRadarHealthProfile,
  generateSecurityEvent,
  generateServiceGraph,
  generateSystemLog,
} from '@/lib/advancedMockGenerator'

export function useAnalyticsStream() {
  const analytics = useAnalyticsStore()
  const stream = useStreamStore()

  let fastTimer = 0
  let mediumTimer = 0
  let slowTimer = 0

  function emitFastData(): void {
    if (stream.paused) return

    analytics.pushSystemLog(generateSystemLog())
    analytics.pushMarketTick(generateMarketTick())

    if (Math.random() > 0.4) {
      analytics.pushGeoPoint(generateGeoTrafficPoint())
    }
  }

  function emitMediumData(): void {
    if (stream.paused) return

    analytics.pushHeatmapCells(generateHeatmapCells())

    if (Math.random() > 0.35) {
      analytics.pushSecurityEvent(generateSecurityEvent())
    }
  }

  function emitSlowData(): void {
    if (stream.paused) return

    const graph = generateServiceGraph()
    analytics.setServiceGraph(graph.nodes, graph.edges)
    analytics.setRadarProfile(generateRadarHealthProfile())
  }

  onMounted(() => {
    emitFastData()
    emitMediumData()
    emitSlowData()

    fastTimer = window.setInterval(emitFastData, 900)
    mediumTimer = window.setInterval(emitMediumData, 1600)
    slowTimer = window.setInterval(emitSlowData, 3500)
  })

  onUnmounted(() => {
    window.clearInterval(fastTimer)
    window.clearInterval(mediumTimer)
    window.clearInterval(slowTimer)
  })

  return {
    analytics,
  }
}