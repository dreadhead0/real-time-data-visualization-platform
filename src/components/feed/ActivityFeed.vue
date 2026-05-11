<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import type { AlertSeverity } from '@/types/domain'

const store = useAlertsStore()
const listEl = ref<HTMLDivElement | null>(null)
const autoScroll = ref(true)

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: 'INFO', warning: 'WARN', error: 'ERR ', critical: 'CRIT',
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

watch(
  () => store.filtered.length,
  async () => {
    if (!autoScroll.value) return
    await nextTick()
    listEl.value?.scrollTo({ top: 0, behavior: 'smooth' })
  },
)

function onScroll() {
  if (!listEl.value) return
  autoScroll.value = listEl.value.scrollTop < 60
}
</script>

<template>
  <div class="feed-wrapper">
    <div class="feed-header">
      <div class="feed-title-group">
        <span class="feed-title">Activity Log</span>
        <span class="feed-count">{{ store.filtered.length }} events</span>
      </div>
      <div class="severity-counts">
        <span class="sev-badge sev-crit">{{ store.counts.critical }} CRIT</span>
        <span class="sev-badge sev-err">{{ store.counts.error }} ERR</span>
        <span class="sev-badge sev-warn">{{ store.counts.warning }} WARN</span>
        <span class="sev-badge sev-info">{{ store.counts.info }} INFO</span>
      </div>
    </div>

    <div class="feed-controls">
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input
          :value="store.searchQuery"
          placeholder="Search events…"
          class="feed-search"
          @input="store.setSearch(($event.target as HTMLInputElement).value)"
        />
      </div>
      <select
        :value="store.severityFilter"
        class="feed-filter"
        @change="store.setSeverityFilter(($event.target as HTMLSelectElement).value as AlertSeverity | 'all')"
      >
        <option value="all">All Severity</option>
        <option value="critical">Critical</option>
        <option value="error">Error</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      </select>
      <button class="btn-clear" @click="store.clear">Clear</button>
    </div>

    <div class="feed-table-head">
      <span>TIME</span>
      <span>SEV</span>
      <span>METRIC</span>
      <span>MESSAGE</span>
      <span>VALUE</span>
    </div>

    <div ref="listEl" class="feed-list" @scroll="onScroll">
      <div v-if="store.filtered.length === 0" class="feed-empty">
        <span class="feed-empty-icon">◎</span>
        <span>No events — stream is live</span>
      </div>
      <div
        v-for="alert in store.filtered"
        :key="alert.id"
        class="feed-row"
        :class="`row-${alert.severity}`"
      >
        <span class="col-time">{{ formatTime(alert.timestamp) }}</span>
        <span class="col-sev" :class="`sev-${alert.severity}`">
          <span class="sev-dot" />
          {{ SEVERITY_LABELS[alert.severity] }}
        </span>
        <span class="col-metric">{{ alert.metric.toUpperCase() }}</span>
        <span class="col-msg">{{ alert.message }}</span>
        <span class="col-val">{{ alert.value.toFixed(1) }}</span>
      </div>
    </div>

    <div v-if="!autoScroll" class="scroll-hint" @click="autoScroll = true; listEl?.scrollTo({ top: 0 })">
      ↑ Jump to latest
    </div>
  </div>
</template>

<style scoped>
.feed-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: 14px;
  overflow: hidden;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 12px;
  border-bottom: 1px solid var(--border-dim);
  flex-wrap: wrap;
  gap: 10px;
}

.feed-title-group { display: flex; align-items: center; gap: 10px; }
.feed-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-primary); }
.feed-count { font-size: 10px; font-family: var(--font-mono); color: var(--text-dim); background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 10px; border: 1px solid var(--border-dim); }

.severity-counts { display: flex; gap: 6px; flex-wrap: wrap; }
.sev-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.04em;
}
.sev-crit { background: rgba(244,63,94,0.12); color: #f43f5e; border: 1px solid rgba(244,63,94,0.2); }
.sev-err  { background: rgba(251,146,60,0.10); color: #fb923c; border: 1px solid rgba(251,146,60,0.2); }
.sev-warn { background: rgba(251,191,36,0.10); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
.sev-info { background: rgba(56,189,248,0.10); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); }

.feed-controls {
  display: flex;
  gap: 8px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--border-dim);
  align-items: center;
}
.search-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon { position: absolute; left: 10px; color: var(--text-dim); font-size: 16px; pointer-events: none; }
.feed-search {
  width: 100%;
  font-size: 12px;
  font-family: var(--font-mono);
  padding: 6px 10px 6px 30px;
  border: 1px solid var(--border-dim);
  border-radius: 7px;
  background: rgba(255,255,255,0.03);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.feed-search::placeholder { color: var(--text-dim); }
.feed-search:focus { border-color: rgba(56,189,248,0.3); box-shadow: 0 0 0 2px rgba(56,189,248,0.08); }

.feed-filter {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 6px 8px;
  border: 1px solid var(--border-dim);
  border-radius: 7px;
  background: rgba(255,255,255,0.03);
  color: var(--text-secondary);
  outline: none;
  cursor: pointer;
}
.feed-filter option { background: var(--bg-surface); }

.btn-clear {
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 600;
  padding: 6px 12px;
  border: 1px solid var(--border-dim);
  border-radius: 7px;
  background: transparent;
  color: var(--text-dim);
  transition: background 0.15s, color 0.15s;
}
.btn-clear:hover { background: rgba(244,63,94,0.08); color: var(--neon-red); border-color: rgba(244,63,94,0.2); }

.feed-table-head {
  display: grid;
  grid-template-columns: 90px 80px 80px 1fr 60px;
  padding: 6px 18px;
  border-bottom: 1px solid var(--border-dim);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  font-family: var(--font-mono);
  background: rgba(255,255,255,0.01);
}

.feed-list {
  flex: 1;
  overflow-y: auto;
}

.feed-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 32px;
  color: var(--text-dim);
  font-size: 12px;
  font-family: var(--font-mono);
}
.feed-empty-icon { font-size: 24px; opacity: 0.4; }

.feed-row {
  display: grid;
  grid-template-columns: 90px 80px 80px 1fr 60px;
  align-items: center;
  gap: 0;
  padding: 7px 18px;
  font-size: 11px;
  font-family: var(--font-mono);
  border-bottom: 1px solid rgba(255,255,255,0.02);
  transition: background 0.1s;
  animation: slide-in-top 0.2s ease;
}
.feed-row:hover { background: rgba(255,255,255,0.02); }

.row-critical { border-left: 2px solid var(--neon-red); background: rgba(244,63,94,0.03); }
.row-error    { border-left: 2px solid #fb923c; }
.row-warning  { border-left: 2px solid var(--neon-amber); background: rgba(251,191,36,0.02); }
.row-info     { border-left: 2px solid transparent; }

.col-time { color: var(--text-dim); font-size: 10px; }

.col-sev {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.sev-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.col-sev.sev-critical .sev-dot { background: var(--neon-red); box-shadow: 0 0 5px var(--neon-red); }
.col-sev.sev-error    .sev-dot { background: #fb923c; box-shadow: 0 0 5px #fb923c; }
.col-sev.sev-warning  .sev-dot { background: var(--neon-amber); box-shadow: 0 0 5px var(--neon-amber); }
.col-sev.sev-info     .sev-dot { background: var(--neon-blue); box-shadow: 0 0 5px var(--neon-blue); }
.col-sev.sev-critical { color: var(--neon-red); }
.col-sev.sev-error    { color: #fb923c; }
.col-sev.sev-warning  { color: var(--neon-amber); }
.col-sev.sev-info     { color: var(--neon-blue); }

.col-metric { color: var(--text-secondary); font-size: 10px; }
.col-msg { color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 8px; }
.col-val { color: var(--text-secondary); text-align: right; }

.scroll-hint {
  padding: 9px;
  text-align: center;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--neon-blue);
  cursor: pointer;
  border-top: 1px solid var(--border-dim);
  transition: background 0.15s;
}
.scroll-hint:hover { background: rgba(56,189,248,0.06); }
</style>
