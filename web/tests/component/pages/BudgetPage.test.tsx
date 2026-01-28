/**
 * Component Tests: BudgetPage
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/theme'
import { BudgetPage } from '@/pages/BudgetPage'

vi.mock('@/stores/budget-store', () => ({
  useBudgetStore: vi.fn(),
}))

import { useBudgetStore } from '@/stores/budget-store'

describe('BudgetPage', () => {
  beforeEach(() => {
    vi.mocked(useBudgetStore).mockReturnValue({
      monthlyStatus: null,
      yearlyStatus: null,
      monthlyBudget: null,
      yearlyBudget: null,
      isLoading: false,
      error: null,
      loadBudgetStatuses: vi.fn(),
      loadCurrentBudgets: vi.fn(),
      createBudget: vi.fn(),
      updateBudget: vi.fn(),
      deleteBudget: vi.fn(),
      clearError: vi.fn(),
    } as any)
  })

  it('renders heading', () => {
    render(
      <ThemeProvider theme={theme}>
        <BudgetPage />
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: '预算管理' })).toBeInTheDocument()
  })

  it('renders budget settings section', () => {
    render(
      <ThemeProvider theme={theme}>
        <BudgetPage />
      </ThemeProvider>
    )
    expect(screen.getByText('预算设置')).toBeInTheDocument()
  })
})
