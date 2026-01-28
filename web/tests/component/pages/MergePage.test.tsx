/**
 * Component Tests: MergePage
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/theme'
import { MergePage } from '@/pages/MergePage'

vi.mock('@/stores/merge-store', () => ({
  useMergeStore: vi.fn(),
}))

import { useMergeStore } from '@/stores/merge-store'

describe('MergePage', () => {
  beforeEach(() => {
    vi.mocked(useMergeStore).mockReturnValue({
      isExporting: false,
      isImporting: false,
      importPreview: null,
      mergeResult: null,
      error: null,
      exportAccountBook: vi.fn(),
      previewImport: vi.fn(),
      importAccountBook: vi.fn(),
      clearPreview: vi.fn(),
      clearError: vi.fn(),
    } as any)
  })

  it('renders heading and description', () => {
    render(
      <ThemeProvider theme={theme}>
        <MergePage />
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: '账本合并' })).toBeInTheDocument()
    expect(screen.getByText(/导出或导入账本数据/)).toBeInTheDocument()
  })

  it('renders export section', () => {
    render(
      <ThemeProvider theme={theme}>
        <MergePage />
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: '导出账本' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /导出账本/ })).toBeInTheDocument()
  })
})
