<script setup lang="ts">
import {
  BarChart3,
  CheckCheck,
  Eye,
  EyeOff,
  Filter,
  Globe2,
  Layers3,
  LineChart,
  Network,
  RotateCcw,
  Search,
  ShieldAlert,
  TerminalSquare,
  TrendingUp,
} from "lucide-vue-next";
import { useAnalyticsStore } from "@/stores/analytics";
import type { AdvancedChartMode, DatasetVisibility } from "@/types/analytics";

const analytics = useAnalyticsStore();

const chartModes: {
  label: string;
  value: AdvancedChartMode;
  icon: typeof BarChart3;
}[] = [
  { label: "Overview", value: "overview", icon: BarChart3 },
  { label: "Security", value: "security", icon: ShieldAlert },
  { label: "Geography", value: "geography", icon: Globe2 },
  { label: "Markets", value: "markets", icon: TrendingUp },
  { label: "Network", value: "network", icon: Network },
  { label: "Logs", value: "logs", icon: TerminalSquare },
];

const datasets: {
  label: string;
  value: keyof DatasetVisibility;
  icon: typeof Layers3;
}[] = [
  { label: "Infrastructure", value: "infrastructure", icon: LineChart },
  { label: "Security", value: "security", icon: ShieldAlert },
  { label: "Geography", value: "geography", icon: Globe2 },
  { label: "Markets", value: "markets", icon: TrendingUp },
  { label: "Network", value: "networkGraph", icon: Network },
  { label: "Logs", value: "logs", icon: TerminalSquare },
];

const securitySeverities = ["low", "medium", "high", "critical"] as const;
const logSeverities = [
  "debug",
  "info",
  "warning",
  "error",
  "critical",
] as const;
</script>

<template>
  <section class="advanced-controls">
    <div class="controls-header">
      <div>
        <p class="eyebrow">Interactive controls</p>
        <h2>
          <Filter :size="19" />
          Dashboard Control Center
        </h2>
      </div>

      <div class="controls-actions">
        <button
          class="mini-action"
          type="button"
          @click="analytics.enableAllDatasets"
        >
          <Eye :size="14" />
          Show all
        </button>

        <button
          class="mini-action"
          type="button"
          @click="analytics.disableAllDatasets"
        >
          <EyeOff :size="14" />
          Hide all
        </button>

        <button
          class="mini-action danger"
          type="button"
          @click="analytics.resetFilters"
        >
          <RotateCcw :size="14" />
          Reset filters
        </button>
      </div>
    </div>

    <div class="controls-grid">
      <article class="control-panel">
        <span class="control-title">Chart Mode</span>

        <div class="mode-grid">
          <button
            v-for="mode in chartModes"
            :key="mode.value"
            class="mode-button"
            :class="{ active: analytics.chartMode === mode.value }"
            type="button"
            @click="analytics.setChartMode(mode.value)"
          >
            <component :is="mode.icon" :size="15" />
            {{ mode.label }}
          </button>
        </div>
      </article>

      <article class="control-panel">
        <span class="control-title">Datasets</span>

        <div class="dataset-grid">
          <button
            v-for="dataset in datasets"
            :key="dataset.value"
            class="dataset-pill"
            :class="{ active: analytics.datasetVisibility[dataset.value] }"
            type="button"
            @click="analytics.toggleDataset(dataset.value)"
          >
            <component :is="dataset.icon" :size="14" />
            {{ dataset.label }}
            <CheckCheck
              v-if="analytics.datasetVisibility[dataset.value]"
              :size="13"
            />
          </button>
        </div>
      </article>

      <article class="control-panel">
        <span class="control-title">Security Inspector</span>

        <label class="search-box">
          <Search :size="14" />
          <input
            :value="analytics.securitySearch"
            type="search"
            placeholder="Search IP, country, city, attack type..."
            @input="
              analytics.setSecuritySearch(
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </label>

        <div class="severity-row">
          <button
            v-for="severity in securitySeverities"
            :key="severity"
            class="severity-chip"
            :class="[
              `sev-${severity}`,
              { active: analytics.severityFilters[severity] },
            ]"
            type="button"
            @click="analytics.toggleSeverityFilter(severity)"
          >
            {{ severity }}
          </button>
        </div>
      </article>

      <article class="control-panel">
        <span class="control-title">Log Inspector</span>

        <label class="search-box">
          <Search :size="14" />
          <input
            :value="analytics.logSearch"
            type="search"
            placeholder="Search logs, service, severity..."
            @input="
              analytics.setLogSearch(($event.target as HTMLInputElement).value)
            "
          />
        </label>

        <div class="severity-row">
          <button
            v-for="severity in logSeverities"
            :key="severity"
            class="severity-chip"
            :class="[
              `log-${severity}`,
              { active: analytics.logSeverityFilters[severity] },
            ]"
            type="button"
            @click="analytics.toggleLogSeverityFilter(severity)"
          >
            {{ severity }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.advanced-controls {
  position: relative;
  z-index: 1;
  padding: 1rem;
  border-radius: 1.2rem;
  border: 1px solid rgba(148, 163, 184, 0.13);
  background:
    radial-gradient(
      circle at top right,
      rgba(56, 189, 248, 0.08),
      transparent 30rem
    ),
    rgba(13, 18, 32, 0.82);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.24);
}

.controls-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.controls-header h2 {
  margin: 0.3rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1rem;
  letter-spacing: -0.03em;
}

.controls-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mini-action {
  min-height: 2.15rem;
  padding: 0 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.035);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 800;
}

.mini-action:hover {
  color: var(--text-primary);
  border-color: rgba(56, 189, 248, 0.25);
  background: rgba(56, 189, 248, 0.07);
}

.mini-action.danger:hover {
  color: var(--neon-red);
  border-color: rgba(244, 63, 94, 0.25);
  background: rgba(244, 63, 94, 0.07);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.control-panel {
  min-width: 0;
  padding: 0.85rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.11);
  background: rgba(255, 255, 255, 0.025);
}

.control-title {
  display: block;
  margin-bottom: 0.65rem;
  color: var(--text-primary);
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.mode-grid,
.dataset-grid {
  display: grid;
  gap: 0.45rem;
}

.mode-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.dataset-grid {
  grid-template-columns: 1fr;
}

.mode-button,
.dataset-pill,
.severity-chip {
  border: 1px solid rgba(148, 163, 184, 0.11);
  background: rgba(15, 23, 42, 0.72);
  color: var(--text-secondary);
  transition:
    border-color 160ms ease,
    color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.mode-button:hover,
.dataset-pill:hover,
.severity-chip:hover {
  transform: translateY(-1px);
}

.mode-button {
  min-height: 2.2rem;
  padding: 0 0.55rem;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
}

.mode-button.active {
  color: var(--neon-blue);
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.26);
}

.dataset-pill {
  min-height: 2rem;
  padding: 0 0.6rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.dataset-pill.active {
  color: var(--neon-green);
  background: rgba(34, 211, 160, 0.08);
  border-color: rgba(34, 211, 160, 0.24);
}

.search-box {
  height: 2.35rem;
  padding: 0 0.65rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(148, 163, 184, 0.13);
  background: rgba(15, 23, 42, 0.75);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.search-box input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  color: var(--text-primary);
  background: transparent;
  font-size: 0.78rem;
}

.search-box input::placeholder {
  color: rgba(139, 152, 170, 0.72);
}

.severity-row {
  margin-top: 0.65rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.severity-chip {
  min-height: 1.85rem;
  padding: 0 0.6rem;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  opacity: 0.52;
}

.severity-chip.active {
  opacity: 1;
}

.sev-low.active,
.log-debug.active,
.log-info.active {
  color: var(--neon-blue);
  background: rgba(56, 189, 248, 0.09);
  border-color: rgba(56, 189, 248, 0.24);
}

.sev-medium.active,
.log-warning.active {
  color: var(--neon-amber);
  background: rgba(251, 191, 36, 0.09);
  border-color: rgba(251, 191, 36, 0.24);
}

.sev-high.active,
.log-error.active {
  color: #fb7185;
  background: rgba(251, 113, 133, 0.09);
  border-color: rgba(251, 113, 133, 0.24);
}

.sev-critical.active,
.log-critical.active {
  color: var(--neon-red);
  background: rgba(244, 63, 94, 0.09);
  border-color: rgba(244, 63, 94, 0.24);
}

@media (max-width: 1380px) {
  .controls-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .controls-header {
    flex-direction: column;
  }

  .controls-actions {
    width: 100%;
    justify-content: stretch;
  }

  .mini-action {
    flex: 1;
  }

  .controls-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 460px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }
}
</style>
