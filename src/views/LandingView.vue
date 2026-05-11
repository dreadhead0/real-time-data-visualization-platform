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

        <h1>Real-time intelligence for modern operations teams.</h1>

        <p>
          Monitor infrastructure, security events, market activity, global
          traffic, and system logs from one responsive analytics command center.
        </p>

        <div class="hero__actions">
          <RouterLink to="/app" class="primary-button">
            Launch Dashboard
          </RouterLink>
          <RouterLink to="/login" class="secondary-button">
            Sign In
          </RouterLink>
        </div>

        <div class="hero-stats">
          <div>
            <strong>24/7</strong>
            <span>Live monitoring</span>
          </div>

          <div>
            <strong>6+</strong>
            <span>Data streams</span>
          </div>

          <div>
            <strong>100ms</strong>
            <span>Smooth updates</span>
          </div>
        </div>
      </div>

      <div class="hero-card">
        <div class="metric-preview landing-preview">
          <div class="preview-topline">
            <span></span>
            <strong>LIVE SYSTEM HEALTH</strong>
          </div>

          <div class="preview-chart">
            <i style="height: 38%"></i>
            <i style="height: 62%"></i>
            <i style="height: 49%"></i>
            <i style="height: 76%"></i>
            <i style="height: 58%"></i>
            <i style="height: 84%"></i>
            <i style="height: 68%"></i>
            <i style="height: 91%"></i>
          </div>

          <div class="preview-metrics">
            <span>CPU 68%</span>
            <span>Risk 12</span>
            <span>Logs 1.2k</span>
          </div>
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
