/**
 * Component Tests: ChangePasswordForm
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/theme'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import { useAuthStore } from '@/stores/auth-store'

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ChangePasswordForm', () => {
  const mockHandleChangePassword = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      handleChangePassword: mockHandleChangePassword,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    } as any)
  })

  it('renders heading and password fields', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChangePasswordForm />
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: '修改密码' })).toBeInTheDocument()
    expect(screen.getByLabelText(/当前密码/)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/新密码/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByLabelText(/确认新密码/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '修改密码' })).toBeInTheDocument()
  })

  it('disables submit when any field is empty', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChangePasswordForm />
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: '修改密码' })).toBeDisabled()
  })

  it('enables submit when all fields are filled', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider theme={theme}>
        <ChangePasswordForm />
      </ThemeProvider>
    )
    await user.type(screen.getByLabelText(/当前密码/), 'OldPass123!')
    await user.type(screen.getAllByLabelText(/新密码/)[0], 'NewPass123!')
    await user.type(screen.getByLabelText(/确认新密码/), 'NewPass123!')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '修改密码' })).not.toBeDisabled()
    })
  })

  it('calls handleChangePassword and navigate on submit', async () => {
    const user = userEvent.setup()
    mockHandleChangePassword.mockResolvedValue(undefined)
    render(
      <ThemeProvider theme={theme}>
        <ChangePasswordForm />
      </ThemeProvider>
    )
    await user.type(screen.getByLabelText(/当前密码/), 'OldPass123!')
    await user.type(screen.getAllByLabelText(/新密码/)[0], 'NewPass123!')
    await user.type(screen.getByLabelText(/确认新密码/), 'NewPass123!')
    await user.click(screen.getByRole('button', { name: '修改密码' }))
    await waitFor(() => {
      expect(mockHandleChangePassword).toHaveBeenCalledWith('OldPass123!', 'NewPass123!', 'NewPass123!')
    })
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('shows error when store has error', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      handleChangePassword: mockHandleChangePassword,
      isLoading: false,
      error: '当前密码错误',
      clearError: mockClearError,
    } as any)
    render(
      <ThemeProvider theme={theme}>
        <ChangePasswordForm />
      </ThemeProvider>
    )
    expect(screen.getByText(/当前密码错误/)).toBeInTheDocument()
  })
})
