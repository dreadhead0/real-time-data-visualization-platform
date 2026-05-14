<template>
  <div class="chart-loading">
    <span class="loader-ring" />
    <div>
      <strong>Loading visualization</strong>
      <p>Preparing live chart module…</p>
    </div>
  </div>
</template>

<style scoped>
.chart-loading {
  min-height: 220px;
  display: grid;
  place-items: center;
  gap: 0.75rem;
  text-align: center;
  color: var(--text-secondary);
}

.loader-ring {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 3px solid rgba(148, 163, 184, 0.16);
  border-top-color: var(--neon-blue);
  animation: spin 800ms linear infinite;
}

.chart-loading strong {
  display: block;
  color: var(--text-primary);
  font-size: 0.8rem;
}

.chart-loading p {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>