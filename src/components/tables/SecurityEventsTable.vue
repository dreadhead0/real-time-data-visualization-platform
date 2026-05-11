<script setup lang="ts">
import { computed } from "vue";
import { AlertTriangle, ShieldAlert } from "lucide-vue-next";
import { useAnalyticsStore } from "@/stores/analytics";

const analytics = useAnalyticsStore();

const rows = computed(() => analytics.visibleSecurityEvents.slice(0, 80));

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
        <span class="chart-card-title">Security Event Stream</span>
        <p>
          Filtered live security incidents, source IPs, locations, and risk
          scores
        </p>
      </div>

      <span class="chart-tag tag-red"> {{ rows.length }} visible </span>
    </div>

    <div v-if="rows.length === 0" class="empty-state">
      <ShieldAlert :size="24" />
      <strong>No matching security events</strong>
      <span>Try enabling more severity filters or clearing search.</span>
    </div>

    <div v-else class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Severity</th>
            <th>Type</th>
            <th>Source IP</th>
            <th>Location</th>
            <th>Risk</th>
            <th>Message</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="event in rows" :key="event.id">
            <td class="mono">{{ formatTime(event.timestamp) }}</td>
            <td>
              <span class="severity-badge" :class="`sev-${event.severity}`">
                <AlertTriangle
                  v-if="event.severity === 'critical'"
                  :size="12"
                />
                {{ event.severity }}
              </span>
            </td>
            <td class="mono">{{ event.type.replace("_", " ") }}</td>
            <td class="mono">{{ event.sourceIp }}</td>
            <td>{{ event.city }}, {{ event.country }}</td>
            <td class="mono risk-cell">{{ event.riskScore.toFixed(1) }}</td>
            <td class="message-cell">{{ event.message }}</td>
          </tr>
        </tbody>
      </table>
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

.table-scroll {
  min-height: 0;
  max-height: 440px;
  overflow: auto;
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.09);
}

table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgba(15, 23, 42, 0.96);
}

th,
td {
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  text-align: left;
  font-size: 0.78rem;
}

th {
  color: var(--text-secondary);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

td {
  color: var(--text-primary);
}

tbody tr {
  transition: background 140ms ease;
}

tbody tr:hover {
  background: rgba(56, 189, 248, 0.045);
}

.mono {
  font-family: var(--font-mono);
}

.severity-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 1.5rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 900;
  text-transform: uppercase;
}

.sev-low {
  color: var(--neon-blue);
  background: rgba(56, 189, 248, 0.09);
}

.sev-medium {
  color: var(--neon-amber);
  background: rgba(251, 191, 36, 0.09);
}

.sev-high {
  color: #fb7185;
  background: rgba(251, 113, 133, 0.09);
}

.sev-critical {
  color: var(--neon-red);
  background: rgba(244, 63, 94, 0.1);
}

.risk-cell {
  font-weight: 900;
}

.message-cell {
  color: var(--text-secondary);
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
</style>
