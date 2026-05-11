<script setup lang="ts">
import { RouterView } from "vue-router";
import { onBeforeUnmount, onMounted, watch } from "vue";
import { usePreferencesStore } from "@/stores/preferences";
import ToastHost from "@/components/ui/ToastHost.vue";

const preferences = usePreferencesStore();

let mediaQuery: MediaQueryList | null = null;

function applyTheme() {
  document.documentElement.dataset.theme = preferences.effectiveTheme;
}

function handleSystemThemeChange() {
  if (preferences.theme === "system") {
    applyTheme();
  }
}

onMounted(() => {
  applyTheme();

  mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
  mediaQuery.addEventListener("change", handleSystemThemeChange);
});

watch(
  () => preferences.effectiveTheme,
  () => applyTheme(),
);

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", handleSystemThemeChange);
});
</script>

<template>
  <RouterView />
  <ToastHost />
</template>
