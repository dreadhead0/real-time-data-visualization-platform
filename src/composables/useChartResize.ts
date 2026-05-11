import { onMounted, onUnmounted, type Ref } from 'vue'
import type { EChartsType } from 'echarts/core'

export function useChartResize(chartRef: Ref<EChartsType | null>) {
  let observer: ResizeObserver | null = null

  onMounted(() => {
    if (!chartRef.value) return
    const dom = (chartRef.value as unknown as { getDom: () => HTMLElement }).getDom()
    observer = new ResizeObserver(() => {
      chartRef.value?.resize()
    })
    observer.observe(dom)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })
}
