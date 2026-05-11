<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Activity, Eye, EyeOff } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const preferences = usePreferencesStore();

const email = ref(preferences.email || "");
const password = ref("");

const showPassword = ref(false);

const passwordInputType = computed(() => {
  return showPassword.value ? "text" : "password";
});

function submitLogin() {
  const safeEmail = email.value.trim() || "analyst@pulseops.local";

  auth.login(safeEmail, preferences.displayName);
  preferences.setEmail(safeEmail);

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
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
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
