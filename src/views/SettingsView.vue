<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Check,
  Laptop,
  Mail,
  Moon,
  RotateCcw,
  Settings,
  Shield,
  Sun,
  Trash2,
  Upload,
  User,
} from "lucide-vue-next";
import { usePreferencesStore, type ThemeMode } from "@/stores/preferences";
import { useToastStore } from "@/stores/toast";

const preferences = usePreferencesStore();

const nameDraft = ref(preferences.displayName);
const roleDraft = ref(preferences.role);
const emailDraft = ref(preferences.email);

const isProfileDirty = computed(() => {
  return (
    nameDraft.value.trim() !== preferences.displayName ||
    roleDraft.value.trim() !== preferences.role ||
    emailDraft.value.trim().toLowerCase() !== preferences.email
  );
});

const fileInput = ref<HTMLInputElement | null>(null);

const toast = useToastStore();

const themeOptions: {
  label: string;
  value: ThemeMode;
  icon: typeof Moon;
  description: string;
}[] = [
  {
    label: "Dark",
    value: "dark",
    icon: Moon,
    description: "High-contrast command center UI",
  },
  {
    label: "Light",
    value: "light",
    icon: Sun,
    description: "Clean bright monitoring workspace",
  },
  {
    label: "System",
    value: "system",
    icon: Laptop,
    description: "Follow your device preference",
  },
];

const initials = computed(() => {
  return preferences.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

function saveProfile() {
  if (!isProfileDirty.value) {
    toast.info("No profile changes to save.");
    return;
  }

  preferences.setDisplayName(nameDraft.value);
  preferences.setRole(roleDraft.value);
  preferences.setEmail(emailDraft.value);

  toast.success("Profile settings saved.");
}

function resetProfile() {
  preferences.resetProfile();
  nameDraft.value = preferences.displayName;
  roleDraft.value = preferences.role;
  emailDraft.value = preferences.email;

  toast.info("Profile reset to defaults.");
}

function openFilePicker() {
  fileInput.value?.click();
}

function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const isSmallEnough = file.size <= 1_500_000;

  if (!isImage) {
    alert("Please choose an image file.");
    return;
  }

  if (!isSmallEnough) {
    alert("Please choose an image below 1.5MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    if (typeof reader.result === "string") {
      preferences.setAvatarDataUrl(reader.result);
    }
  };

  reader.readAsDataURL(file);
}
</script>

<template>
  <section class="settings-page">
    <div class="section-heading settings-heading">
      <div>
        <p class="eyebrow">Workspace preferences</p>
        <h1>
          <Settings :size="24" />
          Settings
        </h1>
        <p class="settings-subtitle">
          Manage profile identity, appearance, and persisted dashboard
          preferences.
        </p>
      </div>

      <div class="settings-status">
        <Shield :size="16" />
        Preferences autosave locally
      </div>
    </div>

    <div class="settings-grid">
      <article class="settings-card profile-card">
        <div class="settings-card-head">
          <h2>
            <User :size="20" />
            Profile
          </h2>
          <span class="settings-chip">Local profile</span>
        </div>

        <div class="profile-uploader">
          <div class="avatar-preview">
            <img
              v-if="preferences.avatarDataUrl"
              :src="preferences.avatarDataUrl"
              alt="Profile avatar"
            />
            <span v-else>{{ initials }}</span>
          </div>

          <div class="avatar-actions">
            <strong>Profile picture</strong>
            <p>Upload a small image. It is stored locally in your browser.</p>

            <div class="button-row">
              <button
                class="secondary-button"
                type="button"
                @click="openFilePicker"
              >
                <Upload :size="16" />
                Choose image
              </button>

              <button
                class="secondary-button danger-soft"
                type="button"
                @click="preferences.clearAvatar"
              >
                <Trash2 :size="16" />
                Remove
              </button>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleAvatarUpload"
            />
          </div>
        </div>

        <form class="settings-form" @submit.prevent="saveProfile">
          <label>
            Display name
            <input
              v-model="nameDraft"
              type="text"
              placeholder="Operations Analyst"
            />
          </label>

          <label>
            Role
            <input
              v-model="roleDraft"
              type="text"
              placeholder="Real-time Systems Monitor"
            />
          </label>

          <label>
            Email
            <span class="input-with-icon">
              <Mail :size="16" />
              <input
                v-model="emailDraft"
                type="email"
                placeholder="analyst@pulseops.local"
              />
            </span>
          </label>

          <div class="button-row">
            <button
              class="primary-button"
              type="submit"
              :disabled="!isProfileDirty"
            >
              <Check :size="16" />
              Save profile
            </button>

            <button
              class="secondary-button"
              type="button"
              @click="resetProfile"
            >
              <RotateCcw :size="16" />
              Reset
            </button>
          </div>
        </form>
      </article>

      <article class="settings-card">
        <div class="settings-card-head">
          <h2>
            <Moon :size="20" />
            Appearance
          </h2>
          <span class="settings-chip">{{ preferences.theme }}</span>
        </div>

        <div class="theme-options">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="theme-option"
            :class="{ active: preferences.theme === option.value }"
            type="button"
            @click="preferences.setTheme(option.value)"
          >
            <component :is="option.icon" :size="20" />

            <span>
              <strong>{{ option.label }}</strong>
              <small>{{ option.description }}</small>
            </span>

            <Check v-if="preferences.theme === option.value" :size="17" />
          </button>
        </div>
      </article>

      <article class="settings-card">
        <div class="settings-card-head">
          <h2>
            <Shield :size="20" />
            Stability Notes
          </h2>
        </div>

        <div class="settings-note-list">
          <div>
            <strong>Theme persistence</strong>
            <span
              >Pinia persisted state keeps the selected theme after
              refresh.</span
            >
          </div>

          <div>
            <strong>Safe avatar handling</strong>
            <span>Only local image files below 1.5MB are accepted.</span>
          </div>

          <div>
            <strong>No unsafe DOM injection</strong>
            <span
              >Profile values are rendered through Vue bindings, not raw
              HTML.</span
            >
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
