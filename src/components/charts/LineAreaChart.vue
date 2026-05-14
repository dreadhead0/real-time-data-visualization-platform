<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { MetricName } from "@/types/domain";

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
  seriesData: [number, number][];
  metric: MetricName;
  color?: string;
  unit?: string;
  title?: string;
}>();

const el = ref<HTMLDivElement | null>(null);

let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId = 0;

function getColor() {
  return props.color ?? "#38bdf8";
}

function isCompactChart() {
  return (el.value?.clientWidth ?? window.innerWidth) < 520;
}

function buildOption() {
  const color = getColor();

  return {
    animation: false,
    backgroundColor: "transparent",
    textStyle: {
      color: "#7d8fa8",
      fontFamily: "'JetBrains Mono', monospace",
    },
    grid: {
      left: isCompactChart() ? 34 : 44,
      right: isCompactChart() ? 10 : 14,
      top: 12,
      bottom: isCompactChart() ? 36 : 30,
      containLabel: true,
    },
    ltip: {
      trigger: "axis",
      appendToBody: true,
      backgroundColor: "rgba(9,13,26,0.96)",
      borderColor: "rgba(148, 163, 184, 0.18)",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: "#e2e8f0",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      formatter: (params: unknown) => {
        const point = (params as { value: [number, number] }[])[0];
        if (!point?.value) return "";

        const date = new Date(point.value[0]);
        const value = Number(point.value[1]);

        return `
          <span style="color:#7d8fa8;font-size:10px">${date.toLocaleTimeString()}</span><br/>
          <span style="color:${color}">${props.metric.toUpperCase()}</span>
          <b>${value.toFixed(2)}${props.unit ?? ""}</b>
        `;
      },
      axisPointer: {
        lineStyle: {
          color: "rgba(255,255,255,0.12)",
          type: "dashed",
        },
      },
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      minInterval: isCompactChart() ? 30_000 : 10_000,
      maxInterval: isCompactChart() ? 120_000 : undefined,
      axisLine: {
        lineStyle: { color: "rgba(148, 163, 184, 0.12)" },
      },
      axisTick: { show: false },
      axisLabel: {
        color: "#4b5f78",
        fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: props.unit === "%" ? 100 : undefined,
      axisLabel: {
        color: "#4b5f78",
        fontSize: isCompactChart() ? 8 : 10,
        fontFamily: "'JetBrains Mono', monospace",
        hideOverlap: true,
        showMinLabel: true,
        showMaxLabel: true,
        formatter: (value: number) => {
          const date = new Date(value);

          if (isCompactChart()) {
            return date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }

          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        },
      },
      splitLine: {
        lineStyle: {
          color: "rgba(148, 163, 184, 0.08)",
          type: "dashed",
        },
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "line",
        data: props.seriesData,
        smooth: 0.35,
        symbol: "none",
        showSymbol: false,
        lineStyle: {
          color,
          width: 2,
          shadowColor: `${color}66`,
          shadowBlur: 10,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}35` },
            { offset: 0.55, color: `${color}12` },
            { offset: 1, color: `${color}00` },
          ]),
        },
        emphasis: { disabled: true },
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
    if (!chart) return;
    chart.resize();
  });

  resizeObserver.observe(el.value);

  rafId = window.requestAnimationFrame(renderChart);
}

onMounted(initChart);

watch(
  () => props.seriesData,
  (data) => {
    if (!chart) return;

    chart.setOption(
      {
        series: [
          {
            data,
          },
        ],
      },
      {
        notMerge: false,
        lazyUpdate: true,
      },
    );

    chart.resize();
  },
);

watch(
  () => [props.metric, props.color, props.unit],
  () => {
    renderChart();
  },
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
  <div class="chart-wrapper">
    <div ref="el" class="chart-canvas" />
  </div>
</template>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 220px;
  display: flex;
}

.chart-canvas {
  width: 100%;
  height: 100%;
  min-height: 220px;
}
</style>
