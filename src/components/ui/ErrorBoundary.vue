<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)
const info  = ref('')

onErrorCaptured((err, _instance, errorInfo) => {
  error.value = err instanceof Error ? err : new Error(String(err))
  info.value  = errorInfo
  console.error('[ErrorBoundary]', err, errorInfo)
  return false // prevent further propagation
})

function reset() {
  error.value = null
  info.value  = ''
}
</script>

<template>
  <div v-if="error" class="error-card">
    <p class="error-title">Something went wrong</p>
    <p class="error-msg">{{ error.message }}</p>
    <p v-if="info" class="error-info">{{ info }}</p>
    <button class="error-retry" @click="reset">Retry</button>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-card {
  padding: 24px;
  border: 1px solid var(--color-border-danger);
  border-radius: 12px;
  background: var(--color-background-danger);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.error-title { font-weight: 500; color: var(--color-text-danger); margin: 0; }
.error-msg   { font-size: 13px; color: var(--color-text-primary); margin: 0; }
.error-info  { font-size: 11px; color: var(--color-text-tertiary); font-family: var(--font-mono); margin: 0; }
.error-retry {
  align-self: flex-start;
  font-size: 12px;
  padding: 5px 12px;
  border: 1px solid var(--color-border-danger);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-danger);
  cursor: pointer;
}
</style>
