/**
 * Unit Tests: CSV Import Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseCSV, validateCSVStructure, importFromCSV } from '@/services/data-management/csv-import-service'

vi.mock('@/services/accounting/account-entry-service', () => ({
  createEntry: vi.fn().mockResolvedValue(undefined),
}))

describe('CSV Import Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseCSV', () => {
    it('parses simple CSV', () => {
      const content = '日期,金额,类别,备注\n2026/1/15,100,餐饮,午餐'
      const lines = parseCSV(content)
      expect(lines).toHaveLength(2)
      expect(lines[0]).toEqual(['日期', '金额', '类别', '备注'])
      expect(lines[1]).toEqual(['2026/1/15', '100', '餐饮', '午餐'])
    })

    it('handles quoted fields with commas', () => {
      const content = '日期,金额,类别,备注\n2026-01-15,50,其他,"note, with comma"'
      const lines = parseCSV(content)
      expect(lines[1][3]).toBe('note, with comma')
    })
  })

  describe('validateCSVStructure', () => {
    it('rejects empty file', () => {
      expect(validateCSVStructure([])).toEqual({ valid: false, error: 'CSV文件为空' })
    })

    it('requires date, amount, category columns', () => {
      const bad = [['a', 'b', 'c']]
      expect(validateCSVStructure(bad)).toEqual({
        valid: false,
        error: 'CSV文件格式不正确：缺少必要的列（日期、金额、类别）',
      })
    })

    it('accepts valid header', () => {
      const ok = [['日期', '金额', '类别', '备注']]
      expect(validateCSVStructure(ok)).toEqual({ valid: true })
    })
  })

  describe('importFromCSV', () => {
    it('imports valid CSV and returns count', async () => {
      const csv = '日期,金额,类别,备注\n2026/1/15,100,餐饮,午餐'
      const result = await importFromCSV(csv)
      expect(result.imported).toBe(1)
      expect(result.errors).toHaveLength(0)
    })

    it('returns errors for invalid CSV', async () => {
      const result = await importFromCSV('')
      expect(result.imported).toBe(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
