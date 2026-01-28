/**
 * Component Tests: StatisticsPage
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/theme'
import { StatisticsPage } from '@/pages/StatisticsPage'

vi.mock('@/stores/statistics-store', () => ({
  useStatisticsStore: vi.fn(),
}))

import { useStatisticsStore } from '@/stores/statistics-store'

describe('StatisticsPage', () => {
  beforeEach(() => {
    vi.mocked(useStatisticsStore).mockReturnValue({
      summary: null,
      isLoading: false,
      error: null,
      selectedDimension: 'month',
      loadStatistics: vi.fn(),
      refreshStatistics: vi.fn(),
      setDimension: vi.fn(),
      clearError: vi.fn(),
    } as any)
  })

  it('renders heading and refresh button', () => {
    render(
      <ThemeProvider theme={theme}>
        <StatisticsPage />
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: '统计与报表' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '刷新' })).toBeInTheDocument()
  })

  it('renders time dimension selector', () => {
    render(
      <ThemeProvider theme={theme}>
        <StatisticsPage />
      </ThemeProvider>
    )
    expect(screen.getByText('时间维度')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '日', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '月', exact: true })).toBeInTheDocument()
  })
})
