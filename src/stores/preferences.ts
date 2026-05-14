import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'dark' | 'light' | 'system'

export interface UserPreferences {
  theme: ThemeMode
  displayName: string
  role: string
  email: string
  avatarDataUrl: string
}

function createDefaultPreferences(email = ''): UserPreferences {
  return {
    theme: 'dark',
    displayName: 'Operations Analyst',
    role: 'Real-time Systems Monitor',
    email,
    avatarDataUrl: '',
  }
}

export const usePreferencesStore = defineStore(
  'preferences',
  () => {
    const activeEmail = ref('')
    const preferencesByEmail = ref<Record<string, UserPreferences>>({})

    const fallbackPreferences = ref<UserPreferences>(createDefaultPreferences())

    const currentPreferences = computed(() => {
      if (!activeEmail.value) return fallbackPreferences.value

      if (!preferencesByEmail.value[activeEmail.value]) {
        preferencesByEmail.value[activeEmail.value] = createDefaultPreferences(activeEmail.value)
      }

      return preferencesByEmail.value[activeEmail.value]
    })

    const theme = computed(() => currentPreferences.value.theme)
    const displayName = computed(() => currentPreferences.value.displayName)
    const role = computed(() => currentPreferences.value.role)
    const email = computed(() => currentPreferences.value.email)
    const avatarDataUrl = computed(() => currentPreferences.value.avatarDataUrl)

    const effectiveTheme = computed(() => {
      if (theme.value !== 'system') return theme.value

      if (typeof window === 'undefined') return 'dark'

      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    })

    function activateUser(emailValue: string, nameValue?: string): void {
      const safeEmail = emailValue.trim().toLowerCase()
      if (!safeEmail) return

      activeEmail.value = safeEmail

      if (!preferencesByEmail.value[safeEmail]) {
        preferencesByEmail.value[safeEmail] = createDefaultPreferences(safeEmail)
      }

      preferencesByEmail.value[safeEmail].email = safeEmail

      if (nameValue?.trim()) {
        preferencesByEmail.value[safeEmail].displayName = nameValue.trim()
      }
    }

    function clearActiveUser(): void {
      activeEmail.value = ''
    }

    function patchCurrentPreferences(patch: Partial<UserPreferences>): void {
      if (!activeEmail.value) {
        fallbackPreferences.value = {
          ...fallbackPreferences.value,
          ...patch,
        }
        return
      }

      preferencesByEmail.value[activeEmail.value] = {
        ...currentPreferences.value,
        ...patch,
      }
    }

    function setTheme(value: ThemeMode): void {
      patchCurrentPreferences({ theme: value })
    }

    function setDisplayName(value: string): void {
      patchCurrentPreferences({
        displayName: value.trim() || 'Operations Analyst',
      })
    }

    function setRole(value: string): void {
      patchCurrentPreferences({
        role: value.trim() || 'Real-time Systems Monitor',
      })
    }

    function setEmail(value: string): void {
      const safeEmail = value.trim().toLowerCase() || 'analyst@pulseops.local'
      patchCurrentPreferences({ email: safeEmail })
    }

    function setAvatarDataUrl(value: string): void {
      patchCurrentPreferences({ avatarDataUrl: value })
    }

    function clearAvatar(): void {
      patchCurrentPreferences({ avatarDataUrl: '' })
    }

function resetProfile(): void {
  const currentEmail = currentPreferences.value.email
  const currentName = currentPreferences.value.displayName

  patchCurrentPreferences({
    displayName: currentName,
    email: currentEmail,
    role: 'Real-time Systems Monitor',
    avatarDataUrl: '',
  })
}

    return {
      activeEmail,
      preferencesByEmail,

      theme,
      displayName,
      role,
      email,
      avatarDataUrl,
      effectiveTheme,

      activateUser,
      clearActiveUser,
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
      pick: ['activeEmail', 'preferencesByEmail'],
    },
  },
)