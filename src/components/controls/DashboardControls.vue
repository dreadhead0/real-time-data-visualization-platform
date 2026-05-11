<script setup lang="ts">
import { Pause, Play, RotateCcw } from "lucide-vue-next";
import { useStreamStore } from "@/stores/stream";
import { useMetricsStore } from "@/stores/metrics";
import { useAlertsStore } from "@/stores/alerts";
import type { TimeRange } from "@/types/domain";

const streamStore = useStreamStore();
const metricsStore = useMetricsStore();
const alertsStore = useAlertsStore();

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "Live", value: "live" },
];

function clearAll() {
  alertsStore.clear();
  metricsStore.reset();
}
</script>

<template>
  <div class="controls-bar">
    <div class="range-group" aria-label="Time range controls">
      <button
        v-for="r in TIME_RANGES"
        :key="r.value"
        class="range-btn"
        :class="{ active: metricsStore.timeRange === r.value }"
        type="button"
        @click="metricsStore.setTimeRange(r.value)"
      >
        {{ r.label }}
      </button>
    </div>

    <button
      class="btn-ctrl"
      :class="streamStore.paused ? 'btn-resume' : 'btn-pause'"
      type="button"
      @click="streamStore.toggle"
    >
      <Play v-if="streamStore.paused" :size="14" />
      <Pause v-else :size="14" />
      {{ streamStore.paused ? "Resume" : "Pause" }}
    </button>

    <button class="btn-ctrl btn-clear-log" type="button" @click="clearAll">
      <RotateCcw :size="14" />
      Clear
    </button>
  </div>
</template>

<style scoped>
.controls-bar {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.range-group {
  display: flex;
  gap: 3px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.range-btn {
  min-height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  transition:
    background 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease;
}

.range-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.055);
}

.range-btn.active {
  color: var(--neon-blue);
  background: rgba(56, 189, 248, 0.13);
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.22);
}

.btn-ctrl {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 13px;
  border-radius: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  transition:
    background 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    transform 150ms ease;
}

.btn-ctrl:hover {
  transform: translateY(-1px);
}

.btn-pause {
  color: var(--neon-amber);
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.22);
}

.btn-resume {
  color: var(--neon-green);
  background: rgba(34, 211, 160, 0.08);
  border: 1px solid rgba(34, 211, 160, 0.22);
}

.btn-clear-log {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.btn-clear-log:hover {
  color: var(--neon-red);
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.22);
}

@media (max-width: 680px) {
  .controls-bar {
    width: 100%;
  }

  .range-group {
    width: 100%;
    overflow-x: auto;
  }

  .range-btn {
    flex: 1;
  }
}
</style>
