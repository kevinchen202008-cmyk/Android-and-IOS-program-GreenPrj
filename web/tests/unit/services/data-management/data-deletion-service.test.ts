/**
 * Unit Tests: Data Deletion Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteAllData } from '@/services/data-management/data-deletion-service'

vi.mock('@/services/accounting/account-entry-service', () => ({
  getAllEntries: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/services/budget/budget-service', () => ({
  getAllBudgets: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/repositories/account-entry-repository', () => ({
  accountEntryRepository: { deleteEntry: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock('@/repositories/budget-repository', () => ({
  deleteBudget: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/audit', () => ({
  logSuccess: vi.fn().mockResolvedValue(undefined),
  logFailure: vi.fn().mockResolvedValue(undefined),
}))

describe('Data Deletion Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('deleteAllData', () => {
    it('calls deleteAllEntries and deleteAllBudgets, then logs success', async () => {
      const { logSuccess } = await import('@/services/audit')
      const { accountEntryRepository } = await import('@/repositories/account-entry-repository')
      const { deleteBudget } = await import('@/repositories/budget-repository')
      await deleteAllData()
      expect(logSuccess).toHaveBeenCalledWith(
        '删除所有数据',
        'DELETE_ALL_DATA',
        expect.stringContaining('0条账目')
      )
      expect(accountEntryRepository.deleteEntry).not.toHaveBeenCalled()
      expect(deleteBudget).not.toHaveBeenCalled()
    })

    it('deletes entries and budgets when present', async () => {
      const { getAllEntries } = await import('@/services/accounting/account-entry-service')
      const { getAllBudgets } = await import('@/services/budget/budget-service')
      vi.mocked(getAllEntries).mockResolvedValue([
        { id: 'e1', amount: 100, date: '', category: '', notes: '', createdAt: '', updatedAt: '' },
      ] as any)
      vi.mocked(getAllBudgets).mockResolvedValue([
        { id: 'b1', type: 'monthly', year: 2026, month: 1, amount: 1000, createdAt: '', updatedAt: '' },
      ] as any)
      const { accountEntryRepository } = await import('@/repositories/account-entry-repository')
      const { deleteBudget } = await import('@/repositories/budget-repository')
      await deleteAllData()
      expect(accountEntryRepository.deleteEntry).toHaveBeenCalledWith('e1')
      expect(deleteBudget).toHaveBeenCalledWith('b1')
    })
  })
})
