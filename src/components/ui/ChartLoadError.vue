<template>
  <div class="chart-load-error">
    <strong>Visualization failed to load</strong>
    <p>Refresh or switch chart mode to retry.</p>
  </div>
</template>

<style scoped>
.chart-load-error {
  min-height: 220px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 1rem;
  color: var(--neon-red);
  border-radius: 1rem;
  background: rgba(244, 63, 94, 0.06);
  border: 1px solid rgba(244, 63, 94, 0.18);
}

.chart-load-error p {
  margin: 0.3rem 0 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
}
</style>