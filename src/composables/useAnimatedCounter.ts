import { ref, watch } from 'vue'

export function useAnimatedCounter(
  getValue: () => number,
  decimals = 1,
  durationMs = 400,
) {
  const displayed = ref(0)
  let rafId: number | null = null

  watch(getValue, (target) => {
    const start = displayed.value
    const delta = target - start
    if (Math.abs(delta) < 0.01) return

    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out-cubic
      displayed.value = Math.round((start + delta * eased) * Math.pow(10, decimals)) / Math.pow(10, decimals)
      if (t < 1) rafId = requestAnimationFrame(step)
    }

    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(step)
  })

  return { displayed }
}
