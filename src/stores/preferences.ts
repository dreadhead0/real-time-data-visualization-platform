import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'dark' | 'light' | 'system'

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const theme = ref<ThemeMode>('dark')
    const displayName = ref('Operations Analyst')
    const role = ref('Real-time Systems Monitor')
    const email = ref('analyst@pulseops.local')
    const avatarDataUrl = ref<string>('')

    const effectiveTheme = computed(() => {
      if (theme.value !== 'system') return theme.value

      if (typeof window === 'undefined') return 'dark'

      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    })

    function setTheme(value: ThemeMode): void {
      theme.value = value
    }

    function setDisplayName(value: string): void {
      displayName.value = value.trim() || 'Operations Analyst'
    }

    function setRole(value: string): void {
      role.value = value.trim() || 'Real-time Systems Monitor'
    }

    function setEmail(value: string): void {
      email.value = value.trim() || 'analyst@pulseops.local'
    }

    function setAvatarDataUrl(value: string): void {
      avatarDataUrl.value = value
    }

    function clearAvatar(): void {
      avatarDataUrl.value = ''
    }

    function resetProfile(): void {
      displayName.value = 'Operations Analyst'
      role.value = 'Real-time Systems Monitor'
      email.value = 'analyst@pulseops.local'
      avatarDataUrl.value = ''
    }

    return {
      theme,
      displayName,
      role,
      email,
      avatarDataUrl,
      effectiveTheme,
      setTheme,
      setDisplayName,
      setRole,
      setEmail,
      setAvatarDataUrl,
      clearAvatar,
      resetProfile,
    }
  },
  {
    persist: {
      pick: ['theme', 'displayName', 'role', 'email', 'avatarDataUrl'],
    },
  },
)