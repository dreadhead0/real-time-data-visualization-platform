<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Activity, Eye, EyeOff } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";
import { useToastStore } from "@/stores/toast";

import { useAnalyticsStore } from "@/stores/analytics";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const toast = useToastStore();
const preferences = usePreferencesStore();

const analytics = useAnalyticsStore();

const email = ref("");
const password = ref("");

const showPassword = ref(false);

const passwordInputType = computed(() => {
  return showPassword.value ? "text" : "password";
});

function submitLogin() {
  const result = auth.login(email.value, password.value);

  if (!result.ok) {
    toast.error(result.message);
    return;
  }

  if (result.user) {
    preferences.activateUser(result.user.email, result.user.name);
    analytics.activateDashboardUser(result.user.email);
  }

  toast.success("Welcome back to PulseOps.");

  const redirect =
    typeof route.query.redirect === "string" ? route.query.redirect : "/app";
  router.push(redirect);
}
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

      <form class="auth-form" @submit.prevent="submitLogin">
        <label>
          Email
          <input
            id="login-email"
            name="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </label>

        <label>
          Password
          <span class="password-field">
            <input
              v-model="password"
              :type="passwordInputType"
              placeholder="Enter password"
              required
              autocomplete="current-password"
            />

            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="17" />
              <Eye v-else :size="17" />
            </button>
          </span>
        </label>

        <button class="primary-button full-button" type="submit">Login</button>
      </form>

      <p class="auth-hint">
        Demo authentication is stored locally for this frontend project.
      </p>

      <p class="auth-switch">
        New here?
        <RouterLink to="/signup">Create an account</RouterLink>
      </p>
    </section>
  </main>
</template>
