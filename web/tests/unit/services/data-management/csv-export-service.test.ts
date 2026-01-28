/**
 * Unit Tests: CSV Export Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { entriesToCSV } from '@/services/data-management/csv-export-service'
import type { AccountEntrySchema } from '@/types/schema'

vi.mock('@/services/accounting/account-entry-service', () => ({
  getAllEntries: vi.fn().mockResolvedValue([]),
}))

describe('CSV Export Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('entriesToCSV', () => {
    it('returns header row', () => {
      const csv = entriesToCSV([])
      expect(csv).toContain('日期,金额,类别,备注')
    })

    it('formats entries as CSV rows', () => {
      const entries: AccountEntrySchema[] = [
        { id: '1', amount: 100, date: '2026-01-15T00:00:00.000Z', category: 'food', notes: '午餐', createdAt: '', updatedAt: '' },
      ]
      const csv = entriesToCSV(entries)
      const lines = csv.split('\n')
      expect(lines.length).toBeGreaterThanOrEqual(2)
      expect(lines[0]).toBe('日期,金额,类别,备注')
      expect(lines[1]).toMatch(/100/)
      expect(lines[1]).toContain('food')
      expect(lines[1]).toContain('午餐')
    })

    it('escapes quotes in notes', () => {
      const entries: AccountEntrySchema[] = [
        { id: '1', amount: 50, date: '2026-01-15', category: 'other', notes: 'a "quoted" note', createdAt: '', updatedAt: '' },
      ]
      const csv = entriesToCSV(entries)
      expect(csv).toContain('"a ""quoted"" note"')
    })
  })
})
