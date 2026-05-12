<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import {
  AlertTriangle,
  CircleGauge,
  Clock3,
  Cpu,
  Database,
  FileText,
  Globe2,
  MemoryStick,
  Network,
  RadioTower,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-vue-next";

import { useMetricsStore } from "@/stores/metrics";
import { useAlertsStore } from "@/stores/alerts";
import { useAnalyticsStore } from "@/stores/analytics";
import { useStreamConnection } from "@/composables/useStreamConnection";
import { useAnalyticsStream } from "@/composables/useAnalyticsStream";

const HeatmapChart = defineAsyncComponent(
  () => import("@/components/charts/HeatmapChart.vue"),
);
const CandlestickChart = defineAsyncComponent(
  () => import("@/components/charts/CandlestickChart.vue"),
);
const RadarHealthChart = defineAsyncComponent(
  () => import("@/components/charts/RadarHealthChart.vue"),
);
const NetworkGraphChart = defineAsyncComponent(
  () => import("@/components/charts/NetworkGraphChart.vue"),
);
const GeoTrafficMap = defineAsyncComponent(
  () => import("@/components/charts/GeoTrafficMap.vue"),
);

import AdvancedDashboardControls from "@/components/controls/AdvancedDashboardControls.vue";
import SecurityEventsTable from "@/components/tables/SecurityEventsTable.vue";
import SystemLogsTable from "@/components/tables/SystemLogsTable.vue";

import MetricCard from "@/components/ui/MetricCard.vue";
import LineAreaChart from "@/components/charts/LineAreaChart.vue";
import BarChart from "@/components/charts/BarChart.vue";
import ActivityFeed from "@/components/feed/ActivityFeed.vue";
import DashboardControls from "@/components/controls/DashboardControls.vue";
import ProcessTable from "@/components/tables/ProcessTable.vue";
import ErrorBoundary from "@/components/ui/ErrorBoundary.vue";

useStreamConnection();
useAnalyticsStream();

const metrics = useMetricsStore();
const alerts = useAlertsStore();
const analytics = useAnalyticsStore();

const cpuSeries = computed(() => metrics.getSeriesData("cpu"));
const memorySeries = computed(() => metrics.getSeriesData("memory"));
const networkSeries = computed(() => metrics.getSeriesData("network"));

const barLabels = ["CPU", "Memory", "Network", "Throughput"];
const barValues = computed(() => [
  metrics.summary.cpu,
  metrics.summary.memory,
  metrics.summary.network,
  metrics.summary.throughput,
]);

const selectedMarketSymbol = computed(() => analytics.selectedSymbol);

const availableSymbols = computed(() => {
  const symbols = analytics.symbols;
  return symbols.length > 0
    ? symbols
    : ["BTC-USD", "ETH-USD", "AAPL", "NVDA", "TSLA", "MSFT"];
});

const latestMarketTick = computed(() => {
  return analytics.marketTicks.find(
    (tick) => tick.symbol === analytics.selectedSymbol,
  );
});

const alertBanner = computed(() => {
  const s = metrics.summary;
  const security = analytics.securitySummary;

  if (security.critical > 0) {
    return {
      msg: `CRITICAL — ${security.critical} security incident(s) detected · Avg risk ${security.avgRisk}`,
      level: "crit",
      icon: ShieldAlert,
    };
  }

  if (s.cpu >= 90 || s.errorRate >= 8) {
    return {
      msg: `CRITICAL — CPU ${s.cpu.toFixed(0)}% · Error rate ${s.errorRate.toFixed(1)}%`,
      level: "crit",
      icon: ShieldAlert,
    };
  }

  if (s.cpu >= 75 || s.errorRate >= 3 || security.high > 0) {
    return {
      msg: `WARNING — CPU ${s.cpu.toFixed(0)}% · High-risk events ${security.high}`,
      level: "warn",
      icon: AlertTriangle,
    };
  }

  if (alerts.counts.critical > 0) {
    return {
      msg: `${alerts.counts.critical} critical alert(s) detected`,
      level: "crit",
      icon: ShieldAlert,
    };
  }

  return null;
});

const clockStr = ref("");
let clockTimer = 0;

function updateClock() {
  clockStr.value = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

onMounted(() => {
  updateClock();
  clockTimer = window.setInterval(updateClock, 1000);
});

onUnmounted(() => {
  clearInterval(clockTimer);
});

const METRIC_CARDS = computed(() => [
  {
    label: "CPU Usage",
    value: metrics.summary.cpu,
    unit: "%",
    icon: Cpu,
    color: "#38bdf8",
    description: "Processor load",
    decimals: 1,
    tw: 75,
    tc: 90,
  },
  {
    label: "Memory Used",
    value: metrics.summary.memory,
    unit: "%",
    icon: MemoryStick,
    color: "#22c55e",
    description: "RAM utilization",
    decimals: 1,
    tw: 80,
    tc: 95,
  },
  {
    label: "Network I/O",
    value: metrics.summary.network,
    unit: "%",
    icon: Network,
    color: "#06b6d4",
    description: "Traffic saturation",
    decimals: 1,
    tw: 70,
    tc: 90,
  },
  {
    label: "Latency",
    value: metrics.summary.latency,
    unit: "ms",
    icon: Clock3,
    color: "#a78bfa",
    description: "Response time",
    decimals: 0,
    tw: 300,
    tc: 600,
  },
  {
    label: "Throughput",
    value: metrics.summary.throughput,
    unit: "%",
    icon: Zap,
    color: "#fbbf24",
    description: "Request capacity",
    decimals: 1,
    tw: 20,
    tc: 10,
  },
  {
    label: "Error Rate",
    value: metrics.summary.errorRate,
    unit: "%",
    icon: XCircle,
    color: "#f43f5e",
    description: "Failed requests",
    decimals: 2,
    tw: 3,
    tc: 8,
  },
]);

const healthCards = computed(() => [
  {
    label: "Critical Alerts",
    value: alerts.counts.critical,
    icon: ShieldAlert,
    tone: "danger",
  },
  {
    label: "Security Events",
    value: analytics.securitySummary.total,
    icon: RadioTower,
    tone: "info",
  },
  {
    label: "Geo Regions",
    value: analytics.geoSummary.countries,
    icon: Globe2,
    tone: "blue",
  },
  {
    label: "Market Symbols",
    value: analytics.marketSummary.tracked,
    icon: TrendingUp,
    tone: "green",
  },
  {
    label: "System Logs",
    value: analytics.logSummary.total,
    icon: FileText,
    tone: "info",
  },
  {
    label: "Datasets",
    value: Object.values(analytics.datasetVisibility).filter(Boolean).length,
    icon: Database,
    tone: "green",
  },
  {
    label: "Load",
    value: `${metrics.summary.cpu.toFixed(0)}%`,
    icon: CircleGauge,
    tone: "blue",
  },
]);
</script>

<template>
  <section class="dashboard">
    <div class="grid-bg" aria-hidden="true" />

    <div class="dashboard-hero">
      <div class="hero-copy">
        <p class="eyebrow">PulseOps Analytics</p>
        <h1>Real-time infrastructure command center</h1>
        <p>
          Live CPU, memory, network, process, security, market, geographic, and
          log intelligence.
        </p>
      </div>

      <div class="hero-actions">
        <DashboardControls />

        <div class="clock-card">
          <span class="live-pulse" />
          <div>
            <strong>{{ clockStr }}</strong>
            <span>Live stream</span>
          </div>
        </div>
      </div>
    </div>

    <Transition name="banner">
      <div
        v-if="alertBanner"
        class="alert-banner"
        :class="`banner-${alertBanner.level}`"
      >
        <component :is="alertBanner.icon" :size="18" />
        <span class="banner-msg">{{ alertBanner.msg }}</span>
        <span class="banner-hint">Inspect activity feed</span>
      </div>
    </Transition>

    <main class="dashboard-body">
      <div class="controls-collapse-shell">
        <button
          class="controls-toggle"
          type="button"
          @click="analytics.toggleControls"
        >
          <span>
            <SlidersHorizontal :size="16" />
            {{ analytics.controlsOpen ? "Hide controls" : "Show controls" }}
          </span>

          <small> {{ analytics.chartMode }} mode </small>
        </button>

        <Transition name="controls-collapse">
          <AdvancedDashboardControls v-if="analytics.controlsOpen" />
        </Transition>
      </div>

      <section class="health-strip">
        <article
          v-for="item in healthCards"
          :key="item.label"
          class="health-card"
          :class="`health-${item.tone}`"
        >
          <component :is="item.icon" :size="18" />
          <div>
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </article>
      </section>

      <section class="cards-row">
        <ErrorBoundary>
          <MetricCard
            v-for="card in METRIC_CARDS"
            :key="card.label"
            v-bind="card"
            :threshold-warn="card.tw"
            :threshold-crit="card.tc"
          />
        </ErrorBoundary>
      </section>

      <section
        v-if="
          analytics.chartMode === 'overview' ||
          analytics.chartMode === 'network'
        "
        class="charts-grid"
      >
        <article class="chart-card chart-wide">
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">CPU Utilization</span>
              <p>Rolling processor pressure</p>
            </div>
            <span class="chart-tag tag-blue"
              >{{ metrics.summary.cpu.toFixed(1) }}%</span
            >
          </div>

          <ErrorBoundary>
            <LineAreaChart
              :series-data="cpuSeries"
              metric="cpu"
              color="#38bdf8"
              unit="%"
            />
          </ErrorBoundary>
        </article>

        <article class="chart-card chart-wide">
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">Memory Pressure</span>
              <p>RAM usage trend</p>
            </div>
            <span class="chart-tag tag-green"
              >{{ metrics.summary.memory.toFixed(1) }}%</span
            >
          </div>

          <ErrorBoundary>
            <LineAreaChart
              :series-data="memorySeries"
              metric="memory"
              color="#22c55e"
              unit="%"
            />
          </ErrorBoundary>
        </article>

        <article class="chart-card">
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">Network I/O</span>
              <p>Traffic saturation</p>
            </div>
            <span class="chart-tag tag-cyan"
              >{{ metrics.summary.network.toFixed(1) }}%</span
            >
          </div>

          <ErrorBoundary>
            <LineAreaChart
              :series-data="networkSeries"
              metric="network"
              color="#06b6d4"
              unit="%"
            />
          </ErrorBoundary>
        </article>

        <article class="chart-card">
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">Resource Snapshot</span>
              <p>Current system mix</p>
            </div>
            <span class="chart-tag">current</span>
          </div>

          <ErrorBoundary>
            <BarChart :labels="barLabels" :values="barValues" unit="%" />
          </ErrorBoundary>
        </article>
      </section>

      <section class="advanced-grid">
        <article
          v-if="
            analytics.datasetVisibility.security &&
            ['overview', 'security', 'logs'].includes(analytics.chartMode)
          "
          class="chart-card chart-wide"
        >
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">Operational Heatmap</span>
              <p>
                Streaming intensity across infrastructure, security, logs, and
                markets
              </p>
            </div>
            <span class="chart-tag tag-cyan"
              >{{ analytics.heatmapCells.length }} cells</span
            >
          </div>

          <ErrorBoundary>
            <HeatmapChart :cells="analytics.heatmapCells" />
          </ErrorBoundary>
        </article>

        <article
          v-if="
            analytics.datasetVisibility.markets &&
            ['overview', 'markets'].includes(analytics.chartMode)
          "
          class="chart-card chart-wide"
        >
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">Market Candlestick</span>
              <p>Simulated real-time OHLC and volume stream</p>
            </div>

            <div class="chart-inline-controls">
              <select
                class="chart-select"
                :value="analytics.selectedSymbol"
                @change="
                  analytics.setSelectedSymbol(
                    ($event.target as HTMLSelectElement).value,
                  )
                "
              >
                <option
                  v-for="symbol in availableSymbols"
                  :key="symbol"
                  :value="symbol"
                >
                  {{ symbol }}
                </option>
              </select>

              <span
                class="chart-tag"
                :class="
                  latestMarketTick && latestMarketTick.changePercent >= 0
                    ? 'tag-green'
                    : 'tag-red'
                "
              >
                {{
                  latestMarketTick
                    ? `${latestMarketTick.changePercent}%`
                    : "warming"
                }}
              </span>
            </div>
          </div>

          <ErrorBoundary>
            <CandlestickChart
              :ticks="analytics.selectedMarketTicks"
              :symbol="selectedMarketSymbol"
            />
          </ErrorBoundary>
        </article>

        <article
          v-if="
            analytics.datasetVisibility.infrastructure &&
            ['overview', 'network'].includes(analytics.chartMode)
          "
          class="chart-card"
        >
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">System Health Radar</span>
              <p>
                Performance, security, reliability, throughput, and stability
              </p>
            </div>
            <span class="chart-tag tag-blue">profile</span>
          </div>

          <ErrorBoundary>
            <RadarHealthChart :profile="analytics.radarProfile" />
          </ErrorBoundary>
        </article>

        <article
          v-if="
            analytics.datasetVisibility.geography &&
            ['overview', 'geography'].includes(analytics.chartMode)
          "
          class="chart-card"
        >
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">Geographic Traffic</span>
              <p>Longitude/latitude request and threat visualization</p>
            </div>
            <span class="chart-tag tag-green">
              {{ analytics.geoSummary.countries }} regions
            </span>
          </div>

          <ErrorBoundary>
            <GeoTrafficMap :points="analytics.geoTraffic" />
          </ErrorBoundary>
        </article>

        <article
          v-if="
            analytics.datasetVisibility.networkGraph &&
            ['overview', 'network'].includes(analytics.chartMode)
          "
          class="chart-card chart-full"
        >
          <div class="chart-card-head">
            <div>
              <span class="chart-card-title">Service Dependency Network</span>
              <p>
                Interactive draggable graph of services, traffic, latency, and
                health
              </p>
            </div>
            <span class="chart-tag tag-cyan">
              {{ analytics.serviceNodes.length }} nodes
            </span>
          </div>

          <ErrorBoundary>
            <NetworkGraphChart
              :nodes="analytics.serviceNodes"
              :edges="analytics.serviceEdges"
            />
          </ErrorBoundary>
        </article>
      </section>

      <section
        v-if="
          analytics.datasetVisibility.security ||
          analytics.datasetVisibility.logs
        "
        class="inspector-grid"
      >
        <SecurityEventsTable
          v-if="
            analytics.datasetVisibility.security &&
            ['overview', 'security'].includes(analytics.chartMode)
          "
        />

        <SystemLogsTable
          v-if="
            analytics.datasetVisibility.logs &&
            ['overview', 'logs'].includes(analytics.chartMode)
          "
        />
      </section>
      <section class="bottom-grid">
        <div class="bottom-left">
          <ErrorBoundary>
            <ProcessTable />
          </ErrorBoundary>
        </div>

        <div class="bottom-right">
          <ErrorBoundary>
            <ActivityFeed />
          </ErrorBoundary>
        </div>
      </section>
    </main>
  </section>
</template>

<style scoped>
.dashboard {
  position: relative;
  min-height: calc(100vh - 6.5rem);
  overflow: hidden;
}

.grid-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.dashboard-hero {
  position: relative;
  z-index: 1;
  margin-bottom: 1rem;
  padding: 1.35rem;
  border-radius: 1.35rem;
  border: 1px solid rgba(148, 163, 184, 0.13);
  background:
    radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.16),
      transparent 34rem
    ),
    radial-gradient(
      circle at top right,
      rgba(34, 197, 94, 0.1),
      transparent 28rem
    ),
    linear-gradient(180deg, rgba(17, 24, 39, 0.82), rgba(8, 13, 24, 0.9));
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

.hero-copy h1 {
  margin: 0.35rem 0 0.35rem;
  max-width: 800px;
  font-size: clamp(1.8rem, 3.5vw, 3.8rem);
  line-height: 0.95;
  letter-spacing: -0.07em;
  color: var(--text-primary);
}

.hero-copy p:not(.eyebrow) {
  max-width: 760px;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.clock-card {
  min-width: 150px;
  min-height: 52px;
  padding: 0.65rem 0.85rem;
  border-radius: 1rem;
  border: 1px solid rgba(34, 211, 160, 0.18);
  background: rgba(34, 211, 160, 0.07);
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.clock-card strong,
.clock-card span {
  display: block;
}

.clock-card strong {
  font-family: var(--font-mono);
  font-size: 0.88rem;
}

.clock-card span {
  color: var(--text-secondary);
  font-size: 0.72rem;
}

.live-pulse {
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 999px;
  background: var(--neon-green);
  box-shadow: 0 0 0 0 rgba(34, 211, 160, 0.55);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.alert-banner {
  position: relative;
  z-index: 2;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
}

.banner-crit {
  color: var(--neon-red);
  border: 1px solid rgba(244, 63, 94, 0.25);
  background: linear-gradient(
    90deg,
    rgba(244, 63, 94, 0.16),
    rgba(244, 63, 94, 0.045)
  );
}

.banner-warn {
  color: var(--neon-amber);
  border: 1px solid rgba(251, 191, 36, 0.25);
  background: linear-gradient(
    90deg,
    rgba(251, 191, 36, 0.14),
    rgba(251, 191, 36, 0.045)
  );
}

.banner-msg {
  flex: 1;
}

.banner-hint {
  color: inherit;
  opacity: 0.65;
  font-size: 0.72rem;
}

.banner-enter-active,
.banner-leave-active {
  transition: all 0.25s ease;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.dashboard-body {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1rem;
}

.health-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(120px, 1fr));
  gap: 0.8rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

.health-card {
  padding: 0.9rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(13, 18, 32, 0.72);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.health-card svg {
  color: var(--card-tone);
}

.health-card strong,
.health-card span {
  display: block;
}

.health-card strong {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  color: var(--text-primary);
}

.health-card span {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.health-danger {
  --card-tone: var(--neon-red);
}

.health-info {
  --card-tone: var(--neon-purple);
}

.health-blue {
  --card-tone: var(--neon-blue);
}

.health-green {
  --card-tone: var(--neon-green);
}

.cards-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(150px, 1fr));
  gap: 1rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.inspector-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  gap: 1rem;
}

.chart-full {
  grid-column: span 4;
}

.chart-inline-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-select {
  height: 2rem;
  padding: 0 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.88);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 800;
  outline: none;
}

.chart-select:focus {
  border-color: rgba(56, 189, 248, 0.45);
}

.tag-red {
  color: var(--neon-red);
  background: rgba(244, 63, 94, 0.09);
  border-color: rgba(244, 63, 94, 0.18);
}

.chart-card {
  min-height: 280px;
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
  overflow: hidden;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.22);
  box-shadow: 0 24px 68px rgba(0, 0, 0, 0.32);
}

.chart-wide {
  grid-column: span 2;
}

.chart-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.chart-card-title {
  display: block;
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.chart-card-head p {
  margin-top: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.chart-tag {
  flex-shrink: 0;
  padding: 0.32rem 0.55rem;
  border-radius: 999px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 800;
}

.tag-blue {
  color: var(--neon-blue);
  background: rgba(56, 189, 248, 0.09);
  border-color: rgba(56, 189, 248, 0.18);
}

.tag-green {
  color: var(--neon-green);
  background: rgba(34, 211, 160, 0.09);
  border-color: rgba(34, 211, 160, 0.18);
}

.tag-cyan {
  color: var(--neon-cyan);
  background: rgba(6, 182, 212, 0.09);
  border-color: rgba(6, 182, 212, 0.18);
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr);
  gap: 1rem;
  min-height: 430px;
}

.bottom-left,
.bottom-right {
  min-width: 0;
  min-height: 0;
}

@media (max-width: 1500px) {
  .cards-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .charts-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .advanced-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-full {
    grid-column: span 2;
  }

  .chart-wide {
    grid-column: span 1;
  }
}

@media (max-width: 1180px) {
  .dashboard-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
    justify-content: space-between;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .inspector-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .health-strip {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    overflow-x: visible;
  }

  .cards-row,
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .advanced-grid {
    grid-template-columns: 1fr;
  }

  .chart-full {
    grid-column: span 1;
  }

  .chart-card-head {
    flex-direction: column;
  }

  .chart-inline-controls {
    width: 100%;
    justify-content: space-between;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .clock-card {
    width: 100%;
  }

  .banner-hint {
    display: none;
  }
}

@media (max-width: 560px) {
  .dashboard-hero {
    padding: 1rem;
    border-radius: 1rem;
  }

  .hero-copy h1 {
    font-size: 2rem;
  }

  .health-strip {
    grid-template-columns: 1fr;
  }

  .chart-card {
    min-height: 250px;
    border-radius: 1rem;
  }
}

.controls-collapse-shell {
  display: grid;
  gap: 0.75rem;
}

.controls-toggle {
  width: fit-content;
  min-height: 2.45rem;
  padding: 0 0.85rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(56, 189, 248, 0.18);
  background: rgba(56, 189, 248, 0.075);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  font-weight: 800;
}

.controls-toggle span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.controls-toggle small {
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  text-transform: uppercase;
}

.controls-toggle:hover {
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(56, 189, 248, 0.12);
}

.controls-collapse-enter-active,
.controls-collapse-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    max-height 220ms ease;
  overflow: hidden;
}

.controls-collapse-enter-from,
.controls-collapse-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
}

.controls-collapse-enter-to,
.controls-collapse-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 700px;
}

@media (max-width: 640px) {
  .controls-toggle {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
