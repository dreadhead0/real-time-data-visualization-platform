import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface AuthUser {
  name: string
  email: string
}

interface RegisteredUser extends AuthUser {
  password: string
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const registeredUsers = ref<RegisteredUser[]>([])

    const isAuthenticated = computed(() => user.value !== null)

    function signup(name: string, email: string, password: string): { ok: boolean; message: string } {
      const safeName = name.trim()
      const safeEmail = email.trim().toLowerCase()
      const safePassword = password.trim()

      if (!safeName || !safeEmail || !safePassword) {
        return {
          ok: false,
          message: 'Please fill in all signup fields.',
        }
      }

      const existingUser = registeredUsers.value.find((item) => item.email === safeEmail)

      if (existingUser) {
        return {
          ok: false,
          message: 'An account with this email already exists. Please login instead.',
        }
      }

      const createdUser: RegisteredUser = {
        name: safeName,
        email: safeEmail,
        password: safePassword,
      }

      registeredUsers.value.push(createdUser)

      user.value = {
        name: createdUser.name,
        email: createdUser.email,
      }

      return {
        ok: true,
        message: 'Account created successfully.',
      }
    }

    function login(email: string, password: string): { ok: boolean; message: string; user?: AuthUser } {
      const safeEmail = email.trim().toLowerCase()
      const safePassword = password.trim()

      const foundUser = registeredUsers.value.find((item) => item.email === safeEmail)

      if (!foundUser) {
        return {
          ok: false,
          message: 'No account found with this email. Please sign up first.',
        }
      }

      if (foundUser.password !== safePassword) {
        return {
          ok: false,
          message: 'Incorrect password. Please try again.',
        }
      }

      user.value = {
        name: foundUser.name,
        email: foundUser.email,
      }

      return {
        ok: true,
        message: 'Login successful.',
        user: user.value,
      }
    }

    function logout() {
      user.value = null
    }

    return {
      user,
      registeredUsers,
      isAuthenticated,
      signup,
      login,
      logout,
    }
  },
  {
    persist: {
      paths: ['user', 'registeredUsers'],
    },
  },
)