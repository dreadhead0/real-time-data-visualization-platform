<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";

import { escapeHtml, safeTooltipNumber } from "@/utils/sanitize";
import { HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { HeatmapCell } from "@/types/analytics";

echarts.use([
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

const props = defineProps<{
  cells: HeatmapCell[];
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function renderChart() {
  if (!chart) return;

  const buckets = ["CPU", "Memory", "Network", "Security", "Logs", "Markets"];
  const latest = props.cells.slice(0, 120).reverse();

  const timeBuckets = Array.from(
    new Set(
      latest.map((cell) =>
        new Date(cell.timestamp).toLocaleTimeString([], {
          minute: "2-digit",
          second: "2-digit",
        }),
      ),
    ),
  ).slice(-20);

  const data = latest
    .map((cell) => {
      const time = new Date(cell.timestamp).toLocaleTimeString([], {
        minute: "2-digit",
        second: "2-digit",
      });

      return [
        timeBuckets.indexOf(time),
        buckets.indexOf(cell.bucket),
        cell.value,
      ];
    })
    .filter(([x, y]) => x >= 0 && y >= 0);

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(148, 163, 184, 0.18)",
      textStyle: { color: "#e5edf8" },
      formatter(params: any) {
        const [x, y, value] = params.value;
        return `${escapeHtml(buckets[y])}<br/>${escapeHtml(timeBuckets[x])} · ${safeTooltipNumber(value)}% intensity`;
      },
    },
    grid: {
      left: 56,
      right: 20,
      top: 20,
      bottom: 38,
    },
    xAxis: {
      type: "category",
      data: timeBuckets,
      axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.18)" } },
      axisLabel: { color: "#8b98aa", fontSize: 10 },
      splitArea: {
        show: true,
        areaStyle: { color: ["rgba(255,255,255,0.01)", "transparent"] },
      },
    },
    yAxis: {
      type: "category",
      data: buckets,
      axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.18)" } },
      axisLabel: { color: "#8b98aa", fontSize: 10 },
      splitArea: {
        show: true,
        areaStyle: { color: ["rgba(255,255,255,0.01)", "transparent"] },
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      show: false,
      inRange: {
        color: ["#0f172a", "#0ea5e9", "#22c55e", "#fbbf24", "#f43f5e"],
      },
    },
    series: [
      {
        type: "heatmap",
        data,
        progressive: 200,
        animation: true,
        animationDuration: 240,
        emphasis: {
          itemStyle: {
            borderColor: "#e5edf8",
            borderWidth: 1,
          },
        },
      },
    ],
  });
}

onMounted(() => {
  if (!chartEl.value) return;

  chart = echarts.init(chartEl.value);
  renderChart();

  resizeObserver = new ResizeObserver(() => chart?.resize());
  resizeObserver.observe(chartEl.value);
});

watch(() => props.cells, renderChart, { deep: true });

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
});
</script>

<template>
  <div ref="chartEl" class="advanced-chart"></div>
</template>

<style scoped>
.advanced-chart {
  width: 100%;
  height: 300px;
}
</style>
