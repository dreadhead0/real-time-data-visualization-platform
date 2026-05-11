<script setup lang="ts">
import { Camera, Moon, Settings, Sun, User } from "lucide-vue-next";
</script>

<template>
  <section class="settings-page">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Workspace preferences</p>
        <h1>
          <Settings :size="24" />
          Settings
        </h1>
      </div>
    </div>

    <div class="settings-grid">
      <article class="settings-card">
        <h2>
          <User :size="20" />
          Profile
        </h2>

        <div class="profile-uploader">
          <div class="avatar-preview">
            <Camera :size="24" />
          </div>

          <div>
            <strong>Profile picture</strong>
            <p>Upload support will be connected in Stage 6.</p>
            <button class="secondary-button">Choose image</button>
          </div>
        </div>
      </article>

      <article class="settings-card">
        <h2>
          <Moon :size="20" />
          Appearance
        </h2>

        <div class="theme-options">
          <button class="secondary-button">
            <Moon :size="18" />
            Dark
          </button>

          <button class="secondary-button">
            <Sun :size="18" />
            Light
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
