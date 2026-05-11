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
          <span>Create your workspace</span>
        </div>
      </div>

      <form class="auth-form">
        <label>
          Full name
          <input type="text" placeholder="Your name" />
        </label>

        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input type="password" placeholder="Create password" />
        </label>

        <RouterLink to="/app" class="primary-button full-button"
          >Create Account</RouterLink
        >
      </form>

      <p class="auth-switch">
        Already have an account?
        <RouterLink to="/login">Login</RouterLink>
      </p>
    </section>
  </main>
</template>
