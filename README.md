# PulseOps — Real-Time Data Visualization Platform

PulseOps is a high-performance real-time analytics dashboard built with **Vue 3**, **TypeScript**, **Pinia**, and **ECharts**. It simulates a modern operations command center for monitoring infrastructure metrics, process activity, security incidents, geographic traffic, market activity, service dependencies, and live system logs.

The platform was built for **Frontend Wizards — Stage 5A**, where the focus is real-time frontend architecture, smooth visualization updates, scalable state handling, performance optimization, responsive UI, and engineering maturity.

---

## Live Demo

```txt
https://real-time-data-visualization-platfo.vercel.app/
```

---

## Repository

```txt
https://github.com/dreadhead0/real-time-data-visualization-platform
```

---

## Overview

PulseOps behaves like a production-grade monitoring and analytics workspace. It receives simulated streaming data, validates incoming payloads, updates charts and tables live, and gives users controls for pausing the stream, changing time ranges, filtering logs, switching visualization modes, and toggling datasets.

The dashboard includes infrastructure charts, live metric cards, process monitoring, activity logs, security events, geographic traffic visualization, market candlesticks, heatmaps, radar charts, and a service dependency network.

---

## Key Features

### Real-Time Streaming

- Simulated live data stream using a custom stream manager.
- Continuous updates without page refresh.
- Pause and resume support.
- Reconnect/status handling structure.
- Live heartbeat/status tracking.
- Throttled metric and alert updates to reduce unnecessary rendering.

### Live Visualizations

PulseOps includes all required chart types and several bonus visualizations:

- Line charts
- Area charts
- Bar chart
- Real-time metric cards
- Activity feed/table
- Heatmap
- Candlestick chart
- Radar chart
- Network graph
- Geographic traffic visualization

### Dashboard Controls

Users can:

- Pause or resume streaming.
- Change time ranges: `1m`, `5m`, `15m`, `1h`, and `Live`.
- Toggle datasets on/off.
- Switch dashboard modes.
- Inspect charts through tooltips.
- Search and filter logs/events.
- Load older activity feed events.

### Activity Feed

The activity feed supports:

- Newest events first.
- Severity indicators.
- Searchable logs.
- Severity filtering.
- Infinite loading / load older events.
- Scroll handling.
- Timestamp formatting.
- Empty state.

### Process Monitor

The process monitor simulates live process activity with:

- CPU and memory usage bars.
- Process status badges.
- Kill, nice, and info actions.
- Search/filtering.
- Stable row ordering to prevent rows jumping while metrics update.

### Responsive UI

PulseOps is responsive across:

- Desktop
- Tablet
- Mobile

Dense tables use horizontal scrolling on smaller screens to preserve readability instead of squeezing columns until they become unreadable.

### Theme Support

- Dark mode
- Light mode
- System preference mode
- Persisted local theme preference

### Local Demo Authentication

The app includes local demo authentication:

- Signup
- Login
- Logout
- Protected dashboard routes
- Per-user local preferences

This is intentionally frontend-only for the stage requirement and does not use a backend authentication service.

---

## Tech Stack

| Area             | Technology                             |
| ---------------- | -------------------------------------- |
| Framework        | Vue 3                                  |
| Language         | TypeScript                             |
| Build Tool       | Vite                                   |
| State Management | Pinia                                  |
| Charts           | ECharts                                |
| Icons            | Lucide Vue                             |
| Validation       | Zod-style payload validation utilities |
| Styling          | CSS variables, scoped component styles |
| Deployment       | Vercel                                 |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/dreadhead0/real-time-data-visualization-platform
cd real-time-data-visualization-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The app will run locally at:

```txt
http://localhost:5173
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

---

## Project Structure

```txt
src/
├── assets/
├── components/
│   ├── charts/
│   ├── controls/
│   ├── feed/
│   ├── system/
│   ├── tables/
│   └── ui/
├── composables/
├── layouts/
├── lib/
├── router/
├── stores/
├── types/
├── utils/
├── views/
├── App.vue
└── main.ts
```

### Important Folders

#### `components/charts`

Reusable visualization components powered by ECharts.

Examples:

- `LineAreaChart.vue`
- `BarChart.vue`
- `HeatmapChart.vue`
- `CandlestickChart.vue`
- `RadarHealthChart.vue`
- `GeoTrafficMap.vue`
- `NetworkGraphChart.vue`

#### `components/feed`

Contains the real-time activity feed.

#### `components/tables`

Contains dense operational tables such as process monitoring, security events, and system logs.

#### `components/controls`

Contains dashboard control components for filtering, pausing, time range selection, and dataset toggles.

#### `stores`

Centralized Pinia stores for metrics, alerts, analytics, preferences, stream state, and authentication.

#### `lib`

Low-level streaming and buffering utilities.

#### `composables`

Reusable lifecycle logic for starting/stopping streams and wiring live data into stores.

#### `utils`

Shared utilities such as sanitization helpers and formatting helpers.

---

## Architecture Explanation

PulseOps uses a modular frontend architecture designed around separation of concerns.

The app is split into:

1. **Stream layer**
2. **Data/state layer**
3. **Visualization layer**
4. **Interaction/control layer**
5. **Layout/UI layer**

### 1. Stream Layer

The stream layer simulates live incoming events and metrics. It is responsible for generating or receiving payloads and forwarding them into the application through controlled subscriptions.

The stream manager abstracts the streaming source so the UI does not care whether the data comes from:

- Mock generator
- WebSocket
- Server-Sent Events
- API polling
- Real backend service

For this stage, mocked streaming is used because the task explicitly allows simulated live data.

### 2. Data/State Layer

Pinia stores centralize all major application state:

- Metrics
- Alerts
- Stream status
- Analytics datasets
- User preferences
- Local authentication

This keeps components focused on rendering and interaction instead of owning complex data logic.

### 3. Visualization Layer

Chart components are reusable and receive data through props. This keeps chart logic isolated and makes each visualization easier to test, tune, and optimize.

Charts are designed to:

- Render smoothly.
- Avoid unnecessary re-instantiation.
- Resize with their container.
- Clean up chart instances on unmount.
- Use bounded data arrays/buffers to avoid memory growth.

### 4. Interaction Layer

Dashboard controls allow users to interact with the stream and datasets without modifying chart internals.

Controls include:

- Time range selection
- Pause/resume
- Dataset visibility toggles
- Chart mode switching
- Search/filter controls

### 5. Layout/UI Layer

The layout uses responsive CSS grids and flexible cards. Dense data tables use horizontal scrolling on mobile instead of forcing unreadable compressed columns.

---

## State Management Strategy

PulseOps uses **Pinia** for centralized and scalable state management.

### Why Pinia?

Pinia was chosen because it fits Vue 3 naturally and provides:

- Typed stores
- Simple reactive state
- Computed getters
- Modular store separation
- Easy persistence patterns
- Cleaner architecture than passing state through many component props

### Main Stores

#### Metrics Store

Handles live infrastructure metrics such as:

- CPU
- Memory
- Network
- Latency
- Throughput
- Error rate

It stores recent values in bounded buffers and exposes time-range filtered series to charts.

#### Alerts Store

Handles activity feed alerts, severity counts, search, filtering, and visible event history.

#### Analytics Store

Handles advanced dashboard datasets:

- Security events
- System logs
- Geographic traffic
- Market ticks
- Heatmap cells
- Radar profile
- Service dependency graph
- Dataset visibility
- Dashboard mode

#### Stream Store

Tracks live stream status:

- Connected
- Connecting
- Disconnected
- Error
- Paused

This supports visible stream resilience UI and pause/resume behavior.

#### Preferences Store

Stores user-facing preferences such as:

- Display name
- Role
- Avatar
- Theme preference

Preferences are persisted locally and scoped to the current local demo user where relevant.

#### Auth Store

Provides local demo authentication:

- Signup
- Login
- Logout
- Session persistence

This is not intended to replace production authentication.

---

## Data Streaming Approach

PulseOps uses a simulated streaming approach.

The app generates live payloads representing:

- Infrastructure metric updates
- Alert events
- Security incidents
- Logs
- Market ticks
- Geographic traffic
- Service health changes
- Process metrics

Payloads are pushed into centralized stores through composables such as stream connection handlers.

### Why mocked streaming?

The assignment accepts mocked streaming generators. A mock stream keeps the project frontend-focused while still demonstrating real-time UI behavior, rendering pressure, memory handling, filtering, and state updates.

### Production equivalent

In production, the stream layer could be replaced with:

- WebSocket connection
- Server-Sent Events
- Kafka-backed gateway
- Live metrics API
- Observability backend
- Security event pipeline

Because the stream manager abstracts the source, the UI can remain mostly unchanged.

---

## Rendering Optimization Decisions

Performance is a major focus of this project. PulseOps uses several strategies to keep the UI responsive during continuous updates.

### 1. Bounded Buffers

Metric history is stored in fixed-size buffers instead of unbounded arrays. This prevents memory growth during long sessions.

### 2. Throttled Updates

Incoming metric and alert payloads are throttled before entering stores. This reduces render pressure and prevents charts/tables from updating too aggressively.

### 3. Derived State with Computed Values

Charts receive computed data derived from stores. This avoids recalculating unnecessary values in multiple components.

### 4. Reusable Chart Components

Each chart owns its ECharts instance and updates only its relevant options/data. Chart instances are disposed on unmount to prevent memory leaks.

### 5. Async Chart Loading

Advanced charts are loaded asynchronously with loading and error fallback components. This reduces initial bundle pressure and improves perceived performance.

### 6. Stable Table Ordering

The process table avoids constantly reordering rows based on rapidly changing CPU values. This keeps the table usable while values update in real time.

### 7. Responsive Table Strategy

On desktop, tables aim to fit available space. On smaller screens, dense tables use horizontal scrolling to preserve column readability.

### 8. Cleanup on Unmount

Intervals, listeners, resize observers, chart instances, and stream subscriptions are cleaned up when components unmount.

---

## Error Handling and Resilience

PulseOps includes several resilience patterns:

- Stream status tracking.
- Pause/resume behavior.
- Connection notice UI for paused, connecting, disconnected, and error states.
- Loading states for async chart components.
- Error states for failed chart module loading.
- Empty states for logs/activity feed.
- Payload validation before data enters stores.
- Cleanup of timers, observers, subscriptions, and chart instances.

The UI is designed so malformed or missing data does not crash the dashboard.

---

## Security and Stability

PulseOps includes frontend security and stability precautions.

### Payload Validation

Incoming payloads are validated before entering the app state. This helps protect stores and components from malformed data.

### Tooltip Sanitization

Some ECharts tooltips render HTML strings. Dynamic values used in tooltips are escaped/sanitized before rendering.

This is especially important because production systems may receive external data from logs, network events, APIs, or user-generated metadata.

### Safe Profile Rendering

User profile values are rendered through Vue bindings instead of raw HTML injection.

### Avatar Handling

Avatar uploads are handled locally and constrained to safe image files and size limits.

### Cleanup

The app cleans up:

- Intervals
- Resize observers
- Chart instances
- Stream listeners
- Throttlers

This prevents memory leaks during long-running dashboard sessions.

---

## Responsive Design Strategy

PulseOps uses a responsive design strategy based on the type of content.

### Cards and Charts

Cards and charts reflow using CSS grid:

- Multi-column layout on desktop
- Two-column or single-column layout on tablet
- Single-column layout on mobile

### Dense Tables

Dense tables such as the activity feed and process monitor retain their full columns on mobile and use horizontal scrolling when needed.

This trade-off was chosen because squeezing operational tables too much makes them unreadable.

### Mobile Interaction

The mobile layout prioritizes:

- Readable typography
- Clear spacing
- Scrollable tables
- Usable controls
- Stable card heights
- Avoiding layout jumps during streaming

---

## Timezone Decision

Timestamps are displayed using the viewer’s browser/device timezone.

This means if someone opens the dashboard in a different country, the timestamps are shown in their local context, which is usually the best default for a monitoring interface.

### Trade-off

Because this is a frontend-only demo, the app relies on the device clock. If a user’s computer time or timezone is incorrect, the dashboard time will also reflect that incorrect device setting.

### Production recommendation

In production, timestamps should be generated by the backend in UTC and sent to the frontend as ISO timestamps or epoch values. The frontend should then format those timestamps in either:

- The viewer’s local timezone
- UTC
- A user-selected timezone

This project intentionally uses browser-local formatting to keep the frontend demo globally understandable.

---

## Trade-Offs Made

### 1. Mocked Stream Instead of Real Backend

The project uses a mocked streaming generator instead of a real WebSocket backend.

Reason:

- The task accepts mocked streaming.
- The focus is frontend architecture and rendering performance.
- It allows the dashboard to run without backend setup.

Production improvement:

- Replace the mock stream with WebSockets or Server-Sent Events.

### 2. Local Demo Authentication

Authentication is stored locally in the browser.

Reason:

- This is a frontend challenge.
- It demonstrates route protection, signup, login, logout, and per-user preferences without requiring backend infrastructure.

Production improvement:

- Use secure backend authentication, hashed passwords, HTTP-only cookies, refresh tokens, and server-side session validation.

### 3. Browser-Local Timezone

The app displays timestamps in the viewer’s local timezone.

Reason:

- Users in different locations can interpret events naturally.

Trade-off:

- Incorrect device time leads to incorrect displayed time.

Production improvement:

- Backend-generated UTC timestamps with frontend timezone formatting.

### 4. Horizontal Scrolling for Dense Tables on Mobile

Activity feed and process monitor tables scroll horizontally on smaller screens.

Reason:

- Operational tables contain many important columns.
- Compressing all columns into a narrow mobile width hurts readability.

Trade-off:

- Users may need to swipe horizontally on mobile.

Production improvement:

- Add a mobile-specific detail drawer or expandable row view.

### 5. Simulated Market and Security Data

Markets, security incidents, logs, and geography data are simulated.

Reason:

- The assignment evaluates real-time frontend behavior, not backend data acquisition.

Production improvement:

- Connect to real observability, SIEM, market, or analytics APIs.

### 6. HTML Tooltips in ECharts

ECharts tooltip formatters use HTML strings for rich formatting.

Reason:

- ECharts tooltip customization is more flexible with HTML.

Mitigation:

- Dynamic values are escaped before rendering.

Production improvement:

- Continue sanitizing external values and avoid injecting untrusted raw HTML.

### 7. No Web Worker Yet

The app uses throttling, bounded buffers, and efficient updates but does not currently move data generation into a Web Worker.

Reason:

- Current simulated workload performs well without the extra complexity.

Production improvement:

- Move high-frequency data simulation or parsing to a Web Worker for heavier datasets.

### 8. Local Storage Persistence

User preferences and demo sessions are stored in browser storage.

Reason:

- This keeps the demo self-contained.

Trade-off:

- Data is per-browser and not shared across devices.

Production improvement:

- Persist user preferences in a backend database.

---

## Available Routes

| Route           | Description    |
| --------------- | -------------- |
| `/`             | Landing page   |
| `/login`        | Login page     |
| `/signup`       | Signup page    |
| `/app`          | Main dashboard |
| `/app/settings` | User settings  |

---

## Usage Guide

### Create an Account

Go to `/signup`, enter a display name, email, and password, then create a local demo account.

### Login

Go to `/login` and sign in with a previously created local account.

### Open Dashboard

Use the dashboard to monitor live metrics, logs, security events, and visualizations.

### Pause or Resume Stream

Use the stream control buttons to pause or resume live updates.

### Change Time Range

Use the time range buttons to inspect recent data windows.

### Filter Logs

Use search and severity filters in the Activity Log and System Log Explorer.

### Toggle Datasets

Use the dashboard control center to enable or disable datasets.

### Change Theme

Open Settings and select Dark, Light, or System theme.

---

## Performance Notes

PulseOps is designed to remain responsive under continuous updates.

Key decisions:

- Stream payloads are throttled.
- Metrics use bounded buffers.
- Charts are componentized.
- Advanced charts are lazy-loaded.
- Large feed data is incrementally displayed.
- Components clean up resources on unmount.
- Derived data is computed centrally instead of repeatedly inside templates.
- Tables avoid unstable auto-sorting while values update.

---

## Known Limitations

- The stream is simulated, not connected to a real backend.
- Authentication is local demo authentication only.
- Browser-local time depends on the viewer’s device clock.
- Mobile dense tables require horizontal scrolling.
- Web Workers are not currently used.
- Data is stored locally and does not sync across devices.
- The dashboard is optimized for frontend demonstration rather than production security operations.

---

## Future Improvements

Potential next steps:

- Real WebSocket/SSE backend.
- Server-generated UTC timestamps.
- Backend authentication.
- User-selectable timezone.
- Web Worker for high-frequency stream simulation.
- Draggable dashboard widgets.
- Customizable layout persistence.
- Command palette.
- Keyboard shortcuts.
- Sound alerts.
- Notification center.
- Exportable logs.
- More advanced table virtualization.
- Real observability API integration.

---

## Development Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

---

## Build Verification

Before submission, run:

```bash
npm run build
```

The project should complete TypeScript checking and production build successfully.

---

## Author

Built by **dreadhead** for **Frontend Wizards — Stage 5A**.

---

## License

This project is for learning, portfolio, and challenge submission purposes.

````

```txt
https://real-time-data-visualization-platfo.vercel.app/
https://github.com/dreadhead0/real-time-data-visualization-platform
````
