<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import {
  Activity,
  BarChart3,
  Cpu,
  Globe2,
  LogOut,
  Menu,
  Settings,
  Shield,
} from "lucide-vue-next";
import { ref } from "vue";

const sidebarOpen = ref(false);
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

      <nav class="sidebar__nav">
        <RouterLink to="/app">
          <BarChart3 :size="18" />
          Dashboard
        </RouterLink>

        <RouterLink to="/app">
          <Cpu :size="18" />
          Infrastructure
        </RouterLink>

        <RouterLink to="/app">
          <Shield :size="18" />
          Security
        </RouterLink>

        <RouterLink to="/app">
          <Globe2 :size="18" />
          Geography
        </RouterLink>

        <RouterLink to="/app/settings">
          <Settings :size="18" />
          Settings
        </RouterLink>
      </nav>

      <RouterLink to="/" class="sidebar__logout">
        <LogOut :size="18" />
        Exit
      </RouterLink>
    </aside>

    <div
      class="mobile-overlay"
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
    />

    <main class="workspace">
      <header class="topbar">
        <button class="icon-button mobile-menu" @click="sidebarOpen = true">
          <Menu :size="20" />
        </button>

        <div>
          <p class="eyebrow">Real-time command center</p>
          <h2>Live Operations Dashboard</h2>
        </div>

        <div class="topbar__status">
          <span class="live-dot"></span>
          Live
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>
