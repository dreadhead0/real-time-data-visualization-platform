<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { GraphChart } from "echarts/charts";
import { LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ServiceEdge, ServiceNode } from "@/types/analytics";

echarts.use([GraphChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const props = defineProps<{
  nodes: ServiceNode[];
  edges: ServiceEdge[];
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const categoryColor: Record<ServiceNode["category"], string> = {
  frontend: "#38bdf8",
  api: "#22c55e",
  database: "#a78bfa",
  queue: "#fbbf24",
  cache: "#06b6d4",
  worker: "#fb7185",
  external: "#f97316",
};

function renderChart() {
  if (!chart) return;

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
    symbolSize: Math.max(34, Math.min(74, node.requests / 50)),
    itemStyle: {
      color: categoryColor[node.category],
      shadowBlur: 18,
      shadowColor: categoryColor[node.category],
    },
    label: {
      color: "#e5edf8",
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

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(148, 163, 184, 0.18)",
      textStyle: { color: "#e5edf8" },
      formatter(params: any) {
        if (params.dataType === "edge") {
          return `Traffic: ${params.data.value}<br/>Latency: ${params.data.latency}ms`;
        }

        return `${params.data.name}<br/>Health: ${params.data.health}%<br/>Requests: ${params.data.value}<br/>Errors: ${params.data.errorRate}%`;
      },
    },
    legend: {
      top: 4,
      right: 6,
      textStyle: { color: "#8b98aa", fontSize: 10 },
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
        label: {
          show: true,
          position: "right",
          fontSize: 10,
        },
        force: {
          repulsion: 260,
          edgeLength: 110,
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
  });
}

onMounted(() => {
  if (!chartEl.value) return;

  chart = echarts.init(chartEl.value);
  renderChart();

  resizeObserver = new ResizeObserver(() => chart?.resize());
  resizeObserver.observe(chartEl.value);
});

watch(() => [props.nodes, props.edges], renderChart, { deep: true });

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
