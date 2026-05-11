<script setup lang="ts">
import { ref, onMounted } from 'vue'

const dark = ref(false)

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark')
    || window.matchMedia('(prefers-color-scheme: dark)').matches
  apply()
})

function apply() {
  document.documentElement.classList.toggle('dark', dark.value)
}

function toggle() {
  dark.value = !dark.value
  apply()
}
</script>

<template>
  <button class="theme-toggle" :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggle">
    {{ dark ? '☀️' : '🌙' }}
  </button>
</template>

<style scoped>
.theme-toggle {
  font-size: 16px;
  padding: 6px 10px;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 8px;
  background: var(--color-background-secondary);
  cursor: pointer;
  line-height: 1;
}
</style>
