/**
 * Component Tests: OperationLogsPage
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/theme'
import { OperationLogsPage } from '@/pages/OperationLogsPage'

vi.mock('@/stores/operation-log-store', () => ({
  useOperationLogStore: vi.fn(),
}))

import { useOperationLogStore } from '@/stores/operation-log-store'

describe('OperationLogsPage', () => {
  beforeEach(() => {
    vi.mocked(useOperationLogStore).mockReturnValue({
      logs: [],
      isLoading: false,
      error: null,
      totalCount: 0,
      currentPage: 0,
      pageSize: 50,
      filters: { type: null, result: null, startDate: null, endDate: null },
      loadLogs: vi.fn(),
      setFilter: vi.fn(),
      clearFilters: vi.fn(),
      checkCleanup: vi.fn().mockResolvedValue({ needed: false, count: 0 }),
      performCleanup: vi.fn(),
      clearError: vi.fn(),
    } as any)
  })

  it('renders heading', () => {
    render(
      <ThemeProvider theme={theme}>
        <OperationLogsPage />
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: '操作日志与审计' })).toBeInTheDocument()
  })

  it('renders export logs button', () => {
    render(
      <ThemeProvider theme={theme}>
        <OperationLogsPage />
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: '导出日志' })).toBeInTheDocument()
  })
})
