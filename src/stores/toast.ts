import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastMessage[]>([])

  function show(type: ToastType, message: string): void {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

    toasts.value.push({
      id,
      type,
      message,
    })

    window.setTimeout(() => {
      remove(id)
    }, 3500)
  }

  function success(message: string): void {
    show('success', message)
  }

  function error(message: string): void {
    show('error', message)
  }

  function info(message: string): void {
    show('info', message)
  }

  function warning(message: string): void {
    show('warning', message)
  }

  function remove(id: string): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts,
    show,
    success,
    error,
    info,
    warning,
    remove,
  }
})