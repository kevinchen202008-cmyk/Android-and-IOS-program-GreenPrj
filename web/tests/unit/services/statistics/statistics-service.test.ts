/**
 * Unit Tests: Statistics Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTimeStatistics,
  getCategoryStatistics,
  getStatisticsSummary,
  getDailyStatistics,
  getMonthlyStatistics,
  type TimeDimension,
} from '@/services/statistics/statistics-service'
import type { AccountEntrySchema } from '@/types/schema'

const mockEntries: AccountEntrySchema[] = [
  { id: '1', amount: 100, date: '2026-01-15T00:00:00.000Z', category: 'food', notes: '', createdAt: '', updatedAt: '' },
  { id: '2', amount: 50, date: '2026-01-15T00:00:00.000Z', category: 'transportation', notes: '', createdAt: '', updatedAt: '' },
  { id: '3', amount: 200, date: '2026-01-20T00:00:00.000Z', category: 'food', notes: '', createdAt: '', updatedAt: '' },
]

vi.mock('@/services/accounting/account-entry-service', () => ({
  getAllEntries: vi.fn().mockResolvedValue([]),
}))

describe('Statistics Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { getAllEntries } = await import('@/services/accounting/account-entry-service')
    vi.mocked(getAllEntries).mockResolvedValue(mockEntries)
  })

  describe('getStatisticsSummary', () => {
    it('returns summary with totals and averages', async () => {
      const summary = await getStatisticsSummary('month')
      expect(summary.totalAmount).toBe(350)
      expect(summary.totalCount).toBe(3)
      expect(summary.averageAmount).toBeCloseTo(350 / 3)
      expect(summary.timeStatistics).toBeDefined()
      expect(summary.categoryStatistics).toBeDefined()
    })

    it('filters by date range when provided', async () => {
      const start = new Date('2026-01-16T00:00:00.000Z')
      const end = new Date('2026-01-25T00:00:00.000Z')
      const summary = await getStatisticsSummary('month', start, end)
      expect(summary.totalCount).toBe(1)
      expect(summary.totalAmount).toBe(200)
    })

    it('returns zero averages when no entries', async () => {
      const { getAllEntries } = await import('@/services/accounting/account-entry-service')
      vi.mocked(getAllEntries).mockResolvedValue([])
      const summary = await getStatisticsSummary('month')
      expect(summary.totalAmount).toBe(0)
      expect(summary.totalCount).toBe(0)
      expect(summary.averageAmount).toBe(0)
    })
  })

  describe('getTimeStatistics', () => {
    it('groups entries by dimension', async () => {
      const stats = await getTimeStatistics('month')
      expect(Array.isArray(stats)).toBe(true)
      expect(stats.length).toBeGreaterThan(0)
      const first = stats[0]
      expect(first).toHaveProperty('period')
      expect(first).toHaveProperty('total')
      expect(first).toHaveProperty('count')
      expect(first).toHaveProperty('entries')
    })

    it('respects day dimension', async () => {
      const stats = await getTimeStatistics('day')
      expect(Array.isArray(stats)).toBe(true)
    })

    it('respects date range filter', async () => {
      const start = new Date('2026-01-01')
      const end = new Date('2026-01-31')
      const stats = await getTimeStatistics('month', start, end)
      expect(Array.isArray(stats)).toBe(true)
    })
  })

  describe('getCategoryStatistics', () => {
    it('groups entries by category with totals and percentage', async () => {
      const stats = await getCategoryStatistics()
      expect(Array.isArray(stats)).toBe(true)
      expect(stats.length).toBe(2)
      const food = stats.find((s) => s.category === 'food')
      const trans = stats.find((s) => s.category === 'transportation')
      expect(food).toBeDefined()
      expect(food!.total).toBe(300)
      expect(food!.percentage).toBeCloseTo((300 / 350) * 100)
      expect(trans).toBeDefined()
      expect(trans!.total).toBe(50)
    })

    it('sorts by total descending', async () => {
      const stats = await getCategoryStatistics()
      expect(stats[0].total).toBeGreaterThanOrEqual(stats[1].total)
    })
  })

  describe('getDailyStatistics', () => {
    it('delegates to getTimeStatistics with day dimension', async () => {
      const start = new Date('2026-01-01')
      const end = new Date('2026-01-31')
      const stats = await getDailyStatistics(start, end)
      expect(Array.isArray(stats)).toBe(true)
    })
  })

  describe('getMonthlyStatistics', () => {
    it('delegates to getTimeStatistics with month dimension', async () => {
      const start = new Date('2026-01-01')
      const end = new Date('2026-01-31')
      const stats = await getMonthlyStatistics(start, end)
      expect(Array.isArray(stats)).toBe(true)
    })
  })
})
