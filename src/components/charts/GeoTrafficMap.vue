<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { ScatterChart, EffectScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { GeoTrafficPoint } from "@/types/analytics";

echarts.use([
  ScatterChart,
  EffectScatterChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

const props = defineProps<{
  points: GeoTrafficPoint[];
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function renderChart() {
  if (!chart) return;

  const latest = props.points.slice(0, 120);

  const trafficData = latest.map((point) => [
    point.lon,
    point.lat,
    point.requests,
    point.city,
    point.country,
    point.latency,
  ]);

  const threatData = latest
    .filter((point) => point.threats > 0)
    .map((point) => [
      point.lon,
      point.lat,
      point.threats,
      point.city,
      point.country,
      point.latency,
    ]);

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(148, 163, 184, 0.18)",
      textStyle: { color: "#e5edf8" },
      formatter(params: any) {
        const [, , value, city, country, latency] = params.value;

        return `${city}, ${country}<br/>${params.seriesName}: ${value}<br/>Latency: ${latency}ms`;
      },
    },
    grid: {
      left: 36,
      right: 20,
      top: 20,
      bottom: 32,
    },
    xAxis: {
      type: "value",
      min: -180,
      max: 180,
      name: "Longitude",
      nameTextStyle: { color: "#8b98aa" },
      axisLabel: { color: "#8b98aa", fontSize: 10 },
      axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.18)" } },
      splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.08)" } },
    },
    yAxis: {
      type: "value",
      min: -60,
      max: 80,
      name: "Latitude",
      nameTextStyle: { color: "#8b98aa" },
      axisLabel: { color: "#8b98aa", fontSize: 10 },
      axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.18)" } },
      splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.08)" } },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 10000,
      dimension: 2,
      inRange: {
        symbolSize: [8, 34],
        color: ["#38bdf8", "#22c55e", "#fbbf24"],
      },
    },
    series: [
      {
        name: "Requests",
        type: "scatter",
        data: trafficData,
        symbolSize(value: number[]) {
          return Math.max(7, Math.min(30, value[2] / 350));
        },
        itemStyle: {
          color: "rgba(56, 189, 248, 0.66)",
          shadowBlur: 14,
          shadowColor: "rgba(56, 189, 248, 0.65)",
        },
        large: true,
        largeThreshold: 200,
      },
      {
        name: "Threats",
        type: "effectScatter",
        data: threatData,
        symbolSize(value: number[]) {
          return Math.max(10, Math.min(36, value[2] * 1.5));
        },
        rippleEffect: {
          brushType: "stroke",
          scale: 3,
        },
        itemStyle: {
          color: "#f43f5e",
          shadowBlur: 18,
          shadowColor: "rgba(244, 63, 94, 0.75)",
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

watch(() => props.points, renderChart, { deep: true });

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
  height: 340px;
}
</style>
