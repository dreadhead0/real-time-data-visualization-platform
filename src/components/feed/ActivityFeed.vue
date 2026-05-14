<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import { Search, Circle } from "lucide-vue-next";
import { useAlertsStore } from "@/stores/alerts";
import type { AlertSeverity } from "@/types/domain";

const store = useAlertsStore();

const autoScroll = ref(true);
const listEl = ref<HTMLDivElement | null>(null);
const tableScrollEl = ref<HTMLDivElement | null>(null);
const INITIAL_VISIBLE_EVENTS = 40;
const LOAD_STEP = 40;
const BOTTOM_THRESHOLD_PX = 80;

const visibleLimit = ref(INITIAL_VISIBLE_EVENTS);

const visibleAlerts = computed(() => {
  return store.filtered.slice(0, visibleLimit.value);
});

const canLoadMore = computed(() => {
  return visibleLimit.value < store.filtered.length;
});

function loadMoreEvents() {
  if (!canLoadMore.value) return;

  visibleLimit.value = Math.min(
    visibleLimit.value + LOAD_STEP,
    store.filtered.length,
  );
}

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: "INFO",
  warning: "WARN",
  error: "ERR ",
  critical: "CRIT",
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

watch(
  () => store.filtered.length,
  async () => {
    if (!autoScroll.value) return;
    await nextTick();
    listEl.value?.scrollTo({ top: 0 });
  },
);

watch(
  () => [store.searchQuery, store.severityFilter],
  async () => {
    visibleLimit.value = INITIAL_VISIBLE_EVENTS;
    await nextTick();
    listEl.value?.scrollTo({ top: 0 });
  },
);

function onScroll() {
  if (!listEl.value) return;

  const element = listEl.value;

  autoScroll.value = element.scrollTop < 60;

  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;

  if (distanceFromBottom < BOTTOM_THRESHOLD_PX) {
    loadMoreEvents();
  }
}

function onTableWheel(event: WheelEvent) {
  if (!tableScrollEl.value) return;

  const horizontalDelta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.shiftKey
        ? event.deltaY
        : 0;

  if (horizontalDelta === 0) return;

  tableScrollEl.value.scrollLeft += horizontalDelta;
  event.preventDefault();
}
</script>

<template>
  <div class="feed-wrapper">
    <div class="feed-header">
      <div class="feed-title-group">
        <span class="feed-title">Activity Log</span>
        <span class="feed-count">
          {{ visibleAlerts.length }}/{{ store.filtered.length }} events
        </span>
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
        <span class="search-icon">
  <Search :size="14" />
</span>
        <input
          id="activity-feed-search"
          name="activityFeedSearch"
          :value="store.searchQuery"
          placeholder="Search events…"
          class="feed-search"
          autocomplete="off"
          @input="store.setSearch(($event.target as HTMLInputElement).value)"
        />
      </div>
      <select
        id="activity-feed-severity"
        name="activityFeedSeverity"
        :value="store.severityFilter"
        class="feed-filter"
        @change="
          store.setSeverityFilter(
            ($event.target as HTMLSelectElement).value as AlertSeverity | 'all',
          )
        "
      >
        <option value="all">All Severity</option>
        <option value="critical">Critical</option>
        <option value="error">Error</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      </select>
      <button class="btn-clear" @click="store.clear">Clear</button>
    </div>

<div
  ref="tableScrollEl"
  class="feed-table-scroll"
  @wheel="onTableWheel"
>
      <div class="feed-table-inner">
        <div class="feed-table-head">
          <span>TIME</span>
          <span>SEV</span>
          <span>SOURCE</span>
          <span>METRIC</span>
          <span>MESSAGE</span>
          <span>VALUE</span>
        </div>

        <div ref="listEl" class="feed-list" @scroll="onScroll">
          <div v-if="store.filtered.length === 0" class="feed-empty">
            <span class="feed-empty-icon">
  <Circle :size="24" />
</span>
            <span>No events — stream is live</span>
          </div>

          <div
            v-for="alert in visibleAlerts"
            :key="alert.id"
            class="feed-row"
            :class="`row-${alert.severity}`"
          >
            <span class="col-time">{{ formatTime(alert.timestamp) }}</span>

            <span class="col-sev" :class="`sev-${alert.severity}`">
              <span class="sev-dot" />
              {{ SEVERITY_LABELS[alert.severity] }}
            </span>

            <span class="col-source">
              {{
                alert.metric === "cpu"
                  ? "node"
                  : alert.metric === "memory"
                    ? "worker"
                    : alert.metric === "network"
                      ? "gateway"
                      : alert.metric === "throughput"
                        ? "api"
                        : "monitor"
              }}
            </span>

            <span class="col-metric">{{ alert.metric.toUpperCase() }}</span>
            <span class="col-msg">{{ alert.message }}</span>
            <span class="col-val">{{ alert.value.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="canLoadMore"
      class="feed-load-more"
      type="button"
      @click="loadMoreEvents"
    >
      Load older events
    </button>

    <div v-else-if="store.filtered.length > 0" class="feed-end">
      End of buffered event history
    </div>

    <div
      v-if="!autoScroll"
      class="scroll-hint"
      @click="
        autoScroll = true;
        listEl?.scrollTo({ top: 0 });
      "
    >
      ↑ Jump to latest
    </div>
  </div>
</template>

<style scoped>
.feed-wrapper {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: 14px;
  overflow: hidden;
  overflow-anchor: none;
}

.feed-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 12px;
  border-bottom: 1px solid var(--border-dim);
  flex-wrap: wrap;
  gap: 10px;
}

.feed-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feed-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-primary);
}

.feed-count {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid var(--border-dim);
}

.severity-counts {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sev-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.04em;
}

.sev-crit {
  background: rgba(244, 63, 94, 0.12);
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.sev-err {
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.2);
}

.sev-warn {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.sev-info {
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.feed-controls {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--border-dim);
  align-items: center;
  justify-content: flex-start;
}

.search-wrap {
  flex: 0 1 420px;
  max-width: 420px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-dim);
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.feed-search {
  width: 100%;
  font-size: 12px;
  font-family: var(--font-mono);
  padding: 6px 10px 6px 30px;
  border: 1px solid var(--border-dim);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.feed-search::placeholder {
  color: var(--text-dim);
}

.feed-search:focus {
  border-color: rgba(56, 189, 248, 0.3);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.08);
}

.feed-filter {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 6px 8px;
  border: 1px solid var(--border-dim);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  outline: none;
  cursor: pointer;
}

.feed-filter option {
  background: var(--bg-surface);
}

.btn-clear {
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 600;
  padding: 6px 12px;
  border: 1px solid var(--border-dim);
  border-radius: 7px;
  background: transparent;
  color: var(--text-dim);
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}

.btn-clear:hover {
  background: rgba(244, 63, 94, 0.08);
  color: var(--neon-red);
  border-color: rgba(244, 63, 94, 0.2);
}

/* Desktop: no horizontal scroll, table fills card */
.feed-table-scroll {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  border-bottom: 1px solid var(--border-dim);
}

.feed-table-inner {
  --feed-cols: 92px 84px 120px 140px minmax(240px, 1fr) 104px;

  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.feed-table-head,
.feed-row {
  display: grid;
  grid-template-columns: var(--feed-cols);
  column-gap: 1rem;
  align-items: center;
  width: 100%;
  min-width: 0;
  padding-left: 18px;
  padding-right: 28px;
}

.feed-table-head {
  flex: 0 0 auto;
  padding-top: 7px;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--border-dim);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.01);
}

.feed-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  overflow-anchor: none;
}

.feed-row {
  min-height: 34px;
  padding-top: 7px;
  padding-bottom: 7px;
  font-size: 11px;
  font-family: var(--font-mono);
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  transition: background 0.1s;
  animation: slide-in-top 0.2s ease;
}

.feed-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.feed-empty {
  width: 100%;
  min-height: 260px;
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

.feed-empty-icon {
  display: inline-flex;
  opacity: 0.4;
}

.row-critical {
  border-left: 2px solid var(--neon-red);
  background: rgba(244, 63, 94, 0.03);
}

.row-error {
  border-left: 2px solid #fb923c;
}

.row-warning {
  border-left: 2px solid var(--neon-amber);
  background: rgba(251, 191, 36, 0.02);
}

.row-info {
  border-left: 2px solid transparent;
}

.col-time,
.col-sev,
.col-source,
.col-metric,
.col-msg,
.col-val {
  min-width: 0;
}

.col-time {
  color: var(--text-dim);
  font-size: 10px;
}

.col-sev {
  width: fit-content;
  max-width: max-content;
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0.15rem 0.35rem;
  border-radius: 0.35rem;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.sev-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.col-source,
.col-metric {
  color: var(--text-secondary);
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-msg {
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
}

.feed-table-head span:last-child,
.col-val {
  color: var(--text-secondary);
  justify-self: end;
  text-align: right;
  width: 100%;
  padding-right: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.col-sev.sev-critical {
  color: var(--neon-red);
  background: rgba(244, 63, 94, 0.09);
}

.col-sev.sev-error {
  color: #fb923c;
  background: rgba(251, 146, 60, 0.09);
}

.col-sev.sev-warning {
  color: var(--neon-amber);
  background: rgba(251, 191, 36, 0.09);
}

.col-sev.sev-info {
  color: var(--neon-blue);
  background: rgba(56, 189, 248, 0.09);
}

.col-sev.sev-critical .sev-dot {
  background: var(--neon-red);
  box-shadow: 0 0 5px var(--neon-red);
}

.col-sev.sev-error .sev-dot {
  background: #fb923c;
  box-shadow: 0 0 5px #fb923c;
}

.col-sev.sev-warning .sev-dot {
  background: var(--neon-amber);
  box-shadow: 0 0 5px var(--neon-amber);
}

.col-sev.sev-info .sev-dot {
  background: var(--neon-blue);
  box-shadow: 0 0 5px var(--neon-blue);
}

.feed-load-more,
.feed-end,
.scroll-hint {
  flex: 0 0 auto;
}

.feed-load-more {
  width: min(360px, calc(100% - 24px));
  margin: 10px auto;
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, 0.24);
  background: rgba(56, 189, 248, 0.07);
  color: var(--neon-blue);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
}

.feed-load-more:hover {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.38);
}

.feed-end {
  width: min(420px, calc(100% - 24px));
  margin: 10px auto;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.06);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 10px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

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

.scroll-hint:hover {
  background: rgba(56, 189, 248, 0.06);
}

/* Mobile/tablet: horizontal table scroll only here */
@media (max-width: 900px) {
.feed-table-scroll {
  --mobile-feed-width: 920px;

  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y;
  overscroll-behavior-x: contain;

  /* hide visible horizontal scrollbar, keep scroll working */
  scrollbar-width: none;
}

.feed-table-scroll::-webkit-scrollbar {
  display: none;
}
  .feed-table-inner {
    --feed-cols: 96px 84px 120px 150px 270px 120px;

    width: var(--mobile-feed-width);
    min-width: var(--mobile-feed-width);
    max-width: none;
    height: 100%;
  }

  .feed-table-head,
  .feed-row {
    width: var(--mobile-feed-width);
    min-width: var(--mobile-feed-width);
    max-width: none;
    grid-template-columns: var(--feed-cols) !important;
    padding-left: 18px;
    padding-right: 42px;
  }

  .feed-list,
  .feed-empty {
    width: var(--mobile-feed-width);
    min-width: var(--mobile-feed-width);
    max-width: none;
  }

  .feed-list {
    overflow-y: auto;
    overflow-x: visible;
  }

  .feed-controls {
    flex-wrap: wrap;
  }

  .feed-controls .search-wrap {
    flex: 1 1 100%;
    max-width: none;
  }

  .feed-filter,
  .btn-clear {
    flex: 1;
  }

  .col-val {
    padding-right: 1.5rem;
  }
}
</style>
