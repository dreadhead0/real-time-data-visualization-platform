<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { GraphChart } from "echarts/charts";
import { LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ServiceEdge, ServiceNode } from "@/types/analytics";

import { escapeHtml, safeTooltipNumber } from "@/utils/sanitize";

echarts.use([GraphChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const props = defineProps<{
  nodes: ServiceNode[];
  edges: ServiceEdge[];
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId = 0;

const categoryColor: Record<ServiceNode["category"], string> = {
  frontend: "#38bdf8",
  api: "#22c55e",
  database: "#a78bfa",
  queue: "#fbbf24",
  cache: "#06b6d4",
  worker: "#fb7185",
  external: "#f97316",
};

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

  const categories = [
    { name: "frontend" },
    { name: "api" },
    { name: "database" },
    { name: "queue" },
    { name: "cache" },
    { name: "worker" },
    { name: "external" },
  ];

  const nodes = props.nodes.map((node) => ({
    id: node.id,
    name: node.name,
    value: node.requests,
    category: node.category,
    symbolSize: mobile
      ? Math.max(28, Math.min(58, node.requests / 60))
      : Math.max(34, Math.min(74, node.requests / 50)),
    itemStyle: {
      color: categoryColor[node.category],
      shadowBlur: mobile ? 12 : 18,
      shadowColor: categoryColor[node.category],
    },
    label: {
      color: "#e5edf8",
      overflow: "truncate",
      width: mobile ? 72 : 120,
    },
    health: node.health,
    errorRate: node.errorRate,
  }));

  const links = props.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    value: edge.traffic,
    lineStyle: {
      width: Math.max(1, Math.min(5, edge.traffic / 400)),
      color: edge.latency > 250 ? "#f43f5e" : "rgba(56, 189, 248, 0.42)",
      curveness: 0.18,
    },
    latency: edge.latency,
  }));

  chart.resize();

  chart.setOption(
    {
      backgroundColor: "transparent",
      tooltip: {
        appendToBody: true,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(148, 163, 184, 0.18)",
        textStyle: { color: "#e5edf8" },
formatter(params: any) {
  if (params.dataType === "edge") {
    return `Traffic: ${safeTooltipNumber(params.data.value)}<br/>Latency: ${safeTooltipNumber(params.data.latency)}ms`;
  }

  return `${escapeHtml(params.data.name)}<br/>Health: ${safeTooltipNumber(params.data.health)}%<br/>Requests: ${safeTooltipNumber(params.data.value)}<br/>Errors: ${safeTooltipNumber(params.data.errorRate)}%`;
}
      },
      legend: {
        top: mobile ? 8 : 4,
        left: "center",
        orient: "horizontal",
        itemWidth: 18,
        itemHeight: 10,
        textStyle: {
          color: "#8b98aa",
          fontSize: mobile ? 9 : 10,
        },
        data: categories.map((category) => category.name),
      },
      series: [
        {
          type: "graph",
          layout: "force",
          roam: true,
          draggable: true,
          categories,
          data: nodes,
          links,

          left: mobile ? "6%" : "8%",
          right: mobile ? "10%" : "8%",
          top: mobile ? 92 : 62,
          bottom: mobile ? 28 : 24,

          label: {
            show: true,
            position: mobile ? "bottom" : "right",
            distance: mobile ? 6 : 8,
            fontSize: mobile ? 9 : 10,
            color: "#e5edf8",
            overflow: "truncate",
            width: mobile ? 76 : 120,
          },

          force: {
            repulsion: mobile ? 170 : 270,
            edgeLength: mobile ? 78 : 115,
            gravity: mobile ? 0.08 : 0.04,
          },

          lineStyle: {
            opacity: 0.8,
          },

          emphasis: {
            focus: "adjacency",
          },

          animationDuration: 350,
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

watch(() => [props.nodes, props.edges], renderChart, { deep: true });

onBeforeUnmount(() => {
  window.cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  chart?.dispose();

  resizeObserver = null;
  chart = null;
});
</script>

<template>
  <div class="network-chart-shell">
    <div ref="chartEl" class="advanced-chart"></div>
  </div>
</template>

<style scoped>
.network-chart-shell {
  width: 100%;
  min-height: 380px;
  overflow: hidden;
}

.advanced-chart {
  width: 100%;
  height: 380px;
}

@media (max-width: 680px) {
  .network-chart-shell {
    min-height: 460px;
  }

  .advanced-chart {
    height: 460px;
  }
}
</style>
