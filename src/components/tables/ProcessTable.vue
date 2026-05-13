<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { ProcessRow } from "@/types/dashboard";

const NAMES = [
  "nginx",
  "node",
  "postgres",
  "redis",
  "python3",
  "go-runtime",
  "kafka",
  "elasticsearch",
  "grafana",
  "prometheus",
  "java",
  "ruby",
  "php-fpm",
  "mysql",
  "mongodb",
];
const USERS = [
  "root",
  "www-data",
  "postgres",
  "redis",
  "app",
  "deploy",
  "monitor",
  "svc-acct",
];

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

function makeProcess(pid: number): ProcessRow & { id: string } {
  const statuses = [
    "running",
    "running",
    "running",
    "sleeping",
    "sleeping",
    "warning",
    "zombie",
  ] as const;
  return {
    id: uid(),
    pid,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    cpu: Math.round(Math.random() * 80 * 10) / 10,
    memory: Math.round(Math.random() * 60 * 10) / 10,
    threads: Math.floor(Math.random() * 24) + 1,
    user: USERS[Math.floor(Math.random() * USERS.length)],
    priority: Math.floor(Math.random() * 40) - 20,
  };
}

const processes = ref<(ProcessRow & { id: string })[]>([]);
const searchQuery = ref("");
const sortKey = ref<"cpu" | "memory" | "pid">("cpu");
const sortDir = ref<"asc" | "desc">("desc");
const confirmKill = ref<(ProcessRow & { id: string }) | null>(null);
const toast = ref<{ msg: string; type: string } | null>(null);
let toastTimer = 0;
let updateTimer = 0;

onMounted(() => {
  if (processes.value.length === 0) {
    processes.value = Array.from({ length: 18 }, (_, i) =>
      makeProcess(1000 + i * 37 + Math.floor(Math.random() * 37)),
    );
  }

  updateTimer = window.setInterval(() => {
    processes.value = processes.value.map((p) => ({
      ...p,
      cpu: Math.max(0, Math.min(100, p.cpu + (Math.random() - 0.48) * 8)),
      memory: Math.max(0, Math.min(100, p.memory + (Math.random() - 0.48) * 3)),
    }));
  }, 1000);
});

onUnmounted(() => {
  clearInterval(updateTimer);
  clearTimeout(toastTimer);
});

const filtered = computed(() => {
  let list = processes.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();

    list = list.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.user.toLowerCase().includes(q) ||
        String(p.pid).includes(q)
      );
    });
  }

  return [...list].sort((a, b) => {
    const mul = sortDir.value === "desc" ? -1 : 1;
    return (a[sortKey.value] - b[sortKey.value]) * mul;
  });
});

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key)
    sortDir.value = sortDir.value === "desc" ? "asc" : "desc";
  else {
    sortKey.value = key;
    sortDir.value = "desc";
  }
}

function showToast(msg: string, type = "success") {
  clearTimeout(toastTimer);
  toast.value = { msg, type };
  toastTimer = window.setTimeout(() => {
    toast.value = null;
  }, 2800);
}

function killProcess(p: ProcessRow & { id: string }) {
  confirmKill.value = p;
}

function confirmKillAction() {
  if (!confirmKill.value) return;
  const name = confirmKill.value.name;
  processes.value = processes.value.filter(
    (p) => p.id !== confirmKill.value!.id,
  );
  confirmKill.value = null;
  showToast(`Process "${name}" terminated`, "success");
}

function niceProcess(p: ProcessRow & { id: string }) {
  processes.value = processes.value.map((row) =>
    row.id === p.id
      ? { ...row, priority: Math.min(19, row.priority + 5), cpu: row.cpu * 0.7 }
      : row,
  );
  showToast(`Niced "${p.name}" (priority +5)`, "info");
}

function infoProcess(p: ProcessRow & { id: string }) {
  showToast(
    `${p.name} · PID ${p.pid} · CPU ${p.cpu.toFixed(1)}% · MEM ${p.memory.toFixed(1)}% · ${p.threads} threads`,
    "info",
  );
}

const statusColor: Record<string, string> = {
  running: "var(--neon-green)",
  sleeping: "#3d4f65",
  warning: "var(--neon-amber)",
  zombie: "var(--neon-red)",
  stopped: "var(--neon-red)",
};
</script>

<template>
  <div class="table-wrapper">
    <!-- Header -->
    <div class="table-header">
      <div class="table-title-group">
        <span class="table-title">Process Monitor</span>
        <span class="proc-count">{{ filtered.length }} processes</span>
      </div>
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input
          id="process-search"
          name="processSearch"
          v-model="searchQuery"
          placeholder="Filter processes…"
          class="proc-search"
          autocomplete="off"
        />
      </div>
    </div>

    <!-- Column heads -->
    <div class="col-heads">
      <span class="col-pid">PID</span>
      <span class="col-name">NAME</span>
      <span class="col-status">STATUS</span>
      <span class="col-sort" @click="toggleSort('cpu')">
        CPU%
        <span class="sort-arrow">{{
          sortKey === "cpu" ? (sortDir === "desc" ? "↓" : "↑") : "↕"
        }}</span>
      </span>
      <span class="col-sort" @click="toggleSort('memory')">
        MEM%
        <span class="sort-arrow">{{
          sortKey === "memory" ? (sortDir === "desc" ? "↓" : "↑") : "↕"
        }}</span>
      </span>
      <span class="col-thr">THR</span>
      <span class="col-user">USER</span>
      <span class="col-pri">PRI</span>
      <span class="col-actions">ACTIONS</span>
    </div>

    <!-- Rows -->
    <div class="proc-list">
      <div
        v-for="p in filtered"
        :key="p.id"
        class="proc-row"
        :class="`row-${p.status}`"
      >
        <span class="col-pid mono">{{ p.pid }}</span>
        <span class="col-name mono">{{ p.name }}</span>
        <span class="col-status">
          <span
            class="status-badge"
            :style="`color: ${statusColor[p.status] ?? '#7d8fa8'}; border-color: ${statusColor[p.status] ?? '#3d4f65'}40`"
          >
            <span
              class="status-dot"
              :style="`background:${statusColor[p.status] ?? '#3d4f65'}`"
            />
            {{ p.status }}
          </span>
        </span>
        <span class="col-metric">
          <span class="metric-bar-wrap">
            <span
              class="metric-bar-fill"
              :style="`width:${p.cpu}%; background: ${p.cpu > 80 ? 'var(--neon-red)' : p.cpu > 50 ? 'var(--neon-amber)' : 'var(--neon-blue)'}`"
            />
          </span>
          <span class="mono metric-val">{{ p.cpu.toFixed(1) }}</span>
        </span>
        <span class="col-metric">
          <span class="metric-bar-wrap">
            <span
              class="metric-bar-fill"
              :style="`width:${p.memory}%; background: ${p.memory > 80 ? 'var(--neon-red)' : 'var(--neon-purple)'}`"
            />
          </span>
          <span class="mono metric-val">{{ p.memory.toFixed(1) }}</span>
        </span>
        <span class="col-thr mono">{{ p.threads }}</span>
        <span class="col-user mono">{{ p.user }}</span>
        <span
          class="col-pri mono"
          :style="`color:${p.priority < 0 ? 'var(--neon-amber)' : 'var(--text-dim)'}`"
          >{{ p.priority }}</span
        >
        <span class="col-actions">
          <button
            class="act-btn act-kill"
            type="button"
            @click="killProcess(p)"
            title="Kill process"
          >
            Kill
          </button>

          <button
            class="act-btn act-nice"
            type="button"
            @click="niceProcess(p)"
            title="Nice process"
          >
            Nice
          </button>

          <button
            class="act-btn act-info"
            type="button"
            @click="infoProcess(p)"
            title="Process info"
          >
            Info
          </button>
        </span>
      </div>
    </div>

    <!-- Confirm modal -->
    <Teleport to="body">
      <div
        v-if="confirmKill"
        class="modal-backdrop"
        @click.self="confirmKill = null"
      >
        <div class="modal-box">
          <div class="modal-icon">⚠</div>
          <h3 class="modal-title">Kill Process?</h3>
          <p class="modal-msg">
            This will terminate <strong>{{ confirmKill.name }}</strong>
            <span class="modal-pid">(PID {{ confirmKill.pid }})</span>
          </p>
          <div class="modal-actions">
            <button class="modal-btn modal-cancel" @click="confirmKill = null">
              Cancel
            </button>
            <button class="modal-btn modal-confirm" @click="confirmKillAction">
              Kill Process
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <div v-if="toast" class="toast" :class="`toast-${toast.type}`">
        <span class="toast-dot" />
        {{ toast.msg }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.table-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 12px;
  border-bottom: 1px solid var(--border-dim);
  gap: 12px;
  flex-wrap: wrap;
}
.table-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.table-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-primary);
}
.proc-count {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid var(--border-dim);
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-dim);
  font-size: 16px;
  pointer-events: none;
}
.proc-search {
  font-size: 12px;
  font-family: var(--font-mono);
  padding: 6px 10px 6px 30px;
  border: 1px solid var(--border-dim);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
  outline: none;
  width: 220px;
  transition: border-color 0.2s;
}
.proc-search::placeholder {
  color: var(--text-dim);
}
.proc-search:focus {
  border-color: rgba(56, 189, 248, 0.3);
}

.col-heads,
.proc-row {
  display: grid;
  grid-template-columns:
    64px minmax(110px, 1fr) 112px minmax(150px, 1fr)
    minmax(150px, 1fr) 48px 92px 48px 150px;
  align-items: center;
  gap: 0.45rem;
  padding: 0 18px;
}

.col-heads {
  padding-top: 7px;
  padding-bottom: 7px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.015);
  border-bottom: 1px solid var(--border-dim);
}

.col-sort {
  cursor: pointer;
  user-select: none;
  transition: color 0.15s;
}
.col-sort:hover {
  color: var(--neon-blue);
}
.sort-arrow {
  opacity: 0.6;
  margin-left: 2px;
}

.proc-list {
  overflow-y: auto;
  max-height: 380px;
}

.proc-row {
  font-size: 11px;
  font-family: var(--font-mono);
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  transition: background 0.1s;
  min-height: 36px;
}
.proc-row:hover {
  background: rgba(255, 255, 255, 0.025);
}
.row-zombie,
.row-stopped {
  background: rgba(244, 63, 94, 0.03);
}
.row-warning {
  background: rgba(251, 191, 36, 0.02);
}

.mono {
  font-family: var(--font-mono);
}
.col-pid {
  color: var(--text-dim);
}
.col-name {
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-thr {
  color: var(--text-secondary);
}
.col-user {
  color: var(--text-secondary);
}
.col-pri {
  font-size: 10px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.03);
  letter-spacing: 0.04em;
}
.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.col-metric {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(96px, 1fr) 44px;
  align-items: center;
  gap: 0.65rem;
}

.metric-bar-wrap {
  width: 100%;
  height: 0.5rem;
  background: rgba(148, 163, 184, 0.16);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.metric-bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.45s ease;
  box-shadow: 0 0 16px currentColor;
}

.metric-val {
  color: var(--text-secondary);
  min-width: 44px;
  font-size: 11px;
  text-align: right;
}

.col-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  justify-content: flex-start;
}

.act-btn {
  min-width: 42px;
  height: 1.65rem;
  padding: 0 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.55rem;
  border: 1px solid var(--border-dim);
  background: rgba(255, 255, 255, 0.035);
  font-size: 10px;
  font-weight: 900;
  font-family: var(--font-mono);
  cursor: pointer;
  transition:
    transform 140ms ease,
    background 140ms ease,
    border-color 140ms ease,
    color 140ms ease,
    box-shadow 140ms ease;
}

.act-btn:hover {
  transform: translateY(-1px);
}

.act-kill {
  color: #fb7185;
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.22);
}

.act-kill:hover {
  color: #fff;
  background: rgba(244, 63, 94, 0.25);
  border-color: rgba(244, 63, 94, 0.5);
  box-shadow: 0 0 18px rgba(244, 63, 94, 0.18);
}

.act-nice {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.22);
}

.act-nice:hover {
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.14);
}

.act-info {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.22);
}

.act-info:hover {
  color: #e0f2fe;
  background: rgba(56, 189, 248, 0.18);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.14);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(5, 8, 16, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.15s ease;
}
.modal-box {
  background: var(--bg-surface);
  border: 1px solid rgba(244, 63, 94, 0.25);
  border-radius: 16px;
  padding: 32px 36px;
  text-align: center;
  max-width: 380px;
  width: 90%;
  box-shadow:
    0 0 60px rgba(244, 63, 94, 0.1),
    0 24px 64px rgba(0, 0, 0, 0.5);
  animation: slide-up 0.2s ease;
}
.modal-icon {
  font-size: 32px;
  color: var(--neon-amber);
  margin-bottom: 12px;
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.modal-msg {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}
.modal-pid {
  font-family: var(--font-mono);
  color: var(--text-dim);
  margin-left: 4px;
}
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.modal-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-ui);
  transition: background 0.15s;
  cursor: pointer;
}
.modal-cancel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-soft);
  color: var(--text-secondary);
}
.modal-cancel:hover {
  background: rgba(255, 255, 255, 0.08);
}
.modal-confirm {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--neon-red);
}
.modal-confirm:hover {
  background: rgba(244, 63, 94, 0.25);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-ui);
  backdrop-filter: blur(10px);
  animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.toast-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.toast-success {
  background: rgba(34, 211, 160, 0.12);
  border: 1px solid rgba(34, 211, 160, 0.25);
  color: var(--neon-green);
}
.toast-success .toast-dot {
  background: var(--neon-green);
  box-shadow: 0 0 6px var(--neon-green);
}
.toast-info {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: var(--neon-blue);
}
.toast-info .toast-dot {
  background: var(--neon-blue);
  box-shadow: 0 0 6px var(--neon-blue);
}
.toast-error {
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.25);
  color: var(--neon-red);
}
.toast-error .toast-dot {
  background: var(--neon-red);
  box-shadow: 0 0 6px var(--neon-red);
}

.process-action {
  min-height: 1.65rem;
  padding: 0 0.55rem;
  border-radius: 0.55rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 140ms ease,
    background 140ms ease,
    border-color 140ms ease,
    color 140ms ease;
}

.process-action:hover {
  transform: translateY(-1px);
}

.action-kill {
  color: #fb7185;
  background: rgba(244, 63, 94, 0.09);
  border-color: rgba(244, 63, 94, 0.2);
}

.action-kill:hover {
  color: #fff;
  background: rgba(244, 63, 94, 0.22);
  border-color: rgba(244, 63, 94, 0.45);
}

.action-nice {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.09);
  border-color: rgba(59, 130, 246, 0.2);
}

.action-nice:hover {
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.4);
}

.action-info {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.09);
  border-color: rgba(56, 189, 248, 0.2);
}

.action-info:hover {
  background: rgba(56, 189, 248, 0.18);
  border-color: rgba(56, 189, 248, 0.4);
}
</style>
