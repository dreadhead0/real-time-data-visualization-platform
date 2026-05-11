# PulseOps Analytics

A high-performance real-time data visualization platform built with Vue 3, TypeScript, Pinia, Vue Router, and ECharts.

## Features

- Real-time streaming dashboard
- CPU, memory, latency, throughput, error-rate, and network metrics
- Live metric cards with animated counters
- Line, area, and bar charts
- Advanced ECharts visualizations:
  - heatmap
  - candlestick chart
  - radar chart
  - service network graph
  - geographic traffic visualization
- Live process monitor
- Live activity feed
- Security event inspector
- System log explorer
- Dataset toggles
- Dashboard mode switching
- Severity filtering
- Searchable logs and events
- Pause/resume streaming
- Time range controls
- Landing, login, signup, dashboard, and settings pages
- Dark/light/system theme support
- Persisted profile settings
- Profile picture upload
- Responsive desktop/tablet/mobile layout

## Setup

```bash
npm install
npm run dev

Production build:

npm run build
npm run preview
Architecture

The app is organized around reusable Vue components and centralized Pinia stores.

src/
  components/
    charts/       Reusable ECharts visualizations
    controls/     Dashboard controls and filters
    feed/         Activity feed
    tables/       Process, security, and logs tables
    ui/           Metric cards and error boundaries
  composables/    Streaming and chart lifecycle logic
  layouts/        Dashboard shell
  lib/            Mock generators and resilience helpers
  router/         Vue Router setup
  stores/         Pinia stores
  types/          Shared TypeScript models
  views/          Route-level pages

  State management strategy

The platform uses Pinia stores for clean, scalable state management:

metrics manages infrastructure metrics and chart series.
stream manages pause/resume streaming state.
alerts manages alert and activity feed state.
analytics manages security, geography, market, network graph, heatmap, radar, and log datasets.
preferences persists theme, profile, role, email, and avatar preferences.

Persisted state is used only for user preferences and dashboard configuration, not high-frequency streaming arrays.

Data streaming approach

The dashboard uses simulated real-time data generators to model a production streaming environment. Multiple intervals produce different data frequencies:

fast stream for logs, markets, and geo traffic
medium stream for heatmap and security events
slow stream for service graph and radar health profile

Streams are cleaned up on component unmount to prevent memory leaks.

Rendering optimization decisions
Route-level lazy loading reduces initial page load.
Advanced chart components are async-loaded.
Streaming arrays are capped to prevent unbounded memory growth.
Chart instances are disposed on unmount.
Resize observers are disconnected on unmount.
ECharts canvas renderer is used for efficient chart rendering.
Dashboard filters use computed values instead of mutating source datasets.
Large datasets are sliced before display.
Error handling and resilience
Components are wrapped with error boundaries.
Mock data is validated and shaped before entering stores.
Streaming data arrays use bounded buffers.
Resilience utilities provide:
safe JSON parsing
text sanitization
exponential reconnect backoff helpers
Empty states are displayed for filtered security and log views.
The UI does not rely on unsafe DOM injection.

Security and stability
User profile values are rendered through Vue bindings.
Uploaded avatars are limited to image files below 1.5MB.
No raw HTML rendering is used for user profile fields.
Intervals and observers are cleaned up.
Dataset filters do not mutate raw source data.
Trade-offs
Streaming is mocked instead of using a live WebSocket backend because the task allows simulated streams.
Geographic visualization uses longitude/latitude plotting instead of a full world map asset to keep the bundle lighter.
Authentication pages are UI-only placeholders for the frontend stage.
Market data is simulated to avoid external API rate limits and secret management.
```
