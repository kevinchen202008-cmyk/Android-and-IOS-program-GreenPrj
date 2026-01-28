/**
 * Component Tests: LoginForm
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/theme'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuthStore } from '@/stores/auth-store'

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

describe('LoginForm', () => {
  const mockHandleLogin = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      handleLogin: mockHandleLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    } as any)
  })

  it('renders heading and password field', () => {
    render(
      <ThemeProvider theme={theme}>
        <LoginForm />
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
  })

  it('disables submit when password is empty', () => {
    render(
      <ThemeProvider theme={theme}>
        <LoginForm />
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: '登录' })).toBeDisabled()
  })

  it('enables submit when password is filled', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider theme={theme}>
        <LoginForm />
      </ThemeProvider>
    )
    await user.type(screen.getByLabelText(/密码/), 'TestPassword123!')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '登录' })).not.toBeDisabled()
    })
  })

  it('calls handleLogin on submit', async () => {
    const user = userEvent.setup()
    mockHandleLogin.mockResolvedValue(undefined)
    render(
      <ThemeProvider theme={theme}>
        <LoginForm />
      </ThemeProvider>
    )
    await user.type(screen.getByLabelText(/密码/), 'TestPassword123!')
    await user.click(screen.getByRole('button', { name: '登录' }))
    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith('TestPassword123!')
    })
  })

  it('shows error when store has error', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      handleLogin: mockHandleLogin,
      isLoading: false,
      error: '密码错误',
      clearError: mockClearError,
    } as any)
    render(
      <ThemeProvider theme={theme}>
        <LoginForm />
      </ThemeProvider>
    )
    expect(screen.getByText(/密码错误/)).toBeInTheDocument()
  })
})
