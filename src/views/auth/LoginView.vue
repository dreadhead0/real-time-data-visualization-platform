<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Activity } from "lucide-vue-next";
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="sidebar__brand auth-brand">
        <div class="brand-mark">
          <Activity :size="20" />
        </div>
        <div>
          <h1>PulseOps</h1>
          <span>Welcome back</span>
        </div>
      </div>

      <form class="auth-form">
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input type="password" placeholder="Enter password" />
        </label>

        <RouterLink to="/app" class="primary-button full-button"
          >Login</RouterLink
        >
      </form>

      <p class="auth-switch">
        New here?
        <RouterLink to="/signup">Create an account</RouterLink>
      </p>
    </section>
  </main>
</template>
