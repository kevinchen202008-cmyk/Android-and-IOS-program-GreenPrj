/**
 * Unit Tests: Budget Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateBudgetInput,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService,
  getBudgetStatus,
  calculateActualConsumption,
} from '@/services/budget/budget-service'
import type { BudgetSchema } from '@/types/schema'
import type { CreateBudgetInput } from '@/types/budget'

const mockBudget: BudgetSchema = {
  id: 'b1',
  type: 'monthly',
  year: 2026,
  month: 1,
  amount: 1000,
  createdAt: '',
  updatedAt: '',
}

vi.mock('@/repositories/budget-repository', () => ({
  createBudget: vi.fn(),
  getBudgetById: vi.fn(),
  getMonthlyBudget: vi.fn(),
  getYearlyBudget: vi.fn(),
  getAllBudgets: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
}))

vi.mock('@/services/accounting/account-entry-service', () => ({
  getAllEntries: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/services/audit', () => ({
  logSuccess: vi.fn().mockResolvedValue(undefined),
  logFailure: vi.fn().mockResolvedValue(undefined),
}))

describe('Budget Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const repo = await import('@/repositories/budget-repository')
    vi.mocked(repo.createBudget).mockResolvedValue(mockBudget)
    vi.mocked(repo.getBudgetById).mockResolvedValue(mockBudget)
    vi.mocked(repo.getMonthlyBudget).mockResolvedValue(null)
    vi.mocked(repo.getYearlyBudget).mockResolvedValue(null)
    vi.mocked(repo.updateBudget).mockResolvedValue({ ...mockBudget, amount: 2000 })
    vi.mocked(repo.deleteBudget).mockResolvedValue(undefined)
  })

  describe('validateBudgetInput', () => {
    it('rejects amount <= 0', () => {
      expect(validateBudgetInput({ type: 'monthly', year: 2026, month: 1, amount: 0 })).toEqual({
        valid: false,
        error: '预算金额必须大于0',
      })
      expect(validateBudgetInput({ type: 'yearly', year: 2026, amount: -1 })).toEqual({
        valid: false,
        error: '预算金额必须大于0',
      })
    })

    it('requires month for monthly budget', () => {
      expect(
        validateBudgetInput({ type: 'monthly', year: 2026, amount: 100 } as CreateBudgetInput)
      ).toEqual({ valid: false, error: '月度预算必须指定月份' })
    })

    it('rejects month out of range', () => {
      expect(
        validateBudgetInput({ type: 'monthly', year: 2026, month: 13, amount: 100 })
      ).toEqual({ valid: false, error: '月份必须在1-12之间' })
    })

    it('accepts valid monthly input', () => {
      expect(validateBudgetInput({ type: 'monthly', year: 2026, month: 6, amount: 500 })).toEqual({
        valid: true,
      })
    })

    it('accepts valid yearly input', () => {
      expect(validateBudgetInput({ type: 'yearly', year: 2026, amount: 12000 })).toEqual({
        valid: true,
      })
    })
  })

  describe('createBudgetService', () => {
    it('creates monthly budget and logs success', async () => {
      const { createBudget } = await import('@/repositories/budget-repository')
      const { logSuccess } = await import('@/services/audit')
      const input: CreateBudgetInput = { type: 'monthly', year: 2026, month: 3, amount: 800 }
      const result = await createBudgetService(input)
      expect(createBudget).toHaveBeenCalledWith(input)
      expect(logSuccess).toHaveBeenCalled()
      expect(result.amount).toBe(1000)
    })

    it('throws when monthly budget exists', async () => {
      const { getMonthlyBudget } = await import('@/repositories/budget-repository')
      vi.mocked(getMonthlyBudget).mockResolvedValue(mockBudget)
      await expect(
        createBudgetService({ type: 'monthly', year: 2026, month: 1, amount: 500 })
      ).rejects.toThrow(/已存在预算/)
    })

    it('throws when yearly budget exists', async () => {
      const { getYearlyBudget } = await import('@/repositories/budget-repository')
      vi.mocked(getYearlyBudget).mockResolvedValue({ ...mockBudget, type: 'yearly', month: undefined })
      await expect(
        createBudgetService({ type: 'yearly', year: 2026, amount: 500 })
      ).rejects.toThrow(/已存在预算/)
    })

    it('throws on invalid input', async () => {
      await expect(
        createBudgetService({ type: 'monthly', year: 2026, month: 1, amount: 0 })
      ).rejects.toThrow('预算金额必须大于0')
    })
  })

  describe('updateBudgetService', () => {
    it('updates budget and logs success', async () => {
      const { updateBudget } = await import('@/repositories/budget-repository')
      const { logSuccess } = await import('@/services/audit')
      const result = await updateBudgetService('b1', { amount: 2000 })
      expect(updateBudget).toHaveBeenCalledWith('b1', { amount: 2000 })
      expect(logSuccess).toHaveBeenCalled()
      expect(result.amount).toBe(2000)
    })

    it('throws when amount <= 0', async () => {
      await expect(updateBudgetService('b1', { amount: 0 })).rejects.toThrow(
        '预算金额必须大于0'
      )
    })
  })

  describe('deleteBudgetService', () => {
    it('deletes budget and logs success', async () => {
      const { getBudgetById, deleteBudget } = await import('@/repositories/budget-repository')
      const { logSuccess } = await import('@/services/audit')
      await deleteBudgetService('b1')
      expect(getBudgetById).toHaveBeenCalledWith('b1')
      expect(deleteBudget).toHaveBeenCalledWith('b1')
      expect(logSuccess).toHaveBeenCalled()
    })
  })

  describe('calculateActualConsumption', () => {
    it('returns sum of entries in budget period', async () => {
      const { getAllEntries } = await import('@/services/accounting/account-entry-service')
      vi.mocked(getAllEntries).mockResolvedValue([
        { id: '1', amount: 200, date: '2026-01-10T00:00:00.000Z', category: 'food', notes: '', createdAt: '', updatedAt: '' },
        { id: '2', amount: 150, date: '2026-01-20T00:00:00.000Z', category: 'shopping', notes: '', createdAt: '', updatedAt: '' },
      ])
      const consumption = await calculateActualConsumption(mockBudget)
      expect(consumption).toBe(350)
    })

    it('returns 0 when no entries', async () => {
      const { getAllEntries } = await import('@/services/accounting/account-entry-service')
      vi.mocked(getAllEntries).mockResolvedValue([])
      const consumption = await calculateActualConsumption(mockBudget)
      expect(consumption).toBe(0)
    })
  })

  describe('getBudgetStatus', () => {
    it('returns status with actualAmount and isExceeded', async () => {
      const { getAllEntries } = await import('@/services/accounting/account-entry-service')
      vi.mocked(getAllEntries).mockResolvedValue([
        { id: '1', amount: 600, date: '2026-01-15T00:00:00.000Z', category: 'food', notes: '', createdAt: '', updatedAt: '' },
      ])
      const status = await getBudgetStatus(mockBudget)
      expect(status.actualAmount).toBe(600)
      expect(status.remainingAmount).toBe(400)
      expect(status.percentageUsed).toBe(60)
      expect(status.isExceeded).toBe(false)
    })

    it('sets isExceeded when actual > budget', async () => {
      const { getAllEntries } = await import('@/services/accounting/account-entry-service')
      vi.mocked(getAllEntries).mockResolvedValue([
        { id: '1', amount: 1200, date: '2026-01-15T00:00:00.000Z', category: 'food', notes: '', createdAt: '', updatedAt: '' },
      ])
      const status = await getBudgetStatus(mockBudget)
      expect(status.isExceeded).toBe(true)
      expect(status.remainingAmount).toBe(-200)
    })
  })
})
