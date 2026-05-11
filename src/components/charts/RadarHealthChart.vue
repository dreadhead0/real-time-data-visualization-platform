<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { RadarChart } from "echarts/charts";
import { RadarComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { RadarHealthProfile } from "@/types/analytics";

echarts.use([RadarChart, RadarComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
  profile: RadarHealthProfile;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function renderChart() {
  if (!chart) return;

  const values = [
    props.profile.performance,
    props.profile.reliability,
    props.profile.security,
    props.profile.network,
    props.profile.throughput,
    props.profile.stability,
  ];

  chart.setOption(
    {
      backgroundColor: "transparent",
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "rgba(148, 163, 184, 0.18)",
        textStyle: { color: "#e5edf8" },
        formatter() {
          return `
            Performance: ${props.profile.performance}%<br/>
            Reliability: ${props.profile.reliability}%<br/>
            Security: ${props.profile.security}%<br/>
            Network: ${props.profile.network}%<br/>
            Throughput: ${props.profile.throughput}%<br/>
            Stability: ${props.profile.stability}%
          `;
        },
      },
      radar: {
        radius: "66%",
        splitNumber: 4,
        axisName: {
          color: "#8b98aa",
          fontSize: 11,
        },
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitArea: {
          areaStyle: {
            color: ["rgba(56, 189, 248, 0.05)", "rgba(255,255,255,0.01)"],
          },
        },
        axisLine: {
          lineStyle: { color: "rgba(148, 163, 184, 0.16)" },
        },
        splitLine: {
          lineStyle: { color: "rgba(148, 163, 184, 0.14)" },
        },
        indicator: [
          { name: "Performance" },
          { name: "Reliability" },
          { name: "Security" },
          { name: "Network" },
          { name: "Throughput" },
          { name: "Stability" },
        ],
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: values,
              name: "Health",
              areaStyle: {
                color: "rgba(56, 189, 248, 0.18)",
              },
              lineStyle: {
                color: "#38bdf8",
                width: 2,
              },
              itemStyle: {
                color: "#38bdf8",
              },
            },
          ],
          animationDuration: 250,
        },
      ],
    },
    {
      notMerge: true,
      lazyUpdate: true,
    },
  );
}

onMounted(() => {
  if (!chartEl.value) return;

  chart = echarts.init(chartEl.value);
  renderChart();

  resizeObserver = new ResizeObserver(() => chart?.resize());
  resizeObserver.observe(chartEl.value);
});

watch(() => props.profile, renderChart, { deep: true });

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
  chart = null;
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
