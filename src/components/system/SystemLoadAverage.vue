<script setup lang="ts">
import { computed } from "vue";
import { BarChart3 } from "lucide-vue-next";
import { useMetricsStore } from "@/stores/metrics";

const metrics = useMetricsStore();

const loadRows = computed(() => {
  const cpu = metrics.summary.cpu;
  const memory = metrics.summary.memory;
  const network = metrics.summary.network;

  const oneMin = Number(((cpu / 100) * 3.2).toFixed(2));
  const fiveMin = Number((((cpu + memory) / 200) * 3.1).toFixed(2));
  const fifteenMin = Number(
    (((cpu + memory + network) / 300) * 2.6).toFixed(2),
  );

  return [
    {
      label: "1 min",
      value: oneMin,
      percent: Math.min(100, oneMin * 28),
      tone: "blue",
    },
    {
      label: "5 min",
      value: fiveMin,
      percent: Math.min(100, fiveMin * 28),
      tone: "green",
    },
    {
      label: "15 min",
      value: fifteenMin,
      percent: Math.min(100, fifteenMin * 35),
      tone: "purple",
    },
  ];
});
</script>

<template>
  <article class="load-card">
    <div class="load-head">
      <span>
        <BarChart3 :size="16" />
        System Load Average
      </span>
    </div>

    <div class="load-list">
      <div v-for="row in loadRows" :key="row.label" class="load-row">
        <span class="load-label">{{ row.label }}</span>

        <div class="load-track">
          <i
            :class="`tone-${row.tone}`"
            :style="{ width: `${row.percent}%` }"
          ></i>
        </div>

        <strong>{{ row.value }}</strong>
      </div>
    </div>

    <p class="load-foot">
      12 cores · Load avg {{ loadRows.map((row) => row.value).join(" / ") }} (1m
      / 5m / 15m)
    </p>
  </article>
</template>

<style scoped>
.load-card {
  height: 100%;
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
}

.load-list {
  margin-top: 1rem;
  display: grid;
  gap: 0.9rem;
}

.load-foot {
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.load-head span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 900;
}

.load-list {
  margin-top: 1rem;
  display: grid;
  gap: 0.9rem;
}

.load-row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 54px;
  align-items: center;
  gap: 0.75rem;
}

.load-label {
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.load-track {
  height: 0.55rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.13);
}

.load-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  box-shadow: 0 0 18px currentColor;
}

.tone-blue {
  color: #38bdf8;
  background: #38bdf8;
}

.tone-green {
  color: #22c55e;
  background: #22c55e;
}

.tone-purple {
  color: #a78bfa;
  background: #a78bfa;
}

.load-row strong {
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.86rem;
  text-align: right;
}

.load-foot {
  margin: 1rem 0 0;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  color: var(--text-secondary);
  font-size: 0.72rem;
}
</style>
