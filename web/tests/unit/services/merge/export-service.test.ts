/**
 * Unit Tests: Export Service (merge)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportAccountBook } from '@/services/merge/export-service'

vi.mock('@/services/accounting/account-entry-service', () => ({
  getAllEntries: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/services/budget/budget-service', () => ({
  getAllBudgets: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/services/audit/operation-log-service', () => ({
  getAllLogs: vi.fn().mockResolvedValue([]),
}))

describe('Export Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportAccountBook', () => {
    it('returns schema with version, exportedAt, and data', async () => {
      const result = await exportAccountBook()
      expect(result.version).toBeDefined()
      expect(result.exportedAt).toBeDefined()
      expect(result.data).toBeDefined()
      expect(result.data.accounts).toEqual([])
      expect(result.data.budgets).toEqual([])
      expect(result.data.operationLogs).toEqual([])
      expect(Array.isArray(result.data.categories)).toBe(true)
    })

    it('includes entries from getAllEntries', async () => {
      const { getAllEntries } = await import('@/services/accounting/account-entry-service')
      const entries = [
        { id: '1', amount: 100, date: '2026-01-15', category: 'food', notes: '', createdAt: '', updatedAt: '' },
      ]
      vi.mocked(getAllEntries).mockResolvedValue(entries as any)
      const result = await exportAccountBook()
      expect(result.data.accounts).toHaveLength(1)
      expect(result.data.accounts[0].amount).toBe(100)
    })

    it('includes budgets from getAllBudgets', async () => {
      const { getAllBudgets } = await import('@/services/budget/budget-service')
      const budgets = [
        { id: 'b1', type: 'monthly', year: 2026, month: 1, amount: 1000, createdAt: '', updatedAt: '' },
      ]
      vi.mocked(getAllBudgets).mockResolvedValue(budgets as any)
      const result = await exportAccountBook()
      expect(result.data.budgets).toHaveLength(1)
      expect(result.data.budgets[0].amount).toBe(1000)
    })
  })
})
