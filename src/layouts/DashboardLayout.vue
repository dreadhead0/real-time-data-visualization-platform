<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import {
  Activity,
  BarChart3,
  Cpu,
  Globe2,
  LogOut,
  Menu,
  Moon,
  Settings,
  Shield,
  Sun,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { usePreferencesStore } from "@/stores/preferences";
import { useAnalyticsStore } from "@/stores/analytics";
import { useAuthStore } from "@/stores/auth";
import type { AdvancedChartMode } from "@/types/analytics";

const sidebarOpen = ref(false);

const router = useRouter();
const route = useRoute();
const preferences = usePreferencesStore();
const analytics = useAnalyticsStore();
const auth = useAuthStore();

const isDashboardRoute = computed(() => route.name === "dashboard");

const initials = computed(() => {
  return preferences.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

function toggleTheme() {
  preferences.setTheme(
    preferences.effectiveTheme === "dark" ? "light" : "dark",
  );
}

function logout() {
  auth.logout();
  sidebarOpen.value = false;
  router.push("/");
}

function goToDashboardMode(mode: AdvancedChartMode) {
  analytics.setChartMode(mode);
  sidebarOpen.value = false;
  router.push("/app");
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar__brand">
        <div class="brand-mark">
          <Activity :size="20" />
        </div>
        <div>
          <h1>PulseOps</h1>
          <span>Analytics Platform</span>
        </div>
      </div>

      <div class="sidebar-profile">
        <div class="sidebar-avatar">
          <img
            v-if="preferences.avatarDataUrl"
            :src="preferences.avatarDataUrl"
            alt="Profile avatar"
          />
          <span v-else>{{ initials }}</span>
        </div>

        <div>
          <strong>{{ preferences.displayName }}</strong>
          <span>{{ preferences.role }}</span>
        </div>
      </div>

      <nav class="sidebar__nav">
        <button
          type="button"
          :class="{
            active: isDashboardRoute && analytics.chartMode === 'overview',
          }"
          @click="goToDashboardMode('overview')"
        >
          <BarChart3 :size="18" />
          Dashboard
        </button>

        <button
          type="button"
          :class="{
            active: isDashboardRoute && analytics.chartMode === 'network',
          }"
          @click="goToDashboardMode('network')"
        >
          <Cpu :size="18" />
          Infrastructure
        </button>

        <button
          type="button"
          :class="{
            active: isDashboardRoute && analytics.chartMode === 'security',
          }"
          @click="goToDashboardMode('security')"
        >
          <Shield :size="18" />
          Security
        </button>

        <button
          type="button"
          :class="{
            active: isDashboardRoute && analytics.chartMode === 'geography',
          }"
          @click="goToDashboardMode('geography')"
        >
          <Globe2 :size="18" />
          Geography
        </button>

        <RouterLink to="/app/settings" @click="sidebarOpen = false">
          <Settings :size="18" />
          Settings
        </RouterLink>
      </nav>

      <button class="sidebar__logout" type="button" @click="logout">
        <LogOut :size="18" />
        Logout
      </button>
    </aside>

    <div
      class="mobile-overlay"
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
    />

    <main class="workspace">
      <header class="topbar">
        <button
          class="icon-button mobile-menu"
          type="button"
          @click="sidebarOpen = true"
        >
          <Menu :size="20" />
        </button>

        <div>
          <p class="eyebrow">Real-time command center</p>
          <h2>Live Operations Dashboard</h2>
        </div>

        <div class="topbar__actions">
          <button
            class="theme-toggle"
            type="button"
            :aria-label="
              preferences.effectiveTheme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            "
            @click="toggleTheme"
          >
            <Sun v-if="preferences.effectiveTheme === 'dark'" :size="17" />
            <Moon v-else :size="17" />
            <span class="theme-toggle__text">
              {{ preferences.effectiveTheme === "dark" ? "Light" : "Dark" }}
            </span>
          </button>

          <div class="topbar__status">
            <span class="live-dot"></span>
            Live
          </div>
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>
