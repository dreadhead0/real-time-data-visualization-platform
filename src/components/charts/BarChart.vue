<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useChartResize } from '@/composables/useChartResize'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  labels: string[]
  values: number[]
  colors?: string[]
  unit?: string
}>()

const COLORS = ['#38bdf8','#22d3a0','#a78bfa','#f43f5e','#fbbf24','#06b6d4']

const el = ref<HTMLDivElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)
const chartRef = computed(() => chartInstance.value as unknown as import('echarts/core').EChartsType | null)
useChartResize(chartRef)

function buildOption() {
  return {
    animation: true,
    animationDuration: 400,
    backgroundColor: 'transparent',
    grid: { left: 12, right: 12, top: 12, bottom: 32, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(9,13,26,0.95)',
      borderColor: 'rgba(255,255,255,0.08)',
      textStyle: { color: '#e2e8f0', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
      formatter: (params: unknown[]) => {
        const p = params as { name: string; value: number; color: string }[]
        return `<span style="color:${p[0].color}">■</span> ${p[0].name}: <b>${p[0].value.toFixed(1)}${props.unit ?? ''}</b>`
      },
    },
    xAxis: {
      type: 'category',
      data: props.labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#3d4f65', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#3d4f65', fontSize: 10, formatter: (v: number) => `${v}${props.unit ?? ''}` },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: props.values.map((v, i) => {
          const color = (props.colors ?? COLORS)[i % COLORS.length]
          return {
            value: v,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: color },
                { offset: 1, color: color + '44' },
              ]),
              borderRadius: [4, 4, 0, 0],
              shadowColor: color + '55',
              shadowBlur: 8,
            },
          }
        }),
        barMaxWidth: 40,
        barGap: '20%',
      },
    ],
  }
}

onMounted(() => {
  if (!el.value) return
  chartInstance.value = echarts.init(el.value, undefined, { renderer: 'canvas' })
  chartInstance.value.setOption(buildOption())
})

watch([() => props.labels, () => props.values], () => {
  chartInstance.value?.setOption(buildOption(), { notMerge: false })
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  chartInstance.value = null
})
</script>

<template>
  <div ref="el" class="bar-canvas" />
</template>

<style scoped>
.bar-canvas { width: 100%; min-height: 180px; }
</style>
