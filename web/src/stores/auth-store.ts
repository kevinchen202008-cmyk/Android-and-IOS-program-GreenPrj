/**
 * Authentication Store (Zustand)
 * Manages authentication state
 */

import { create } from 'zustand'
import { setPassword, login, changePassword, logout, isPasswordSet, isAuthenticated } from '@/services/auth'
import { getSession } from '@/services/auth/session-manager'

interface AuthState {
  isAuthenticated: boolean
  isPasswordSet: boolean | undefined // undefined means checking, false means not set, true means set
  isLoading: boolean
  error: string | null
  checkPasswordStatus: () => Promise<void>
  checkAuthStatus: () => void
  handleSetPassword: (password: string, confirmPassword: string) => Promise<void>
  handleLogin: (password: string) => Promise<void>
  handleChangePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
  handleLogout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isPasswordSet: undefined, // Start as undefined to show loading
  isLoading: false,
  error: null,

  checkPasswordStatus: async () => {
    try {
      const exists = await isPasswordSet()
      set({ isPasswordSet: exists })
    } catch (error) {
      console.error('Error checking password status:', error)
      set({ isPasswordSet: false })
    }
  },

  checkAuthStatus: () => {
    const authenticated = isAuthenticated()
    set({ isAuthenticated: authenticated })
  },

  handleSetPassword: async (password: string, confirmPassword: string) => {
    set({ isLoading: true, error: null })
    try {
      await setPassword(password, confirmPassword)
      set({ isAuthenticated: true, isPasswordSet: true, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '设置密码失败',
        isLoading: false,
      })
      throw error
    }
  },

  handleLogin: async (password: string) => {
    set({ isLoading: true, error: null })
    try {
      await login(password)
      set({ isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '登录失败',
        isLoading: false,
      })
      throw error
    }
  },

  handleChangePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    set({ isLoading: true, error: null })
    try {
      await changePassword(currentPassword, newPassword, confirmPassword)
      set({ isAuthenticated: false, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '修改密码失败',
        isLoading: false,
      })
      throw error
    }
  },

  handleLogout: () => {
    logout()
    set({ isAuthenticated: false })
  },

  clearError: () => {
    set({ error: null })
  },
}))
