/**
 * Unit Tests: Import Service (merge)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isDuplicateEntry,
  calculateSimilarity,
  findDuplicates,
  validateImportData,
  parseImportFile,
  importAccountBook,
} from '@/services/merge/import-service'
import type { AccountEntrySchema } from '@/types/schema'
import type { ExportFormatSchema } from '@/types/schema'

const baseEntry: AccountEntrySchema = {
  id: '1',
  amount: 100,
  date: '2026-01-15T00:00:00.000Z',
  category: 'food',
  notes: '',
  createdAt: '',
  updatedAt: '',
}

vi.mock('@/services/accounting/account-entry-service', () => ({
  getAllEntries: vi.fn().mockResolvedValue([]),
  createEntry: vi.fn().mockResolvedValue(undefined),
  deleteEntry: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/budget/budget-service', () => ({
  createBudgetService: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/audit', () => ({
  logSuccess: vi.fn().mockResolvedValue(undefined),
  logFailure: vi.fn().mockResolvedValue(undefined),
}))

describe('Import Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isDuplicateEntry', () => {
    it('returns true when date, amount, category match', () => {
      const a = { ...baseEntry }
      const b = { ...baseEntry, id: '2', notes: 'x' }
      expect(isDuplicateEntry(a, b)).toBe(true)
    })

    it('returns false when amount differs', () => {
      const a = { ...baseEntry }
      const b = { ...baseEntry, id: '2', amount: 200 }
      expect(isDuplicateEntry(a, b)).toBe(false)
    })

    it('returns false when category differs', () => {
      const a = { ...baseEntry }
      const b = { ...baseEntry, id: '2', category: 'shopping' }
      expect(isDuplicateEntry(a, b)).toBe(false)
    })
  })

  describe('calculateSimilarity', () => {
    it('returns 1 for exact match', () => {
      expect(calculateSimilarity(baseEntry, { ...baseEntry, id: '2' })).toBe(1)
    })

    it('returns 0 for no match', () => {
      const other = { ...baseEntry, id: '2', date: '2026-02-01', amount: 200, category: 'other' }
      expect(calculateSimilarity(baseEntry, other)).toBe(0)
    })
  })

  describe('findDuplicates', () => {
    it('returns duplicates between existing and imported', () => {
      const existing = [baseEntry]
      const imported = [{ ...baseEntry, id: '2' }]
      const dups = findDuplicates(existing, imported)
      expect(dups).toHaveLength(1)
      expect(dups[0].existing.id).toBe('1')
      expect(dups[0].imported.id).toBe('2')
    })

    it('returns empty when no overlap', () => {
      const existing = [baseEntry]
      const imported = [{ ...baseEntry, id: '2', amount: 200 }]
      expect(findDuplicates(existing, imported)).toHaveLength(0)
    })
  })

  describe('validateImportData', () => {
    it('rejects missing version', () => {
      const data = { exportedAt: new Date().toISOString(), data: { accounts: [], budgets: [] } } as any
      expect(validateImportData(data)).toEqual({ valid: false, error: '导出文件缺少版本信息' })
    })

    it('rejects missing data', () => {
      const data = { version: '1.0', exportedAt: new Date().toISOString() } as any
      expect(validateImportData(data)).toEqual({ valid: false, error: '导出文件缺少数据内容' })
    })

    it('accepts valid minimal data', () => {
      const data: ExportFormatSchema = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: { accounts: [], budgets: [] },
      }
      expect(validateImportData(data)).toEqual({ valid: true })
    })
  })

  describe('parseImportFile', () => {
    it('parses valid JSON', () => {
      const json = JSON.stringify({ version: '1.0', exportedAt: '2026-01-01', data: {} })
      const result = parseImportFile(json)
      expect(result.version).toBe('1.0')
    })

    it('throws on invalid JSON', () => {
      expect(() => parseImportFile('not json')).toThrow('JSON文件格式不正确')
    })
  })

  describe('importAccountBook', () => {
    it('imports entries and logs success', async () => {
      const { createEntry } = await import('@/services/accounting/account-entry-service')
      const { logSuccess } = await import('@/services/audit')
      const data: ExportFormatSchema = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: {
          accounts: [
            { id: 'a1', amount: 50, date: '2026-01-10', category: 'food', notes: '', createdAt: '', updatedAt: '' },
          ],
          budgets: [],
        },
      }
      const result = await importAccountBook(data)
      expect(result.imported).toBe(1)
      expect(result.duplicates).toBe(0)
      expect(createEntry).toHaveBeenCalled()
      expect(logSuccess).toHaveBeenCalled()
    })

    it('validates before import', async () => {
      await expect(importAccountBook({} as any)).rejects.toThrow('导出文件缺少版本信息')
    })
  })
})
