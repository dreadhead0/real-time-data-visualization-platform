<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { CandlestickChart, BarChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { MarketTick } from "@/types/analytics";

echarts.use([
  CandlestickChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

const props = defineProps<{
  ticks: MarketTick[];
  symbol: string;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function renderChart() {
  if (!chart) return;

  const ticks = props.ticks.slice(-80);

  const labels = ticks.map((tick) =>
    new Date(tick.timestamp).toLocaleTimeString([], {
      minute: "2-digit",
      second: "2-digit",
    }),
  );

  const candleData = ticks.map((tick) => [
    tick.open,
    tick.close,
    tick.low,
    tick.high,
  ]);
  const volumeData = ticks.map((tick) => tick.volume);

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(148, 163, 184, 0.18)",
      textStyle: { color: "#e5edf8" },
    },
    grid: [
      {
        left: 48,
        right: 18,
        top: 18,
        height: 180,
      },
      {
        left: 48,
        right: 18,
        top: 225,
        height: 45,
      },
    ],
    xAxis: [
      {
        type: "category",
        data: labels,
        boundaryGap: true,
        axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.18)" } },
        axisLabel: { color: "#8b98aa", fontSize: 10 },
      },
      {
        type: "category",
        gridIndex: 1,
        data: labels,
        axisLabel: { show: false },
        axisLine: { lineStyle: { color: "rgba(148, 163, 184, 0.18)" } },
      },
    ],
    yAxis: [
      {
        scale: true,
        axisLabel: { color: "#8b98aa", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(148, 163, 184, 0.08)" } },
      },
      {
        scale: true,
        gridIndex: 1,
        axisLabel: { show: false },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0, 1],
        start: 45,
        end: 100,
      },
    ],
    series: [
      {
        name: props.symbol,
        type: "candlestick",
        data: candleData,
        itemStyle: {
          color: "#22c55e",
          color0: "#f43f5e",
          borderColor: "#22c55e",
          borderColor0: "#f43f5e",
        },
        animationDuration: 250,
      },
      {
        name: "Volume",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeData,
        itemStyle: {
          color: "rgba(56, 189, 248, 0.38)",
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

watch(() => [props.ticks, props.symbol], renderChart, { deep: true });

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
