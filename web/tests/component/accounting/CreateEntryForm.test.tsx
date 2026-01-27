/**
 * Component Tests: CreateEntryForm
 * Tests form component behavior and validation
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/theme'
import { CreateEntryForm } from '@/components/accounting/CreateEntryForm'
import { useAccountingStore } from '@/stores/accounting-store'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </BrowserRouter>
)

// Mock the store
vi.mock('@/stores/accounting-store', () => ({
  useAccountingStore: vi.fn(),
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CreateEntryForm', () => {
  const mockCreateNewEntry = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.mocked(useAccountingStore).mockReturnValue({
      createNewEntry: mockCreateNewEntry,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    } as any)
  })

  it('should render form fields', () => {
    render(
      <TestWrapper>
        <CreateEntryForm />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/金额/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/日期/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/类别/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/备注/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <CreateEntryForm />
      </TestWrapper>
    )

    // Submit button should be disabled when form is empty (category not selected)
    const submitButton = screen.getByRole('button', { name: /确认入账/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when form is valid', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <CreateEntryForm />
      </TestWrapper>
    )

    // Fill form: amount (date has default), open MUI Select then click option
    await user.type(screen.getByLabelText(/金额/i), '100.50')
    fireEvent.mouseDown(screen.getByLabelText(/类别/i))
    await waitFor(() => expect(screen.getByRole('option', { name: '餐饮' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('option', { name: '餐饮' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /确认入账/i })).not.toBeDisabled()
    })
  })

  it('should call createNewEntry on submit', async () => {
    const user = userEvent.setup()
    mockCreateNewEntry.mockResolvedValue({ id: 'test-id', amount: 100.50 })

    render(
      <TestWrapper>
        <CreateEntryForm />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText(/金额/i), '100.50')
    fireEvent.mouseDown(screen.getByLabelText(/类别/i))
    await waitFor(() => expect(screen.getByRole('option', { name: '餐饮' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('option', { name: '餐饮' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /确认入账/i })).not.toBeDisabled()
    })
    await user.click(screen.getByRole('button', { name: /确认入账/i }))

    await waitFor(() => {
      expect(mockCreateNewEntry).toHaveBeenCalledWith({
        amount: 100.50,
        date: expect.any(String),
        category: 'food',
      })
    })
  })

  it('should display error message when creation fails', async () => {
    mockCreateNewEntry.mockRejectedValue(new Error('创建失败'))

    vi.mocked(useAccountingStore).mockReturnValue({
      createNewEntry: mockCreateNewEntry,
      isLoading: false,
      error: '创建失败',
      clearError: mockClearError,
    } as any)

    render(
      <TestWrapper>
        <CreateEntryForm />
      </TestWrapper>
    )

    expect(screen.getByText(/创建失败/i)).toBeInTheDocument()
  })
})
