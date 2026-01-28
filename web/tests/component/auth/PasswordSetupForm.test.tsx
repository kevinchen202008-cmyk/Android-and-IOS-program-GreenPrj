/**
 * Component Tests: PasswordSetupForm
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/theme'
import { PasswordSetupForm } from '@/components/auth/PasswordSetupForm'
import { useAuthStore } from '@/stores/auth-store'

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

describe('PasswordSetupForm', () => {
  const mockHandleSetPassword = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      handleSetPassword: mockHandleSetPassword,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    } as any)
  })

  it('renders heading and password fields', () => {
    render(
      <ThemeProvider theme={theme}>
        <PasswordSetupForm />
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: '设置密码' })).toBeInTheDocument()
    const pwdFields = screen.getAllByLabelText(/密码/)
    expect(pwdFields.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByLabelText(/确认密码/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '设置密码' })).toBeInTheDocument()
  })

  it('shows helper text for password', () => {
    render(
      <ThemeProvider theme={theme}>
        <PasswordSetupForm />
      </ThemeProvider>
    )
    expect(screen.getByText(/至少6个字符/)).toBeInTheDocument()
  })

  it('disables submit when password or confirm is empty', () => {
    render(
      <ThemeProvider theme={theme}>
        <PasswordSetupForm />
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: '设置密码' })).toBeDisabled()
  })

  it('enables submit when both fields are filled', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider theme={theme}>
        <PasswordSetupForm />
      </ThemeProvider>
    )
    await user.type(screen.getAllByLabelText(/密码/)[0], 'TestPassword123!')
    await user.type(screen.getByLabelText(/确认密码/), 'TestPassword123!')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '设置密码' })).not.toBeDisabled()
    })
  })

  it('calls handleSetPassword on submit', async () => {
    const user = userEvent.setup()
    mockHandleSetPassword.mockResolvedValue(undefined)
    render(
      <ThemeProvider theme={theme}>
        <PasswordSetupForm />
      </ThemeProvider>
    )
    await user.type(screen.getAllByLabelText(/密码/)[0], 'TestPassword123!')
    await user.type(screen.getByLabelText(/确认密码/), 'TestPassword123!')
    await user.click(screen.getByRole('button', { name: '设置密码' }))
    await waitFor(() => {
      expect(mockHandleSetPassword).toHaveBeenCalledWith('TestPassword123!', 'TestPassword123!')
    })
  })

  it('shows error when store has error', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      handleSetPassword: mockHandleSetPassword,
      isLoading: false,
      error: '两次密码不一致',
      clearError: mockClearError,
    } as any)
    render(
      <ThemeProvider theme={theme}>
        <PasswordSetupForm />
      </ThemeProvider>
    )
    expect(screen.getByText(/两次密码不一致/)).toBeInTheDocument()
  })
})
