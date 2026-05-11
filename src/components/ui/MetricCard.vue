<script setup lang="ts">
import { computed, ref, watch, type Component } from "vue";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-vue-next";
import { useAnimatedCounter } from "@/composables/useAnimatedCounter";

const props = defineProps<{
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
  thresholdWarn?: number;
  thresholdCrit?: number;
  icon?: Component;
  color?: string;
  description?: string;
}>();

const { displayed } = useAnimatedCounter(
  () => props.value,
  props.decimals ?? 1,
);

const trend = ref<"up" | "down" | "flat">("flat");

watch(
  () => props.value,
  (next, prev) => {
    if (next > prev + 0.05) trend.value = "up";
    else if (next < prev - 0.05) trend.value = "down";
    else trend.value = "flat";
  },
);

const statusClass = computed(() => {
  if (props.thresholdCrit != null && props.value >= props.thresholdCrit)
    return "crit";
  if (props.thresholdWarn != null && props.value >= props.thresholdWarn)
    return "warn";
  return "ok";
});

const accentColor = computed(() => {
  if (props.color) return props.color;
  if (statusClass.value === "crit") return "var(--neon-red)";
  if (statusClass.value === "warn") return "var(--neon-amber)";
  return "var(--neon-green)";
});

const barPercent = computed(() => {
  const max = props.thresholdCrit ?? 100;
  return Math.min(100, Math.max(0, (props.value / max) * 100));
});

const ringDash = computed(() => {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const filled = (barPercent.value / 100) * circ;
  return `${filled} ${circ}`;
});

const TrendIcon = computed(() => {
  if (trend.value === "up") return ArrowUp;
  if (trend.value === "down") return ArrowDown;
  return ArrowRight;
});
</script>

<template>
  <article
    class="metric-card"
    :class="`status-${statusClass}`"
    :style="{ '--accent': accentColor }"
  >
    <div class="metric-glow" />

    <div class="card-top">
      <div class="icon-shell">
        <component :is="icon" v-if="icon" :size="19" />
      </div>

      <div class="ring-wrap">
        <svg width="42" height="42" viewBox="0 0 42 42">
          <circle
            cx="21"
            cy="21"
            r="16"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            stroke-width="3"
          />
          <circle
            cx="21"
            cy="21"
            r="16"
            fill="none"
            :stroke="accentColor"
            stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="ringDash"
            stroke-dashoffset="25"
            transform="rotate(-90 21 21)"
          />
        </svg>
        <span class="ring-pct">{{ Math.round(barPercent) }}</span>
      </div>
    </div>

    <div>
      <div class="card-value">
        <span class="value-num">{{ displayed.toFixed(decimals ?? 1) }}</span>
        <span v-if="unit" class="value-unit">{{ unit }}</span>
      </div>

      <p class="card-label">{{ label }}</p>
      <p v-if="description" class="card-description">{{ description }}</p>
    </div>

    <div class="card-footer">
      <div class="card-bar">
        <div
          class="card-bar-fill"
          :style="{ width: `${barPercent}%`, background: accentColor }"
        />
      </div>

      <span class="trend-badge" :class="`trend-${trend}`">
        <component :is="TrendIcon" :size="12" />
      </span>
    </div>
  </article>
</template>

<style scoped>
.metric-card {
  --accent: var(--neon-green);
  position: relative;
  min-height: 150px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.045),
      rgba(255, 255, 255, 0.015)
    ),
    rgba(13, 18, 32, 0.88);
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(
    in srgb,
    var(--accent) 34%,
    rgba(148, 163, 184, 0.12)
  );
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.36),
    0 0 0 1px color-mix(in srgb, var(--accent) 12%, transparent),
    0 0 40px color-mix(in srgb, var(--accent) 10%, transparent);
}

.metric-glow {
  position: absolute;
  inset: auto -40px -52px -40px;
  height: 90px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 16%, transparent),
    transparent 68%
  );
  pointer-events: none;
}

.status-warn {
  border-color: rgba(251, 191, 36, 0.22);
}

.status-crit {
  border-color: rgba(244, 63, 94, 0.28);
}

.card-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.icon-shell {
  width: 38px;
  height: 38px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
}

.ring-wrap {
  position: relative;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
}

.ring-wrap circle:last-child {
  transition: stroke-dasharray 0.5s ease;
  filter: drop-shadow(
    0 0 5px color-mix(in srgb, var(--accent) 68%, transparent)
  );
}

.ring-pct {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 8px;
  font-weight: 700;
  color: var(--text-secondary);
}

.card-value {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value-num {
  font-family: var(--font-mono);
  font-size: clamp(25px, 2vw, 32px);
  font-weight: 700;
  line-height: 1;
  color: var(--text-primary);
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}

.value-unit {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
}

.card-label {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: var(--text-primary);
}

.card-description {
  margin-top: 3px;
  font-size: 11px;
  color: var(--text-secondary);
}

.card-footer {
  position: relative;
  z-index: 1;
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-bar {
  flex: 1;
  height: 5px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.055);
}

.card-bar-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.5s ease;
  box-shadow: 0 0 14px color-mix(in srgb, var(--accent) 60%, transparent);
}

.trend-badge {
  width: 24px;
  height: 24px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.trend-up {
  color: var(--neon-red);
  background: rgba(244, 63, 94, 0.1);
}

.trend-down {
  color: var(--neon-green);
  background: rgba(34, 211, 160, 0.1);
}

.trend-flat {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.035);
}

@media (max-width: 560px) {
  .metric-card {
    min-height: 138px;
    padding: 13px;
  }

  .icon-shell {
    width: 34px;
    height: 34px;
  }
}
</style>
