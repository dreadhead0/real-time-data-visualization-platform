import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StreamStatus } from '@/lib/StreamManager'

export const useStreamStore = defineStore('stream', () => {
  const paused = ref(false)
  const status = ref<StreamStatus>('disconnected')
  const lastHeartbeat = ref<number | null>(null)
  const messageCount = ref(0)
  const errorCount = ref(0)

  const isLive = computed(() => !paused.value && status.value === 'connected')
  const statusLabel = computed(() => {
    if (paused.value) return 'Paused'
    return { connecting: 'Connecting…', connected: 'Live', disconnected: 'Offline', error: 'Error' }[status.value]
  })

  function pause(): void   { paused.value = true }
  function resume(): void  { paused.value = false }
  function toggle(): void  { paused.value = !paused.value }

  function setStatus(s: StreamStatus): void {
    status.value = s
  }

  function recordHeartbeat(): void {
    lastHeartbeat.value = Date.now()
  }

  function incrementMessages(): void {
    messageCount.value++
  }

  function incrementErrors(): void {
    errorCount.value++
  }

  function reset(): void {
    messageCount.value = 0
    errorCount.value = 0
    lastHeartbeat.value = null
  }

  return {
    paused, status, lastHeartbeat, messageCount, errorCount,
    isLive, statusLabel,
    pause, resume, toggle, setStatus, recordHeartbeat, incrementMessages, incrementErrors, reset,
  }
})
