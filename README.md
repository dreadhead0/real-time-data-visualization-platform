# Observatory — Real-time Analytics Dashboard

A high-performance, real-time analytics dashboard built with Vue 3, TypeScript, Pinia, and ECharts. Simulates a production-grade DevOps/infrastructure monitoring platform with live-streaming telemetry, smooth chart updates, and interactive controls.

## Setup

```bash
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # production build
npm run type-check # TypeScript validation
```

## Architecture

```
src/
├── lib/
│   ├── StreamManager.ts     # WebSocket/mock connection singleton
│   ├── MockGenerator.ts     # Realistic metric simulation
│   ├── Validator.ts         # Zod-based payload validation + sanitization
│   ├── Throttler.ts         # Debounce + batch utility
│   └── CircularBuffer.ts    # Fixed-capacity ring buffer
├── stores/
│   ├── metrics.ts           # Metric time-series (Pinia)
│   ├── alerts.ts            # Alert events + filtering (Pinia)
│   └── stream.ts            # Stream status + controls (Pinia)
├── components/
│   ├── charts/
│   │   ├── LineAreaChart.vue  # Streaming line/area chart (ECharts)
│   │   └── BarChart.vue       # Multi-metric bar comparison
│   ├── feed/
│   │   └── ActivityFeed.vue   # Virtualised live event feed
│   ├── controls/
│   │   └── DashboardControls.vue  # Pause, time range, reset
│   └── ui/
│       ├── MetricCard.vue     # Animated KPI card
│       ├── ThemeToggle.vue    # Dark/light mode
│       └── ErrorBoundary.vue  # onErrorCaptured wrapper
├── composables/
│   ├── useStreamConnection.ts  # Wires StreamManager → stores
│   ├── useChartResize.ts       # ResizeObserver for ECharts
│   └── useAnimatedCounter.ts   # RAF-based number animation
├── types/
│   └── domain.ts              # MetricPoint, AlertEvent, etc.
└── views/
    └── DashboardView.vue      # Top-level layout
```

## State Management Strategy

**Pinia** with three independent stores, chosen over Vuex for first-class TypeScript support and composable store design:

- `useMetricsStore` — one `CircularBuffer<MetricPoint>` per metric (1 000-point cap). Exposes `getSeriesData(metric)` which returns a windowed slice based on the current time range. Computed `summary` provides the latest value per metric for the KPI cards.
- `useAlertsStore` — prepends incoming alerts, caps at 500. Computed `filtered` applies search + severity filter reactively. Counts by severity are also computed.
- `useStreamStore` — tracks connection status, pause state, message count, and last heartbeat. Controls pause/resume without touching the other stores.

## Rendering Optimization Decisions

**ECharts `setOption({ series: [{ data }] }, { notMerge: false })`**
Incremental updates — ECharts diffs the new data against the canvas and repaints only changed regions. This is the single biggest performance win; it avoids tearing down and re-drawing the entire series on every tick.

**Circular buffer**
`CircularBuffer<T>` is a custom fixed-capacity ring buffer. Pushing to a full buffer evicts the oldest item with `O(1)` cost, avoiding the `O(n)` cost of `Array.prototype.shift()`. The buffer itself is not reactive — only the computed `summary` (latest values) and the chart data slices (read on timer) are reactive.

**Throttler + batching**
Raw incoming events are queued in `Throttler` and flushed to the store every 100 ms in a batch. This prevents a cascade of reactive updates on every WebSocket message and keeps Vue's scheduler from being overwhelmed under high-frequency streams.

**`large: true` + `largeThreshold: 200` on ECharts series**
ECharts switches to WebGL-accelerated rendering automatically above 200 points, keeping frame rate smooth as series grow.

**Memoized chart data**
`getSeriesData(metric)` is called inside a Vue `computed()` in the parent view, so ECharts only receives a new array reference when the store actually changes.

## Data Streaming Approach

`StreamManager` is a plain TypeScript class (not a composable) because it has a singleton lifecycle that outlives any component. It supports two modes:

- **`'mock'`** (default) — `MockGenerator` drives `setInterval` at 200 ms, cycling through all six metrics with a random-walk model that produces realistic variance and occasional threshold breaches. A separate 5-second interval emits heartbeats.
- **`'websocket'`** — connects to a WebSocket URL, parses JSON, validates through `Validator.ts`, and emits typed `StreamPayload` events. Falls back with exponential backoff (1 s → 30 s cap).

The `useStreamConnection` composable registers payload and status handlers on `StreamManager` in `onMounted` and unregisters + destroys throttlers in `onUnmounted`, preventing memory leaks.

All incoming payloads pass through `validatePayload()` (Zod schema) before touching any store. Invalid payloads are logged and dropped silently, so malformed data can never crash the UI.

## Trade-offs

| Decision | Chosen | Alternative considered | Reason |
|---|---|---|---|
| Chart library | ECharts | D3.js, Recharts | ECharts has the best incremental streaming API and WebGL fallback for large datasets |
| State library | Pinia | Zustand, Redux Toolkit | First-class Vue 3 + TypeScript integration; stores match domain boundaries naturally |
| Mock transport | `setInterval` | WebSocket echo server | Zero infrastructure for the demo; easy to swap — change `StreamManager` mode to `'websocket'` |
| Buffer strategy | Custom ring buffer | Plain reactive array | Avoids O(n) shift cost and prevents Vue from tracking every array element |
| Chart renderer | Canvas | SVG | Canvas scales to 1 000+ points without DOM node cost |
| Error handling | `onErrorCaptured` boundary | Global `window.onerror` | Scoped to dashboard sections; one bad chart won't kill the feed or cards |
