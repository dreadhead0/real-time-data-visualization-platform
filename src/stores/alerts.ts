import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AlertEvent, AlertSeverity } from '@/types/domain'

const MAX_ALERTS = 500

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref<AlertEvent[]>([])
  const searchQuery = ref('')
  const severityFilter = ref<AlertSeverity | 'all'>('all')

  function push(alert: AlertEvent): void {
    alerts.value.unshift(alert) // newest first
    if (alerts.value.length > MAX_ALERTS) {
      alerts.value = alerts.value.slice(0, MAX_ALERTS)
    }
  }

  function pushBatch(batch: AlertEvent[]): void {
    alerts.value.unshift(...batch)
    if (alerts.value.length > MAX_ALERTS) {
      alerts.value = alerts.value.slice(0, MAX_ALERTS)
    }
  }

  const filtered = computed(() => {
    let list = alerts.value
    if (severityFilter.value !== 'all') {
      list = list.filter((a) => a.severity === severityFilter.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(
        (a) => a.message.toLowerCase().includes(q) || a.metric.toLowerCase().includes(q),
      )
    }
    return list
  })

  const counts = computed(() => ({
    info:     alerts.value.filter((a) => a.severity === 'info').length,
    warning:  alerts.value.filter((a) => a.severity === 'warning').length,
    error:    alerts.value.filter((a) => a.severity === 'error').length,
    critical: alerts.value.filter((a) => a.severity === 'critical').length,
  }))

  function clear(): void {
    alerts.value = []
  }

  function setSearch(q: string): void {
    searchQuery.value = q
  }

  function setSeverityFilter(s: AlertSeverity | 'all'): void {
    severityFilter.value = s
  }

  return { alerts, searchQuery, severityFilter, filtered, counts, push, pushBatch, clear, setSearch, setSeverityFilter }
})
