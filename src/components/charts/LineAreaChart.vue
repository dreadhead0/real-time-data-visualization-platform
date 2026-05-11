<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartResize } from '@/composables/useChartResize'
import type { MetricName } from '@/types/domain'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer])

const props = defineProps<{
  seriesData: [number, number][]
  metric: MetricName
  color?: string
  unit?: string
  title?: string
}>()

const el = ref<HTMLDivElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)
const chartRef = computed(() => chartInstance.value as unknown as import('echarts/core').EChartsType | null)
useChartResize(chartRef)

const accent = computed(() => props.color ?? '#38bdf8')

function buildOption() {
  const c = accent.value
  return {
    animation: false,
    backgroundColor: 'transparent',
    textStyle: { color: '#7d8fa8', fontFamily: "'JetBrains Mono', monospace" },
    grid: { left: 44, right: 12, top: 12, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(9,13,26,0.95)',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#e2e8f0', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
      formatter: (params: unknown[]) => {
        const p = (params as { value: [number, number] }[])[0]
        const d = new Date(p.value[0])
        return `<span style="color:#7d8fa8;font-size:10px">${d.toLocaleTimeString()}</span><br/><span style="color:${c}">${props.metric}</span> <b>${p.value[1].toFixed(2)}${props.unit ?? ''}</b>`
      },
      axisPointer: { lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' } },
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
      axisLabel: { color: '#3d4f65', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#3d4f65', fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
        formatter: (v: number) => `${v}${props.unit ?? ''}`,
      },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'line',
        data: props.seriesData,
        smooth: 0.4,
        symbol: 'none',
        lineStyle: { color: c, width: 1.5, shadowColor: c + '55', shadowBlur: 8 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0,   color: c + '33' },
            { offset: 0.5, color: c + '0a' },
            { offset: 1,   color: c + '00' },
          ]),
        },
        emphasis: { disabled: true },
        large: true,
        largeThreshold: 200,
      },
    ],
  }
}

onMounted(() => {
  if (!el.value) return
  chartInstance.value = echarts.init(el.value, undefined, { renderer: 'canvas' })
  chartInstance.value.setOption(buildOption())
})

watch(
  () => props.seriesData,
  (data) => {
    if (!chartInstance.value) return
    chartInstance.value.setOption({ series: [{ data }] }, { notMerge: false })
  },
  { deep: false },
)

onUnmounted(() => {
  chartInstance.value?.dispose()
  chartInstance.value = null
})
</script>

<template>
  <div class="chart-wrapper">
    <div ref="el" class="chart-canvas" />
  </div>
</template>

<style scoped>
.chart-wrapper { display: flex; flex-direction: column; width: 100%; height: 100%; }
.chart-canvas  { flex: 1; min-height: 160px; }
</style>
