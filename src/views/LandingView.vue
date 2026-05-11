<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Activity, BarChart3, Globe2, ShieldCheck, Zap } from "lucide-vue-next";
</script>

<template>
  <main class="landing-page">
    <nav class="landing-nav">
      <div class="sidebar__brand">
        <div class="brand-mark">
          <Activity :size="20" />
        </div>
        <div>
          <h1>PulseOps</h1>
          <span>Analytics Platform</span>
        </div>
      </div>

      <div class="landing-nav__actions">
        <RouterLink to="/login" class="ghost-link">Login</RouterLink>
        <RouterLink to="/signup" class="primary-button">Get Started</RouterLink>
      </div>
    </nav>

    <section class="hero">
      <div class="hero__content">
        <p class="eyebrow">Real-time analytics platform</p>
        <h1>
          Monitor infrastructure, security, markets, logs, and global activity
          in one live dashboard.
        </h1>
        <p>
          A high-performance visualization platform built with Vue, TypeScript,
          Pinia, and ECharts.
        </p>

        <div class="hero__actions">
          <RouterLink to="/app" class="primary-button"
            >Launch Dashboard</RouterLink
          >
          <RouterLink to="/login" class="secondary-button">Sign In</RouterLink>
        </div>
      </div>

      <div class="hero-card">
        <div class="metric-preview">
          <CpuIcon />
        </div>

        <div class="hero-card__grid">
          <div>
            <BarChart3 :size="24" />
            <strong>Live Charts</strong>
            <span>Line, area, bar, radar, heatmap</span>
          </div>
          <div>
            <ShieldCheck :size="24" />
            <strong>Security Events</strong>
            <span>Severity alerts and threat logs</span>
          </div>
          <div>
            <Globe2 :size="24" />
            <strong>Geo Traffic</strong>
            <span>Global source visualization</span>
          </div>
          <div>
            <Zap :size="24" />
            <strong>Fast Streaming</strong>
            <span>Smooth real-time updates</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { Cpu as CpuIcon } from "lucide-vue-next";
</script>
