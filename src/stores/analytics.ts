import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  AdvancedChartMode,
  DatasetVisibility,
  GeoTrafficPoint,
  HeatmapCell,
  MarketTick,
  RadarHealthProfile,
  SecurityEvent,
  ServiceEdge,
  ServiceNode,
  SystemLog,
  LogSeverityFilters,
  SeverityFilters,
} from '@/types/analytics'

const MAX_SECURITY_EVENTS = 300
const MAX_GEO_POINTS = 250
const MAX_MARKET_TICKS = 400
const MAX_LOGS = 500
const MAX_HEATMAP_CELLS = 360

const defaultVisibility: DatasetVisibility = {
  infrastructure: true,
  security: true,
  geography: true,
  markets: true,
  networkGraph: true,
  logs: true,
}

const defaultSeverityFilters: SeverityFilters = {
  low: true,
  medium: true,
  high: true,
  critical: true,
}

const defaultLogSeverityFilters: LogSeverityFilters = {
  debug: true,
  info: true,
  warning: true,
  error: true,
  critical: true,
}

export const useAnalyticsStore = defineStore(
  'analytics',
  () => {
    const securityEvents = ref<SecurityEvent[]>([])
    const geoTraffic = ref<GeoTrafficPoint[]>([])
    const marketTicks = ref<MarketTick[]>([])
    const systemLogs = ref<SystemLog[]>([])
    const heatmapCells = ref<HeatmapCell[]>([])
    const serviceNodes = ref<ServiceNode[]>([])
    const serviceEdges = ref<ServiceEdge[]>([])

    const radarProfile = ref<RadarHealthProfile>({
      performance: 80,
      reliability: 84,
      security: 76,
      network: 82,
      throughput: 78,
      stability: 88,
    })

    const chartMode = ref<AdvancedChartMode>('overview')
    const controlsOpen = ref(true)
    const datasetVisibility = ref<DatasetVisibility>({ ...defaultVisibility })
    const selectedSymbol = ref('BTC-USD')
    const securitySearch = ref('')
    const logSearch = ref('')

    const severityFilters = ref<SeverityFilters>({ ...defaultSeverityFilters })
    const logSeverityFilters = ref<LogSeverityFilters>({ ...defaultLogSeverityFilters })

    function pushSecurityEvent(event: SecurityEvent): void {
      securityEvents.value.unshift(event)
      if (securityEvents.value.length > MAX_SECURITY_EVENTS) {
        securityEvents.value = securityEvents.value.slice(0, MAX_SECURITY_EVENTS)
      }
    }

    function pushGeoPoint(point: GeoTrafficPoint): void {
      geoTraffic.value.unshift(point)
      if (geoTraffic.value.length > MAX_GEO_POINTS) {
        geoTraffic.value = geoTraffic.value.slice(0, MAX_GEO_POINTS)
      }
    }

    function pushMarketTick(tick: MarketTick): void {
      marketTicks.value.unshift(tick)
      if (marketTicks.value.length > MAX_MARKET_TICKS) {
        marketTicks.value = marketTicks.value.slice(0, MAX_MARKET_TICKS)
      }
    }

    function pushSystemLog(log: SystemLog): void {
      systemLogs.value.unshift(log)
      if (systemLogs.value.length > MAX_LOGS) {
        systemLogs.value = systemLogs.value.slice(0, MAX_LOGS)
      }
    }

    function pushHeatmapCells(cells: HeatmapCell[]): void {
      heatmapCells.value.unshift(...cells)
      if (heatmapCells.value.length > MAX_HEATMAP_CELLS) {
        heatmapCells.value = heatmapCells.value.slice(0, MAX_HEATMAP_CELLS)
      }
    }

    function setServiceGraph(nodes: ServiceNode[], edges: ServiceEdge[]): void {
      serviceNodes.value = nodes
      serviceEdges.value = edges
    }

    function setRadarProfile(profile: RadarHealthProfile): void {
      radarProfile.value = profile
    }

    function setChartMode(mode: AdvancedChartMode): void {
      chartMode.value = mode
    }

    function setSelectedSymbol(symbol: string): void {
      selectedSymbol.value = symbol
    }

    function toggleDataset(key: keyof DatasetVisibility): void {
      datasetVisibility.value = {
        ...datasetVisibility.value,
        [key]: !datasetVisibility.value[key],
      }
    }

    function setDatasetVisibility(key: keyof DatasetVisibility, value: boolean): void {
      datasetVisibility.value = {
        ...datasetVisibility.value,
        [key]: value,
      }
    }

    function setSecuritySearch(value: string): void {
      securitySearch.value = value
    }

    function setLogSearch(value: string): void {
      logSearch.value = value
    }

    function toggleSeverityFilter(key: keyof SeverityFilters): void {
  severityFilters.value = {
    ...severityFilters.value,
    [key]: !severityFilters.value[key],
  }
}

function toggleLogSeverityFilter(key: keyof LogSeverityFilters): void {
  logSeverityFilters.value = {
    ...logSeverityFilters.value,
    [key]: !logSeverityFilters.value[key],
  }
}

function enableAllDatasets(): void {
  datasetVisibility.value = { ...defaultVisibility }
}

function disableAllDatasets(): void {
  datasetVisibility.value = {
    infrastructure: false,
    security: false,
    geography: false,
    markets: false,
    networkGraph: false,
    logs: false,
  }
}

function resetFilters(): void {
  securitySearch.value = ''
  logSearch.value = ''
  severityFilters.value = { ...defaultSeverityFilters }
  logSeverityFilters.value = { ...defaultLogSeverityFilters }
}

function toggleControls(): void {
  controlsOpen.value = !controlsOpen.value
}

 const visibleSecurityEvents = computed(() => {
  const q = securitySearch.value.trim().toLowerCase()

  return securityEvents.value.filter((event) => {
    const matchesSeverity = severityFilters.value[event.severity]

    const matchesSearch =
      !q ||
      event.message.toLowerCase().includes(q) ||
      event.country.toLowerCase().includes(q) ||
      event.city.toLowerCase().includes(q) ||
      event.sourceIp.toLowerCase().includes(q) ||
      event.type.toLowerCase().includes(q)

    return matchesSeverity && matchesSearch
  })
})

   const visibleLogs = computed(() => {
  const q = logSearch.value.trim().toLowerCase()

  return systemLogs.value.filter((log) => {
    const matchesSeverity = logSeverityFilters.value[log.severity]

    const matchesSearch =
      !q ||
      log.message.toLowerCase().includes(q) ||
      log.source.toLowerCase().includes(q) ||
      log.severity.toLowerCase().includes(q)

    return matchesSeverity && matchesSearch
  })
})

    const selectedMarketTicks = computed(() => {
      return marketTicks.value
        .filter((tick) => tick.symbol === selectedSymbol.value)
        .slice()
        .reverse()
    })

    const symbols = computed(() => {
      const unique = new Set(marketTicks.value.map((tick) => tick.symbol))
      return Array.from(unique)
    })

    const securitySummary = computed(() => {
      const critical = securityEvents.value.filter((event) => event.severity === 'critical').length
      const high = securityEvents.value.filter((event) => event.severity === 'high').length
      const total = securityEvents.value.length
      const avgRisk =
        total === 0
          ? 0
          : securityEvents.value.reduce((sum, event) => sum + event.riskScore, 0) / total

      return {
        total,
        critical,
        high,
        avgRisk: Number(avgRisk.toFixed(1)),
      }
    })

    const geoSummary = computed(() => {
      const countries = new Set(geoTraffic.value.map((point) => point.country))
      const totalRequests = geoTraffic.value.reduce((sum, point) => sum + point.requests, 0)
      const totalThreats = geoTraffic.value.reduce((sum, point) => sum + point.threats, 0)

      return {
        countries: countries.size,
        totalRequests,
        totalThreats,
      }
    })

    const marketSummary = computed(() => {
      const latestBySymbol = new Map<string, MarketTick>()

      for (const tick of marketTicks.value) {
        if (!latestBySymbol.has(tick.symbol)) {
          latestBySymbol.set(tick.symbol, tick)
        }
      }

      const latest = Array.from(latestBySymbol.values())
      const gainers = latest.filter((tick) => tick.changePercent >= 0).length
      const losers = latest.filter((tick) => tick.changePercent < 0).length

      return {
        tracked: latest.length,
        gainers,
        losers,
      }
    })

    const logSummary = computed(() => {
      const errors = systemLogs.value.filter(
        (log) => log.severity === 'error' || log.severity === 'critical',
      ).length

      return {
        total: systemLogs.value.length,
        errors,
      }
    })

    function reset(): void {
      securityEvents.value = []
      geoTraffic.value = []
      marketTicks.value = []
      systemLogs.value = []
      heatmapCells.value = []
      serviceNodes.value = []
      serviceEdges.value = []
      radarProfile.value = {
        performance: 80,
        reliability: 84,
        security: 76,
        network: 82,
        throughput: 78,
        stability: 88,
      }
    }

    return {
      securityEvents,
      geoTraffic,
      marketTicks,
      systemLogs,
      heatmapCells,
      serviceNodes,
      serviceEdges,
      radarProfile,
      chartMode,
      datasetVisibility,
      selectedSymbol,
      securitySearch,
      logSearch,

      visibleSecurityEvents,
      visibleLogs,
      selectedMarketTicks,
      symbols,
      securitySummary,
      geoSummary,
      marketSummary,
      logSummary,

      pushSecurityEvent,
      pushGeoPoint,
      pushMarketTick,
      pushSystemLog,
      pushHeatmapCells,
      setServiceGraph,
      setRadarProfile,
      setChartMode,
      setSelectedSymbol,
      toggleDataset,
      setDatasetVisibility,
      setSecuritySearch,
      setLogSearch,
      reset,

      controlsOpen,
      toggleControls,

      severityFilters,
      logSeverityFilters,
      toggleSeverityFilter,
      toggleLogSeverityFilter,
      enableAllDatasets,
      disableAllDatasets,
      resetFilters,
    }
  },
  {
    persist: {
     pick: [
      'chartMode',
      'controlsOpen',
      'datasetVisibility',
      'selectedSymbol',
      'severityFilters',
      'logSeverityFilters',
    ],
    },
  },
)