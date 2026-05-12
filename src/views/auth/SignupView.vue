<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { Activity, Eye, EyeOff } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";
import { useToastStore } from "@/stores/toast";

const toast = useToastStore();
const router = useRouter();
const auth = useAuthStore();
const preferences = usePreferencesStore();

const name = ref("");
const email = ref("");
const password = ref("");

const showPassword = ref(false);

const passwordInputType = computed(() => {
  return showPassword.value ? "text" : "password";
});

function submitSignup() {
  const result = auth.signup(name.value, email.value, password.value);

  if (!result.ok) {
    toast.error(result.message);
    return;
  }

  const safeName = name.value.trim();
  const safeEmail = email.value.trim().toLowerCase();

  preferences.setDisplayName(safeName);
  preferences.setEmail(safeEmail);

  toast.success("Account created. Welcome to PulseOps.");
  router.push("/app");
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
          <span>Create your workspace</span>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="submitSignup">
        <input
          id="signup-name"
          name="name"
          v-model="name"
          type="text"
          placeholder="Your name"
          required
          autocomplete="name"
        />

        <input
          id="signup-email"
          name="email"
          v-model="email"
          type="email"
          placeholder="you@example.com"
          required
          autocomplete="email"
        />

        <label>
          Password
          <span class="password-field">
            <input
              id="signup-password"
              name="password"
              v-model="password"
              :type="passwordInputType"
              placeholder="Create password"
              required
              autocomplete="new-password"
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
        <button class="primary-button full-button" type="submit">
          Create Account
        </button>
      </form>

      <p class="auth-hint">
        This creates a local demo session for the frontend dashboard.
      </p>

      <p class="auth-switch">
        Already have an account?
        <RouterLink to="/login">Login</RouterLink>
      </p>
    </section>
  </main>
</template>
