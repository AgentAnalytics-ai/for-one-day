'use client'

import { Toast } from '@/components/ui/toast'

class ToastManager {
  private static instance: ToastManager
  private toasts: Toast[] = []
  private listeners: ((toasts: Toast[]) => void)[] = []

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager()
    }
    return ToastManager.instance
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    
    this.toasts.push(newToast)
    this.notify()
    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  success(title: string, message?: string) {
    return this.add({ type: 'success', title, message })
  }

  error(title: string, message?: string) {
    return this.add({ type: 'error', title, message, duration: 8000 })
  }

  warning(title: string, message?: string) {
    return this.add({ type: 'warning', title, message })
  }

  info(title: string, message?: string) {
    return this.add({ type: 'info', title, message })
  }

  getToasts(): Toast[] {
    return [...this.toasts]
  }
}

export const toast = ToastManager.getInstance()
