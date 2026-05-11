<script setup lang="ts">
import { computed } from "vue";
import { TerminalSquare } from "lucide-vue-next";
import { useAnalyticsStore } from "@/stores/analytics";

const analytics = useAnalyticsStore();

const rows = computed(() => analytics.visibleLogs.slice(0, 120));

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
</script>

<template>
  <article class="data-table-card">
    <div class="table-card-head">
      <div>
        <span class="chart-card-title">System Log Explorer</span>
        <p>
          Searchable real-time logs from gateway, API, auth, workers, and
          database services
        </p>
      </div>

      <span class="chart-tag tag-cyan"> {{ rows.length }} visible </span>
    </div>

    <div v-if="rows.length === 0" class="empty-state">
      <TerminalSquare :size="24" />
      <strong>No matching logs</strong>
      <span>Try enabling more log severities or clearing search.</span>
    </div>

    <div v-else class="log-stream">
      <div
        v-for="log in rows"
        :key="log.id"
        class="log-row"
        :class="`log-${log.severity}`"
      >
        <span class="log-time">{{ formatTime(log.timestamp) }}</span>
        <span class="log-severity">{{ log.severity }}</span>
        <span class="log-source">{{ log.source }}</span>
        <span class="log-message">{{ log.message }}</span>
        <span class="log-duration">{{ log.durationMs }}ms</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.data-table-card {
  min-width: 0;
  min-height: 360px;
  padding: 1rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.035),
      rgba(255, 255, 255, 0.012)
    ),
    rgba(13, 18, 32, 0.82);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.table-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.table-card-head p {
  margin-top: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.log-stream {
  max-height: 440px;
  overflow: auto;
  display: grid;
  gap: 0.4rem;
  padding-right: 0.25rem;
}

.log-row {
  display: grid;
  grid-template-columns: 78px 86px 86px minmax(0, 1fr) 70px;
  gap: 0.65rem;
  align-items: center;
  padding: 0.65rem 0.75rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(148, 163, 184, 0.09);
  background: rgba(15, 23, 42, 0.62);
  font-size: 0.76rem;
  transition:
    transform 140ms ease,
    background 140ms ease,
    border-color 140ms ease;
}

.log-row:hover {
  transform: translateX(2px);
  background: rgba(56, 189, 248, 0.045);
  border-color: rgba(56, 189, 248, 0.13);
}

.log-time,
.log-severity,
.log-source,
.log-duration {
  font-family: var(--font-mono);
}

.log-time,
.log-source,
.log-duration {
  color: var(--text-secondary);
}

.log-severity {
  width: fit-content;
  padding: 0.22rem 0.45rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;
}

.log-message {
  min-width: 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-debug .log-severity,
.log-info .log-severity {
  color: var(--neon-blue);
  background: rgba(56, 189, 248, 0.09);
}

.log-warning .log-severity {
  color: var(--neon-amber);
  background: rgba(251, 191, 36, 0.09);
}

.log-error .log-severity {
  color: #fb7185;
  background: rgba(251, 113, 133, 0.09);
}

.log-critical .log-severity {
  color: var(--neon-red);
  background: rgba(244, 63, 94, 0.1);
}

.empty-state {
  flex: 1;
  min-height: 250px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.35rem;
  color: var(--text-secondary);
  text-align: center;
}

.empty-state strong {
  color: var(--text-primary);
}

@media (max-width: 700px) {
  .log-row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .log-message {
    white-space: normal;
  }
}
</style>
