<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { ScatterChart, EffectScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { GeoTrafficPoint } from "@/types/analytics";

import { escapeHtml, safeTooltipNumber } from "@/utils/sanitize";

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
let rafId = 0;

function isMobileChart() {
  return (chartEl.value?.clientWidth ?? window.innerWidth) < 520;
}

function renderChart() {
  if (!chart || !chartEl.value) return;

  const width = chartEl.value.clientWidth;
  const height = chartEl.value.clientHeight;

  if (width <= 0 || height <= 0) {
    rafId = window.requestAnimationFrame(renderChart);
    return;
  }

  const mobile = isMobileChart();
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

  chart.resize();

  chart.setOption(
    {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "item",
        appendToBody: true,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(148, 163, 184, 0.18)",
        borderWidth: 1,
        confine: true,
        textStyle: { color: "#e5edf8" },
formatter(params: any) {
  const [, , value, city, country, latency] = params.value;

  return `${escapeHtml(city)}, ${escapeHtml(country)}<br/>${escapeHtml(params.seriesName)}: ${safeTooltipNumber(value)}<br/>Latency: ${safeTooltipNumber(latency)}ms`;
}
      },

      grid: {
        left: mobile ? 42 : 48,
        right: mobile ? 28 : 34,
        top: mobile ? 28 : 34,
        bottom: mobile ? 42 : 44,
        containLabel: true,
      },

      xAxis: {
        type: "value",
        min: -180,
        max: 180,
        name: "",
        axisLabel: {
          color: "#8b98aa",
          fontSize: mobile ? 9 : 10,
          margin: 10,
        },
        axisLine: {
          lineStyle: { color: "rgba(148, 163, 184, 0.18)" },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: { color: "rgba(148, 163, 184, 0.08)" },
        },
      },

      yAxis: {
        type: "value",
        min: -60,
        max: 80,
        name: "",
        axisLabel: {
          color: "#8b98aa",
          fontSize: mobile ? 9 : 10,
          margin: 10,
        },
        axisLine: {
          lineStyle: { color: "rgba(148, 163, 184, 0.18)" },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: { color: "rgba(148, 163, 184, 0.08)" },
        },
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
            return mobile
              ? Math.max(7, Math.min(24, value[2] / 420))
              : Math.max(7, Math.min(30, value[2] / 350));
          },
          itemStyle: {
            color: "rgba(56, 189, 248, 0.66)",
            shadowBlur: mobile ? 10 : 14,
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
            return mobile
              ? Math.max(9, Math.min(28, value[2] * 1.3))
              : Math.max(10, Math.min(36, value[2] * 1.5));
          },
          rippleEffect: {
            brushType: "stroke",
            scale: mobile ? 2.4 : 3,
          },
          itemStyle: {
            color: "#f43f5e",
            shadowBlur: mobile ? 12 : 18,
            shadowColor: "rgba(244, 63, 94, 0.75)",
          },
        },
      ],
    },
    {
      notMerge: true,
      lazyUpdate: false,
    },
  );
}

async function initChart() {
  await nextTick();

  if (!chartEl.value) return;

  chart = echarts.init(chartEl.value, undefined, {
    renderer: "canvas",
  });

  resizeObserver = new ResizeObserver(() => {
    renderChart();
  });

  resizeObserver.observe(chartEl.value);

  rafId = window.requestAnimationFrame(renderChart);
}

onMounted(initChart);

watch(() => props.points, renderChart, { deep: true });

onBeforeUnmount(() => {
  window.cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  chart?.dispose();

  resizeObserver = null;
  chart = null;
});
</script>

<template>
  <div class="geo-chart-shell">
    <div ref="chartEl" class="advanced-chart"></div>
  </div>
</template>

<style scoped>
.geo-chart-shell {
  width: 100%;
  min-height: 360px;
  overflow: hidden;
}

.advanced-chart {
  width: 100%;
  height: 360px;
}

@media (max-width: 680px) {
  .geo-chart-shell {
    min-height: 390px;
  }

  .advanced-chart {
    height: 390px;
  }
}
</style>
