<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import { escapeHtml, safeTooltipNumber } from "@/utils/sanitize";

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
  labels: string[];
  values: number[];
  colors?: string[];
  unit?: string;
}>();

const COLORS = [
  "#38bdf8",
  "#22d3a0",
  "#a78bfa",
  "#f43f5e",
  "#fbbf24",
  "#06b6d4",
];

const el = ref<HTMLDivElement | null>(null);

let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId = 0;

function buildOption() {
  return {
    animation: true,
    animationDuration: 400,
    backgroundColor: "transparent",

    grid: {
      left: 8,
      right: 16,
      top: 18,
      bottom: 38,
      containLabel: true,
    },

    tooltip: {
      trigger: "axis",
      appendToBody: true,
      backgroundColor: "rgba(9,13,26,0.95)",
      borderColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      textStyle: {
        color: "#e2e8f0",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      formatter: (params: unknown) => {
        const points = params as {
          name: string;
          value: number;
          color: string;
        }[];

        const point = points[0];

        if (!point) return "";

        return `<span style="color:${escapeHtml(point.color)}">■</span> ${escapeHtml(point.name)}: <b>${safeTooltipNumber(point.value).toFixed(1)}${escapeHtml(props.unit ?? "")}</b>`;
      },
    },

    xAxis: {
      type: "category",
      data: props.labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#3d4f65",
        fontSize: 10,
        interval: 0,
        hideOverlap: true,
        fontFamily: "'JetBrains Mono', monospace",
      },
    },

    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: {
        color: "#3d4f65",
        fontSize: 10,
        formatter: (value: number) => `${value}${props.unit ?? ""}`,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.04)",
          type: "dashed",
        },
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },

    series: [
      {
        type: "bar",
        data: props.values.map((value, index) => {
          const color = (props.colors ?? COLORS)[index % COLORS.length];

          return {
            value,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color },
                { offset: 1, color: `${color}44` },
              ]),
              borderRadius: [5, 5, 0, 0],
              shadowColor: `${color}55`,
              shadowBlur: 8,
            },
          };
        }),
        barMaxWidth: 36,
        barMinWidth: 12,
        barGap: "28%",
      },
    ],
  };
}

function renderChart() {
  if (!chart || !el.value) return;

  const width = el.value.clientWidth;
  const height = el.value.clientHeight;

  if (width <= 0 || height <= 0) {
    rafId = window.requestAnimationFrame(renderChart);
    return;
  }

  chart.resize();
  chart.setOption(buildOption(), {
    notMerge: true,
    lazyUpdate: false,
  });
}

async function initChart() {
  await nextTick();

  if (!el.value) return;

  chart = echarts.init(el.value, undefined, {
    renderer: "canvas",
  });

  resizeObserver = new ResizeObserver(() => {
    chart?.resize();
  });

  resizeObserver.observe(el.value);

  rafId = window.requestAnimationFrame(renderChart);
}

onMounted(initChart);

watch(
  [() => props.labels, () => props.values],
  () => {
    renderChart();
  },
  { deep: true },
);

onUnmounted(() => {
  window.cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  chart?.dispose();

  resizeObserver = null;
  chart = null;
});
</script>

<template>
  <div class="bar-chart-shell">
    <div ref="el" class="bar-canvas" />
  </div>
</template>

<style scoped>
.bar-chart-shell {
  width: 100%;
  height: 100%;
  min-height: 220px;
  overflow: hidden;
}

.bar-canvas {
  width: 100%;
  height: 100%;
  min-height: 220px;
}

@media (max-width: 680px) {
  .bar-chart-shell,
  .bar-canvas {
    min-height: 260px;
  }
}
</style>
